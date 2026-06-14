-- 00038_fix_history_rpc_userid.sql
-- Fixes the history RPC by explicitly accepting the user_id from the frontend.
-- This bypasses the same auth.uid() edge case that affected the exam start function.

CREATE OR REPLACE FUNCTION public.fn_get_my_csv_attempts(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    test_id INTEGER,
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
