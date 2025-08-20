-- Create storage bucket for academic articles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'academic-articles', 
  'academic-articles', 
  true, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create storage policies for academic articles bucket
CREATE POLICY "Anyone can view academic articles" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'academic-articles');

CREATE POLICY "Authenticated users can upload academic articles" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'academic-articles' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their uploaded articles" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'academic-articles' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete their uploaded articles" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'academic-articles' 
  AND auth.role() = 'authenticated'
);

-- Add file_path column to articles table to store the path to the uploaded file
ALTER TABLE public.articles 
ADD COLUMN file_path TEXT,
ADD COLUMN file_size BIGINT,
ADD COLUMN file_type TEXT;

-- Update the pdf_url column to be nullable since we'll use file_path for hosted files
-- Keep pdf_url for backward compatibility with external links
ALTER TABLE public.articles 
ALTER COLUMN pdf_url DROP NOT NULL;