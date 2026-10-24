import { useParams, Link, Navigate } from 'react-router-dom';
import { openExternalUrl, openStoredFileNative, signInWithGoogle } from '@/lib/native';
import { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, BookOpen, Calendar, Copy, Download, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticleViewer } from '@/components/ArticleViewer';
import { PublicationCard } from '@/components/repository/PublicationCard';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { collectiveAuthor, formatCitation, recordReading } from '@/lib/repository';
export default function ArticleDetail() {
  const { id } = useParams();
  const { articles, loading, error, refetch } = useArticlesContext();
  const { user } = useAuth();
  const { toggleFavorite, isFavorited } = useFavorites(user?.id || null);
  const { toast } = useToast();
  const [preview, setPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const article = articles.find(item => item.id === id);
  useEffect(() => { if (user && article && article.content_type !== 'news') recordReading(user.id, article.id); }, [user?.id, article?.id]);
  if (loading) return <div role="status" className="py-20 text-center text-muted-foreground">Carregando artigo…</div>;
  if (error) return <div className="py-20 text-center"><p className="mb-4 text-destructive">Não foi possível carregar o artigo.</p><Button onClick={() => void refetch()}>Tentar novamente</Button></div>;
  if (!article) return <section className="py-20 text-center"><h1 className="mb-5 text-2xl font-semibold">Artigo não encontrado</h1><Button asChild variant="outline"><Link to="/todos"><ArrowLeft />Voltar ao acervo</Link></Button></section>;
  if (article.content_type === 'news') return <Navigate to={`/noticia/${article.id}`} replace />;
  const collective = article.authors.length === 1 && article.authors[0] === collectiveAuthor;
  const member = article.authors.some(name => name.includes(' (GEPEFE)'));
  const hasFile = Boolean(article.file_path || article.pdf_url);
  const pdf = article.file_type?.includes('pdf') || article.pdf_url?.toLowerCase().includes('.pdf');
  const citation = formatCitation(article, `${window.location.origin}/article/${article.id}`);
  const related = articles.filter(item => item.content_type !== 'news' && item.id !== article.id && (item.category === article.category || item.tags.some(tag => article.tags.includes(tag)))).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 3);
  async function download() {
    if (!article) return;
    setDownloading(true);
    try {
      if (article.file_path && await openStoredFileNative('academic-articles', article.file_path)) {
        // opened in in-app browser
      } else if (article.file_path) {
        const { data, error } = await supabase.storage.from('academic-articles').download(article.file_path);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = article.file_path.split('/').pop() || `${article.title}.pdf`; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (article.pdf_url) await openExternalUrl(article.pdf_url);
    } catch { toast({ title: 'Não foi possível baixar o documento', variant: 'destructive' }); }
    finally { setDownloading(false); }
  }
  async function copyCitation() {
    try { await navigator.clipboard.writeText(citation); toast({ title: 'Citação copiada' }); }
    catch { toast({ title: 'Não foi possível copiar a citação', variant: 'destructive' }); }
  }
  return <main>
    <header className="border-b border-border pb-8"><div className="mb-4 flex flex-wrap items-center gap-3"><Badge variant="secondary" className="rounded-sm">{article.category}</Badge></div><h1 className="break-words text-3xl font-semibold leading-tight sm:text-4xl">{article.title}</h1>
      <div className="mt-6 flex items-start gap-3 text-sm leading-6">{collective ? <Users className="mt-1 h-4 w-4 shrink-0 text-primary" /> : <User className={`mt-1 h-4 w-4 shrink-0 ${member ? 'text-primary' : 'text-muted-foreground'}`} />}<div><p>{collective ? 'Criação do GEPEFE' : article.authors.map(name => name.replace(' (GEPEFE)', '')).join('; ')}</p>{(collective || member) && <p className="text-xs text-muted-foreground">Grupo de Estudos e Pesquisas em Educação Física e Escola</p>}</div></div>
      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(`${article.publish_date.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR')}</span><span>DOI: não informado</span></div>
      <div className="mt-6 flex flex-wrap gap-3"><Button disabled={!hasFile || downloading} onClick={() => void download()}><Download />{downloading ? 'Baixando…' : pdf ? 'Baixar PDF' : 'Baixar documento'}</Button><Button variant="outline" disabled={!hasFile} onClick={() => setPreview(true)}><BookOpen />{pdf ? 'Ler PDF' : 'Ler documento'}</Button><Button variant="outline" size="icon" asChild={!user} onClick={user ? () => void toggleFavorite(article.id) : undefined} aria-label={isFavorited(article.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'} title="Salvar nos favoritos" aria-pressed={isFavorited(article.id)}>{user ? <Bookmark className={isFavorited(article.id) ? 'fill-primary text-primary' : ''} /> : <Link to="/auth"><Bookmark /></Link>}</Button></div>
    </header>
    <Tabs defaultValue="abstract" className="mt-8"><TabsList className="h-auto max-w-full flex-wrap justify-start"><TabsTrigger value="abstract">Resumo / Abstract</TabsTrigger><TabsTrigger value="keywords">Palavras-chave</TabsTrigger><TabsTrigger value="citation">Citação ABNT</TabsTrigger></TabsList><TabsContent value="abstract" className="py-6"><h2 className="mb-4 text-xl font-semibold">Resumo</h2><p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{article.abstract || 'Resumo não informado.'}</p></TabsContent><TabsContent value="keywords" className="py-6"><h2 className="mb-4 text-xl font-semibold">Palavras-chave</h2><div className="flex flex-wrap gap-2">{article.tags.length ? article.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>) : <p className="text-sm text-muted-foreground">Palavras-chave não informadas.</p>}</div></TabsContent><TabsContent value="citation" className="py-6"><h2 className="mb-4 text-xl font-semibold">Referência Bibliográfica (ABNT)</h2><p className="break-words text-sm leading-7 text-muted-foreground">{citation}</p><Button variant="outline" className="mt-5" onClick={() => void copyCitation()}><Copy />Copiar Citação</Button></TabsContent></Tabs>
    {related.length > 0 && <section className="mt-8 border-t border-border pt-8"><h2 className="mb-5 text-xl font-semibold">Artigos Relacionados</h2><div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{related.map(item => <PublicationCard key={item.id} article={item} saved={isFavorited(item.id)} canSave={Boolean(user)} onSave={() => void toggleFavorite(item.id)} onRead={() => { if (user) recordReading(user.id, item.id); }} />)}</div></section>}
    {preview && <ArticleViewer article={article} isOpen={preview} onClose={() => setPreview(false)} />}
  </main>;
}
