-- Update the gepefe@unesc.net user to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'gepefe@unesc.net'
);