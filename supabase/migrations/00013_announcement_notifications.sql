-- 00013_announcement_notifications.sql

-- 1. EFFICIENT PROGRESS HELPER
CREATE OR REPLACE FUNCTION public.fn_get_course_chapter_ids(p_course_id UUID)
RETURNS TABLE(chapter_id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id FROM public.chapters c
  JOIN public.modules m ON c.module_id = m.id
  WHERE m.course_id = p_course_id;
END;
$$;

-- 2. ANNOUNCEMENT TRIGGER
CREATE OR REPLACE FUNCTION public.fn_notify_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cadet RECORD;
BEGIN
  -- Notify all cadets if target_wing is 'Common', else notify only those in the wing
  FOR v_cadet IN 
    SELECT id FROM public.cadet_profiles 
    WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing
  LOOP
    INSERT INTO public.notifications (user_id, type, title, content, link)
    VALUES (
      v_cadet.id,
      'announcement',
      NEW.title,
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      '/dashboard'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_on_announcement_created ON public.announcements;
CREATE TRIGGER tr_on_announcement_created
  AFTER INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_announcement();

-- Grant execute
GRANT EXECUTE ON FUNCTION public.fn_get_course_chapter_ids(UUID) TO authenticated;
