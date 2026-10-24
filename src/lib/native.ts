import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

export const NATIVE_AUTH_CALLBACK = 'com.gepefe.app://login-callback';

export const isNative = () => Capacitor.isNativePlatform();

/** Opens an external URL inside the app (in-app browser) on native, new tab on web. */
export async function openExternalUrl(url: string) {
  if (isNative()) await Browser.open({ url });
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
  if (!result.error && result.data?.url) await Browser.open({ url: result.data.url });
  return result;
}

function parseNativeAuthCallback(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'com.gepefe.app:' && parsed.hostname === 'login-callback' && ['', '/'].includes(parsed.pathname)
      ? parsed : undefined;
  } catch { return undefined; }
}

/** Only accepts the exact OAuth callback; never treats unrelated links as sessions. */
export async function completeNativeAuth(url: string) {
  const parsed = parseNativeAuthCallback(url);
  if (!parsed) return false;
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const parameter = (key: string) => hash.get(key) || parsed.searchParams.get(key);
  if (parameter('error')) throw new Error('Não foi possível concluir o login com Google. Tente novamente.');
  const code = parsed.searchParams.get('code');
  const accessToken = parameter('access_token');
  const refreshToken = parameter('refresh_token');
  if (!code && (!accessToken || !refreshToken)) return false;
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : accessToken && refreshToken
      ? await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      : undefined;
  if (result?.error) throw result.error;
  return Boolean(result?.data.session);
}

/** Mounted by App.tsx, including cold starts and cleanup on unmount. */
export function registerNativeAuthListener(onSuccess: () => void, onError: () => void) {
  if (!isNative()) return () => undefined;
  let disposed = false;
  let processing = false;
  const handleUrl = async ({ url }: { url: string }) => {
    if (disposed || processing || !parseNativeAuthCallback(url)) return;
    processing = true;
    try {
      // Dismiss OAuth as soon as the app receives its callback, before session I/O.
      await Browser.close().catch(() => undefined);
      if (await completeNativeAuth(url) && !disposed) {
        onSuccess();
      }
    } catch {
      if (!disposed) onError();
    } finally { processing = false; }
  };
  const listener = CapacitorApp.addListener('appUrlOpen', handleUrl);
  void listener.then(async () => {
    if (disposed) return;
    const launch = await CapacitorApp.getLaunchUrl();
    if (launch?.url) await handleUrl(launch);
  }).catch(() => { if (!disposed) onError(); });
  return () => {
    disposed = true;
    void listener.then(handle => handle.remove()).catch(() => undefined);
  };
}

/** Also catches journal/PDF anchors embedded in sanitized news content. */
export function registerNativeLinkListener(onError: () => void) {
  if (!isNative()) return () => undefined;
  const handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const url = new URL(anchor.href, window.location.href);
    if (!['https:', 'http:'].includes(url.protocol)) return;
    if (url.origin === window.location.origin && anchor.target !== '_blank' && !anchor.hasAttribute('download')) return;
    event.preventDefault();
    event.stopPropagation();
    void openExternalUrl(url.href).catch(onError);
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
