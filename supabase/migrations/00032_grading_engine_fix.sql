-- 00032_grading_engine_fix.sql
-- Fixes grading matching string values (Marine vs B)
-- Fixes Exam Results RPC to return the actual string text instead of A/B/C/D.

CREATE OR REPLACE FUNCTION public.fn_submit_csv_exam(
    p_attempt_id UUID,
    p_answers JSONB, -- Format: {"question_id": "selected_option_string"}
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

    -- Grade answers
    FOR v_record IN 
        SELECT aq.question_id, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d
        FROM csv_attempt_questions aq
        JOIN csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
    LOOP
        v_total_q := v_total_q + 1;
        
        -- Resolve full text of correct answer
        v_correct_text := CASE v_record.correct_answer
            WHEN 'A' THEN v_record.option_a
            WHEN 'B' THEN v_record.option_b
            WHEN 'C' THEN v_record.option_c
            WHEN 'D' THEN v_record.option_d
            ELSE v_record.correct_answer
        END;

        -- Check if answer is correct (extremely robust string matching)
        IF LOWER(REGEXP_REPLACE(p_answers->>v_record.question_id, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(v_correct_text, '[^a-zA-Z0-9]', '', 'g')) THEN
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


-- Overwrite fn_get_exam_results to return full text for the Answer Review section
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt RECORD;
    v_test RECORD;
    v_grade RECORD;
BEGIN
    -- Get attempt
    SELECT * INTO v_attempt FROM csv_exam_attempts WHERE id = p_attempt_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Get test info
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = v_attempt.test_id;
    
    -- Get grading policy info
    SELECT * INTO v_grade FROM csv_grading_policy 
    WHERE v_attempt.percentage >= min_score AND v_attempt.percentage <= max_score 
    ORDER BY min_score DESC LIMIT 1;

    RETURN jsonb_build_object(
        'attempt_id', v_attempt.id,
        'test_title', v_test.test_name,
        'score', v_attempt.score,
        'total_questions', v_attempt.total_questions,
        'passed', v_attempt.percentage >= v_test.passing_percent,
        'time_spent', v_attempt.time_taken_seconds,
        'tab_switches', v_attempt.tab_switches,
        'status', v_attempt.status,
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
            FROM csv_attempt_questions aq
            JOIN csv_questions q ON q.question_id = aq.question_id
            WHERE aq.attempt_id = p_attempt_id
        )
    );
END;
$$;
