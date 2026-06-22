-- 00041_profile_avatar.sql
-- Add avatar_url column to profiles, create avatars storage bucket, and setup secure notification RPCs

-- 1. Add avatar_url column to profile tables if they do not exist
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.instructor_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop existing storage policies if any
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Upload Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Update Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Delete Avatar" ON storage.objects;

-- 4. Enable public reading of avatar images
CREATE POLICY "Public Avatar Access" ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 5. Enable authenticated users to manage their own avatar images (prefixed by their uid)
CREATE POLICY "Authenticated User Upload Avatar" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND name LIKE auth.uid()::text || '%'
);

CREATE POLICY "Authenticated User Update Avatar" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND name LIKE auth.uid()::text || '%'
);

CREATE POLICY "Authenticated User Delete Avatar" ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND name LIKE auth.uid()::text || '%'
);

-- 6. Create robust RPCs for Notifications (using SECURITY DEFINER to bypass RLS restrictions securely)

-- Mark all notifications as read for current user
CREATE OR REPLACE FUNCTION public.fn_mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true 
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$;

-- Delete single notification for current user
CREATE OR REPLACE FUNCTION public.fn_delete_notification(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Clear all notifications for current user
CREATE OR REPLACE FUNCTION public.fn_clear_all_notifications()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE user_id = auth.uid();
END;
$$;

-- Grant Execution Permissions
GRANT EXECUTE ON FUNCTION public.fn_mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_delete_notification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_clear_all_notifications() TO authenticated;
