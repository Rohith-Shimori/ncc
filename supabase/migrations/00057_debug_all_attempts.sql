-- 00057_debug_all_attempts.sql
CREATE OR REPLACE FUNCTION public.fn_debug_all_attempts()
RETURNS TABLE (max_score integer, max_percentage integer, total_rows integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT MAX(score)::integer, MAX(percentage)::integer, COUNT(*)::integer FROM public.csv_exam_attempts;
$$;

GRANT EXECUTE ON FUNCTION public.fn_debug_all_attempts() TO anon, authenticated;
