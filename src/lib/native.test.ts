/// <reference types="bun" />
import { beforeEach, expect, mock, test } from 'bun:test';

let native = true;
const browserOpen = mock(async (_options: { url: string }) => undefined);
const browserClose = mock(async () => undefined);
const setSession = mock(async (_tokens: unknown) => ({ data: { session: { user: { id: 'test-user' } } }, error: null as Error | null }));
const exchangeCode = mock(async (_code: string) => ({ data: { session: { user: { id: 'test-user' } } }, error: null }));
const oauth = mock(async (_options: unknown) => ({ data: { url: 'https://auth.example/authorize' }, error: null }));
const signedUrl = mock(async (_path: string, _seconds: number) => ({ data: { signedUrl: 'https://files.example/document.pdf' }, error: null }));
const removeListener = mock(async () => undefined);
let onAppUrl: (event: { url: string }) => Promise<void> = async () => undefined;
const launchUrl = mock(async (): Promise<{ url: string } | undefined> => undefined);
mock.module('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native } }));
mock.module('@capacitor/browser', () => ({ Browser: { open: browserOpen, close: browserClose } }));
mock.module('@capacitor/app', () => ({ App: {
  addListener: mock(async (_name: string, handler: typeof onAppUrl) => { onAppUrl = handler; return { remove: removeListener }; }),
  getLaunchUrl: launchUrl,
} }));
mock.module('@/integrations/supabase/client', () => ({ supabase: {
  auth: { setSession, exchangeCodeForSession: exchangeCode, signInWithOAuth: oauth },
  storage: { from: () => ({ createSignedUrl: signedUrl }) },
} }));
const { openExternalUrl, openStoredFileNative, signInWithGoogle, completeNativeAuth, registerNativeAuthListener } = await import('./native');

beforeEach(() => {
  native = true;
  browserOpen.mockClear(); browserClose.mockClear(); setSession.mockClear(); exchangeCode.mockClear(); oauth.mockClear(); signedUrl.mockClear(); removeListener.mockClear();
  launchUrl.mockResolvedValue(undefined);
});

test('native Google login uses the exact app callback without navigating the webview', async () => {
  await signInWithGoogle('https://web.example/email-confirmation');
  expect(oauth.mock.calls[0]).toEqual([{ provider: 'google', options: { redirectTo: 'com.gepefe.app://login-callback', skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } } }]);
  expect(browserOpen.mock.calls[0]).toEqual([{ url: 'https://auth.example/authorize' }]);
});
test('web Google login preserves its web callback and does not invoke a native plugin', async () => {
  native = false;
  await signInWithGoogle('https://web.example/email-confirmation');
  expect(oauth.mock.calls[0]).toEqual([{ provider: 'google', options: { redirectTo: 'https://web.example/email-confirmation', queryParams: { prompt: 'select_account' } } }]);
  expect(browserOpen).not.toHaveBeenCalled();
});
test('native journal and PDF links open with Capacitor Browser', async () => {
  await openExternalUrl('https://journal.example/article.pdf');
  expect(browserOpen.mock.calls[0]).toEqual([{ url: 'https://journal.example/article.pdf' }]);
});
test('stored PDF downloads on native use a signed URL in Capacitor Browser', async () => {
  expect(await openStoredFileNative('academic-articles', 'folder/file.pdf')).toBe(true);
  expect(signedUrl.mock.calls[0]).toEqual(['folder/file.pdf', 600]);
  expect(browserOpen.mock.calls[0]).toEqual([{ url: 'https://files.example/document.pdf' }]);
});
test('web stored downloads remain handled by the original browser download path', async () => {
  native = false;
  expect(await openStoredFileNative('academic-articles', 'folder/file.pdf')).toBe(false);
  expect(signedUrl).not.toHaveBeenCalled();
});
test('OAuth hash callback restores both tokens through setSession', async () => {
  expect(await completeNativeAuth('com.gepefe.app://login-callback#access_token=test-access&refresh_token=test-refresh')).toBe(true);
  expect(setSession.mock.calls[0]).toEqual([{ access_token: 'test-access', refresh_token: 'test-refresh' }]);
});
test('OAuth query callback restores both tokens through setSession', async () => {
  expect(await completeNativeAuth('com.gepefe.app://login-callback?access_token=test-access&refresh_token=test-refresh')).toBe(true);
  expect(setSession).toHaveBeenCalledTimes(1);
});
test('PKCE callbacks exchange the code for a session', async () => {
  expect(await completeNativeAuth('com.gepefe.app://login-callback?code=test-code')).toBe(true);
  expect(exchangeCode.mock.calls[0]).toEqual(['test-code']);
});
test('unrelated callbacks and incomplete tokens cannot restore a session', async () => {
  for (const url of ['https://login-callback#access_token=x&refresh_token=y', 'com.gepefe.app://login-callback.evil#access_token=x&refresh_token=y', 'com.gepefe.app://login-callback/other#access_token=x&refresh_token=y', 'com.gepefe.app://login-callback#access_token=x']) {
    expect(await completeNativeAuth(url)).toBe(false);
  }
  expect(setSession).not.toHaveBeenCalled();
});
test('appUrlOpen completes login, closes the browser and cleans up the listener', async () => {
  const success = mock(() => undefined);
  const error = mock(() => undefined);
  const cleanup = registerNativeAuthListener(success, error);
  await new Promise(resolve => setTimeout(resolve, 0));
  await onAppUrl({ url: 'com.gepefe.app://login-callback#access_token=test-access&refresh_token=test-refresh' });
  expect(success).toHaveBeenCalledTimes(1);
  expect(error).not.toHaveBeenCalled();
  expect(browserClose).toHaveBeenCalledTimes(1);
  cleanup();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(removeListener).toHaveBeenCalledTimes(1);
});
test('cold-start callback also restores the session', async () => {
  launchUrl.mockResolvedValue({ url: 'com.gepefe.app://login-callback?code=cold-start-code' });
  const success = mock(() => undefined);
  const cleanup = registerNativeAuthListener(success, mock(() => undefined));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(exchangeCode.mock.calls[0]).toEqual(['cold-start-code']);
  expect(success).toHaveBeenCalledTimes(1);
  cleanup();
});

test('the app closes OAuth immediately before restoring the callback session', async () => {
  const success = mock(() => undefined);
  const cleanup = registerNativeAuthListener(success, mock(() => undefined));
  await new Promise(resolve => setTimeout(resolve, 0));
  let release: (() => void) | undefined;
  setSession.mockImplementationOnce(async () => {
    expect(browserClose).toHaveBeenCalledTimes(1);
    await new Promise<void>(resolve => { release = resolve; });
    return { data: { session: { user: { id: 'test-user' } } }, error: null };
  });
  const callback = onAppUrl({ url: 'com.gepefe.app://login-callback#access_token=test-access&refresh_token=test-refresh' });
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(browserClose).toHaveBeenCalledTimes(1);
  expect(success).not.toHaveBeenCalled();
  release?.();
  await callback;
  expect(success).toHaveBeenCalledTimes(1);
  cleanup();
});

test('unrelated app links do not close the integrated browser', async () => {
  const cleanup = registerNativeAuthListener(mock(() => undefined), mock(() => undefined));
  await new Promise(resolve => setTimeout(resolve, 0));
  await onAppUrl({ url: 'com.gepefe.app://document' });
  expect(browserClose).not.toHaveBeenCalled();
  expect(setSession).not.toHaveBeenCalled();
  cleanup();
});