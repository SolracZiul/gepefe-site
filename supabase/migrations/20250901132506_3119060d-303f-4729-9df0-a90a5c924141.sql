-- Add content type to support both articles and news
ALTER TABLE public.articles ADD COLUMN content_type text NOT NULL DEFAULT 'article';

-- Add additional fields for news
ALTER TABLE public.articles ADD COLUMN summary text;
ALTER TABLE public.articles ADD COLUMN image_url text;
ALTER TABLE public.articles ADD COLUMN content text;

-- Add check constraint for content type
ALTER TABLE public.articles ADD CONSTRAINT valid_content_type 
CHECK (content_type IN ('article', 'news'));

-- Create index for better performance when filtering by content type
CREATE INDEX idx_articles_content_type ON public.articles(content_type);

-- Update RLS policies to handle news as well
DROP POLICY IF EXISTS "Anyone can view articles" ON public.articles;
CREATE POLICY "Anyone can view articles and news" 
ON public.articles 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create articles" ON public.articles;
CREATE POLICY "Authenticated users can create articles and news" 
ON public.articles 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Authenticated users can update articles" ON public.articles;
CREATE POLICY "Authenticated users can update articles and news" 
ON public.articles 
FOR UPDATE 
USING (auth.uid() = created_by);