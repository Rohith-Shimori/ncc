-- 00018_gamification_schema.sql
-- Add gamification columns to cadet profiles

ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- Update the leaderboard function to include streaks
DROP FUNCTION IF EXISTS public.fn_get_leaderboard(INTEGER, TEXT);
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
