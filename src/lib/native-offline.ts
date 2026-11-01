import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import type { Article } from '@/hooks/useArticles';
import { getArticleFileUrl } from './downloads';

export type OfflinePublication = Pick<Article, 'id' | 'title' | 'authors' | 'category' | 'publish_date' | 'abstract' | 'tags'> & { path: string };
const manifest = 'downloads/index.json';
let revision = 0;
const listeners = new Set<() => void>();
export const subscribeDownloads = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const downloadsRevision = () => revision;
function changed() { revision++; listeners.forEach(listener => listener()); }
function requireNative() { if (!Capacitor.isNativePlatform()) throw new Error('Disponível apenas no aplicativo.'); }

export function offlineDestination(native: boolean, connected: boolean): string | null {
  return native && !connected ? '/baixados' : null;
}

// Offline mode is a native-only state: the watcher never registers on the web,
// so the store stays false and browser navigation is never blocked.
let offline = false;
const connectionListeners = new Set<() => void>();
export const subscribeOffline = (listener: () => void) => { connectionListeners.add(listener); return () => { connectionListeners.delete(listener); }; };
export const isOfflineMode = () => Capacitor.isNativePlatform() && offline;
export const offlineNavigationMessage = 'Modo offline ativo. Conecte-se à internet para acessar esta seção.';
export const connectionRestoredMessage = 'Conexão reestabelecida.';

function reportOffline(value: boolean) {
  if (offline === value) return;
  offline = value;
  connectionListeners.forEach(listener => listener());
}

/** While the native app is offline only the downloaded library stays reachable. */
export function offlineNavigationTarget(offlineMode: boolean, target: string): string | null {
  return offlineMode && target !== '/baixados' ? '/baixados' : null;
}


export async function listDownloads(): Promise<OfflinePublication[]> {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const result = await Filesystem.readFile({ path: manifest, directory: Directory.Data });
    const text = typeof result.data === 'string' ? new TextDecoder().decode(Uint8Array.from(atob(result.data), char => char.charCodeAt(0))) : await result.data.text();
    return JSON.parse(text) as OfflinePublication[];
  } catch (error) {
    // Missing manifest is the normal first launch; other failures must not overwrite saved entries.
    try { await Filesystem.stat({ path: manifest, directory: Directory.Data }); } catch { return []; }
    throw error;
  }
}

async function writeManifest(items: OfflinePublication[]) {
  const bytes = new TextEncoder().encode(JSON.stringify(items));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  await Filesystem.writeFile({ path: manifest, directory: Directory.Data, data: btoa(binary), recursive: true });
  changed();
}

// Serialize mutations so simultaneous card downloads cannot lose another saved entry.
let queue: Promise<unknown> = Promise.resolve();
function mutate<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation);
  queue = result.catch(() => undefined);
  return result;
}

export async function saveDownload(article: Article): Promise<void> {
  requireNative();
  if (article.content_type === 'news') throw new Error('Somente publicações acadêmicas.');
  return mutate(async () => {
    const items = await listDownloads();
    if (items.some(item => item.id === article.id)) return;
    const url = getArticleFileUrl(article);
    if (!url) throw new Error('Ficheiro não disponível.');
    const path = `downloads/${encodeURIComponent(article.id)}.pdf`;
    await Filesystem.mkdir({ path: 'downloads', directory: Directory.Data, recursive: true }).catch(() => undefined);
    try {
      await Filesystem.downloadFile({ url, path, directory: Directory.Data });
      const result = await Filesystem.readFile({ path, directory: Directory.Data });
      const header = typeof result.data === 'string' ? atob(result.data.slice(0, 1368)) : await result.data.slice(0, 1024).text();
      if (!header.includes('%PDF-')) throw new Error('Este endereço não fornece um PDF para leitura offline.');
      const { id, title, authors, category, publish_date, abstract, tags } = article;
      await writeManifest([...items, { id, title, authors, category, publish_date, abstract, tags, path }]);
    } catch (error) {
      await Filesystem.deleteFile({ path, directory: Directory.Data }).catch(() => undefined);
      throw error;
    }
  });
}

