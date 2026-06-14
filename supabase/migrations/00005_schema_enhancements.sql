-- 00005_schema_enhancements.sql
-- Add missing columns + exam RPC functions (SECURITY DEFINER)

-- ============================================
-- SCHEMA FIXES
-- ============================================
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_level VARCHAR(5) DEFAULT 'A';

ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS image_urls JSONB;

-- ============================================
-- SECURE EXAM FUNCTIONS (SECURITY DEFINER)
-- These run with DB owner privileges, so clients
-- never see correct_answer directly.
-- ============================================

-- 1. START EXAM: Creates attempt, picks random questions, returns them WITHOUT answers
CREATE OR REPLACE FUNCTION public.fn_start_exam(p_test_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_test RECORD;
  v_attempt_id UUID;
  v_question_ids UUID[];
  v_questions JSONB;
BEGIN
  -- Get test details
  SELECT * INTO v_test FROM tests WHERE id = p_test_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Test not found or inactive';
  END IF;

  -- Select random questions from the test's course question banks
  SELECT ARRAY_AGG(q.id) INTO v_question_ids
  FROM (
    SELECT qs.id FROM questions qs
    JOIN question_banks qb ON qs.bank_id = qb.id
    WHERE qb.course_id = v_test.course_id
    ORDER BY random()
    LIMIT v_test.question_count
  ) q;

  IF v_question_ids IS NULL OR array_length(v_question_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No questions available for this test';
  END IF;

  -- Create attempt
  INSERT INTO test_attempts (test_id, user_id, question_ids, total_questions, status)
  VALUES (p_test_id, auth.uid(), to_jsonb(v_question_ids), array_length(v_question_ids, 1), 'in_progress')
  RETURNING id INTO v_attempt_id;

  -- Return questions WITHOUT correct_answer and explanation
  SELECT jsonb_build_object(
    'attempt_id', v_attempt_id,
    'duration_minutes', v_test.duration_minutes,
    'test_title', v_test.title,
    'questions', jsonb_agg(
      jsonb_build_object(
        'id', qs.id,
        'question_text', qs.question_text,
        'question_type', qs.question_type,
        'options', qs.options,
        'topic_tag', qs.topic_tag,
        'points', qs.points,
        'difficulty', qs.difficulty
      ) ORDER BY random() -- randomize order
    )
  ) INTO v_questions
  FROM questions qs
  WHERE qs.id = ANY(v_question_ids);

  RETURN v_questions;
END;
$$;

-- 2. SUBMIT EXAM: Grades answers server-side, never exposes correct answers during exam
CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB, -- [{"question_id": "uuid", "selected_answer": "text"}, ...]
  p_tab_switches INTEGER DEFAULT 0,
  p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_answer RECORD;
  v_question RECORD;
  v_correct_count INTEGER := 0;
  v_total INTEGER := 0;
  v_score INTEGER;
  v_status TEXT := 'submitted';
BEGIN
  -- Verify attempt belongs to user and is in_progress
  SELECT * INTO v_attempt FROM test_attempts
  WHERE id = p_attempt_id AND user_id = auth.uid() AND status = 'in_progress';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid attempt or already submitted';
  END IF;

  -- Flag if too many tab switches
  IF p_tab_switches >= 5 THEN
    v_status := 'flagged';
  END IF;

  -- Grade each answer
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers) AS elem
  LOOP
    SELECT * INTO v_question FROM questions WHERE id = (v_answer.elem->>'question_id')::UUID;
    IF FOUND THEN
      v_total := v_total + 1;
      INSERT INTO test_answers (attempt_id, question_id, selected_answer, is_correct, time_spent_seconds)
      VALUES (
        p_attempt_id,
        v_question.id,
        v_answer.elem->>'selected_answer',
        v_question.correct_answer = v_answer.elem->>'selected_answer',
        COALESCE((v_answer.elem->>'time_spent')::INTEGER, 0)
      )
      ON CONFLICT (attempt_id, question_id) DO NOTHING;

      IF v_question.correct_answer = v_answer.elem->>'selected_answer' THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    END IF;
  END LOOP;

  -- Calculate score
  v_score := CASE WHEN v_total > 0 THEN ROUND((v_correct_count::NUMERIC / v_total) * 100) ELSE 0 END;

  -- Update attempt
  UPDATE test_attempts SET
    submitted_at = NOW(),
    score = v_score,
    total_correct = v_correct_count,
    total_questions = v_total,
    tab_switch_count = p_tab_switches,
    time_spent_seconds = p_time_spent,
    status = v_status
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'score', v_score,
    'total_correct', v_correct_count,
    'total_questions', v_total,
    'status', v_status,
    'passed', v_score >= (SELECT passing_score FROM tests WHERE id = v_attempt.test_id)
  );
END;
$$;

-- 3. GET RESULTS: Returns full results with correct answers (only for submitted attempts)
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_attempt FROM test_attempts
  WHERE id = p_attempt_id AND user_id = auth.uid() AND status IN ('submitted', 'flagged', 'timed_out');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Results not available';
  END IF;

  SELECT jsonb_build_object(
    'attempt_id', v_attempt.id,
    'test_title', t.title,
    'score', v_attempt.score,
    'total_correct', v_attempt.total_correct,
    'total_questions', v_attempt.total_questions,
    'time_spent', v_attempt.time_spent_seconds,
    'tab_switches', v_attempt.tab_switch_count,
    'status', v_attempt.status,
    'passed', v_attempt.score >= t.passing_score,
    'submitted_at', v_attempt.submitted_at,
    'questions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'question_text', q.question_text,
          'options', q.options,
          'correct_answer', q.correct_answer,
          'selected_answer', ta.selected_answer,
          'is_correct', ta.is_correct,
          'explanation', q.explanation,
          'topic_tag', q.topic_tag
        )
      )
      FROM test_answers ta
      JOIN questions q ON q.id = ta.question_id
      WHERE ta.attempt_id = v_attempt.id
    )
  ) INTO v_result
  FROM tests t WHERE t.id = v_attempt.test_id;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.fn_start_exam(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_exam_results(UUID) TO authenticated;
