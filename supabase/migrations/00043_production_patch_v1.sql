-- NCC PRODUCTION PATCH V1 (Corrected)
-- This script fixes column mismatches and ensures the exam grading works perfectly.

-- 1. Ensure test_attempts has answers and grading_data columns
ALTER TABLE public.test_attempts ADD COLUMN IF NOT EXISTS answers JSONB;
ALTER TABLE public.test_attempts ADD COLUMN IF NOT EXISTS grading_data JSONB;
ALTER TABLE public.test_attempts ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0;

-- 2. FIX: Efficient Chapter ID Helper (Used for Dashboard Progress)
DROP FUNCTION IF EXISTS public.fn_get_course_chapter_ids(UUID);
CREATE OR REPLACE FUNCTION public.fn_get_course_chapter_ids(p_course_id UUID)
RETURNS TABLE(chapter_id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id FROM public.chapters c
  JOIN public.modules m ON c.module_id = m.id
  WHERE m.course_id = p_course_id;
END;
$$;

-- 3. FIX: Robust Exam Submission (Calculates score, EXP, and notifies user)
DROP FUNCTION IF EXISTS public.fn_submit_exam(UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB,
  p_tab_switches INTEGER,
  p_time_spent INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- Calculate EXP gain (Score % * Multiplier)
  v_exp_gain := ROUND((v_score::FLOAT / v_total::FLOAT * 100)::NUMERIC) * (CASE 
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
    'exp_gain', v_exp_gain,
    'percentage', ROUND((v_score::FLOAT / v_total::FLOAT * 100)::NUMERIC, 1)
  );
END;
$$;

-- 4. FIX: Exam Result Retrieval (Aligned with Frontend ExamResults.jsx)
DROP FUNCTION IF EXISTS public.fn_get_exam_results(UUID);
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt RECORD;
  v_test RECORD;
BEGIN
  -- Get attempt details
  SELECT * INTO v_attempt FROM public.test_attempts WHERE id = p_attempt_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Get test info
  SELECT title, passing_score INTO v_test FROM public.tests WHERE id = v_attempt.test_id;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt.id,
    'test_title', v_test.title,
    'score', v_attempt.score,
    'total_questions', COALESCE(v_attempt.total_questions, 0),
    'passed', CASE 
      WHEN COALESCE(v_attempt.total_questions, 0) > 0 
      THEN (v_attempt.score::FLOAT / v_attempt.total_questions::FLOAT * 100) >= v_test.passing_score
      ELSE false
    END,
    'time_spent', v_attempt.time_spent_seconds,
    'tab_switches', v_attempt.tab_switch_count,
    'status', v_attempt.status,
    'grading_data', v_attempt.grading_data
  );
END;
$$;

-- 5. FIX: Mark Single Notification as Read
DROP FUNCTION IF EXISTS public.fn_mark_notification_read(UUID);
CREATE OR REPLACE FUNCTION public.fn_mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications SET is_read = true 
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Grant Execution Permissions
GRANT EXECUTE ON FUNCTION public.fn_get_course_chapter_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_exam_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_mark_notification_read(UUID) TO authenticated;
