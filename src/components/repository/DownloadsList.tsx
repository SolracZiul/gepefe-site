import { useEffect, useState } from 'react';
import { BookOpen, Loader2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfReader } from '@/components/repository/DocumentPreview';
import { useNativeDownloads } from '@/hooks/useNativeDownloads';
import { useToast } from '@/hooks/use-toast';
import { openPdfFile, readDownload, removeDownload, type OfflinePublication } from '@/lib/native-offline';

export function DownloadsList() {
  const { items, loading, error } = useNativeDownloads();
  const { toast } = useToast();
  const [reader, setReader] = useState<{ id: string; title: string; url: string } | null>(null);
  // Only the card whose id matches shows feedback; the others stay untouched.
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  useEffect(() => () => { if (reader) URL.revokeObjectURL(reader.url); }, [reader]);
  async function act(item: OfflinePublication, remove: boolean) {
    setActiveItemId(item.id);
    try {
      if (remove) { await removeDownload(item.id); if (reader?.id === item.id) setReader(null); }
      else { try { await openPdfFile(item); } catch { const url = await readDownload(item); window.open(url, '_blank'); setReader({ id: item.id, title: item.title, url }); } }
    } catch { toast({ title: 'Não foi possível acessar o download', variant: 'destructive' }); }
    finally { setActiveItemId(current => (current === item.id ? null : current)); }
  }
  return <>
    {loading ? <p role="status" className="text-muted-foreground">Carregando downloads…</p> : error ? <p role="alert" className="text-destructive">Não foi possível carregar os downloads.</p> : !items.length ? <div className="py-16 text-center"><BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhuma publicação baixada.</p></div> : null}
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(item => {
        const active = item.id === activeItemId;
        return <article key={item.id} className="min-w-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="mb-2 text-xs text-muted-foreground">{item.category} · {item.publish_date.slice(0, 4)}</p>
          <h2 className="break-words text-base font-semibold leading-snug">{item.title}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{item.authors.join('; ')}</p>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" disabled={active} onClick={event => { event.stopPropagation(); void act(item, false); }}>{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}Ler PDF</Button>
            <Button className="ml-auto" size="icon" variant="ghost" title="Remover download" aria-label={`Remover download: ${item.title}`} disabled={active} onClick={event => { event.stopPropagation(); void act(item, true); }}>{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}</Button>
          </div>
        </article>;
      })}
    </div>
    {reader && <section aria-label="Leitura offline" className="mt-6 min-w-0 border-t border-border pt-4">
      <div className="mb-4 flex items-start justify-between gap-3"><h2 className="min-w-0 break-words text-lg font-semibold">{reader.title}</h2><Button className="shrink-0" size="icon" variant="ghost" aria-label="Fechar PDF" onClick={() => setReader(null)}><X /></Button></div>
      <PdfReader key={reader.url} url={reader.url} title={reader.title} local />
    </section>}
  </>;
}
