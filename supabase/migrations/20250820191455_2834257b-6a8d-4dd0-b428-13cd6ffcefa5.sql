-- Remove the current overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more secure policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- This ensures:
-- 1. Only authenticated users can view profile information
-- 2. Anonymous/unauthenticated users cannot access any profile data
-- 3. Existing functionality (like showing article authors) still works for logged-in users