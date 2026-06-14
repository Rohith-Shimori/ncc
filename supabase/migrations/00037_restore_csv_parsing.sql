-- 00037_restore_csv_parsing.sql
-- Fixes the JSONB type casting error introduced in 00035.
-- Restores the original string parsing logic ("SUBJECT_CODE:COUNT|...") while preserving the critical explicit user ID fix.

CREATE OR REPLACE FUNCTION public.fn_start_csv_exam(
    p_test_id INTEGER,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt_id UUID;
    v_duration INTEGER;
    v_questions JSONB;
    v_actual_user_id UUID;
BEGIN
    -- Resolve user ID definitively
    v_actual_user_id := COALESCE(p_user_id, auth.uid());

    IF v_actual_user_id IS NULL THEN
        RAISE EXCEPTION 'Cannot start exam: User ID is missing or auth context is lost.';
    END IF;

    -- 1. Get test duration
    SELECT time_limit_minutes INTO v_duration
    FROM csv_mock_exams
    WHERE test_id = p_test_id AND is_active = TRUE;

    IF v_duration IS NULL THEN
        RAISE EXCEPTION 'Test not found or inactive';
    END IF;

    -- 2. Create attempt
    INSERT INTO csv_exam_attempts (user_id, test_id, status)
    VALUES (v_actual_user_id, p_test_id, 'in_progress')
    RETURNING id INTO v_attempt_id;

    -- 3. Randomly select questions based on distribution (mock logic)
    WITH Distribution AS (
        SELECT 
            split_part(part, ':', 1) AS subject_code,
            split_part(part, ':', 2)::INTEGER AS q_count
        FROM (
            SELECT unnest(string_to_array(question_distribution, '|')) AS part
            FROM csv_mock_exams
            WHERE test_id = p_test_id
        ) d
        WHERE part != '' AND part LIKE '%:%'
    ),
    SelectedQuestions AS (
        SELECT 
            q.question_id, 
            q.question_text, 
            -- Build a JSON array of non-null options
            (
                SELECT jsonb_agg(opt)
                FROM unnest(ARRAY[q.option_a, q.option_b, q.option_c, q.option_d]) AS opt
                WHERE opt IS NOT NULL AND opt != ''
            ) as options,
            q.subject_code, 
            q.difficulty
        FROM Distribution d
        CROSS JOIN LATERAL (
            SELECT question_id, question_text, option_a, option_b, option_c, option_d, subject_code, difficulty
            FROM csv_questions
            WHERE subject_code = d.subject_code
            AND active = TRUE
            ORDER BY random()
            LIMIT d.q_count
        ) q
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', question_id,
            'question_text', question_text,
            'options', options,
            'subject_code', subject_code,
            'difficulty', difficulty
        )
    ) INTO v_questions
    FROM SelectedQuestions;

    -- 4. Save attempt questions
    INSERT INTO csv_attempt_questions (attempt_id, question_id, subject_code)
    SELECT v_attempt_id, q->>'id', q->>'subject_code'
    FROM jsonb_array_elements(v_questions) q;

    -- 5. Return payload
    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'duration_minutes', v_duration,
        'csv_questions', v_questions
    );
END;
$$;
