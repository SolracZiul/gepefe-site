import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowRight, Bookmark, BookOpen, ChevronLeft, ChevronRight, FlaskConical, History, Info, Library, LockKeyholeOpen, Newspaper, RotateCcw, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RepositoryHeader } from '@/components/repository/RepositoryHeader';
import { PublicationCard } from '@/components/repository/PublicationCard';
import { NewsCard } from '@/components/NewsCard';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { useSearch } from '@/contexts/SearchContext';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { collectiveAuthor, filterPublications, readHistory, recordReading, studyAreas } from '@/lib/repository';

const pageSize = 9;
export default function Index() {
  const { articles, loading, error, refetch } = useArticlesContext();
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSearch();
  const { user, isAdmin } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites(user?.id || null);
  const [area, setArea] = useState('');
  const [sort, setSort] = useState('recent');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [view, setView] = useState<'collection' | 'history' | 'researchers'>('collection');
  const [history, setHistory] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => { setHistory(user ? readHistory(user.id) : []); if (!user) setView('collection'); }, [user?.id]);
  useEffect(() => { setPage(1); }, [searchQuery, selectedCategory, area, sort, view]);
  const academic = useMemo(() => articles.filter(article => article.content_type !== 'news'), [articles]);
  const filtered = useMemo(() => filterPublications(articles, searchQuery, area, selectedCategory === 'Todos' ? '' : selectedCategory, sort), [articles, searchQuery, area, selectedCategory, sort]);
  const visible = view === 'history' ? history.flatMap(id => filtered.filter(article => article.id === id)) : filtered;
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pages);
  const news = articles.filter(article => article.content_type === 'news' && (isAdmin || article.title !== 'Como Publicar Notícias no Portal GEPEFE')).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 3);
  const documentTypes = Array.from(new Set(['Artigos Completos', 'Relatos de Experiência', 'Resumos Expandidos', ...academic.map(article => article.category)])).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const researchers = Array.from(new Set(academic.flatMap(article => article.authors.filter(author => author.includes(' (GEPEFE)'))))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const filtersActive = Boolean(searchQuery || area || selectedCategory && selectedCategory !== 'Todos');
  const reset = () => { setSearchQuery(''); setSelectedCategory(''); setArea(''); };
  const markRead = (id: string) => { if (user) setHistory(recordReading(user.id, id)); };
  const openView = (next: typeof view) => { setView(next); setMobileNav(false); reset(); };
  const sidebarItems = [
    { label: 'Acervo Completo', icon: Library, action: () => openView('collection'), active: view === 'collection' },
    ...(user ? [{ label: 'Meus Favoritos', icon: Bookmark, href: '/favoritos' }, { label: 'Histórico de Leitura', icon: History, action: () => openView('history'), active: view === 'history' }] : []),
    { label: 'Sobre o GEPEFE', icon: Info, href: '/sobre' },
    { label: 'Linhas de Pesquisa', icon: FlaskConical, href: '/sobre#linhas-de-pesquisa' },
    { label: 'Integrantes / Pesquisadores', icon: Users, action: () => openView('researchers'), active: view === 'researchers' },
    { label: 'Notícias', icon: Newspaper, href: '/noticias' },
  ];
  const navigation = (mini = false) => <>
    {!mini && <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Repositório</p>}
    <nav aria-label="Navegação institucional" className="space-y-1.5">{sidebarItems.map(item => <Button key={item.label} variant="ghost" title={mini ? item.label : undefined} aria-label={mini ? item.label : undefined} asChild={Boolean(item.href)} onClick={item.action} className={`h-auto min-h-11 w-full gap-3 rounded-md px-3 py-3 text-left text-[13px] hover:bg-muted hover:text-foreground ${mini ? 'justify-center' : 'justify-start whitespace-normal'} ${item.active ? 'bg-primary/15 text-foreground font-semibold' : 'text-muted-foreground'}`}>
      {item.href ? <Link to={item.href}><item.icon className="shrink-0" />{!mini && <span>{item.label}</span>}</Link> : <><item.icon className="shrink-0" />{!mini && <span>{item.label}</span>}</>}
    </Button>)}</nav>
    {!mini && <div className="mt-10 border-t border-border px-3 pt-6"><LockKeyholeOpen className="mb-3 h-5 w-5 text-muted-foreground" /><p className="text-xs font-semibold">Conhecimento de acesso aberto</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Educação Física e Escola</p><a href="mailto:gepefe@unesc.net" className="mt-4 block text-xs text-muted-foreground hover:underline">gepefe@unesc.net</a></div>}
  </>;

  return <div className="repository min-h-screen bg-background text-foreground">
    <RepositoryHeader query={searchQuery} onQueryChange={setSearchQuery} onHistory={() => openView('history')} onToggleSidebar={() => { if (window.matchMedia('(min-width: 1024px)').matches) setCollapsed(!collapsed); else setMobileNav(true); }} />
    <div className="mx-auto flex max-w-[1680px]">
      <aside className={`sticky top-[77px] hidden h-[calc(100vh-77px)] shrink-0 overflow-y-auto border-r border-border bg-card px-4 py-8 lg:block ${collapsed ? 'w-20' : 'w-64'}`}>{navigation(collapsed)}</aside>
      <Sheet open={mobileNav} onOpenChange={setMobileNav}><SheetContent side="left" className="repository w-72 bg-card"><SheetHeader><SheetTitle className="mb-6 text-left">GEPEFE</SheetTitle></SheetHeader>{navigation()}</SheetContent></Sheet>
      <main className="min-w-0 flex-1 px-4 pb-8 pt-7 sm:px-7 lg:px-9 lg:pt-9">
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="h-3.5 w-3.5" /><span>GEPEFE</span><span>/</span><span>Repositório Institucional</span></div>
        <section className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-7 xl:flex-row xl:items-center">
          <div><div className="mb-3 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pesquisa · Educação · Acesso aberto</span></div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Repositório Acadêmico GEPEFE</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Grupo de Estudos e Pesquisas em Educação Física e Escola</p></div>
          <div className="flex shrink-0 items-center gap-4 xl:border-l xl:border-border xl:pl-6"><Archive className="h-6 w-6 text-muted-foreground" /><div><p className="text-2xl font-semibold tabular-nums">{loading ? '—' : academic.length}</p><p className="text-xs text-muted-foreground">publicações no acervo</p></div></div>
        </section>
        {view === 'researchers' ? <section><h2 className="mb-2 text-xl font-semibold">Integrantes / Pesquisadores</h2><p className="mb-6 text-sm text-muted-foreground">Autores GEPEFE identificados nas publicações do acervo.</p><div className="divide-y divide-border">{researchers.map(author => <div key={author} className="flex flex-wrap items-center justify-between gap-3 py-5"><span className="flex items-center gap-3 text-sm"><Users className="h-4 w-4 text-primary" />{author.replace(' (GEPEFE)', '')}</span><Button variant="outline" size="sm" onClick={() => { openView('collection'); setSearchQuery(author.replace(' (GEPEFE)', '')); }}>Publicações<ArrowRight /></Button></div>)}</div>{researchers.length === 0 && <p className="py-12 text-sm text-muted-foreground">Nenhum integrante identificado no acervo disponível.</p>}<Button variant="link" asChild className="mt-6 text-foreground"><Link to="/sobre">Sobre o GEPEFE<ArrowRight /></Link></Button></section> : <>
          <section aria-label="Filtros acadêmicos" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_210px]">
            <div><label id="area-label" className="mb-2 block text-[11px] font-medium text-muted-foreground">Área de Estudo</label><Select value={area || 'all'} onValueChange={value => setArea(value === 'all' ? '' : value)}><SelectTrigger aria-labelledby="area-label" className="h-11 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as áreas</SelectItem>{studyAreas.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
            <div><label id="type-label" className="mb-2 block text-[11px] font-medium text-muted-foreground">Tipo de Documento</label><Select value={selectedCategory && selectedCategory !== 'Todos' ? selectedCategory : 'all'} onValueChange={value => setSelectedCategory(value === 'all' ? '' : value)}><SelectTrigger aria-labelledby="type-label" className="h-11 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os documentos</SelectItem>{documentTypes.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
            <div><label id="sort-label" className="mb-2 block text-[11px] font-medium text-muted-foreground">Ordenação</label><Select value={sort} onValueChange={setSort}><SelectTrigger aria-labelledby="sort-label" className="h-11 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">Mais Recentes</SelectItem><SelectItem value="downloads">Mais Baixados</SelectItem><SelectItem value="title">A–Z</SelectItem></SelectContent></Select></div>
          </section>
          <section id="publications">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><h2 className="text-lg font-semibold">{view === 'history' ? 'Histórico de Leitura' : filtersActive ? 'Resultados da busca' : 'Publicações Recentes'}</h2><Badge variant="secondary" className="rounded-sm font-normal tabular-nums">{visible.length}</Badge></div>{filtersActive && <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:bg-muted hover:text-foreground"><X />Limpar filtros</Button>}</div>
            {view === 'history' && <p className="mb-5 text-xs text-muted-foreground">Leituras recentes neste navegador.</p>}
            {loading ? <div role="status" className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{[1, 2, 3].map(id => <div key={id} className="h-80 animate-pulse rounded-lg border border-border bg-muted" />)}<span className="sr-only">Carregando publicações</span></div> : error ? <div className="py-14 text-center"><p className="mb-4 text-sm text-destructive">Não foi possível carregar o acervo.</p><Button variant="outline" onClick={() => void refetch()}><RotateCcw />Tentar novamente</Button></div> : visible.length === 0 ? <div className="py-16 text-center"><BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{view === 'history' && !filtersActive ? 'Nenhuma leitura registrada neste navegador.' : 'Nenhuma publicação encontrada.'}</p>{filtersActive && <Button variant="outline" className="mt-5" onClick={reset}>Limpar filtros</Button>}</div> : <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{visible.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(article => <PublicationCard key={article.id} article={article} canSave={Boolean(user)} saved={isFavorited(article.id)} onSave={() => void toggleFavorite(article.id)} onRead={() => markRead(article.id)} />)}</div>}
            {!loading && visible.length > 0 && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><p>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, visible.length)} de {visible.length} publicações</p>{pages > 1 && <div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></Button><span>{currentPage} / {pages}</span><Button variant="outline" size="icon" aria-label="Próxima página" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight /></Button></div>}</div>}
          </section>
          {view === 'collection' && !filtersActive && news.length > 0 && <section className="mt-12 border-t border-border pt-8"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Notícias do GEPEFE</h2><Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:bg-muted hover:text-foreground"><Link to="/noticias">Todas as notícias<ArrowRight /></Link></Button></div><div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{news.map(item => <NewsCard key={item.id} news={{ ...item, summary: item.summary || '', image_url: item.image_url || '', images: item.images || [] }} />)}</div></section>}
        </>}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[11px] text-muted-foreground"><span>GEPEFE · Repositório Acadêmico Institucional</span><Link to="/sobre" className="flex items-center gap-1.5 hover:underline"><LockKeyholeOpen className="h-3.5 w-3.5" />Acesso aberto</Link></footer>
      </main>
    </div>
  </div>;
}
