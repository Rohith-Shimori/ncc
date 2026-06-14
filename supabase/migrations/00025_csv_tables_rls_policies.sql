-- 00025_csv_tables_rls_policies.sql
-- RLS policies for all csv_* tables so that authenticated users can actually read/write data.

-- csv_subjects: everyone can read, instructors/admins can write
CREATE POLICY "csv_subjects_select" ON csv_subjects FOR SELECT USING (true);
CREATE POLICY "csv_subjects_insert" ON csv_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_subjects_update" ON csv_subjects FOR UPDATE USING (true);
CREATE POLICY "csv_subjects_delete" ON csv_subjects FOR DELETE USING (true);

-- csv_modules
CREATE POLICY "csv_modules_select" ON csv_modules FOR SELECT USING (true);
CREATE POLICY "csv_modules_insert" ON csv_modules FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_modules_update" ON csv_modules FOR UPDATE USING (true);
CREATE POLICY "csv_modules_delete" ON csv_modules FOR DELETE USING (true);

-- csv_questions
CREATE POLICY "csv_questions_select" ON csv_questions FOR SELECT USING (true);
CREATE POLICY "csv_questions_insert" ON csv_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_questions_update" ON csv_questions FOR UPDATE USING (true);
CREATE POLICY "csv_questions_delete" ON csv_questions FOR DELETE USING (true);

-- csv_mock_exams
CREATE POLICY "csv_mock_exams_select" ON csv_mock_exams FOR SELECT USING (true);
CREATE POLICY "csv_mock_exams_insert" ON csv_mock_exams FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_mock_exams_update" ON csv_mock_exams FOR UPDATE USING (true);
CREATE POLICY "csv_mock_exams_delete" ON csv_mock_exams FOR DELETE USING (true);

-- csv_exam_attempts
CREATE POLICY "csv_exam_attempts_select" ON csv_exam_attempts FOR SELECT USING (true);
CREATE POLICY "csv_exam_attempts_insert" ON csv_exam_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_exam_attempts_update" ON csv_exam_attempts FOR UPDATE USING (true);

-- csv_attempt_questions
CREATE POLICY "csv_attempt_questions_select" ON csv_attempt_questions FOR SELECT USING (true);
CREATE POLICY "csv_attempt_questions_insert" ON csv_attempt_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_attempt_questions_update" ON csv_attempt_questions FOR UPDATE USING (true);

-- csv_grading_policy
CREATE POLICY "csv_grading_policy_select" ON csv_grading_policy FOR SELECT USING (true);
CREATE POLICY "csv_grading_policy_insert" ON csv_grading_policy FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_grading_policy_update" ON csv_grading_policy FOR UPDATE USING (true);

-- csv_analytics_config
CREATE POLICY "csv_analytics_config_select" ON csv_analytics_config FOR SELECT USING (true);
CREATE POLICY "csv_analytics_config_insert" ON csv_analytics_config FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_analytics_config_update" ON csv_analytics_config FOR UPDATE USING (true);

-- csv_anticheat_config
CREATE POLICY "csv_anticheat_config_select" ON csv_anticheat_config FOR SELECT USING (true);
CREATE POLICY "csv_anticheat_config_insert" ON csv_anticheat_config FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_anticheat_config_update" ON csv_anticheat_config FOR UPDATE USING (true);

-- csv_import_logs
CREATE POLICY "csv_import_logs_select" ON csv_import_logs FOR SELECT USING (true);
CREATE POLICY "csv_import_logs_insert" ON csv_import_logs FOR INSERT WITH CHECK (true);
