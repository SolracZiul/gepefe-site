import { Link } from 'react-router-dom';
import { Archive, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RepositoryCollection } from '@/components/repository/RepositoryCollection';
import { NewsCard } from '@/components/NewsCard';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { useSearch } from '@/contexts/SearchContext';
import { useAuth } from '@/hooks/useAuth';
export default function Index() {
  const { articles, loading } = useArticlesContext();
  const { searchQuery } = useSearch();
  const { isAdmin } = useAuth();
  const academic = articles.filter(article => article.content_type !== 'news');
  const news = articles.filter(article => article.content_type === 'news' && (isAdmin || article.title !== 'Como Publicar Notícias no Portal GEPEFE')).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 3);
  return <main>
    <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="h-3.5 w-3.5" /><span>GEPEFE</span><span>/</span><span>Repositório Institucional</span></div>
    <section className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-7 xl:flex-row xl:items-center"><div><div className="mb-3 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pesquisa · Educação · Acesso aberto</span></div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Repositório Acadêmico GEPEFE</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Grupo de Estudos e Pesquisas em Educação Física e Escola</p></div><div className="flex shrink-0 items-center gap-4 xl:border-l xl:border-border xl:pl-6"><Archive className="h-6 w-6 text-muted-foreground" /><div><p className="text-2xl font-semibold tabular-nums">{loading ? '—' : academic.length}</p><p className="text-xs text-muted-foreground">publicações no acervo</p></div></div></section>
    <RepositoryCollection home />
    {!searchQuery && news.length > 0 && <section className="mt-12 border-t border-border pt-8"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Notícias do GEPEFE</h2><Button variant="ghost" size="sm" asChild><Link to="/noticias">Todas as notícias<ArrowRight /></Link></Button></div><div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{news.map(item => <NewsCard key={item.id} news={{ ...item, summary: item.summary || '', image_url: item.image_url || '', images: item.images || [] }} />)}</div></section>}
  </main>;
}
