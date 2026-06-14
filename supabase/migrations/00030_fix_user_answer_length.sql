-- 00030_fix_user_answer_length.sql
-- Drop the restrictive CHECK constraint and change user_answer to TEXT so it can store full strings instead of just A/B/C/D.

-- Drop the check constraint if it exists
ALTER TABLE public.csv_attempt_questions DROP CONSTRAINT IF EXISTS csv_attempt_questions_user_answer_check;

-- Change the data type to TEXT
ALTER TABLE public.csv_attempt_questions ALTER COLUMN user_answer TYPE TEXT;