export async function removeDownload(id: string): Promise<void> {
  requireNative();
  return mutate(async () => {
    const items = await listDownloads();
    const item = items.find(entry => entry.id === id);
    if (!item) return;
    await Filesystem.deleteFile({ path: item.path, directory: Directory.Data });
    await writeManifest(items.filter(entry => entry.id !== id));
  });
}

export async function readDownload(item: OfflinePublication): Promise<string> {
  requireNative();
  const result = await Filesystem.readFile({ path: item.path, directory: Directory.Data });
  const bytes = typeof result.data === 'string' ? Uint8Array.from(atob(result.data), char => char.charCodeAt(0)) : await result.data.arrayBuffer();
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}

/** Raw bytes of a saved PDF, read as Base64 through Filesystem so PDF.js can render offline. */
export async function readDownloadData(item: OfflinePublication): Promise<Uint8Array> {
  requireNative();
  const result = await Filesystem.readFile({ path: item.path, directory: Directory.Data });
  return typeof result.data === 'string' ? Uint8Array.from(atob(result.data), char => char.charCodeAt(0)) : new Uint8Array(await result.data.arrayBuffer());
}

/** WebView-loadable address of a saved PDF (Capacitor.convertFileSrc of the device path). */
export async function downloadFileSrc(item: OfflinePublication): Promise<string> {
  requireNative();
  const { uri } = await Filesystem.getUri({ path: item.path, directory: Directory.Data });
  return Capacitor.convertFileSrc(uri);
}

export function watchNativeConnection(onOffline: () => void, onOnline?: () => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => undefined;
  let disposed = false;
  let remove: (() => Promise<void>) | undefined;
  let statusVersion = 0;
  const apply = (connected: boolean) => {
    if (disposed) return;
    const wasOffline = offline;
    reportOffline(!connected);
    if (!connected) onOffline();
    else if (wasOffline) onOnline?.();
  };
  void Network.addListener('networkStatusChange', status => { statusVersion++; apply(status.connected); }).then(handle => {
    if (disposed) void handle.remove(); else remove = () => handle.remove();
  }).catch(() => undefined);
  const initialVersion = statusVersion;
  void Network.getStatus().then(status => { if (statusVersion === initialVersion) apply(status.connected); }).catch(() => undefined);
  // The webview's own events keep the store correct even if the plugin listener is unavailable.
  const listening = typeof window !== 'undefined' && typeof window.addEventListener === 'function';
  const onWindowOffline = () => apply(false);
  const onWindowOnline = () => apply(true);
  if (listening) { window.addEventListener('offline', onWindowOffline); window.addEventListener('online', onWindowOnline); }
  return () => {
    disposed = true;
    void remove?.();
    if (listening) { window.removeEventListener('offline', onWindowOffline); window.removeEventListener('online', onWindowOnline); }
  };
}

export async function findDownload(id: string): Promise<OfflinePublication | null> {
  if (!Capacitor.isNativePlatform()) return null;
  return (await listDownloads().catch(() => [])).find(item => item.id === id) ?? null;
}

/** Opens a saved PDF in the phone's reader; falls back to a new tab with the given URL. */
export async function openPdfFile(item: OfflinePublication | null, fallbackUrl?: string | null): Promise<void> {
  if (Capacitor.isNativePlatform() && item) {
    try {
      const { FileOpener } = await import('@capacitor-community/file-opener');
      const { uri } = await Filesystem.getUri({ path: item.path, directory: Directory.Data });
      await FileOpener.open({ filePath: uri, contentType: 'application/pdf' });
      return;
    } catch { /* fall through to the browser */ }
  }
  if (fallbackUrl) window.open(fallbackUrl, '_blank', 'noopener');
  else throw new Error('PDF indisponível.');
}
