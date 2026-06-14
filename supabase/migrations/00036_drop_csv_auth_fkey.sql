-- 00036_drop_csv_auth_fkey.sql
-- Removes the foreign key constraint to auth.users for the new CSV engine.
-- This aligns with migration 00021_drop_auth_fkeys.sql which dropped them for the old engine,
-- preventing crashes in local development environments where auth.users is out of sync.

ALTER TABLE public.csv_exam_attempts 
DROP CONSTRAINT IF EXISTS csv_exam_attempts_user_id_fkey;
