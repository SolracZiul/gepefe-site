import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';
import { Share } from '@capacitor/share';
import { supabase } from '@/integrations/supabase/client';

export const NATIVE_AUTH_CALLBACK = 'br.com.gepefe.app://login-callback';
const PUBLIC_SITE_URL = 'https://gepefe.netlify.app';

export const isNative = () => Capacitor.isNativePlatform();

/** Resolves an app route to its public website URL for sharing outside the app. */
export function getPublicShareUrl(path: string) {
  return new URL(path, PUBLIC_SITE_URL).toString();
}

/** Opens the platform share sheet, using Capacitor on native WebViews. Reports which channel delivered the item. */
export async function shareContent(options: { title: string; text?: string; url: string }): Promise<'shared' | 'copied'> {
  if (isNative()) {
    await Share.share({ ...options, dialogTitle: 'Compartilhar' });
    return 'shared';
  }

  if (navigator.share) {
    await navigator.share(options);
    return 'shared';
  }

  await navigator.clipboard.writeText(options.url);
  return 'copied';
}

/** Opens an external URL inside the app (in-app browser) on native, new tab on web. */
export async function openExternalUrl(url: string) {
  if (isNative()) {
    try {
      await Browser.open({ url });
    } catch {
      // Se o Browser falhar ou a janela já estiver aberta, tenta abrir na janela nativa sem crashar
      window.open(url, '_system');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/** Downloads a stored file: on native opens a signed URL in the in-app browser. Returns true if handled. */
export async function openStoredFileNative(bucket: string, path: string) {
  if (!isNative()) return false;
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 600);
    if (error || !data) throw error ?? new Error('Signed URL failed');
    await openExternalUrl(data.signedUrl);
    return true;
  } catch {
    return false;
  }
}

export async function signInWithGoogle(webRedirect: string) {
  if (!isNative()) {
    return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: webRedirect, queryParams: { prompt: 'select_account' } } });
  }
  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: NATIVE_AUTH_CALLBACK, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
  });
  if (!result.error && result.data?.url) await openExternalUrl(result.data.url);
  return result;
}

function parseNativeAuthCallback(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'br.com.gepefe.app:' && parsed.hostname === 'login-callback' && ['', '/'].includes(parsed.pathname)
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

function parseNewsAppLink(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && parsed.hostname === 'gepefe.netlify.app'
      && /^\/noticia\/[^/]+\/?$/.test(parsed.pathname)
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : undefined;
  } catch { return undefined; }
}

/** Routes verified website news links into the matching screen in the app. */
export function registerNativeAppLinkListener(onNavigate: (path: string) => void) {
  if (!isNative()) return () => undefined;
  let disposed = false;
  const handleUrl = (url: string) => {
    const path = parseNewsAppLink(url);
    if (!disposed && path) onNavigate(path);
  };
  const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => handleUrl(url));
  void listener.then(async () => {
    if (disposed) return;
    const launch = await CapacitorApp.getLaunchUrl();
    if (launch?.url) handleUrl(launch.url);
  }).catch(() => undefined);
  return () => {
    disposed = true;
    void listener.then(handle => handle.remove()).catch(() => undefined);
  };
}

/** Also catches journal/PDF anchors embedded in sanitized news content safely. */
export function registerNativeLinkListener(onError: () => void) {
  if (!isNative()) return () => undefined;
  const handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    try {
      const url = new URL(anchor.href, window.location.href);
      if (!['https:', 'http:'].includes(url.protocol)) return;
      if (url.origin === window.location.origin && anchor.target !== '_blank' && !anchor.hasAttribute('download')) return;
      
      event.preventDefault();
      event.stopPropagation();
      void openExternalUrl(url.href).catch(() => {
        // Fallback silencioso sem travar a app com o toast vermelho
        window.open(url.href, '_blank');
      });
    } catch {
      // Ignora falhas de sintaxe de URL para não exibir o toast de erro indesejado
    }
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
