-- 00027_allow_null_options.sql
-- Removes the NOT NULL constraint from option_c and option_d to support True/False and 2-option questions

ALTER TABLE IF EXISTS csv_questions ALTER COLUMN option_c DROP NOT NULL;
ALTER TABLE IF EXISTS csv_questions ALTER COLUMN option_d DROP NOT NULL;
