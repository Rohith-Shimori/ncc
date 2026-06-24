-- NCC Database Migration 00044
-- Adds missing utility security-definer helper functions required by Express backend controllers for notifications and email dispatches.

-- 1. fn_get_user_email: Fetches the email address for a given user UUID.
DROP FUNCTION IF EXISTS public.fn_get_user_email(uuid);
CREATE OR REPLACE FUNCTION public.fn_get_user_email(p_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = p_user_id;
$$;

-- 2. fn_get_all_instructors: Returns all instructors with their IDs, names, and emails.
DROP FUNCTION IF EXISTS public.fn_get_all_instructors();
CREATE OR REPLACE FUNCTION public.fn_get_all_instructors()
RETURNS TABLE(id uuid, full_name text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.full_name, u.email
  FROM public.instructor_profiles i
  JOIN auth.users u ON i.id = u.id;
$$;

-- 3. fn_get_users_by_wing: Returns all cadets matching a specific wing, or all cadets if p_wing is 'Common'.
DROP FUNCTION IF EXISTS public.fn_get_users_by_wing(text);
CREATE OR REPLACE FUNCTION public.fn_get_users_by_wing(p_wing text)
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, u.email
  FROM public.cadet_profiles c
  JOIN auth.users u ON c.id = u.id
  WHERE p_wing = 'Common' OR c.wing = p_wing;
$$;
