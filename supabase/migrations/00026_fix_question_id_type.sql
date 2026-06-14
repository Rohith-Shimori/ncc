-- 00026_fix_question_id_type.sql
-- Fixes the question_id type to support string-based custom IDs (e.g., "Q-NCC_GEN-0001") instead of SERIAL

-- 1. Drop the foreign key constraint first
ALTER TABLE IF EXISTS csv_attempt_questions DROP CONSTRAINT IF EXISTS csv_attempt_questions_question_id_fkey;

-- 2. Alter the column type in csv_questions
ALTER TABLE IF EXISTS csv_questions ALTER COLUMN question_id DROP DEFAULT;
ALTER TABLE IF EXISTS csv_questions ALTER COLUMN question_id TYPE VARCHAR(50);

-- 3. Alter the column type in csv_attempt_questions
ALTER TABLE IF EXISTS csv_attempt_questions ALTER COLUMN question_id TYPE VARCHAR(50);

-- 4. Re-add the foreign key constraint
ALTER TABLE IF EXISTS csv_attempt_questions 
  ADD CONSTRAINT csv_attempt_questions_question_id_fkey 
  FOREIGN KEY (question_id) REFERENCES csv_questions(question_id) ON DELETE CASCADE;
