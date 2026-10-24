import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

export const NATIVE_AUTH_CALLBACK = 'com.gepefe.app://login-callback';

export const isNative = () => Capacitor.isNativePlatform();

/** Opens an external URL inside the app (in-app browser) on native, new tab on web. */
export async function openExternalUrl(url: string) {
  if (isNative()) await Browser.open({ url, presentationStyle: 'popover' });
  else window.open(url, '_blank', 'noopener,noreferrer');
}

/** Downloads a stored file: on native opens a signed URL in the in-app browser. Returns true if handled. */
export async function openStoredFileNative(bucket: string, path: string) {
  if (!isNative()) return false;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 600);
  if (error || !data) throw error ?? new Error('Signed URL failed');
  await Browser.open({ url: data.signedUrl });
  return true;
}

export async function signInWithGoogle(webRedirect: string) {
  if (!isNative()) {
    return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: webRedirect, queryParams: { prompt: 'select_account' } } });
  }
  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: NATIVE_AUTH_CALLBACK, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
  });
  if (result.data?.url) await Browser.open({ url: result.data.url });
  return result;
}

/** Listens for the deep link returning from OAuth and completes the session. */
export function registerNativeAuthListener() {
  if (!isNative()) return;
  App.addListener('appUrlOpen', async ({ url }) => {
    if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return;
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      if (code) await supabase.auth.exchangeCodeForSession(code);
      else if (hash.get('access_token') && hash.get('refresh_token')) {
        await supabase.auth.setSession({ access_token: hash.get('access_token')!, refresh_token: hash.get('refresh_token')! });
      }
    } finally {
      await Browser.close().catch(() => undefined);
      window.location.replace('/');
    }
  });
}
