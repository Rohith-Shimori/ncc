-- 00053_add_missing_columns_for_real.sql
-- 1. Add missing gamification and profile columns to public.cadet_profiles
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add missing avatar columns to instructor and admin profiles
ALTER TABLE public.instructor_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Re-create the leaderboard function with explicit search path
DROP FUNCTION IF EXISTS public.fn_get_leaderboard(INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.fn_get_leaderboard(TEXT, INTEGER);

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
SET search_path = public
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

-- 4. Re-backfill exact registration date (created_at) from auth.users to all profile tables
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
