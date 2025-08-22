-- Política para permitir que administradores excluam qualquer artigo
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON public.articles;

CREATE POLICY "Users can delete their own articles or admins can delete any" 
ON public.articles 
FOR DELETE 
USING (
  auth.uid() = created_by 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);