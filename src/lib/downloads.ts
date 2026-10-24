import { supabase } from '@/integrations/supabase/client';
import { isNative, openExternalUrl } from '@/lib/native';

interface DownloadableDocument {
  title: string;
  file_path: string | null;
  pdf_url: string | null;
}

/** Download actions are separate from preview actions, including in the native app. */
export async function downloadDocument(article: DownloadableDocument) {
  const filename = article.file_path?.split('/').pop() || `${article.title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
  let url: string;
  if (article.file_path) {
    if (isNative()) {
      const { data, error } = await supabase.storage.from('academic-articles')
        .createSignedUrl(article.file_path, 60, { download: true });
      if (error || !data) throw error ?? new Error('Não foi possível obter o ficheiro.');
      await openExternalUrl(data.signedUrl);
      return;
    }
    url = supabase.storage.from('academic-articles')
      .getPublicUrl(article.file_path, { download: true }).data.publicUrl;
  } else if (article.pdf_url) {
    url = article.pdf_url;
  } else {
    throw new Error('Ficheiro não disponível.');
  }

  // Never fall back to opening a preview if a host refuses a download (e.g. CORS).
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não foi possível descarregar o ficheiro.');
  const blob = await response.blob();
  if (!blob.size || blob.type.toLowerCase().includes('text/html')) {
    throw new Error('Este endereço não disponibiliza um ficheiro para download.');
  }
  const file = new File([blob], filename, { type: blob.type });
  if (isNative() && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: article.title }); }
    catch (error) { if ((error as DOMException).name !== 'AbortError') throw error; }
    return;
  }
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
}