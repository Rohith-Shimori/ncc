-- 00008_rls_hardening.sql
-- Grant ALL permissions to Admins and Instructors for platform management

-- Helper functions for cleaner RLS (optional but recommended)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.instructor_profiles WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. COURSES, MODULES, CHAPTERS (Admin only management)
CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can manage chapters" ON public.chapters
  FOR ALL TO authenticated USING (public.is_admin());

-- 2. TESTS, QUESTIONS, QUESTION BANKS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can manage tests" ON public.tests
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "Admins and Instructors can manage questions" ON public.questions
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "Admins and Instructors can manage banks" ON public.question_banks
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 3. ANNOUNCEMENTS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can manage announcements" ON public.announcements
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 4. VIEWING ALL RESULTS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can view all attempts" ON public.test_attempts
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "Admins and Instructors can view all answers" ON public.test_answers
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 5. VIEWING ALL PROGRESS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can view all progress" ON public.user_progress
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 6. VIEWING ALL PROFILES (Admins & Instructors - though already public, adding explicitly for clarity)
CREATE POLICY "Admins can manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can manage instructor profiles" ON public.instructor_profiles
  FOR ALL TO authenticated USING (public.is_admin());
