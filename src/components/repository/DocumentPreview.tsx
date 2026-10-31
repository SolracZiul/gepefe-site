import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getArticleFileUrl } from '@/lib/downloads';
import { openExternalUrl } from '@/lib/native';
import type { Article } from '@/hooks/useArticles';

export function DocumentPreview({ article }: { article: Article }) {
  const url = getArticleFileUrl(article);
  if (!url) return null;
  const pdf = article.file_type?.toLowerCase().includes('pdf') || /\.pdf(?:$|[?#])/i.test(url);

  return (
    <section id="documento" aria-label="Visualização do documento" className="mt-8 min-w-0 scroll-mt-40 border-t border-border pt-6">
      <h2 className="mb-4 text-xl font-semibold">Documento</h2>
      {pdf ? (
        <iframe
          key={url}
          src={url}
          title={`PDF: ${article.title}`}
          className="block h-[65dvh] min-h-[360px] w-full rounded-lg border border-border bg-muted sm:h-[760px]"
        />
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