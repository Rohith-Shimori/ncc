-- 00012_system_wide_notifications.sql
-- Implements triggers for automated notifications across the platform

-- 1. LEVEL UP NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_level_up()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level > OLD.level THEN
    INSERT INTO public.notifications (user_id, type, title, content)
    VALUES (NEW.id, 'achievement', 'Level Up! 🎖️', 'Congratulations! You reached Level ' || NEW.level || '. Keep up the great work, Cadet!');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_level_up ON public.cadet_profiles;
CREATE TRIGGER tr_notify_level_up
  AFTER UPDATE OF level ON public.cadet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_level_up();


-- 2. ANNOUNCEMENT NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_announcement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND (OLD.is_active IS NULL OR OLD.is_active = false) THEN
    INSERT INTO public.notifications (user_id, type, title, content, link)
    SELECT id, 'announcement', NEW.title, 
           CASE WHEN length(NEW.content) > 100 THEN left(NEW.content, 97) || '...' ELSE NEW.content END,
           '/dashboard'
    FROM public.cadet_profiles
    WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_announcement ON public.announcements;
CREATE TRIGGER tr_notify_announcement
  AFTER INSERT OR UPDATE OF is_active ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_announcement();


-- 3. NEW COURSE NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_new_course()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, content, link)
  SELECT id, 'enrollment', 'New Course Available: ' || NEW.title, 
         'A new training module has been published for ' || NEW.target_wing || ' wing.',
         '/courses'
  FROM public.cadet_profiles
  WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_course ON public.courses;
CREATE TRIGGER tr_notify_new_course
  AFTER INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_new_course();


-- 4. NEW TEST NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_new_test()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    INSERT INTO public.notifications (user_id, type, title, content, link)
    SELECT id, 'exam', 'New Test Released: ' || NEW.title, 
           'A new ' || NEW.test_type || ' test is now available. Challenge yourself!',
           '/practice-tests'
    FROM public.cadet_profiles
    WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_test ON public.tests;
CREATE TRIGGER tr_notify_new_test
  AFTER INSERT ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_new_test();


-- 5. COURSE COMPLETION NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_course_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
  v_course_title TEXT;
  v_total_chapters INTEGER;
  v_completed_chapters INTEGER;
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Get course info
    SELECT m.course_id, c_table.title INTO v_course_id, v_course_title
    FROM chapters c 
    JOIN modules m ON c.module_id = m.id 
    JOIN courses c_table ON m.course_id = c_table.id
    WHERE c.id = NEW.chapter_id;

    -- Count total chapters in course
    SELECT COUNT(*) INTO v_total_chapters 
    FROM chapters c 
    JOIN modules m ON c.module_id = m.id 
    WHERE m.course_id = v_course_id;

    -- Count completed chapters for user
    SELECT COUNT(*) INTO v_completed_chapters 
    FROM user_progress up
    JOIN chapters c ON up.chapter_id = c.id
    JOIN modules m ON c.module_id = m.id
    WHERE m.course_id = v_course_id AND up.user_id = NEW.user_id AND up.completed = true;

    IF v_total_chapters > 0 AND v_total_chapters = v_completed_chapters THEN
      -- Check if notification already sent for this course completion
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = NEW.user_id 
        AND type = 'achievement' 
        AND title = 'Course Completed! 🎓' 
        AND content LIKE '%' || v_course_title || '%'
      ) THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
          NEW.user_id, 
          'achievement', 
          'Course Completed! 🎓', 
          'Congratulations! You have finished all chapters in "' || v_course_title || '".', 
          '/course/' || v_course_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_course_completion ON public.user_progress;
CREATE TRIGGER tr_notify_course_completion
  AFTER INSERT OR UPDATE OF completed ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_course_completion();


-- 6. ENROLLMENT NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  v_course_title TEXT;
BEGIN
  SELECT title INTO v_course_title FROM courses WHERE id = NEW.course_id;
  
  INSERT INTO public.notifications (user_id, type, title, content, link)
  VALUES (
    NEW.user_id,
    'enrollment',
    'Enrolled in ' || v_course_title,
    'Welcome to the course! Start your learning journey now.',
    '/course/' || NEW.course_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_enrollment ON public.course_enrollments;
CREATE TRIGGER tr_notify_enrollment
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_enrollment();
