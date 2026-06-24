-- 00058_debug_user_attempts.sql
CREATE OR REPLACE FUNCTION public.fn_get_user_attempts(p_name text)
RETURNS TABLE (score integer, total_questions integer, percentage integer, status varchar)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT score, total_questions, percentage, status
  FROM public.csv_exam_attempts
  WHERE user_id = (SELECT id FROM public.cadet_profiles WHERE full_name = p_name LIMIT 1);
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_user_attempts(text) TO anon, authenticated;
