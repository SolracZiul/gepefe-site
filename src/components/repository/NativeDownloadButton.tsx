import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNativeDownloads } from '@/hooks/useNativeDownloads';
import { removeDownload, saveDownload } from '@/lib/native-offline';
import type { Article } from '@/hooks/useArticles';

export function NativeDownloadButton({ article }: { article: Article }) {
  const { items, loading, error } = useNativeDownloads();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  if (!Capacitor.isNativePlatform()) return null;
  const saved = items.some(item => item.id === article.id);
  const label = saved ? 'Remover download' : 'Baixar para leitura offline';
  return <Button size="icon" variant="outline" className="shrink-0" title={label} aria-label={label} disabled={busy || loading || error || (!saved && !article.file_path && !article.pdf_url)} onClick={async event => {
    event.preventDefault(); event.stopPropagation(); setBusy(true);
    try {
      if (saved) await removeDownload(article.id); else await saveDownload(article);
      toast({ title: saved ? 'Download removido' : 'PDF salvo em Baixados' });
    } catch (error) {
      toast({ title: saved ? 'Não foi possível remover o download' : 'Não foi possível salvar o PDF', description: error instanceof Error ? error.message : undefined, variant: 'destructive' });
    } finally { setBusy(false); }
  }}>{saved ? <Trash2 className="h-4 w-4" /> : <Download className={`h-4 w-4 ${busy ? 'animate-pulse' : ''}`} />}</Button>;
}