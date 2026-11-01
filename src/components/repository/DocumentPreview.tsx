import { useEffect, useRef, useState } from 'react';
import { FileText, ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Button } from '@/components/ui/button';
import { getArticleFileUrl } from '@/lib/downloads';
import { openExternalUrl } from '@/lib/native';
import type { Article } from '@/hooks/useArticles';

GlobalWorkerOptions.workerSrc = workerUrl;

export function PdfReader({ url, title, local = false }: { url: string; title: string; local?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    const task = getDocument(url);
    task.promise.then(pdf => { if (active) setDocument(pdf); }).catch(() => {
      if (active) { setFailed(true); setLoading(false); }
    });
    return () => { active = false; void task.destroy(); };
  }, [url]);

  useEffect(() => {
    if (!document || !width || !canvas.current) return;
    let active = true;
    let rendering: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined;
    setLoading(true);
    document.getPage(page).then(pdfPage => {
      const element = canvas.current;
      if (!active || !element) return;
      const context = element.getContext('2d');
      if (!context) return;
      const viewport = pdfPage.getViewport({ scale: width / pdfPage.getViewport({ scale: 1 }).width });
      const ratio = window.devicePixelRatio || 1;
      element.width = Math.floor(viewport.width * ratio);
      element.height = Math.floor(viewport.height * ratio);
      rendering = pdfPage.render({ canvasContext: context, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      return rendering.promise;
    }).then(() => { if (active) setLoading(false); }).catch(() => {
      if (active) { setFailed(true); setLoading(false); }
    });
    return () => { active = false; rendering?.cancel(); };
  }, [document, page, width]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
      <div className="flex h-12 items-center justify-between gap-2 border-b border-border px-3">
        <Button size="icon" variant="ghost" aria-label="Página anterior" disabled={!document || page === 1} onClick={() => setPage(value => value - 1)}><ChevronLeft /></Button>
        <span aria-live="polite" className="text-xs tabular-nums text-muted-foreground">{document ? `Página ${page} de ${document.numPages}` : 'PDF'}</span>
        <Button size="icon" variant="ghost" aria-label="Próxima página" disabled={!document || page === document.numPages} onClick={() => setPage(value => value + 1)}><ChevronRight /></Button>
      </div>
      <div ref={container} className="relative mx-auto min-h-[360px] w-full max-w-4xl">
        {loading && <div role="status" className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando PDF…</div>}
        {failed ? <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-4 text-center"><p className="text-sm text-muted-foreground">A visualização deste documento não está disponível.</p>{!local && <Button variant="outline" onClick={() => void openExternalUrl(url)}><ExternalLink />Acessar documento</Button>}</div> : <canvas ref={canvas} role="img" aria-label={`${title}, página ${page}`} className="block h-auto w-full" />}
      </div>
    </div>
  );
}

export function DocumentPreview({ article }: { article: Article }) {
  const url = getArticleFileUrl(article);
  if (!url) return null;
  const pdf = article.file_type?.toLowerCase().includes('pdf') || /\.pdf(?:$|[?#])/i.test(url);

  return (
    <section id="documento" aria-label="Visualização do documento" className="mt-8 min-w-0 scroll-mt-40 border-t border-border pt-6">
      <h2 className="mb-4 text-xl font-semibold">Documento</h2>
      {pdf ? (
        <PdfReader key={url} url={url} title={article.title} />
      ) : (
        <div className="flex flex-col items-center gap-4 border-y border-border bg-muted/30 px-4 py-10">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <Button variant="outline" onClick={() => void openExternalUrl(url)}>
            <ExternalLink />Acessar documento
          </Button>
        </div>
      )}
    </section>
  );
}