-- 00033_production_patch.sql
-- Enforces perfect grading matches and ensures History tab queries cannot fail due to RLS.

-- 1. Definitively set the RLS policy to ensure the Cadet can view their own attempts.
DROP POLICY IF EXISTS "csv_exam_attempts_select_auth" ON csv_exam_attempts;

CREATE POLICY "csv_exam_attempts_select_auth" ON csv_exam_attempts 
FOR SELECT USING (
    user_id = auth.uid() OR 
    (SELECT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())) OR 
    (SELECT EXISTS (SELECT 1 FROM public.instructor_profiles WHERE id = auth.uid()))
);

-- 2. Fully Re-apply the fn_submit_csv_exam with PERFECT STRING MATCHING AND EXP GAIN.
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
    v_test_id INTEGER;
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

        -- Resolve full text of correct answer to ensure 'A' matches 'Lata Mangeshkar'
        v_correct_text := CASE trim(v_record.correct_answer)
            WHEN 'A' THEN v_record.option_a
            WHEN 'B' THEN v_record.option_b
            WHEN 'C' THEN v_record.option_c
            WHEN 'D' THEN v_record.option_d
            ELSE v_record.correct_answer
        END;

        -- Check if answer is correct (extremely robust alphanumeric string matching)
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
        'percentage', v_percentage,
        'exp_gained', v_exp_gain
    );
END;
$$;
