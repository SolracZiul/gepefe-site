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

export async function listDownloads(): Promise<OfflinePublication[]> {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const result = await Filesystem.readFile({ path: manifest, directory: Directory.Data });
    const text = typeof result.data === 'string' ? atob(result.data) : await result.data.text();
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

export function watchNativeConnection(onOffline: () => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => undefined;
  let disposed = false;
  let remove: (() => Promise<void>) | undefined;
  let statusVersion = 0;
  const apply = (connected: boolean) => { if (!disposed && offlineDestination(true, connected)) onOffline(); };
  void Network.addListener('networkStatusChange', status => { statusVersion++; apply(status.connected); }).then(handle => {
    if (disposed) void handle.remove(); else remove = () => handle.remove();
  }).catch(() => undefined);
  const initialVersion = statusVersion;
  void Network.getStatus().then(status => { if (statusVersion === initialVersion) apply(status.connected); }).catch(() => undefined);
  return () => { disposed = true; void remove?.(); };
}