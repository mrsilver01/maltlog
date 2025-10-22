-- Phase 4: Create Supabase Storage bucket for whisky images
-- This bucket will store all whisky catalog images migrated from /public/whiskies

-- Create the 'whiskies' bucket for storing whisky catalog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'whiskies',
  'whiskies',
  true,  -- Public bucket for direct URL access
  10485760,  -- 10MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the whiskies bucket
-- Allow public read access (for displaying images)
CREATE POLICY "Public read access for whiskies bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'whiskies');

-- Allow authenticated users to upload whisky images (for admin purposes)
CREATE POLICY "Authenticated upload for whiskies bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'whiskies'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update whisky images (for admin purposes)
CREATE POLICY "Authenticated update for whiskies bucket" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'whiskies'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete whisky images (for admin purposes)
CREATE POLICY "Authenticated delete for whiskies bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'whiskies'
  AND auth.role() = 'authenticated'
);