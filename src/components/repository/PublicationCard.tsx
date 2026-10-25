import { useState } from 'react';
import { downloadDocument, getArticleFileUrl } from '@/lib/downloads';
import { openExternalUrl } from '@/lib/native';
import { Link } from 'react-router-dom';
import { Bookmark, Download, ArrowUpRight, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/hooks/useArticles';
import { collectiveAuthor, formatAcademicAuthor } from '@/lib/repository';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

interface Props {
  article: Article;
  saved: boolean;
  canSave: boolean;
  onSave: () => void;
  onRead: () => void;
}

export function PublicationCard({ article, saved, canSave, onSave, onRead }: Props) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const collective = article.authors.length === 1 && article.authors[0] === collectiveAuthor;
  const member = article.authors.some(author => author.includes(' (GEPEFE)'));
  const hasFile = Boolean(article.file_path || article.pdf_url);

  // Obtém a URL do documento (preferindo pdf_url se existir, ou file_path)
  const fileUrl = getArticleFileUrl(article);

  async function handleRead() {
    onRead();
    if (fileUrl) await openExternalUrl(fileUrl);
  }

  async function download() {
    setDownloading(true);
    try {
      await downloadDocument(article);
    } catch {
      // Se falhar a transferência direta no app nativo, abre no navegador do telemóvel
      if (Capacitor.isNativePlatform() && fileUrl) {
        await openExternalUrl(fileUrl);
      } else {
        toast({
          title: 'Não foi possível baixar o documento',
          description: 'O servidor pode bloquear downloads ou o endereço pode não apontar diretamente para um ficheiro.',
          variant: 'destructive',
        });
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <article className="publication-card flex h-full min-w-0 flex-col rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-card sm:p-6">
      <div className="mb-5 flex min-h-7 items-center gap-3">
        <Badge variant="secondary" className="max-w-full rounded-sm bg-primary/15 text-foreground text-[11px] font-medium">
          {article.category}
        </Badge>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {article.publish_date.slice(0, 4)}
        </span>
      </div>
      <h3 className="mb-3 text-lg font-semibold leading-snug">
        <Link to={`/article/${article.id}`} onClick={onRead} className="line-clamp-3 hover:underline underline-offset-4">
          {article.title}
        </Link>
      </h3>
      <div className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        {collective ? (
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        ) : (
          <User className={`mt-0.5 h-4 w-4 shrink-0 ${member ? 'text-primary' : ''}`} />
        )}
        <span className="line-clamp-2">
          {collective ? 'Criação do GEPEFE' : article.authors.map(formatAcademicAuthor).join('; ')}
        </span>
      </div>
      <p className="mb-5 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.abstract}</p>
      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            className="min-w-0 flex-1 px-3 text-xs"
            disabled={!hasFile}
            onClick={handleRead}
          >
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            Ler / Visualizar PDF
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!hasFile || downloading}
            aria-label="Download"
            title="Download"
            className="shrink-0 hover:bg-muted hover:text-foreground"
            onClick={download}
          >
            <Download className={downloading ? 'animate-pulse h-4 w-4' : 'h-4 w-4'} />
          </Button>
          {canSave && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 hover:bg-muted hover:text-foreground"
              aria-label={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              aria-pressed={saved}
              title={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              onClick={onSave}
            >
              <Bookmark className={saved ? 'fill-primary text-primary h-4 w-4' : 'h-4 w-4'} />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
