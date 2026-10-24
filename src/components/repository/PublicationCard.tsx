import { useState } from 'react';
import { openExternalUrl, openStoredFileNative, signInWithGoogle } from '@/lib/native';
import { Link } from 'react-router-dom';
import { Bookmark, Download, ArrowUpRight, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticleViewer } from '@/components/ArticleViewer';
import type { Article } from '@/hooks/useArticles';
import { collectiveAuthor, formatAcademicAuthor } from '@/lib/repository';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  article: Article;
  saved: boolean;
  canSave: boolean;
  onSave: () => void;
  onRead: () => void;
}

export function PublicationCard({ article, saved, canSave, onSave, onRead }: Props) {
  const [preview, setPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const collective = article.authors.length === 1 && article.authors[0] === collectiveAuthor;
  const member = article.authors.some(author => author.includes(' (GEPEFE)'));
  const hasFile = Boolean(article.file_path || article.pdf_url);

  async function download() {
    setDownloading(true);
    try {
      if (article.file_path && await openStoredFileNative('academic-articles', article.file_path)) {
        // opened in in-app browser
      } else if (article.file_path) {
        const { data, error } = await supabase.storage.from('academic-articles').download(article.file_path);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = article.file_path.split('/').pop() || `${article.title}.pdf`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (article.pdf_url) await openExternalUrl(article.pdf_url);
    } catch {
      toast({ title: 'Não foi possível baixar o documento', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally { setDownloading(false); }
  }

  return <article className="publication-card flex h-full min-w-0 flex-col rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-card sm:p-6">
    <div className="mb-5 flex min-h-7 items-center gap-3">
      <Badge variant="secondary" className="max-w-full rounded-sm bg-primary/15 text-foreground text-[11px] font-medium">{article.category}</Badge>
      <span className="ml-auto text-xs tabular-nums text-muted-foreground">{article.publish_date.slice(0, 4)}</span>
    </div>
    <h3 className="mb-3 text-lg font-semibold leading-snug"><Link to={`/article/${article.id}`} onClick={onRead} className="line-clamp-3 hover:underline underline-offset-4">{article.title}</Link></h3>
    <div className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
      {collective ? <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <User className={`mt-0.5 h-4 w-4 shrink-0 ${member ? 'text-primary' : ''}`} />}
      <span className="line-clamp-2">{collective ? 'Criação do GEPEFE' : article.authors.map(formatAcademicAuthor).join('; ')}</span>
    </div>
    <p className="mb-5 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.abstract}</p>
    <div className="mt-auto">
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button className="min-w-0 flex-1 px-3 text-xs" disabled={!hasFile} onClick={() => { onRead(); setPreview(true); }}><ArrowUpRight />Ler / Visualizar PDF</Button>
        <Button variant="outline" size="icon" disabled={!hasFile || downloading} aria-label="Download" title="Download" className="shrink-0 hover:bg-muted hover:text-foreground" onClick={download}><Download className={downloading ? 'animate-pulse' : ''} /></Button>
        {canSave && <Button variant="ghost" size="icon" className="shrink-0 hover:bg-muted hover:text-foreground" aria-label={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'} aria-pressed={saved} title={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'} onClick={onSave}><Bookmark className={saved ? 'fill-primary text-primary' : ''} /></Button>}
      </div>
    </div>
    {preview && <ArticleViewer article={article} isOpen={preview} onClose={() => setPreview(false)} />}
  </article>;
}