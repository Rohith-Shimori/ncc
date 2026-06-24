-- NCC Database Migration 00046
-- Adds missing fn_complete_chapter utility security-definer helper function required by the frontend chapter completion system.

-- Drop existing function if any
DROP FUNCTION IF EXISTS public.fn_complete_chapter(uuid);

CREATE OR REPLACE FUNCTION public.fn_complete_chapter(p_chapter_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_exp_gain integer := 100;
  v_current_exp integer;
  v_new_level integer;
BEGIN
  -- Get active authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Insert or update user progress for this chapter
  INSERT INTO public.user_progress (user_id, chapter_id, completed, completed_at)
  VALUES (v_user_id, p_chapter_id, true, now())
  ON CONFLICT (user_id, chapter_id) 
  DO UPDATE SET completed = true, completed_at = now();

  -- 2. Award 100 EXP to the cadet profile and update level
  IF EXISTS (SELECT 1 FROM public.cadet_profiles WHERE id = v_user_id) THEN
    -- Get current exp
    SELECT COALESCE(exp, 0) INTO v_current_exp FROM public.cadet_profiles WHERE id = v_user_id;
    
    -- Increment exp
    v_current_exp := v_current_exp + v_exp_gain;
    
    -- Calculate new level (1 level per 1000 exp, starting at level 1)
    v_new_level := (v_current_exp / 1000) + 1;
    
    -- Update profile
    UPDATE public.cadet_profiles
    SET exp = v_current_exp,
        level = GREATEST(level, v_new_level)
    WHERE id = v_user_id;
  END IF;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.fn_complete_chapter(uuid) TO authenticated;
