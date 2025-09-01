-- Drop the old category constraint
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;

-- Create a new constraint that includes "Notícias"
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check 
CHECK (category = ANY (ARRAY[
  'Artigos Completos'::text, 
  'Textos Acadêmicos'::text, 
  'Pesquisas'::text, 
  'Dissertações'::text, 
  'Teses'::text,
  'Notícias'::text
]));