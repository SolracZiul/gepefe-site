-- Update the category check constraint to include "Teses"
ALTER TABLE public.articles 
DROP CONSTRAINT articles_category_check;

ALTER TABLE public.articles 
ADD CONSTRAINT articles_category_check 
CHECK (category = ANY (ARRAY['Artigos Completos'::text, 'Textos Acadêmicos'::text, 'Pesquisas'::text, 'Dissertações'::text, 'Teses'::text]));