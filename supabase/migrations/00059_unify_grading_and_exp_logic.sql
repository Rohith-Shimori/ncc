-- NCC Database Migration 00059
-- 1. Redefine fn_submit_exam to calculate EXP based on raw score * multiplier
-- 2. Redefine fn_get_exam_results to dynamically support both test_attempts and csv_exam_attempts
-- 3. Add DELETE policy to notifications table to fix Express direct table deletions
-- 4. Drop redundant signup trigger on auth.users
-- 5. Recalculate historical EXP and levels for all cadet profiles from scratch

-- Part 1: Align fn_submit_exam
CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB,
  p_tab_switches INTEGER,
  p_time_spent INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_test_id UUID;
  v_user_id UUID;
  v_status TEXT;
  v_question_ids JSONB;
  v_score INTEGER := 0;
  v_total INTEGER := 0;
  v_exp_gain INTEGER := 0;
  v_q RECORD;
  v_ans TEXT;
  v_correct BOOLEAN;
  v_results JSONB := '[]'::JSONB;
  v_passing_score INTEGER;
  v_test_type VARCHAR(20);
  v_test_title VARCHAR(255);
  v_new_exp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get attempt details
  SELECT test_id, user_id, status, question_ids INTO v_test_id, v_user_id, v_status, v_question_ids
  FROM public.test_attempts WHERE id = p_attempt_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Attempt not found'; END IF;
  IF v_status != 'in_progress' THEN RAISE EXCEPTION 'Attempt already submitted'; END IF;

  -- Get test details
  SELECT passing_score, test_type, title INTO v_passing_score, v_test_type, v_test_title 
  FROM public.tests WHERE id = v_test_id;

  -- Decode question IDs array
  v_total := jsonb_array_length(v_question_ids);
  IF v_total = 0 OR v_total IS NULL THEN v_total := 1; END IF;

  -- Grade each question in the attempt
  FOR v_q IN 
    SELECT q.id, q.question_text, q.correct_answer, q.topic_tag 
    FROM public.questions q
    WHERE q.id IN (SELECT jsonb_array_elements_text(v_question_ids)::UUID)
  LOOP
    -- Retrieve user's answer for this question
    v_ans := p_answers->>v_q.id;
    -- Check if it matches correct answer
    v_correct := (COALESCE(v_ans, '') = v_q.correct_answer);
    
    IF v_correct THEN
      v_score := v_score + 1;
    END IF;

    -- Append detailed result for frontend
    v_results := v_results || jsonb_build_object(
      'question_id', v_q.id,
      'question_text', v_q.question_text,
      'topic_tag', v_q.topic_tag,
      'user_answer', COALESCE(v_ans, ''),
      'correct_answer', v_q.correct_answer,
      'is_correct', v_correct
    );
  END LOOP;

  -- Calculate EXP gain (score * multiplier)
  v_exp_gain := v_score * (CASE 
    WHEN v_test_type = 'practice' THEN 5
    WHEN v_test_type = 'mock' THEN 10
    WHEN v_test_type = 'final' THEN 20
    ELSE 5 END);

  -- Update attempt record
  UPDATE public.test_attempts SET
    submitted_at = NOW(),
    score = v_score,
    total_questions = v_total,
    tab_switch_count = p_tab_switches,
    time_spent_seconds = p_time_spent,
    status = CASE WHEN p_tab_switches >= 5 THEN 'flagged' ELSE 'submitted' END,
    answers = p_answers,
    grading_data = v_results
  WHERE id = p_attempt_id;

  -- Update Cadet EXP and level
  IF v_exp_gain > 0 THEN
    UPDATE public.cadet_profiles SET
      exp = exp + v_exp_gain,
      level = fn_calculate_level(exp + v_exp_gain),
      updated_at = NOW()
    WHERE id = v_user_id
    RETURNING exp, level INTO v_new_exp, v_new_level;
  END IF;

  -- Send notification
  INSERT INTO public.notifications (user_id, type, title, content, link)
  VALUES (
    v_user_id,
    'exam',
    'Exam Results: ' || v_test_title,
    'You scored ' || ROUND((v_score::FLOAT / v_total::FLOAT * 100)::NUMERIC) || '% (' || v_score || '/' || v_total || ') and gained ' || v_exp_gain || ' EXP.',
    '/exam-results/' || p_attempt_id
  );

  RETURN jsonb_build_object(
    'score', v_score,
    'total', v_total,
    'total_questions', v_total,
    'exp_gain', v_exp_gain,
    'exp_gained', v_exp_gain,
    'percentage', ROUND((v_score::FLOAT / v_total::FLOAT * 100)::NUMERIC, 1)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;


-- Part 2: Align fn_get_exam_results
DROP FUNCTION IF EXISTS public.fn_get_exam_results(UUID);
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_normal RECORD;
  v_attempt_csv RECORD;
  v_test_normal RECORD;
  v_test_csv RECORD;
  v_grade RECORD;
BEGIN
  -- Check test_attempts first
  SELECT * INTO v_attempt_normal FROM public.test_attempts WHERE id = p_attempt_id;
  
  IF FOUND THEN
    SELECT title, passing_score INTO v_test_normal FROM public.tests WHERE id = v_attempt_normal.test_id;
    
    RETURN jsonb_build_object(
      'attempt_id', v_attempt_normal.id,
      'test_title', v_test_normal.title,
      'score', v_attempt_normal.score,
      'total_questions', COALESCE(v_attempt_normal.total_questions, 0),
      'passed', CASE 
        WHEN COALESCE(v_attempt_normal.total_questions, 0) > 0 
        THEN (v_attempt_normal.score::FLOAT / v_attempt_normal.total_questions::FLOAT * 100) >= v_test_normal.passing_score
        ELSE false
      END,
      'time_spent', v_attempt_normal.time_spent_seconds,
      'tab_switches', v_attempt_normal.tab_switch_count,
      'status', v_attempt_normal.status,
      'grading_data', v_attempt_normal.grading_data
    );
  END IF;

  -- Check csv_exam_attempts
  SELECT * INTO v_attempt_csv FROM public.csv_exam_attempts WHERE id = p_attempt_id;
  
  IF FOUND THEN
    SELECT * INTO v_test_csv FROM public.csv_mock_exams WHERE test_id = v_attempt_csv.test_id;
    
    SELECT * INTO v_grade FROM public.csv_grading_policy 
    WHERE v_attempt_csv.percentage >= min_score AND v_attempt_csv.percentage <= max_score 
    ORDER BY min_score DESC LIMIT 1;

    RETURN jsonb_build_object(
      'attempt_id', v_attempt_csv.id,
      'test_title', v_test_csv.test_name,
      'score', v_attempt_csv.score,
      'total_questions', v_attempt_csv.total_questions,
      'passed', v_attempt_csv.percentage >= v_test_csv.passing_percent,
      'time_spent', v_attempt_csv.time_taken_seconds,
      'tab_switches', v_attempt_csv.tab_switches,
      'status', v_attempt_csv.status,
      'grade_info', jsonb_build_object(
        'grade', COALESCE(v_grade.grade, 'FAIL'),
        'label', COALESCE(v_grade.remarks, 'Fail')
      ),
      'grading_data', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'question_id', q.question_id,
            'question_text', q.question_text,
            'user_answer', aq.user_answer,
            'correct_answer', CASE q.correct_answer
              WHEN 'A' THEN q.option_a
              WHEN 'B' THEN q.option_b
              WHEN 'C' THEN q.option_c
              WHEN 'D' THEN q.option_d
              ELSE q.correct_answer
            END,
            'is_correct', aq.is_correct,
            'subject_code', aq.subject_code,
            'explanation', q.explanation
          )
        )
        FROM public.csv_attempt_questions aq
        JOIN public.csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
      )
    );
  END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_exam_results(UUID) TO authenticated;


