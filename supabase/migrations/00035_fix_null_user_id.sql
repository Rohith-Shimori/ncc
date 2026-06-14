-- 00035_fix_null_user_id.sql
-- Solves the "Phantom Data" and "0 EXP" bug by forcing the user_id to be passed explicitly from the frontend.
-- This bypasses the edge case where auth.uid() evaluates to NULL inside SECURITY DEFINER on some Supabase versions.

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

    -- 3. Randomly select questions based on distribution
    WITH Distribution AS (
        SELECT 
            d.subject_code, 
            d.number_of_questions as q_count,
            d.difficulty
        FROM csv_mock_exams m
        JOIN jsonb_to_recordset(m.question_distribution) AS d(subject_code text, number_of_questions int, difficulty text) ON true
        WHERE m.test_id = p_test_id
    ),
    SelectedQuestions AS (
        SELECT 
            q.question_id, 
            q.question_text,
            jsonb_build_array(q.option_a, q.option_b, q.option_c, q.option_d) as options,
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

-- Recover stranded records (if possible) for the current active user by looking at their most recent activity,
-- or just delete them to clean up the UI. We will clean up orphaned NULL attempts to prevent database bloat.
DELETE FROM csv_exam_attempts WHERE user_id IS NULL;
