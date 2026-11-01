/// <reference types="bun" />
import { beforeEach, expect, mock, test } from 'bun:test';
import type { Article } from '@/hooks/useArticles';

let native = false;
let files = new Map<string, string>();
let downloadBytes = '%PDF-1.4 native test';
let statusListener: ((status: { connected: boolean }) => void) | undefined;
const stop = mock(async () => undefined);
const getStatus = mock(async () => ({ connected: true }));
const downloadFile = mock(async ({ path }: { path: string }) => { files.set(path, btoa(downloadBytes)); });
const readFile = mock(async ({ path }: { path: string }) => { const data = files.get(path); if (!data) throw new Error('missing'); return { data }; });
mock.module('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native } }));
mock.module('@capacitor/browser', () => ({ Browser: { open: async () => undefined, close: async () => undefined } }));
mock.module('@capacitor/app', () => ({ App: { addListener: async () => ({ remove: async () => undefined }), getLaunchUrl: async () => undefined } }));
mock.module('@capacitor/share', () => ({ Share: { share: async () => undefined } }));
mock.module('@capacitor/filesystem', () => ({ Directory: { Data: 'DATA' }, Filesystem: {
  readFile, downloadFile,
  mkdir: async () => undefined,
  stat: async ({ path }: { path: string }) => { if (!files.has(path)) throw new Error('missing'); return {}; },
  writeFile: async ({ path, data }: { path: string; data: string }) => { files.set(path, data); },
  deleteFile: async ({ path }: { path: string }) => { files.delete(path); },
} }));
mock.module('@capacitor/network', () => ({ Network: {
  getStatus,
  addListener: async (_event: string, listener: typeof statusListener) => { statusListener = listener; return { remove: stop }; },
} }));
mock.module('@/integrations/supabase/client', () => ({ supabase: { storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: 'https://storage.example/test.pdf' } }) }) } } }));
const { listDownloads, saveDownload, readDownload, removeDownload, offlineDestination, watchNativeConnection } = await import('./native-offline');
const article: Article = { id: 'pdf-1', title: 'Educação física', authors: ['Autor'], category: 'Artigos Completos', publish_date: '2026-11-01', abstract: 'Resumo', tags: ['Escola'], file_path: 'test.pdf', pdf_url: null, file_type: 'application/pdf', file_size: 40, download_count: 0, created_at: '', updated_at: '' };
beforeEach(() => { native = false; files = new Map(); downloadBytes = '%PDF-1.4 native test'; statusListener = undefined; downloadFile.mockClear(); readFile.mockClear(); getStatus.mockClear(); stop.mockClear(); });

test('web cannot persist, read or remove native downloads', async () => {
  expect(await listDownloads()).toEqual([]);
  await expect(saveDownload(article)).rejects.toThrow('aplicativo');
  await expect(removeDownload('pdf-1')).rejects.toThrow('aplicativo');
  await expect(readDownload({ ...article, path: 'downloads/pdf-1.pdf' })).rejects.toThrow('aplicativo');
  expect(downloadFile).not.toHaveBeenCalled(); expect(readFile).not.toHaveBeenCalled();
});
test('only native disconnected devices receive /baixados', () => {
  expect(offlineDestination(true, false)).toBe('/baixados');
  expect(offlineDestination(false, false)).toBeNull();
  expect(offlineDestination(true, true)).toBeNull();
});
test('web never registers offline detection or redirects', async () => {
  const redirect = mock(() => undefined); const cleanup = watchNativeConnection(redirect);
  await Promise.resolve(); cleanup();
  expect(getStatus).not.toHaveBeenCalled(); expect(statusListener).toBeUndefined(); expect(redirect).not.toHaveBeenCalled();
});
test('native connection loss redirects and disposed listener does not', async () => {
  native = true; const redirect = mock(() => undefined); const cleanup = watchNativeConnection(redirect);
  await Promise.resolve(); statusListener?.({ connected: false }); expect(redirect).toHaveBeenCalledTimes(1);
  cleanup(); statusListener?.({ connected: false }); expect(redirect).toHaveBeenCalledTimes(1); expect(stop).toHaveBeenCalledTimes(1);
});
test('native saves a real PDF with Unicode metadata and reads it without downloading again', async () => {
  native = true; await saveDownload(article); await saveDownload(article);
  const items = await listDownloads(); expect(items[0].title).toBe('Educação física'); expect(items[0].id).toBe('pdf-1'); expect(downloadFile).toHaveBeenCalledTimes(1);
  const url = await readDownload(items[0]); expect(await (await fetch(url)).text()).toBe('%PDF-1.4 native test'); URL.revokeObjectURL(url);
  await removeDownload('pdf-1'); expect(await listDownloads()).toEqual([]); expect(files.has('downloads/pdf-1.pdf')).toBe(false);
});
test('native rejects non-PDF files and excludes news from the offline library', async () => {
  native = true; downloadBytes = '<html>Journal</html>';
  await expect(saveDownload(article)).rejects.toThrow('PDF'); expect(await listDownloads()).toEqual([]); expect(files.has('downloads/pdf-1.pdf')).toBe(false);
  await expect(saveDownload({ ...article, content_type: 'news' })).rejects.toThrow('acadêmicas');
});