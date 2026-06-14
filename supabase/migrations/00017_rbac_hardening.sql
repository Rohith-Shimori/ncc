-- 00017_rbac_hardening.sql
-- Expand RLS for cadet management by Admins and Instructors

-- Admins can update and delete cadet profiles
CREATE POLICY "Admins can update cadet profiles"
  ON public.cadet_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete cadet profiles"
  ON public.cadet_profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Instructors can update cadet profiles (e.g., correcting wings)
CREATE POLICY "Instructors can update cadet profiles"
  ON public.cadet_profiles FOR UPDATE
  TO authenticated
  USING (public.is_instructor());

-- Admins can insert cadet profiles (assuming the auth.user is created via an edge function)
CREATE POLICY "Admins can insert cadet profiles"
  ON public.cadet_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Instructors can insert cadet profiles
CREATE POLICY "Instructors can insert cadet profiles"
  ON public.cadet_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_instructor());
