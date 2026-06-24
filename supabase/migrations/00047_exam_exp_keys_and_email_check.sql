-- NCC Database Migration 00047
-- 1. Adds fn_check_email_exists to verify if an email exists before forgot-password recovery is triggered.
-- 2. Aligns returned keys for fn_submit_exam and fn_submit_csv_exam to include all variants (total_questions, total, exp_gain, exp_gained).

-- Part 1: Check Email Existence Helper (Security Definer)
DROP FUNCTION IF EXISTS public.fn_check_email_exists(text);

CREATE OR REPLACE FUNCTION public.fn_check_email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = LOWER(p_email)
  );
END;
$$;

-- Grant execution to all users (since it's called prior to authentication)
GRANT EXECUTE ON FUNCTION public.fn_check_email_exists(text) TO anon, authenticated;


-- Part 2: Aligned fn_submit_csv_exam (drops and recreates to update return payload)
DROP FUNCTION IF EXISTS public.fn_submit_csv_exam(uuid, jsonb, int, int);

CREATE OR REPLACE FUNCTION public.fn_submit_csv_exam(
    p_attempt_id UUID,
    p_answers JSONB,
    p_tab_switches INTEGER DEFAULT 0,
    p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test_id VARCHAR(50);
    v_user_id UUID;
    v_total_q INTEGER := 0;
    v_correct_q INTEGER := 0;
    v_score INTEGER := 0;
    v_percentage INTEGER := 0;
    v_exp_gain INTEGER := 0;
    v_status VARCHAR := 'submitted';
    v_record RECORD;
    v_correct_text TEXT;
BEGIN
    -- Validate attempt and fetch user_id
    SELECT test_id, user_id INTO v_test_id, v_user_id
    FROM csv_exam_attempts
    WHERE id = p_attempt_id AND status = 'in_progress';

    IF v_test_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or already submitted attempt';
    END IF;

    -- Iterate through the attempt's questions
    FOR v_record IN 
        SELECT aq.question_id, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d
        FROM csv_attempt_questions aq
        JOIN csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
    LOOP
        v_total_q := v_total_q + 1;

        -- Resolve full text of correct answer to ensure 'A' matches option_a
        v_correct_text := CASE trim(v_record.correct_answer)
            WHEN 'A' THEN v_record.option_a
            WHEN 'B' THEN v_record.option_b
            WHEN 'C' THEN v_record.option_c
            WHEN 'D' THEN v_record.option_d
            ELSE v_record.correct_answer
        END;

        -- Check if answer is correct
        IF LOWER(REGEXP_REPLACE(p_answers->>v_record.question_id, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(v_correct_text, '[^a-zA-Z0-9]', '', 'g')) THEN
            v_correct_q := v_correct_q + 1;
            
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = TRUE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        ELSE
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = FALSE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        END IF;
    END LOOP;

    -- Calculate scoring
    IF v_total_q > 0 THEN
        v_score := v_correct_q;
        v_percentage := ROUND((v_correct_q::numeric / v_total_q::numeric) * 100);
    END IF;

    -- Calculate EXP (10 EXP per correct answer)
    v_exp_gain := v_correct_q * 10;

    -- Award XP and trigger leveling for the Cadet
    IF v_exp_gain > 0 AND v_user_id IS NOT NULL THEN
        UPDATE public.cadet_profiles
        SET 
            exp = COALESCE(exp, 0) + v_exp_gain,
            level = fn_calculate_level(COALESCE(exp, 0) + v_exp_gain)
        WHERE id = v_user_id;
    END IF;

    -- Flag attempt if tab switching threshold is exceeded
    IF p_tab_switches >= 5 THEN
        v_status := 'flagged';
    END IF;

    -- Finalize attempt
    UPDATE csv_exam_attempts
    SET status = v_status,
        score = v_score,
        total_questions = v_total_q,
        percentage = v_percentage,
        time_taken_seconds = p_time_spent,
        tab_switches = p_tab_switches,
        submitted_at = now()
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'success', true,
        'score', v_score,
        'total', v_total_q,
        'total_questions', v_total_q,
        'percentage', v_percentage,
        'exp_gain', v_exp_gain,
        'exp_gained', v_exp_gain
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_submit_csv_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;


-- Part 3: Aligned fn_submit_exam (drops and recreates to update return payload)
DROP FUNCTION IF EXISTS public.fn_submit_exam(uuid, jsonb, int, int);

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

  -- Calculate EXP gain
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
    'total_questions', v_total,
    'exp_gain', v_exp_gain,
    'exp_gained', v_exp_gain,
    'percentage', ROUND((v_score::FLOAT / v_total::FLOAT * 100)::NUMERIC, 1)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
