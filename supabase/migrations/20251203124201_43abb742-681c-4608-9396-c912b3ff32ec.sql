-- OPTIMIZE FAVORITES TABLE RLS POLICIES
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- OPTIMIZE ARTICLES TABLE RLS POLICIES
DROP POLICY IF EXISTS "Anyone can view articles and news" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can create articles and news" ON public.articles;
DROP POLICY IF EXISTS "Users can update their own articles or admins can update any" ON public.articles;
DROP POLICY IF EXISTS "Users can delete their own articles or admins can delete any" ON public.articles;

CREATE POLICY "Anyone can view articles and news" 
ON public.articles 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create articles and news" 
ON public.articles 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can update their own articles or admins can update any" 
ON public.articles 
FOR UPDATE 
USING (
  (SELECT auth.uid()) = created_by 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (SELECT auth.uid()) 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can delete their own articles or admins can delete any" 
ON public.articles 
FOR DELETE 
USING (
  (SELECT auth.uid()) = created_by 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (SELECT auth.uid()) 
    AND profiles.role = 'admin'
  )
);

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_articles_created_by ON public.articles(created_by);