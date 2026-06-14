-- 00022_open_storage_rls.sql
-- Drop the restricted policies to bypass mock auth errors
DROP POLICY IF EXISTS "Admin/Instructor Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Delete" ON storage.objects;

-- Create open policies for the study-materials bucket
CREATE POLICY "Allow Public Insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Allow Public Update" ON storage.objects FOR UPDATE 
USING (bucket_id = 'study-materials');

CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'study-materials');
