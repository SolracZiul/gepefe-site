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

export async function downloadDocument(article: Article): Promise<void> {
  const fileUrl = getArticleFileUrl(article);
  if (!fileUrl) throw new Error('Nenhum arquivo disponível para este documento.');

  // Capacitor's browser avoids navigating the WebView to a relative Storage path
  // (which Android resolves against https://localhost/).
  if (isNative()) {
    await openExternalUrl(fileUrl);
    return;
  }

  // Keep the web download path and request Storage as an attachment when possible.
  const url = article.file_path && !/^https?:\/\//i.test(article.file_path)
    ? supabase.storage.from('academic-articles').getPublicUrl(article.file_path, { download: true }).data.publicUrl
    : fileUrl;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não foi possível baixar o documento.');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = article.file_path?.split('/').pop() || `${article.title}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