-- Part 3: Add DELETE policy to notifications table
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);


-- Part 4: Drop redundant triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


-- Part 5: Reset and Recalculate EXP/Level for all Cadet Profiles
DO $$
DECLARE
  v_cadet RECORD;
  v_exam_exp INTEGER := 0;
  v_csv_exp INTEGER := 0;
  v_chapter_exp INTEGER := 0;
  v_total_exp INTEGER := 0;
  v_new_level INTEGER := 1;
BEGIN
  FOR v_cadet IN SELECT id FROM public.cadet_profiles
  LOOP
    -- Calculate normal exam EXP
    SELECT COALESCE(SUM(
      score * (CASE 
        WHEN t.test_type = 'practice' THEN 5
        WHEN t.test_type = 'mock' THEN 10
        WHEN t.test_type = 'final' THEN 20
        ELSE 5 END)
    ), 0)::integer INTO v_exam_exp
    FROM public.test_attempts ta
    JOIN public.tests t ON ta.test_id = t.id
    WHERE ta.user_id = v_cadet.id AND ta.status IN ('submitted', 'flagged');

    -- Calculate CSV mock exam EXP
    SELECT COALESCE(SUM(score * 10), 0)::integer INTO v_csv_exp
    FROM public.csv_exam_attempts
    WHERE user_id = v_cadet.id AND status IN ('submitted', 'flagged');

    -- Calculate chapter completion EXP (100 EXP per chapter completed)
    SELECT COALESCE(COUNT(*) * 100, 0)::integer INTO v_chapter_exp
    FROM public.user_progress
    WHERE user_id = v_cadet.id AND completed = true;

    -- Compute total
    v_total_exp := v_exam_exp + v_csv_exp + v_chapter_exp;
    v_new_level := FLOOR(v_total_exp / 1000) + 1;

    -- Update profile
    UPDATE public.cadet_profiles
    SET 
      exp = v_total_exp,
      level = v_new_level
    WHERE id = v_cadet.id;
  END LOOP;
END $$;
