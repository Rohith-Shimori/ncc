-- 00031_gamification_csv_engine.sql
-- This officially hooks up the new CSV Exam Engine to the Gamification system (XP and Leveling)
-- It also fixes the percentage calculations and ensures everything is strictly recorded.

CREATE OR REPLACE FUNCTION public.fn_submit_csv_exam(
    p_attempt_id UUID,
    p_answers JSONB, -- Format: {"question_id": "selected_option"}
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
BEGIN
    -- Validate attempt and fetch user_id
    SELECT test_id, user_id INTO v_test_id, v_user_id
    FROM csv_exam_attempts
    WHERE id = p_attempt_id AND status = 'in_progress';

    IF v_test_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or already submitted attempt';
    END IF;

    -- Grade answers
    FOR v_record IN 
        SELECT aq.question_id, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d
        FROM csv_attempt_questions aq
        JOIN csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
    LOOP
        v_total_q := v_total_q + 1;
        
        -- Check if answer is correct (extremely robust string matching)
        -- Supports cases where correct_answer is 'A', 'B', 'C', 'D' OR the full text
        IF LOWER(REGEXP_REPLACE(p_answers->>v_record.question_id, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(v_record.correct_answer, '[^a-zA-Z0-9]', '', 'g')) THEN
            v_correct_q := v_correct_q + 1;
            
            -- Save individual correct answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = TRUE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        ELSE
            -- Save incorrect answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = FALSE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        END IF;
    END LOOP;

    v_score := v_correct_q;
    v_exp_gain := v_correct_q * 10; -- Award 10 XP per correct question
    
    IF v_total_q > 0 THEN
        v_percentage := (v_correct_q * 100) / v_total_q;
    END IF;

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

    -- Award XP and trigger leveling for the Cadet
    IF v_exp_gain > 0 AND v_user_id IS NOT NULL THEN
        UPDATE public.cadet_profiles
        SET 
            exp = COALESCE(exp, 0) + v_exp_gain,
            level = fn_calculate_level(COALESCE(exp, 0) + v_exp_gain)
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'status', v_status,
        'score', v_score,
        'total_questions', v_total_q,
        'percentage', v_percentage,
        'total_correct', v_correct_q,
        'exp_gain', v_exp_gain
    );
END;
$$;
