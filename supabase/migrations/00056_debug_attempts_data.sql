-- 00056_debug_attempts_data.sql
CREATE OR REPLACE FUNCTION public.fn_debug_attempts_data()
RETURNS TABLE (score integer, total_questions integer, percentage integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT score, total_questions, percentage FROM public.csv_exam_attempts LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.fn_debug_attempts_data() TO anon, authenticated;
