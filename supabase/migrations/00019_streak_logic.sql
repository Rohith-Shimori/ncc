-- 00019_streak_logic.sql
-- Add function to safely update cadet daily streaks

CREATE OR REPLACE FUNCTION public.fn_update_daily_streak()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cadet RECORD;
  v_new_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_login DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get cadet
  SELECT * INTO v_cadet FROM cadet_profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not a cadet');
  END IF;

  v_last_login := v_cadet.last_login_date;
  v_new_streak := COALESCE(v_cadet.current_streak, 0);
  v_longest_streak := COALESCE(v_cadet.longest_streak, 0);

  -- If already logged in today, do nothing
  IF v_last_login = v_today THEN
    RETURN jsonb_build_object('success', true, 'streak', v_new_streak, 'updated', false);
  END IF;

  -- Calculate new streak
  IF v_last_login = v_today - 1 THEN
    v_new_streak := v_new_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  -- Update longest streak
  IF v_new_streak > v_longest_streak THEN
    v_longest_streak := v_new_streak;
  END IF;

  -- Update profile
  UPDATE cadet_profiles SET
    current_streak = v_new_streak,
    longest_streak = v_longest_streak,
    last_login_date = v_today
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'streak', v_new_streak, 'updated', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_update_daily_streak() TO authenticated;
