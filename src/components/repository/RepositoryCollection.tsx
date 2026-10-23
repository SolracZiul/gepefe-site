import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PublicationCard } from './PublicationCard';
import { MobileCollectionFilters } from './MobileCollectionFilters';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { useSearch } from '@/contexts/SearchContext';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { collectiveAuthor, filterPublications, readHistory, recordReading, studyAreas } from '@/lib/repository';

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="min-w-0"><label className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</label><Select value={value || 'all'} onValueChange={value => onChange(value === 'all' ? '' : value)}><SelectTrigger aria-label={label} className="h-9 bg-background text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>;
}
export function RepositoryCollection({ title = 'Todas as Publicações', category = '', mode = 'collection' }: { title?: string; category?: string; mode?: 'collection' | 'favorites' | 'history'; home?: boolean }) {
  const { articles, loading, error, refetch } = useArticlesContext();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, loading: authLoading } = useAuth();
  const { isFavorited, toggleFavorite, loading: favoritesLoading } = useFavorites(user?.id || null);
  const [area, setArea] = useState('');
  const [type, setType] = useState('');
  const [year, setYear] = useState('');
  const [author, setAuthor] = useState('');
  const [sort, setSort] = useState('recent');
  const [quick, setQuick] = useState('');
  const personal = mode !== 'collection';
  const [history, setHistory] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  useEffect(() => { setHistory(user ? readHistory(user.id) : []); }, [user?.id]);
  useEffect(() => { setPage(1); }, [searchQuery, area, type, year, author, sort, category, mode]);
  const academic = useMemo(() => articles.filter(item => item.content_type !== 'news'), [articles]);
  const types = Array.from(new Set(academic.map(item => item.category))).sort();
  const years = Array.from(new Set(academic.map(item => item.publish_date.slice(0, 4)))).sort().reverse();
  const authors = Array.from(new Set(academic.flatMap(item => item.authors).filter(name => name !== collectiveAuthor).map(name => name.replace(' (GEPEFE)', '')))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const filtered = personal ? filterPublications(articles, quick, '', '', 'recent', {}) : filterPublications(articles, searchQuery, area, type, sort, { year, author, category });
  const visible = mode === 'favorites' ? filtered.filter(item => isFavorited(item.id)) : mode === 'history' ? history.flatMap(id => filtered.filter(item => item.id === id)) : filtered;
  const pages = Math.max(1, Math.ceil(visible.length / 9));
  const current = Math.min(page, pages);
  const active = personal ? Boolean(quick) : Boolean(searchQuery || area || type || year || author);
  const reset = () => { setQuick(''); setSearchQuery(''); setArea(''); setType(''); setYear(''); setAuthor(''); };
  if (mode !== 'collection' && !authLoading && !user) return <section className="py-20 text-center"><BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><h1 className="mb-3 text-2xl font-semibold">{title}</h1><p className="mb-5 text-sm text-muted-foreground">Entre na sua conta para acessar seus artigos.</p><Button asChild><Link to="/auth">Fazer Login</Link></Button></section>;
  return <>
    {personal ? <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-xl font-semibold">{title}</h1><div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Busca rápida" placeholder="Buscar por título, autor ou tag" value={quick} onChange={e => setQuick(e.target.value)} className="h-9 pl-9" /></div></header> : <>
    <MobileCollectionFilters area={area} type={type} sort={sort} year={year} author={author} years={years} authors={authors} category={category} areas={studyAreas} types={category ? [category] : types} onArea={setArea} onType={setType} onSort={setSort} onYear={setYear} onAuthor={setAuthor} onReset={reset} />
    <section aria-label="Filtros acadêmicos" className="mb-5 hidden gap-3 rounded-lg border border-border bg-card p-3 lg:grid lg:grid-cols-5">
      <Filter label="Área de Estudo" value={area} options={studyAreas} onChange={setArea} />
      <Filter label="Categoria / Tipo de Documento" value={type} options={category ? [category] : types} onChange={setType} />
      <Filter label="Ano" value={year} options={years} onChange={setYear} />
      <Filter label="Autor" value={author} options={authors} onChange={setAuthor} />
      <div><label className="mb-1 block text-[11px] font-medium text-muted-foreground">Ordenação</label><Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Ordenação" className="h-9 bg-background text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">Mais Recentes</SelectItem><SelectItem value="downloads">Mais Baixados</SelectItem><SelectItem value="title">A–Z</SelectItem></SelectContent></Select></div>
    </section>
    </>}
    <section id="publications" aria-label={title}>{active && <div className="mb-4 hidden justify-end lg:flex"><Button variant="ghost" size="sm" onClick={reset}><X />Limpar filtros</Button></div>}
      {loading || (mode !== 'collection' && (authLoading || favoritesLoading)) ? <div role="status" className="py-16 text-center text-muted-foreground">Carregando publicações…</div> : error ? <div className="py-16 text-center"><p className="mb-4 text-destructive">Não foi possível carregar o acervo.</p><Button variant="outline" onClick={() => void refetch()}><RotateCcw />Tentar novamente</Button></div> : visible.length === 0 ? <div className="py-16 text-center"><BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhuma publicação encontrada.</p>{active && <Button variant="outline" className="mt-5" onClick={reset}>Limpar filtros</Button>}</div> : <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{visible.slice((current - 1) * 9, current * 9).map(article => <PublicationCard key={article.id} article={article} canSave={Boolean(user)} saved={isFavorited(article.id)} onSave={() => void toggleFavorite(article.id)} onRead={() => { if (user) setHistory(recordReading(user.id, article.id)); }} />)}</div>}
      {!loading && visible.length > 0 && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><p>{(current - 1) * 9 + 1}–{Math.min(current * 9, visible.length)} de {visible.length} publicações</p>{pages > 1 && <div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Página anterior" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft /></Button><span>{current} / {pages}</span><Button variant="outline" size="icon" aria-label="Próxima página" disabled={current === pages} onClick={() => setPage(current + 1)}><ChevronRight /></Button></div>}</div>}
    </section>
  </>;
}
