-- 00048_debug_user_count.sql
CREATE OR REPLACE FUNCTION public.fn_debug_user_count()
RETURNS TABLE (role_meta text, user_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(raw_user_meta_data ->> 'role', 'no_role') AS role_meta, COUNT(*)::integer AS user_count
  FROM auth.users
  GROUP BY raw_user_meta_data ->> 'role';
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_debug_user_count() TO anon, authenticated;
