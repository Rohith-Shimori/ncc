-- 00016_fix_registration_rls.sql
-- Relax the insert policy for cadet_profiles so that profiles can be created during registration
-- when email confirmation is enabled and the user session is not yet active.

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.cadet_profiles;

CREATE POLICY "Users can insert their own profile."
  ON public.cadet_profiles FOR INSERT
  WITH CHECK ( true );
