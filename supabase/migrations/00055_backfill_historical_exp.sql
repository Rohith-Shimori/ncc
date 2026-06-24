-- 00055_backfill_historical_exp.sql
-- Backfill cadet EXP and Levels from their historical mock exam attempts in csv_exam_attempts
DO $$
DECLARE
  v_rec RECORD;
  v_total_exp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Loop through each cadet profile that has submitted exam attempts
  FOR v_rec IN 
    SELECT user_id, SUM(score * 10)::integer AS total_exp
    FROM public.csv_exam_attempts
    WHERE status = 'submitted' AND user_id IS NOT NULL
    GROUP BY user_id
  LOOP
    -- Calculate new level using the standard formula
    v_new_level := FLOOR(v_rec.total_exp / 1000) + 1;

    -- Update cadet profile with their actual accumulated EXP and Level
    UPDATE public.cadet_profiles
    SET 
      exp = COALESCE(v_rec.total_exp, 0),
      level = COALESCE(v_new_level, 1)
    WHERE id = v_rec.user_id;
  END LOOP;
END $$;
