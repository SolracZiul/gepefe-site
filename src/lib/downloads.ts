import { supabase } from '@/integrations/supabase/client';
import { isNative, openExternalUrl } from '@/lib/native';

interface DownloadableDocument {
  title: string;
  file_path: string | null;
  pdf_url: string | null;
}

/** External hosts can refuse fetching; reserve the web tab before user activation expires. */
export async function downloadDocument(article: DownloadableDocument) {
  if (!article.file_path && article.pdf_url) {
    const url = article.pdf_url;
    const fallbackTab = !isNative() ? window.open('', '_blank') : null;
    if (fallbackTab) fallbackTab.opener = null;
    try {
      await fetchAndDownload(url, `${article.title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`, article.title, true);
      fallbackTab?.close();
    } catch (error) {
      console.warn('Download direto bloqueado pelo servidor externo. Abrindo visualização.', error);
      if (fallbackTab && !fallbackTab.closed) fallbackTab.location.href = url;
      else await openExternalUrl(url);
    }
    return;
  }
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

  await fetchAndDownload(url, filename, article.title);
}

async function fetchAndDownload(url: string, filename: string, title: string, validatePdf = false) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não foi possível descarregar o ficheiro.');
  const blob = await response.blob();
  if (!blob.size || blob.type.toLowerCase().includes('text/html')) {
    throw new Error('Este endereço não disponibiliza um ficheiro para download.');
  }
  if (validatePdf && !((await blob.slice(0, 1024).text()).includes('%PDF-'))) {
    throw new Error('O servidor não devolveu um PDF válido.');
  }
  const file = new File([blob], filename, { type: blob.type });
  if (isNative() && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); }
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