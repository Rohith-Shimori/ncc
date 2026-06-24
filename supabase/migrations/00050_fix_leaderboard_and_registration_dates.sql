-- 00050_fix_leaderboard_and_registration_dates.sql
-- 1. Drop overloaded fn_get_leaderboard signatures to resolve PGRST203 Multiple Choices conflict
DROP FUNCTION IF EXISTS public.fn_get_leaderboard(INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.fn_get_leaderboard(TEXT, INTEGER);

-- 2. Add missing columns to profile tables (skipped during history repair)
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.instructor_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Re-create the clean leaderboard function
CREATE OR REPLACE FUNCTION public.fn_get_leaderboard(p_limit INTEGER DEFAULT 10, p_wing TEXT DEFAULT 'All')
RETURNS TABLE (
  rank BIGINT,
  full_name TEXT,
  wing TEXT,
  exp INTEGER,
  level INTEGER,
  current_streak INTEGER,
  is_current_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cp.exp DESC) as rank,
    cp.full_name,
    cp.wing,
    cp.exp,
    cp.level,
    cp.current_streak,
    (cp.id = auth.uid()) as is_current_user
  FROM cadet_profiles cp
  WHERE (p_wing = 'All' OR cp.wing = p_wing)
  ORDER BY cp.exp DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_leaderboard(INTEGER, TEXT) TO anon, authenticated;

-- 4. Backfill exact registration date (created_at) from auth.users to all profile tables
UPDATE public.cadet_profiles c
SET created_at = u.created_at
FROM auth.users u
WHERE c.id = u.id;

UPDATE public.instructor_profiles i
SET created_at = u.created_at
FROM auth.users u
WHERE i.id = u.id;

UPDATE public.admin_profiles a
SET created_at = u.created_at
FROM auth.users u
WHERE a.id = u.id;

-- 5. Update the signup trigger to write the exact created_at timestamp
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
    v_wing := COALESCE(NEW.raw_user_meta_data ->> 'wing', 'Army');
    IF UPPER(v_wing) = 'ARMY' THEN v_wing := 'Army';
    ELSIF UPPER(v_wing) = 'NAVY' THEN v_wing := 'Navy';
    ELSIF UPPER(v_wing) IN ('AIR', 'AIR FORCE', 'AIRFORCE') THEN v_wing := 'Air Force';
    ELSIF UPPER(v_wing) = 'COMMON' THEN v_wing := 'Army';
    END IF;

    v_cert := COALESCE(NEW.raw_user_meta_data ->> 'certificate_level', 'A');
    v_ncc_number := NEW.raw_user_meta_data ->> 'ncc_number';

    INSERT INTO public.cadet_profiles (id, full_name, wing, certificate_level, ncc_number, created_at)
    VALUES (NEW.id, v_full_name, v_wing, v_cert, v_ncc_number, NEW.created_at)
    ON CONFLICT (id) DO NOTHING;

  ELSIF v_role = 'instructor' THEN
    v_rank := NEW.raw_user_meta_data ->> 'rank';
    v_unit := NEW.raw_user_meta_data ->> 'unit';

    INSERT INTO public.instructor_profiles (id, full_name, rank, unit, created_at)
    VALUES (NEW.id, v_full_name, v_rank, v_unit, NEW.created_at)
    ON CONFLICT (id) DO NOTHING;

  ELSIF v_role = 'admin' THEN
    INSERT INTO public.admin_profiles (id, full_name, created_at)
    VALUES (NEW.id, v_full_name, NEW.created_at)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
