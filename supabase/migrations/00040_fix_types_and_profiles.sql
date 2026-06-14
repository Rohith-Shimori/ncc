-- 00040_fix_types_and_profiles.sql
-- 1. DROP old function overloads that use INTEGER for test_id
DROP FUNCTION IF EXISTS public.fn_start_csv_exam(INTEGER, UUID);
DROP FUNCTION IF EXISTS public.fn_get_my_csv_attempts(UUID);

-- 2. RECREATE fn_start_csv_exam using VARCHAR for test_id
CREATE OR REPLACE FUNCTION public.fn_start_csv_exam(
    p_test_id VARCHAR,
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

    -- Get test duration
    SELECT time_limit_minutes INTO v_duration
    FROM csv_mock_exams
    WHERE test_id = p_test_id AND is_active = TRUE;

    IF v_duration IS NULL THEN
        RAISE EXCEPTION 'Test not found or inactive';
    END IF;

    -- Create attempt
    INSERT INTO csv_exam_attempts (user_id, test_id, status)
    VALUES (v_actual_user_id, p_test_id, 'in_progress')
    RETURNING id INTO v_attempt_id;

    -- Randomly select questions based on distribution (mock logic)
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

    -- Save attempt questions
    INSERT INTO csv_attempt_questions (attempt_id, question_id, subject_code)
    SELECT v_attempt_id, q->>'id', q->>'subject_code'
    FROM jsonb_array_elements(v_questions) q;

    -- Return payload
    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'duration_minutes', v_duration,
        'csv_questions', v_questions
    );
END;
$$;


-- 3. RECREATE fn_submit_csv_exam with VARCHAR local v_test_id
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


-- 4. RECREATE fn_get_my_csv_attempts with test_id VARCHAR
CREATE OR REPLACE FUNCTION public.fn_get_my_csv_attempts(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    test_id VARCHAR,
    status VARCHAR,
    score INTEGER,
    total_questions INTEGER,
    percentage INTEGER,
    time_taken_seconds INTEGER,
    tab_switches INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    test_name VARCHAR,
    passing_percent INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_actual_user_id UUID;
BEGIN
    v_actual_user_id := COALESCE(p_user_id, auth.uid());

    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        a.test_id,
        a.status,
        a.score,
        a.total_questions,
        a.percentage,
        a.time_taken_seconds,
        a.tab_switches,
        a.started_at,
        a.submitted_at,
        m.test_name,
        m.passing_percent
    FROM csv_exam_attempts a
    LEFT JOIN csv_mock_exams m ON a.test_id = m.test_id
    WHERE a.user_id = v_actual_user_id
      AND a.status IN ('submitted', 'flagged')
    ORDER BY a.submitted_at ASC;
END;
$$;


-- 5. UPDATE system notification triggers for case-insensitive wing checks
CREATE OR REPLACE FUNCTION public.fn_notify_announcement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND (OLD.is_active IS NULL OR OLD.is_active = false) THEN
    INSERT INTO public.notifications (user_id, type, title, content, link)
    SELECT id, 'announcement', NEW.title, 
           CASE WHEN length(NEW.content) > 100 THEN left(NEW.content, 97) || '...' ELSE NEW.content END,
           '/dashboard'
    FROM public.cadet_profiles
    WHERE NEW.target_wing = 'Common' OR LOWER(wing) = LOWER(NEW.target_wing);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_notify_new_course()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, content, link)
  SELECT id, 'enrollment', 'New Course Available: ' || NEW.title, 
         'A new training module has been published for ' || NEW.target_wing || ' wing.',
         '/courses'
  FROM public.cadet_profiles
  WHERE NEW.target_wing = 'Common' OR LOWER(wing) = LOWER(NEW.target_wing);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_notify_new_test()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    INSERT INTO public.notifications (user_id, type, title, content, link)
    SELECT id, 'exam', 'New Test Released: ' || NEW.title, 
           'A new ' || NEW.test_type || ' test is now available. Challenge yourself!',
           '/practice-tests'
    FROM public.cadet_profiles
    WHERE NEW.target_wing = 'Common' OR LOWER(wing) = LOWER(NEW.target_wing);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. ADD new trigger for newly created csv_mock_exams
CREATE OR REPLACE FUNCTION public.fn_notify_new_csv_test()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    INSERT INTO public.notifications (user_id, type, title, content, link)
    SELECT id, 'exam', 'New Test Released: ' || NEW.test_name, 
           'A new mock exam is now available for ' || NEW.wing || ' wing, Certificate ' || NEW.certificate_level || '.',
           '/practice-tests'
    FROM public.cadet_profiles
    WHERE NEW.wing = 'Common' OR LOWER(wing) = LOWER(NEW.wing);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_csv_test ON public.csv_mock_exams;
CREATE TRIGGER tr_notify_new_csv_test
  AFTER INSERT ON public.csv_mock_exams
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_new_csv_test();


-- 7. BACKFILL profiles for pre-existing auth users depending on metadata role
DO $$
DECLARE
  v_user RECORD;
  v_role TEXT;
  v_full_name TEXT;
  v_wing TEXT;
  v_cert TEXT;
  v_ncc_number TEXT;
  v_rank TEXT;
  v_unit TEXT;
BEGIN
  FOR v_user IN SELECT id, raw_user_meta_data FROM auth.users LOOP
    v_role := COALESCE(v_user.raw_user_meta_data ->> 'role', 'cadet');
    v_full_name := COALESCE(v_user.raw_user_meta_data ->> 'full_name', 'NCC User');

    IF v_role = 'cadet' THEN
      v_wing := COALESCE(v_user.raw_user_meta_data ->> 'wing', 'Army');
      IF UPPER(v_wing) = 'ARMY' THEN v_wing := 'Army';
      ELSIF UPPER(v_wing) = 'NAVY' THEN v_wing := 'Navy';
      ELSIF UPPER(v_wing) IN ('AIR', 'AIR FORCE', 'AIRFORCE') THEN v_wing := 'Air Force';
      ELSIF UPPER(v_wing) = 'COMMON' THEN v_wing := 'Army';
      END IF;

      v_cert := COALESCE(v_user.raw_user_meta_data ->> 'certificate_level', 'A');
      v_ncc_number := v_user.raw_user_meta_data ->> 'ncc_number';

      INSERT INTO public.cadet_profiles (id, full_name, wing, certificate_level, ncc_number)
      VALUES (v_user.id, v_full_name, v_wing, v_cert, v_ncc_number)
      ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'instructor' THEN
      v_rank := v_user.raw_user_meta_data ->> 'rank';
      v_unit := v_user.raw_user_meta_data ->> 'unit';

      INSERT INTO public.instructor_profiles (id, full_name, rank, unit)
      VALUES (v_user.id, v_full_name, v_rank, v_unit)
      ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'admin' THEN
      INSERT INTO public.admin_profiles (id, full_name)
      VALUES (v_user.id, v_full_name)
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;
END $$;


-- 8. GRANT executions
GRANT EXECUTE ON FUNCTION public.fn_start_csv_exam(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_csv_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_my_csv_attempts(UUID) TO authenticated;
