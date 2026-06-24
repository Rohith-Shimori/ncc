-- 00051_debug_migrations.sql
CREATE OR REPLACE FUNCTION public.fn_get_applied_migrations()
RETURNS TABLE (version text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT version FROM supabase_migrations.schema_migrations ORDER BY version ASC;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_applied_migrations() TO anon, authenticated;
