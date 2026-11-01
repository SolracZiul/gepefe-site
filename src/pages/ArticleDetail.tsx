import { useParams, Link, Navigate } from 'react-router-dom';
import { downloadDocument, getArticleFileUrl } from '@/lib/downloads';
import { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, BookOpen, Calendar, Copy, Download, Share2, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PublicationCard } from '@/components/repository/PublicationCard';
import { DocumentPreview } from '@/components/repository/DocumentPreview';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { useToast } from '@/hooks/use-toast';
import { collectiveAuthor, formatCitation, publicationPath, recordReading } from '@/lib/repository';
import { getPublicShareUrl, openExternalUrl, shareContent } from '@/lib/native';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { NativeDownloadButton } from '@/components/repository/NativeDownloadButton';

export default function ArticleDetail() {
  const { id } = useParams();
  const { articles, loading, error, refetch } = useArticlesContext();
  const { user } = useAuth();
  const { toggleFavorite, isFavorited } = useFavorites(user?.id || null);
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const article = articles.find(item => item.id === id);

  useEffect(() => { 
    if (user && article && article.content_type !== 'news') {
      recordReading(user.id, article.id); 
    }
  }, [user?.id, article?.id]);

  if (loading) return <div role="status" className="py-20 text-center text-muted-foreground">Carregando artigo…</div>;
  if (error) return <div className="py-20 text-center"><p className="mb-4 text-destructive">Não foi possível carregar o artigo.</p><Button onClick={() => void refetch()}>Tentar novamente</Button></div>;
  if (!article) return <section className="py-20 text-center"><h1 className="mb-5 text-2xl font-semibold">Artigo não encontrado</h1><Button asChild variant="outline"><Link to="/todos"><ArrowLeft />Voltar ao acervo</Link></Button></section>;
  if (article.content_type === 'news') return <Navigate to={`/noticia/${article.id}`} replace />;

  const collective = article.authors.length === 1 && article.authors[0] === collectiveAuthor;
  const member = article.authors.some(name => name.includes(' (GEPEFE)'));
  const hasFile = Boolean(article.file_path || article.pdf_url);
  const pdf = article.file_type?.includes('pdf') || article.pdf_url?.toLowerCase().includes('.pdf');
  const citation = formatCitation(article, getPublicShareUrl(publicationPath(article)));
  const related = articles.filter(item => item.content_type !== 'news' && item.id !== article.id && (item.category === article.category || item.tags.some(tag => article.tags.includes(tag)))).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 3);

  const fileUrl = getArticleFileUrl(article);
  async function handleOpenOrRead() {
    if (fileUrl) await openExternalUrl(fileUrl);
  }

  async function download() {
    if (!article) return;
    setDownloading(true);
    try {
      await downloadDocument(article);
    } catch {
      if (Capacitor.isNativePlatform() && fileUrl) {
        await Browser.open({ url: fileUrl });
      } else {
        toast({ title: 'Não foi possível baixar o documento', variant: 'destructive' });
      }
    } finally { 
      setDownloading(false); 
    }
  }

  async function copyCitation() {
    try { 
      await navigator.clipboard.writeText(citation); 
      toast({ title: 'Citação copiada' }); 
    } catch { 
      toast({ title: 'Não foi possível copiar a citação', variant: 'destructive' }); 
    }
  }

  // Shares the item's title and public link, falling back to copying the link when the platform sheet is unavailable.
  async function share() {
    if (!article) return;
    try {
      const delivered = await shareContent({
        title: article.title,
        url: getPublicShareUrl(publicationPath(article)),
      });
      if (delivered === 'copied') toast({ title: 'Link copiado para a área de transferência' });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      toast({ title: 'Não foi possível compartilhar', variant: 'destructive' });
    }
  }

  return (
    <main>
      <header className="border-b border-border pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="rounded-sm">{article.category}</Badge>
        </div>
        <h1 className="break-words text-lg font-semibold leading-tight sm:text-3xl lg:text-4xl">{article.title}</h1>
        <div className="mt-6 flex items-start gap-3 text-sm leading-6">
          {collective ? <Users className="mt-1 h-4 w-4 shrink-0 text-primary" /> : <User className={`mt-1 h-4 w-4 shrink-0 ${member ? 'text-primary' : 'text-muted-foreground'}`} />}
          <div>
            <p>{collective ? 'Criação do GEPEFE' : article.authors.map(name => name.replace(' (GEPEFE)', '')).join('; ')}</p>
            {(collective || member) && <p className="text-xs text-muted-foreground">Grupo de Estudos e Pesquisas em Educação Física e Escola</p>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(`${article.publish_date.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR')}</span>
          <span>DOI: não informado</span>
        </div>
      </header>

      <Tabs defaultValue="abstract" className="mt-6 min-w-0">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 overflow-x-auto">
            <TabsList className="h-10 w-max flex-nowrap justify-start whitespace-nowrap">
              <TabsTrigger value="abstract" className="shrink-0 px-2 text-xs sm:px-3 sm:text-sm">Resumo / Abstract</TabsTrigger>
              <TabsTrigger value="keywords" className="shrink-0 px-2 text-xs sm:px-3 sm:text-sm">Palavras-chave</TabsTrigger>
              <TabsTrigger value="citation" className="shrink-0 px-2 text-xs sm:px-3 sm:text-sm">Citação ABNT</TabsTrigger>
            </TabsList>
          </div>
          <div role="group" aria-label="Ações da publicação" className="flex shrink-0 items-center gap-2">
          {Capacitor.isNativePlatform() ? <NativeDownloadButton article={article} /> : <Tooltip>
            <TooltipTrigger asChild><span className="inline-flex"><Button size="icon" disabled={!hasFile || downloading} aria-label={pdf ? 'Baixar PDF' : 'Baixar documento'} onClick={() => void download()}>
              <Download className={downloading ? 'animate-pulse' : ''} />
            </Button></span></TooltipTrigger>
            <TooltipContent>{downloading ? 'Baixando…' : pdf ? 'Baixar PDF' : 'Baixar documento'}</TooltipContent>
          </Tooltip>}
          <Tooltip>
            <TooltipTrigger asChild><span className="inline-flex"><Button size="icon" variant="outline" disabled={!hasFile} aria-label={pdf ? 'Ler PDF' : 'Ler documento'} onClick={() => void handleOpenOrRead()}>
              <BookOpen />
            </Button></span></TooltipTrigger>
            <TooltipContent>{pdf ? 'Ler PDF' : 'Ler documento'}</TooltipContent>
          </Tooltip>
          <Tooltip><TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            asChild={!user} 
            onClick={user ? () => void toggleFavorite(article.id) : undefined} 
            aria-label={isFavorited(article.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'} 
            aria-pressed={isFavorited(article.id)}
          >
            {user ? <Bookmark className={isFavorited(article.id) ? 'fill-primary text-primary' : ''} /> : <Link to="/auth"><Bookmark /></Link>}
          </Button>
          </TooltipTrigger><TooltipContent>{isFavorited(article.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'}</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void share()}
            aria-label="Compartilhar este documento"
          >
            <Share2 />
          </Button>
          </TooltipTrigger><TooltipContent>Compartilhar</TooltipContent></Tooltip>
          </div>
        </div>
        <TabsContent value="abstract" className="py-6">
          <h2 className="mb-4 text-xl font-semibold">Resumo</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{article.abstract || 'Resumo não informado.'}</p>
        </TabsContent>
        <TabsContent value="keywords" className="py-6">
          <h2 className="mb-4 text-xl font-semibold">Palavras-chave</h2>
          <div className="flex flex-wrap gap-2">
            {article.tags.length ? article.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>) : <p className="text-sm text-muted-foreground">Palavras-chave não informadas.</p>}
          </div>
        </TabsContent>
        <TabsContent value="citation" className="py-6">
          <h2 className="mb-4 text-xl font-semibold">Referência Bibliográfica (ABNT)</h2>
          <p className="break-words text-sm leading-7 text-muted-foreground">{citation}</p>
          <Button variant="outline" className="mt-5" onClick={() => void copyCitation()}><Copy />Copiar Citação</Button>
        </TabsContent>
      </Tabs>

      <DocumentPreview article={article} />

      {related.length > 0 && (
        <section className="mt-8 border-t border-border pt-8">
          <h2 className="mb-5 text-xl font-semibold">Artigos Relacionados</h2>
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {related.map(item => (
              <PublicationCard 
                key={item.id} 
                article={item} 
                saved={isFavorited(item.id)} 
                canSave={Boolean(user)} 
                onSave={() => void toggleFavorite(item.id)} 
                onRead={() => { if (user) recordReading(user.id, item.id); }} 
              />
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
