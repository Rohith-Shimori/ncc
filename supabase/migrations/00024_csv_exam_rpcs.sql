-- 00024_csv_exam_rpcs.sql
-- RPC functions for the dynamic CSV exam engine

-- 1. fn_import_csv_data
-- A generic function to bulk insert/upsert CSV data via JSON array
CREATE OR REPLACE FUNCTION public.fn_import_csv_data(table_name text, data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    row jsonb;
    imported_count int := 0;
BEGIN
    -- We use a simple loop to insert. For real production with millions of rows, 
    -- direct COPY or unnest is better, but this works well for CSV sizes typical here.
    FOR row IN SELECT * FROM jsonb_array_elements(data)
    LOOP
        IF table_name = 'csv_subjects' THEN
            INSERT INTO csv_subjects (subject_code, subject_name, description)
            VALUES (row->>'subject_code', row->>'subject_name', row->>'description')
            ON CONFLICT (subject_code) DO UPDATE 
            SET subject_name = EXCLUDED.subject_name, description = EXCLUDED.description;
            imported_count := imported_count + 1;

        ELSIF table_name = 'csv_modules' THEN
            INSERT INTO csv_modules (id, subject_code, module_number, module_name)
            VALUES ((row->>'id')::int, row->>'subject_code', (row->>'module_number')::int, row->>'module_name')
            ON CONFLICT (id) DO UPDATE 
            SET subject_code = EXCLUDED.subject_code, module_number = EXCLUDED.module_number, module_name = EXCLUDED.module_name;
            imported_count := imported_count + 1;

        ELSIF table_name = 'csv_questions' THEN
            INSERT INTO csv_questions (question_id, subject_code, module_number, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, active, certificate, wing)
            VALUES (
                (row->>'question_id')::varchar, 
                row->>'subject_code', 
                (row->>'module_number')::int, 
                (row->>'difficulty')::int, 
                row->>'question_text', 
                row->>'option_a', 
                row->>'option_b', 
                row->>'option_c', 
                row->>'option_d', 
                row->>'correct_answer', 
                row->>'explanation', 
                COALESCE((row->>'active')::boolean, TRUE),
                COALESCE(row->>'certificate', 'Common'),
                COALESCE(row->>'wing', 'Common')
            )
            ON CONFLICT (question_id) DO UPDATE 
            SET subject_code = EXCLUDED.subject_code, 
                module_number = EXCLUDED.module_number, 
                difficulty = EXCLUDED.difficulty, 
                question_text = EXCLUDED.question_text, 
                option_a = EXCLUDED.option_a, 
                option_b = EXCLUDED.option_b, 
                option_c = EXCLUDED.option_c, 
                option_d = EXCLUDED.option_d, 
                correct_answer = EXCLUDED.correct_answer, 
                explanation = EXCLUDED.explanation, 
                active = EXCLUDED.active,
                certificate = EXCLUDED.certificate,
                wing = EXCLUDED.wing;
            imported_count := imported_count + 1;

        ELSIF table_name = 'csv_mock_exams' THEN
            INSERT INTO csv_mock_exams (test_id, test_name, wing, certificate_level, time_limit_minutes, passing_percent, question_distribution, is_active)
            VALUES (
                (row->>'test_id')::int, 
                row->>'test_name', 
                row->>'wing', 
                row->>'certificate_level', 
                COALESCE((row->>'time_limit_minutes')::int, 60), 
                COALESCE((row->>'passing_percent')::int, 60), 
                row->>'question_distribution', 
                COALESCE((row->>'is_active')::boolean, TRUE)
            )
            ON CONFLICT (test_id) DO UPDATE 
            SET test_name = EXCLUDED.test_name, wing = EXCLUDED.wing, certificate_level = EXCLUDED.certificate_level, time_limit_minutes = EXCLUDED.time_limit_minutes, passing_percent = EXCLUDED.passing_percent, question_distribution = EXCLUDED.question_distribution, is_active = EXCLUDED.is_active;
            imported_count := imported_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'imported', imported_count,
        'updated', 0,
        'skipped', 0
    );
END;
$$;

-- 2. fn_start_exam
CREATE OR REPLACE FUNCTION public.fn_start_exam(p_test_id int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test record;
    v_attempt_id uuid;
    v_dist text;
    v_dist_item text;
    v_subj text;
    v_count int;
    v_total_questions int := 0;
    v_question record;
BEGIN
    -- Get Test
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = p_test_id AND is_active = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Test not found or inactive';
    END IF;

    -- Create Attempt
    v_attempt_id := gen_random_uuid();
    INSERT INTO csv_exam_attempts (id, user_id, test_id, started_at, status)
    VALUES (v_attempt_id, auth.uid(), p_test_id, now(), 'in_progress');

    -- Generate csv_questions based on distribution
    -- Format: "SUBJECT_CODE:COUNT|SUBJECT_CODE:COUNT"
    FOREACH v_dist_item IN ARRAY string_to_array(v_test.question_distribution, '|')
    LOOP
        v_subj := split_part(v_dist_item, ':', 1);
        v_count := (split_part(v_dist_item, ':', 2))::int;

        IF v_subj IS NOT NULL AND v_subj != '' AND v_count > 0 THEN
            FOR v_question IN (
                SELECT * FROM csv_questions 
                WHERE subject_code = v_subj AND active = TRUE 
                ORDER BY random() 
                LIMIT v_count
            )
            LOOP
                INSERT INTO csv_attempt_questions (
                    attempt_id, question_id, subject_code, user_answer, is_correct
                ) VALUES (
                    v_attempt_id, v_question.question_id, v_question.subject_code, null, false
                );
                v_total_questions := v_total_questions + 1;
            END LOOP;
        END IF;
    END LOOP;

    -- Update Attempt total
    UPDATE csv_exam_attempts SET total_questions = v_total_questions WHERE id = v_attempt_id;

    -- Return Exam Data
    RETURN (
        SELECT jsonb_build_object(
            'attempt_id', v_attempt_id,
            'duration_minutes', v_test.time_limit_minutes,
            'test_title', v_test.test_name,
            'csv_questions', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', q.question_id,
                        'question_text', q.question_text,
                        'options', jsonb_build_array(q.option_a, q.option_b, q.option_c, q.option_d)
                    )
                )
                FROM csv_attempt_questions aq
                JOIN csv_questions q ON aq.question_id = q.question_id
                WHERE aq.attempt_id = v_attempt_id
            )
        )
    );
