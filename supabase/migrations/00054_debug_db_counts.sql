-- 00054_debug_db_counts.sql
CREATE OR REPLACE FUNCTION public.fn_debug_db_counts()
RETURNS TABLE (table_name text, row_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 'cadet_profiles'::text, COUNT(*)::integer FROM public.cadet_profiles
  UNION ALL
  SELECT 'test_attempts'::text, COUNT(*)::integer FROM public.test_attempts
  UNION ALL
  SELECT 'csv_exam_attempts'::text, COUNT(*)::integer FROM public.csv_exam_attempts
  UNION ALL
  SELECT 'user_progress'::text, COUNT(*)::integer FROM public.user_progress
  UNION ALL
  SELECT 'notifications'::text, COUNT(*)::integer FROM public.notifications;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_debug_db_counts() TO anon, authenticated;
