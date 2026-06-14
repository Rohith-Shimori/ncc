-- 00021_drop_auth_fkeys.sql
-- Drop foreign key constraints pointing to auth.users to allow mock custom auth
-- to function without requiring perfectly synced records in auth.users.

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;
ALTER TABLE public.course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_user_id_fkey;
ALTER TABLE public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_user_id_fkey;
ALTER TABLE public.tests DROP CONSTRAINT IF EXISTS tests_created_by_fkey;
ALTER TABLE public.question_banks DROP CONSTRAINT IF EXISTS question_banks_created_by_fkey;

-- Also check profiles if they have it
ALTER TABLE public.cadet_profiles DROP CONSTRAINT IF EXISTS cadet_profiles_id_fkey;
ALTER TABLE public.instructor_profiles DROP CONSTRAINT IF EXISTS instructor_profiles_id_fkey;
ALTER TABLE public.admin_profiles DROP CONSTRAINT IF EXISTS admin_profiles_id_fkey;
