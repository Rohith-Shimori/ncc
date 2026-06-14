-- 00020_study_materials_storage.sql
-- Create study-materials bucket and setup RLS policies

-- 1. Create the public bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Setup RLS for storage.objects
-- Enable RLS on storage.objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Delete" ON storage.objects;

-- Select: Everyone can read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

-- Insert: Only Admin and Instructor
CREATE POLICY "Admin/Instructor Insert" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'study-materials' 
  AND (public.is_admin() OR public.is_instructor())
);

-- Update: Only Admin and Instructor
CREATE POLICY "Admin/Instructor Update" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'study-materials' 
  AND (public.is_admin() OR public.is_instructor())
);

-- Delete: Only Admin and Instructor
CREATE POLICY "Admin/Instructor Delete" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'study-materials' 
  AND (public.is_admin() OR public.is_instructor())
);
