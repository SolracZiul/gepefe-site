-- Atualizar política RLS para permitir que admins editem qualquer artigo
-- Primeiro, remover a política atual de UPDATE
DROP POLICY IF EXISTS "Authenticated users can update articles and news" ON public.articles;

-- Criar nova política de UPDATE que permite admins ou criadores
CREATE POLICY "Users can update their own articles or admins can update any" 
ON public.articles 
FOR UPDATE 
USING (
  auth.uid() = created_by 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Atualizar o created_by do artigo problemático para o usuário atual (admin)
UPDATE public.articles 
SET created_by = 'afc858b9-f89e-4052-8923-e6c25f7ec676'
WHERE id = '9d700021-7b38-437c-a1a6-c2f668a60852';