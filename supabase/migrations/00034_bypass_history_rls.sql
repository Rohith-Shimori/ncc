-- 00034_bypass_history_rls.sql
-- Bypasses potentially bugged RLS policies by using a Security Definer RPC to fetch user attempts.

CREATE OR REPLACE FUNCTION public.fn_get_my_csv_attempts()
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
BEGIN
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
    WHERE a.user_id = auth.uid()
      AND a.status IN ('submitted', 'flagged')
    ORDER BY a.submitted_at ASC;
END;
$$;
