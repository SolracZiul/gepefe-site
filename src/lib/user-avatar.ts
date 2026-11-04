import type { User } from '@supabase/supabase-js';

// Google sign-in stores the photo under `picture` in newer Supabase versions
// and under `avatar_url` in older ones; accept either so the avatar always loads.
export function userAvatarUrl(user: User | null | undefined): string | undefined {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const url = metadata?.avatar_url ?? metadata?.picture;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
}

export function userDisplayName(user: User | null | undefined, fallback: string): string {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const name = metadata?.display_name ?? metadata?.full_name ?? metadata?.name;
  return typeof name === 'string' && name.trim().length > 0 ? name : fallback;
}
