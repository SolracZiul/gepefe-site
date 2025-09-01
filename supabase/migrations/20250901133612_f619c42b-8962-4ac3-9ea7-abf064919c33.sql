-- Add field for multiple images in news
ALTER TABLE public.articles ADD COLUMN images text[] DEFAULT '{}';

-- Update existing records to move single image_url to images array
UPDATE public.articles 
SET images = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' THEN ARRAY[image_url]
  ELSE '{}'
END
WHERE content_type = 'news';