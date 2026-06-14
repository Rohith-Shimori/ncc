-- 00039_auto_create_profiles.sql
-- Automatically create profile rows when a new user signs up via Supabase Auth.
-- Reads role, full_name, wing, certificate_level, ncc_number, rank, unit from raw_user_meta_data.

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_wing TEXT;
  v_cert TEXT;
  v_ncc_number TEXT;
  v_rank TEXT;
  v_unit TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'cadet');
  v_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'NCC User');

  IF v_role = 'cadet' THEN
    -- Normalize wing casing
    v_wing := COALESCE(NEW.raw_user_meta_data ->> 'wing', 'Army');
    IF UPPER(v_wing) = 'ARMY' THEN v_wing := 'Army';
    ELSIF UPPER(v_wing) = 'NAVY' THEN v_wing := 'Navy';
    ELSIF UPPER(v_wing) IN ('AIR', 'AIR FORCE', 'AIRFORCE') THEN v_wing := 'Air Force';
    ELSIF UPPER(v_wing) = 'COMMON' THEN v_wing := 'Army'; -- Default cadets to Army, not Common
    END IF;

    v_cert := COALESCE(NEW.raw_user_meta_data ->> 'certificate_level', 'A');
    v_ncc_number := NEW.raw_user_meta_data ->> 'ncc_number';

    INSERT INTO public.cadet_profiles (id, full_name, wing, certificate_level, ncc_number)
    VALUES (NEW.id, v_full_name, v_wing, v_cert, v_ncc_number)
    ON CONFLICT (id) DO NOTHING;

  ELSIF v_role = 'instructor' THEN
    v_rank := NEW.raw_user_meta_data ->> 'rank';
    v_unit := NEW.raw_user_meta_data ->> 'unit';

    INSERT INTO public.instructor_profiles (id, full_name, rank, unit)
    VALUES (NEW.id, v_full_name, v_rank, v_unit)
    ON CONFLICT (id) DO NOTHING;

  ELSIF v_role = 'admin' THEN
    INSERT INTO public.admin_profiles (id, full_name)
    VALUES (NEW.id, v_full_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Register the trigger
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