END;
$$;

-- 3. fn_submit_exam
DROP FUNCTION IF EXISTS public.fn_submit_exam(uuid, jsonb, int, int);
DROP FUNCTION IF EXISTS public.fn_submit_exam(uuid, jsonb, int);

CREATE OR REPLACE FUNCTION public.fn_submit_exam(p_attempt_id uuid, p_answers jsonb, p_tab_switches int, p_time_spent int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt record;
    v_test record;
    v_correct int := 0;
    v_total int;
    v_pct int;
    v_grade record;
    v_exp_gain int;
    v_status text := 'submitted';
    v_max_switches int := 2;
BEGIN
    SELECT * INTO v_attempt FROM csv_exam_attempts WHERE id = p_attempt_id;
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = v_attempt.test_id;

    v_total := v_attempt.total_questions;

    -- Grade answers
    -- We'll assume frontend sends the options properly matched, but here we can just update what the frontend calculated
    -- since doing the exact A/B/C/D to option text mapping in plpgsql JSON is tedious. 
    -- Wait! Let's do it fully server-side for security:
    
    WITH submitted_answers AS (
        SELECT key::int AS q_id, value::text AS ans_text
        FROM jsonb_each_text(p_answers)
    ),
    graded AS (
        UPDATE csv_attempt_questions aq
        SET 
            user_answer = sa.ans_text,
            is_correct = (
                CASE 
                    WHEN q.correct_answer = 'A' AND sa.ans_text = q.option_a THEN true
                    WHEN q.correct_answer = 'B' AND sa.ans_text = q.option_b THEN true
                    WHEN q.correct_answer = 'C' AND sa.ans_text = q.option_c THEN true
                    WHEN q.correct_answer = 'D' AND sa.ans_text = q.option_d THEN true
                    WHEN sa.ans_text = q.correct_answer THEN true
                    ELSE false
                END
            )
        FROM csv_questions q
        JOIN submitted_answers sa ON q.question_id = sa.q_id
        WHERE aq.question_id = q.question_id AND aq.attempt_id = p_attempt_id
        RETURNING aq.is_correct
    )
    SELECT count(*) INTO v_correct FROM graded WHERE is_correct = true;

    v_pct := CASE WHEN v_total > 0 THEN round((v_correct::numeric / v_total::numeric) * 100) ELSE 0 END;
    v_exp_gain := v_pct * 10;

    SELECT * INTO v_grade FROM csv_grading_policy 
    WHERE v_pct >= min_score AND v_pct <= max_score 
    ORDER BY min_score DESC LIMIT 1;

    -- Anti-cheat
    IF p_tab_switches >= v_max_switches THEN
        v_status := 'flagged';
    END IF;

    UPDATE csv_exam_attempts 
    SET 
        submitted_at = now(),
        score = v_correct,
        percentage = v_pct,
        time_taken_seconds = p_time_spent,
        tab_switches = p_tab_switches,
        status = v_status
    WHERE id = p_attempt_id;

    -- We skip EXP profile update in SQL for now as the user's frontend triggers EXP refresh anyway, 
    -- but ideally we'd UPDATE cadet_profiles SET exp = exp + v_exp_gain WHERE id = auth.uid();

    RETURN jsonb_build_object(
        'score', v_correct,
        'total', v_total,
        'percentage', v_pct,
        'exp_gain', v_exp_gain,
        'status', v_status,
        'passed', v_pct >= v_test.passing_percent,
        'grade_info', jsonb_build_object(
            'grade', COALESCE(v_grade.grade, 'FAIL'),
            'label', COALESCE(v_grade.remarks, 'Fail')
        )
    );
END;
$$;

-- 4. fn_get_exam_results
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt record;
    v_test record;
    v_grade record;
BEGIN
    SELECT * INTO v_attempt FROM csv_exam_attempts WHERE id = p_attempt_id;
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = v_attempt.test_id;
    
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
                    'topic_tag', q.subject_code,
                    'user_answer', aq.user_answer,
                    'correct_answer', CASE 
                        WHEN q.correct_answer = 'A' THEN q.option_a
                        WHEN q.correct_answer = 'B' THEN q.option_b
                        WHEN q.correct_answer = 'C' THEN q.option_c
                        WHEN q.correct_answer = 'D' THEN q.option_d
                        ELSE q.correct_answer
                    END,
                    'is_correct', aq.is_correct
                )
            )
            FROM csv_attempt_questions aq
            JOIN csv_questions q ON aq.question_id = q.question_id
            WHERE aq.attempt_id = p_attempt_id
        )
    );
END;
$$;
