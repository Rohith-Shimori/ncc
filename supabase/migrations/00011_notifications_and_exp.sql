-- 00011_notifications_and_exp.sql
-- Fix exam submission bug + Add notifications, EXP, and Leaderboard

-- 1. ADD COLUMNS TO cadet_profiles
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- 2. CREATE notifications TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'system', -- system, achievement, exam, enrollment
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. LEVEL CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION public.fn_calculate_level(p_exp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simple leveling: level = floor(exp / 1000) + 1
  RETURN FLOOR(p_exp / 1000) + 1;
END;
$$;

-- 4. FIXED & ENHANCED SUBMIT EXAM
CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB,
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
  v_test RECORD;
  v_answer_item JSONB;
  v_question RECORD;
  v_correct_count INTEGER := 0;
  v_total INTEGER := 0;
  v_score INTEGER;
  v_status TEXT := 'submitted';
  v_exp_gain INTEGER := 0;
  v_new_exp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Verify attempt belongs to user
  SELECT * INTO v_attempt FROM test_attempts
  WHERE id = p_attempt_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;

  -- If already submitted, return existing results instead of erroring
  IF v_attempt.status != 'in_progress' THEN
    RETURN jsonb_build_object(
      'score', v_attempt.score,
      'total_correct', v_attempt.total_correct,
      'total_questions', v_attempt.total_questions,
      'status', v_attempt.status,
      'passed', v_attempt.score >= (SELECT passing_score FROM tests WHERE id = v_attempt.test_id),
      'already_submitted', true
    );
  END IF;

  SELECT * INTO v_test FROM tests WHERE id = v_attempt.test_id;

  -- Flag if too many tab switches
  IF p_tab_switches >= 5 THEN
    v_status := 'flagged';
  END IF;

  -- Grade each answer
  -- Use jsonb_array_elements explicitly and handle potential null/empty
  IF p_answers IS NOT NULL AND jsonb_array_length(p_answers) > 0 THEN
    FOR v_answer_item IN SELECT value FROM jsonb_array_elements(p_answers)
    LOOP
      SELECT * INTO v_question FROM questions WHERE id = (v_answer_item->>'question_id')::UUID;
      IF FOUND THEN
        v_total := v_total + 1;
        
        -- Insert/Update answer record
        INSERT INTO test_answers (attempt_id, question_id, selected_answer, is_correct, time_spent_seconds)
        VALUES (
          p_attempt_id,
          v_question.id,
          v_answer_item->>'selected_answer',
          v_question.correct_answer = v_answer_item->>'selected_answer',
          COALESCE((v_answer_item->>'time_spent')::INTEGER, 0)
        )
        ON CONFLICT (attempt_id, question_id) DO UPDATE SET
          selected_answer = EXCLUDED.selected_answer,
          is_correct = EXCLUDED.is_correct;

        IF v_question.correct_answer = v_answer_item->>'selected_answer' THEN
          v_correct_count := v_correct_count + 1;
        END IF;
      END IF;
    END LOOP;
  ELSE
    -- If no answers provided, use the test's question count
    v_total := v_attempt.total_questions;
  END IF;

  -- Calculate score
  v_score := CASE WHEN v_total > 0 THEN ROUND((v_correct_count::NUMERIC / v_total) * 100) ELSE 0 END;

  -- Calculate EXP gain (Score * Multiplier)
  -- Practice: x5, Mock: x10, Final: x20
  v_exp_gain := v_score * (CASE 
    WHEN v_test.test_type = 'practice' THEN 5
    WHEN v_test.test_type = 'mock' THEN 10
    WHEN v_test.test_type = 'final' THEN 20
    ELSE 5 END);

  -- Update attempt
  UPDATE test_attempts SET
    submitted_at = NOW(),
    score = v_score,
    total_correct = v_correct_count,
    total_questions = GREATEST(v_total, 1),
    tab_switch_count = p_tab_switches,
    time_spent_seconds = p_time_spent,
    status = v_status
  WHERE id = p_attempt_id;

  -- Update User EXP and Level
  UPDATE cadet_profiles SET
    exp = exp + v_exp_gain,
    level = fn_calculate_level(exp + v_exp_gain),
    updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING exp, level INTO v_new_exp, v_new_level;

  -- Create Notification
  INSERT INTO notifications (user_id, type, title, content, link)
  VALUES (
    auth.uid(),
    'exam',
    'Exam Results: ' || v_test.title,
    'You scored ' || v_score || '% and gained ' || v_exp_gain || ' EXP.',
    '/exam-results/' || p_attempt_id
  );

  RETURN jsonb_build_object(
    'score', v_score,
    'total_correct', v_correct_count,
    'total_questions', v_total,
    'status', v_status,
    'passed', v_score >= v_test.passing_score,
    'exp_gained', v_exp_gain,
    'new_exp', v_new_exp,
    'new_level', v_new_level
  );
END;
$$;

-- 5. LEADERBOARD FUNCTION
CREATE OR REPLACE FUNCTION public.fn_get_leaderboard(p_limit INTEGER DEFAULT 10, p_wing TEXT DEFAULT 'All')
RETURNS TABLE (
  rank BIGINT,
  full_name TEXT,
  wing TEXT,
  exp INTEGER,
  level INTEGER,
  is_current_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cp.exp DESC) as rank,
    cp.full_name,
    cp.wing,
    cp.exp,
    cp.level,
    (cp.id = auth.uid()) as is_current_user
  FROM cadet_profiles cp
  WHERE (p_wing = 'All' OR cp.wing = p_wing)
  ORDER BY cp.exp DESC
  LIMIT p_limit;
END;
$$;

-- 6. NOTIFICATION HELPER
CREATE OR REPLACE FUNCTION public.fn_mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications SET is_read = true 
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_leaderboard(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_mark_notification_read(UUID) TO authenticated;
