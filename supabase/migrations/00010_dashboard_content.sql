-- 00010_dashboard_content.sql
-- Restoring dashboard content and seeding cadet progress for Abhiram R

DO $$
DECLARE
    cadet_id UUID;
    drill_course_id UUID;
    weapon_course_id UUID;
    test_id UUID;
BEGIN
    -- 1. Get IDs
    SELECT id INTO cadet_id FROM auth.users WHERE email = 'cadet@ncc.gov.in' LIMIT 1;
    SELECT id INTO drill_course_id FROM public.courses WHERE title ILIKE '%Basic Drill%' LIMIT 1;
    SELECT id INTO weapon_course_id FROM public.courses WHERE title ILIKE '%Weapon Training%' LIMIT 1;
    SELECT id INTO test_id FROM public.tests WHERE title ILIKE '%Basic Drill%' LIMIT 1;

    -- 2. Restore Announcements if missing
    IF NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'Annual Training Camp 2024') THEN
        INSERT INTO public.announcements (title, content, priority, target_wing, is_active)
        VALUES 
        ('Annual Training Camp 2024', 'ATC 2024 registration is now open. All cadets must register by end of month.', 'high', 'Common', true),
        ('New Weapon Training Module', 'A new interactive module for SLR 7.62mm is now available in the courses section.', 'normal', 'Army', true),
        ('Practice Test Series', 'Weekly practice tests for B-Certificate exam are now live.', 'normal', 'Common', true);
    END IF;

    -- 3. Seed Progress for Abhiram R if cadet found
    IF cadet_id IS NOT NULL THEN
        -- Enroll in Drill
        IF drill_course_id IS NOT NULL THEN
            INSERT INTO public.course_enrollments (user_id, course_id, status)
            VALUES (cadet_id, drill_course_id, 'enrolled')
            ON CONFLICT (user_id, course_id) DO NOTHING;
        END IF;

        -- Enroll in Weapon Training
        IF weapon_course_id IS NOT NULL THEN
            INSERT INTO public.course_enrollments (user_id, course_id, status)
            VALUES (cadet_id, weapon_course_id, 'enrolled')
            ON CONFLICT (user_id, course_id) DO NOTHING;
        END IF;

        -- Add Test Attempt for Stats
        IF test_id IS NOT NULL THEN
            INSERT INTO public.test_attempts (test_id, user_id, score, status, submitted_at, total_correct, total_questions)
            VALUES (test_id, cadet_id, 85, 'completed', NOW() - INTERVAL '1 day', 17, 20)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;
