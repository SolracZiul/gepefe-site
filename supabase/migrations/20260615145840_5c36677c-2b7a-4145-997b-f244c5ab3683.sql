
-- Revoke public EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.keep_alive() FROM PUBLIC, anon, authenticated;

-- Restrict listing of the public academic-articles bucket.
-- Public download via the object's public URL keeps working; only the
-- broad SELECT policy that allowed clients to list/enumerate files is removed.
DROP POLICY IF EXISTS "Anyone can view academic articles" ON storage.objects;
