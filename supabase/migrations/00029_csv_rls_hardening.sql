-- 00029_csv_rls_hardening.sql
-- Harden RLS policies for CSV tables so only instructors/admins can mutate content

-- Drop existing highly permissive policies (from 00025)
DROP POLICY IF EXISTS "csv_subjects_insert" ON csv_subjects;
DROP POLICY IF EXISTS "csv_subjects_update" ON csv_subjects;
DROP POLICY IF EXISTS "csv_subjects_delete" ON csv_subjects;

DROP POLICY IF EXISTS "csv_modules_insert" ON csv_modules;
DROP POLICY IF EXISTS "csv_modules_update" ON csv_modules;
DROP POLICY IF EXISTS "csv_modules_delete" ON csv_modules;

DROP POLICY IF EXISTS "csv_questions_insert" ON csv_questions;
DROP POLICY IF EXISTS "csv_questions_update" ON csv_questions;
DROP POLICY IF EXISTS "csv_questions_delete" ON csv_questions;

DROP POLICY IF EXISTS "csv_mock_exams_insert" ON csv_mock_exams;
DROP POLICY IF EXISTS "csv_mock_exams_update" ON csv_mock_exams;
DROP POLICY IF EXISTS "csv_mock_exams_delete" ON csv_mock_exams;

DROP POLICY IF EXISTS "csv_import_logs_insert" ON csv_import_logs;

-- Recreate them with strict role checks using the helper functions created in 00017
CREATE POLICY "csv_subjects_insert_auth" ON csv_subjects FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_subjects_update_auth" ON csv_subjects FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_subjects_delete_auth" ON csv_subjects FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_modules_insert_auth" ON csv_modules FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_modules_update_auth" ON csv_modules FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_modules_delete_auth" ON csv_modules FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_questions_insert_auth" ON csv_questions FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_questions_update_auth" ON csv_questions FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_questions_delete_auth" ON csv_questions FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_mock_exams_insert_auth" ON csv_mock_exams FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_mock_exams_update_auth" ON csv_mock_exams FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_mock_exams_delete_auth" ON csv_mock_exams FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_import_logs_insert_auth" ON csv_import_logs FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());

-- User attempts and questions: 
-- A student should only be able to insert/update their OWN attempts.
-- But since the RPC runs with SECURITY DEFINER, the RLS policies don't strictly block the RPC.
-- However, direct API access must be restricted.
DROP POLICY IF EXISTS "csv_exam_attempts_insert" ON csv_exam_attempts;
DROP POLICY IF EXISTS "csv_exam_attempts_update" ON csv_exam_attempts;
DROP POLICY IF EXISTS "csv_exam_attempts_select" ON csv_exam_attempts;

CREATE POLICY "csv_exam_attempts_select_auth" ON csv_exam_attempts FOR SELECT USING (user_id = auth.uid() OR public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_exam_attempts_insert_auth" ON csv_exam_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "csv_exam_attempts_update_auth" ON csv_exam_attempts FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "csv_attempt_questions_insert" ON csv_attempt_questions;
DROP POLICY IF EXISTS "csv_attempt_questions_update" ON csv_attempt_questions;
DROP POLICY IF EXISTS "csv_attempt_questions_select" ON csv_attempt_questions;

CREATE POLICY "csv_attempt_questions_select_auth" ON csv_attempt_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM csv_exam_attempts WHERE id = attempt_id AND (user_id = auth.uid() OR public.is_admin() OR public.is_instructor()))
);
-- Insert/Update is handled by RPC, but we allow user to insert their own via API if needed
CREATE POLICY "csv_attempt_questions_insert_auth" ON csv_attempt_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM csv_exam_attempts WHERE id = attempt_id AND user_id = auth.uid())
);
CREATE POLICY "csv_attempt_questions_update_auth" ON csv_attempt_questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM csv_exam_attempts WHERE id = attempt_id AND user_id = auth.uid())
);
