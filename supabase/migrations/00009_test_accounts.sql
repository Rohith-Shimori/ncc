-- 00009_test_accounts.sql
-- Create Test Accounts for Admin and Instructor

DO $$
DECLARE
  v_admin_id UUID := 'd0000000-0000-0000-0000-000000000001';
  v_instructor_id UUID := 'd0000000-0000-0000-0000-000000000002';
BEGIN
  -- 1. Create Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ncc.gov.in') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      v_admin_id,
      'admin@ncc.gov.in',
      crypt('Admin@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Platform Administrator"}',
      'authenticated',
      'authenticated'
    );
    
    INSERT INTO public.admin_profiles (id, full_name)
    VALUES (v_admin_id, 'Platform Administrator');
  END IF;

  -- 2. Create Instructor User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'instructor@ncc.gov.in') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      v_instructor_id,
      'instructor@ncc.gov.in',
      crypt('Instructor@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Col. Rajveer Singh"}',
      'authenticated',
      'authenticated'
    );

    INSERT INTO public.instructor_profiles (id, full_name, rank, unit)
    VALUES (v_instructor_id, 'Col. Rajveer Singh', 'Colonel', '1st Punjab Bn NCC');
  END IF;
END $$;
