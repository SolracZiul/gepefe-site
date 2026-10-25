/// <reference types="bun" />
import { afterEach, beforeEach, expect, mock, test } from 'bun:test';

let native = false;
const publicUrl = mock((_path: string, _options: unknown) => ({ data: { publicUrl: 'https://storage.example/file.pdf?download=' } }));
const signedUrl = mock(async (_path: string, _expires: number, _options: unknown) => ({ data: { signedUrl: 'https://storage.example/signed.pdf?download=' }, error: null }));
const open = mock(async (_url: string) => undefined);
mock.module('@/lib/native', () => ({ isNative: () => native, openExternalUrl: open }));
mock.module('@/integrations/supabase/client', () => ({ supabase: { storage: { from: () => ({ getPublicUrl: publicUrl, createSignedUrl: signedUrl }) } } }));
const { downloadDocument } = await import('./downloads');
const originalFetch = globalThis.fetch;
const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const closeTab = mock(() => undefined);
let tab: { opener: unknown; closed: boolean; location: { href: string }; close: typeof closeTab };
const click = mock(() => undefined);
let anchor: { href: string; download: string; click: typeof click; remove: () => void };
const fetchFile = mock(async (_url: unknown) => new Response('%PDF-1.4 test', { headers: { 'content-type': 'application/pdf' } }));

beforeEach(() => {
  native = false;
  closeTab.mockClear();
  tab = { opener: {}, closed: false, location: { href: '' }, close: closeTab };
  globalThis.window = { open: () => tab } as unknown as Window & typeof globalThis;
  publicUrl.mockClear(); signedUrl.mockClear(); open.mockClear(); click.mockClear(); fetchFile.mockClear();
  anchor = { href: '', download: '', click, remove: () => undefined };
  globalThis.fetch = fetchFile as unknown as typeof fetch;
  globalThis.document = { createElement: () => anchor, body: { appendChild: () => undefined } } as unknown as Document;
});
afterEach(() => { globalThis.fetch = originalFetch; globalThis.document = originalDocument; globalThis.window = originalWindow; });

test('Storage download requests download true and delivers a blob instead of opening a preview', async () => {
  await downloadDocument({ title: 'Artigo', file_path: 'folder/file.pdf', pdf_url: null });
  expect(publicUrl.mock.calls[0]).toEqual(['folder/file.pdf', { download: true }]);
  expect(fetchFile.mock.calls[0]).toEqual(['https://storage.example/file.pdf?download=']);
  expect(anchor.href.startsWith('blob:')).toBe(true);
  expect(anchor.download).toBe('file.pdf');
  expect(click).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
});
test('native Storage downloads open the absolute public URL in the integrated browser', async () => {
  native = true;
  await downloadDocument({ title: 'Artigo', file_path: 'folder/file.pdf', pdf_url: null });
  expect(publicUrl.mock.calls[0]).toEqual(['folder/file.pdf', undefined]);
  expect(open.mock.calls[0]).toEqual(['https://storage.example/file.pdf?download=']);
  expect(fetchFile).not.toHaveBeenCalled();
});
test('external PDF URLs are fetched and downloaded as blobs without opening a browser', async () => {
  await downloadDocument({ title: 'Artigo', file_path: null, pdf_url: 'https://journal.example/article.pdf' });
  expect(fetchFile.mock.calls[0]).toEqual(['https://journal.example/article.pdf']);
  expect(anchor.download).toBe('Artigo.pdf');
  expect(click).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
  expect(closeTab).toHaveBeenCalledTimes(1);
});
test('a landing page is not saved disguised as a PDF', async () => {
  fetchFile.mockImplementationOnce(async () => new Response('<html>Journal</html>', { headers: { 'content-type': 'text/html' } }));
  await downloadDocument({ title: 'Artigo', file_path: null, pdf_url: 'https://journal.example/article' });
  expect(click).not.toHaveBeenCalled();
  expect(tab.location.href).toBe('https://journal.example/article');
  expect(tab.opener).toBeNull();
});
test('a refused external download opens the reserved web preview tab', async () => {
  fetchFile.mockImplementationOnce(async () => new Response('', { status: 403 }));
  await downloadDocument({ title: 'Artigo', file_path: null, pdf_url: 'https://journal.example/article.pdf' });
  expect(click).not.toHaveBeenCalled();
  expect(tab.location.href).toBe('https://journal.example/article.pdf');
});
test('native CORS failure opens the external document through the integrated browser helper', async () => {
  native = true;
  fetchFile.mockImplementationOnce(async () => { throw new TypeError('Failed to fetch'); });
  await downloadDocument({ title: 'Artigo', file_path: null, pdf_url: 'https://journal.example/article.pdf' });
  expect(open.mock.calls[0]).toEqual(['https://journal.example/article.pdf']);
  expect(click).not.toHaveBeenCalled();
});
test('non-PDF bytes with a PDF content type open preview instead of saving an invalid file', async () => {
  fetchFile.mockImplementationOnce(async () => new Response('Not a PDF', { headers: { 'content-type': 'application/pdf' } }));
  await downloadDocument({ title: 'Artigo', file_path: null, pdf_url: 'https://journal.example/article.pdf' });
  expect(tab.location.href).toBe('https://journal.example/article.pdf');
  expect(click).not.toHaveBeenCalled();
});
