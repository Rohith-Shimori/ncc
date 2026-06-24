-- 00052_debug_columns.sql
CREATE OR REPLACE FUNCTION public.fn_get_table_columns(p_table text)
RETURNS TABLE (column_name text, data_type text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.column_name::text, c.data_type::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = p_table;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_table_columns(text) TO anon, authenticated;
