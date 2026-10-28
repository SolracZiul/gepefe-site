import type { Article } from '@/hooks/useArticles';
import { supabase } from '@/integrations/supabase/client';
import { isNative, openExternalUrl } from '@/lib/native';

/** Resolve Storage paths to absolute public URLs before they reach a browser. */
export function getArticleFileUrl(article: Pick<Article, 'file_path' | 'pdf_url'>): string {
  const path = article.file_path;
  if (path) {
    if (/^https?:\/\//i.test(path)) return path;
    const { data } = supabase.storage.from('academic-articles').getPublicUrl(path);
    if (data?.publicUrl) return data.publicUrl;
  }
  return article.pdf_url || '';
}

function attachmentName(article: Pick<Article, 'title' | 'file_path'>): string {
  return article.file_path?.split('/').pop() || `${article.title}.pdf`;
}

/** Reserve an empty tab while the click is still a direct user gesture, so a later fallback is not blocked. */
function reservePreviewTab(): Window | null {
  if (typeof window === 'undefined' || typeof window.open !== 'function') return null;
  const tab = window.open('', '_blank');
  if (tab) tab.opener = null;
  return tab;
}

/** A journal landing page answers with HTML; only a real PDF may be saved as one. */
async function isPdfBlob(blob: Blob): Promise<boolean> {
  const head = await blob.slice(0, 1024).text();
  return head.includes('%PDF-');
}

async function fetchAndDownload(url: string, filename: string, validatePdf: boolean): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não foi possível baixar o documento.');
  const blob = await response.blob();
  if (validatePdf && !(await isPdfBlob(blob))) throw new Error('O endereço não devolve um PDF.');
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadDocument(article: Pick<Article, 'title' | 'file_path' | 'pdf_url'>): Promise<void> {
  const stored = Boolean(article.file_path) && !/^https?:\/\//i.test(article.file_path as string);

  // Stored files are resolved once, as an attachment on the web and as an absolute URL in the app.
  if (stored) {
    const path = article.file_path as string;
    const native = isNative();
    const url = supabase.storage
      .from('academic-articles')
      .getPublicUrl(path, native ? undefined : { download: true }).data.publicUrl;
    if (!url) throw new Error('Nenhum arquivo disponível para este documento.');
    // Capacitor's browser keeps the app shell and the private Storage access intact.
    if (native) {
      await openExternalUrl(url);
      return;
    }
    await fetchAndDownload(url, attachmentName(article), false);
    return;
  }

  const fileUrl = getArticleFileUrl(article);
  if (!fileUrl) throw new Error('Nenhum arquivo disponível para este documento.');

  if (isNative()) {
    try {
      await fetchAndDownload(fileUrl, attachmentName(article), true);
    } catch {
      await openExternalUrl(fileUrl);
    }
    return;
  }

  // Journals block scripted downloads (CORS, 403, landing pages): the document still has to open.
  const tab = reservePreviewTab();
  try {
    await fetchAndDownload(fileUrl, attachmentName(article), true);
    tab?.close();
  } catch {
    if (tab) tab.location.href = fileUrl;
    else throw new Error('Não foi possível baixar o documento.');
  }
}
