-- 00014_fix_exam_logic.sql

-- 1. FIX fn_submit_exam: Ensure total_questions and score are never null/zero if questions exist
CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB,
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
  v_questions JSONB;
  v_score INTEGER := 0;
  v_total INTEGER := 0;
  v_exp_gain INTEGER := 0;
  v_q RECORD;
  v_ans TEXT;
  v_correct BOOLEAN;
  v_results JSONB := '[]'::JSONB;
BEGIN
  -- Get attempt details
  SELECT test_id, user_id, status INTO v_test_id, v_user_id, v_status
  FROM public.test_attempts WHERE id = p_attempt_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;

  IF v_status != 'in_progress' THEN
    RAISE EXCEPTION 'Attempt already submitted or invalid';
  END IF;

  -- Get test questions
  SELECT questions INTO v_questions FROM public.tests WHERE id = v_test_id;
  v_total := jsonb_array_length(v_questions);

  -- Handle case with no questions (should not happen but for safety)
  IF v_total = 0 OR v_total IS NULL THEN
    v_total := 1; -- Avoid division by zero in UI
  END IF;

  -- Grade answers
  FOR v_q IN SELECT * FROM jsonb_to_recordset(v_questions) AS x(id TEXT, question TEXT, options JSONB, correct_option TEXT, exp INTEGER)
  LOOP
    v_ans := p_answers->>v_q.id;
    v_correct := (v_ans = v_q.correct_option);
    
    IF v_correct THEN
      v_score := v_score + 1;
      v_exp_gain := v_exp_gain + COALESCE(v_q.exp, 10);
    END IF;

    v_results := v_results || jsonb_build_object(
      'question_id', v_q.id,
      'user_answer', v_ans,
      'correct_answer', v_q.correct_option,
      'is_correct', v_correct
    );
  END LOOP;

  -- Update attempt
  UPDATE public.test_attempts
  SET 
    answers = p_answers,
    score = v_score,
    total_questions = v_total,
    submitted_at = NOW(),
    time_spent_seconds = p_time_spent,
    status = 'submitted',
    grading_data = v_results
  WHERE id = p_attempt_id;

  -- Update cadet EXP
  IF v_exp_gain > 0 THEN
    UPDATE public.cadet_profiles
    SET 
      exp = exp + v_exp_gain,
      level = fn_calculate_level(exp + v_exp_gain)
    WHERE id = v_user_id;
  END IF;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, content, link)
  VALUES (
    v_user_id,
    'exam',
    'Exam Submitted',
    'You scored ' || v_score || '/' || v_total || ' in your recent test. Keep it up!',
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

-- 2. FIX fn_get_exam_results: Be more permissive with status and ensure data consistency
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt RECORD;
  v_test RECORD;
  v_result JSONB;
BEGIN
  -- Get attempt
  SELECT * INTO v_attempt FROM public.test_attempts WHERE id = p_attempt_id;
  
  IF NOT FOUND THEN
    RETURN NULL; -- Better than raising exception for frontend
  END IF;

  -- Get test info
  SELECT id, title, description, category, passing_score, time_limit_minutes 
  INTO v_test 
  FROM public.tests WHERE id = v_attempt.test_id;

  -- Build final result object
  v_result := jsonb_build_object(
    'attempt_id', v_attempt.id,
    'test_id', v_test.id,
    'test_title', v_test.title,
    'test_category', v_test.category,
    'score', v_attempt.score,
    'total_questions', COALESCE(v_attempt.total_questions, 0),
    'percentage', CASE 
      WHEN COALESCE(v_attempt.total_questions, 0) > 0 
      THEN ROUND((v_attempt.score::FLOAT / v_attempt.total_questions::FLOAT * 100)::NUMERIC, 1)
      ELSE 0 
    END,
    'time_spent', v_attempt.time_spent_seconds,
    'time_limit', v_test.time_limit_minutes * 60,
    'submitted_at', v_attempt.submitted_at,
    'status', v_attempt.status,
    'grading_data', v_attempt.grading_data
  );

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_exam_results(UUID) TO authenticated;
