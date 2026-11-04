import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpLeft, History, Search, PanelLeft, User, LogOut, Shield, X } from 'lucide-react';
import { addRecentSearch, loadRecentSearches, saveRecentSearches } from '@/lib/recent-searches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { userAvatarUrl, userDisplayName } from '@/lib/user-avatar';
import { AccountSheet } from './AccountSheet';
import { UserAvatar } from './UserAvatar';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onToggleSidebar: () => void;
  onHistory: () => void;
  onSearch: () => void;
  searchMode: boolean;
  onExitSearch: () => void;
}

export function RepositoryHeader({ query, onQueryChange, onToggleSidebar, onSearch, searchMode, onExitSearch }: Props) {
  const { user, isAdmin, signOut } = useAuth();
  const name = userDisplayName(user, 'Meu perfil');
  const avatar = userAvatarUrl(user);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<string[]>(() => loadRecentSearches());
  const remember = (term: string) => setRecent(list => { const next = addRecentSearch(list, term); saveRecentSearches(next); return next; });
  // The mobile search bar opens ready to type, without scrolling the page.
  useEffect(() => {
    if (!searchMode) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [searchMode]);
  return <header className="w-full bg-background lg:border-b lg:border-border lg:bg-card">
    <div className="flex h-14 items-center justify-between gap-2 px-4 pt-[env(safe-area-inset-top)] lg:hidden">
      {searchMode ? <>
        <form role="search" onSubmit={event => { event.preventDefault(); remember(query); searchRef.current?.blur(); }} className="flex h-12 min-w-0 flex-1 items-center rounded-full bg-muted pl-1 pr-1">
          <Button type="button" variant="ghost" size="icon" aria-label="Fechar busca" title="Fechar busca" onClick={onExitSearch} className="h-10 w-10 shrink-0 rounded-full active:bg-background/60"><ArrowLeft className="h-5 w-5" /></Button>
          <input ref={searchRef} type="search" enterKeyHint="search" aria-label="Buscar por título, autor, palavra-chave ou ano" placeholder="Digite para pesquisar" value={query} onChange={event => onQueryChange(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') onExitSearch(); }} className="h-full min-w-0 flex-1 bg-transparent px-2 text-base text-foreground outline-none placeholder:text-muted-foreground" />
          {query && <Button type="button" variant="ghost" size="icon" aria-label="Limpar busca" title="Limpar busca" onClick={() => { onQueryChange(''); searchRef.current?.focus(); }} className="h-10 w-10 shrink-0 rounded-full active:bg-background/60"><X className="h-5 w-5" /></Button>}
        </form>
        {!query && recent.length > 0 && <div className="fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-40 overflow-y-auto bg-background px-4 pb-24 pt-3">
          <div className="mb-2 flex items-center justify-between"><h2 className="text-base font-medium text-muted-foreground">Pesquisas recentes</h2><button type="button" onClick={() => { setRecent([]); saveRecentSearches([]); }} className="text-sm text-muted-foreground active:text-foreground">Limpar</button></div>
          <ul>{recent.map(term => <li key={term} className="flex items-center">
            <button type="button" onClick={() => { onQueryChange(term); remember(term); searchRef.current?.blur(); }} className="flex min-w-0 flex-1 items-center gap-5 py-3 text-left active:opacity-70"><History className="h-5 w-5 shrink-0 text-muted-foreground" /><span className="truncate text-base text-foreground">{term}</span></button>
            <button type="button" aria-label={`Editar "${term}"`} onClick={() => { onQueryChange(term); searchRef.current?.focus(); }} className="flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground active:text-foreground"><ArrowUpLeft className="h-5 w-5" /></button>
          </li>)}</ul>
        </div>}
      </> : <>
        <Link to="/" aria-label="GEPEFE — início" className="shrink-0"><img src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" alt="GEPEFE" className="h-8 w-auto" /></Link>
        {user ? <button type="button" aria-label="Abrir conta" title="Conta" onClick={() => setAccountOpen(true)} className="rounded-full">
          {avatar ? <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">{name.trim().charAt(0).toUpperCase() || 'G'}</span>}
        </button> : <Button variant="ghost" size="icon" asChild aria-label="Entrar" title="Entrar" className="rounded-full hover:bg-muted hover:text-foreground"><Link to="/auth"><User /></Link></Button>}
      </>}
    </div>
    <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
    <div className="hidden w-full grid-cols-[240px_minmax(0,1fr)_240px] items-center gap-x-5 px-4 py-4 lg:grid">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" aria-label="Alternar navegação" title="Alternar navegação" onClick={onToggleSidebar} className="shrink-0 hover:bg-muted hover:text-foreground"><PanelLeft /></Button>
        <Link to="/" aria-label="GEPEFE — início"><img src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" alt="GEPEFE" className="h-8 w-auto max-w-[100px] object-contain sm:h-10 sm:max-w-[135px]" /></Link>
      </div>
      <form role="search" onSubmit={event => { event.preventDefault(); onSearch(); }} className="relative col-span-2 row-start-2 lg:col-span-1 lg:row-start-1 lg:col-start-2 lg:mx-auto lg:w-full lg:max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input aria-label="Buscar por título, autor, palavra-chave ou ano" placeholder="Título, Autor, Palavra-chave ou Ano" value={query} onChange={event => onQueryChange(event.target.value)} className="h-11 rounded-md border-border bg-background pl-11 pr-10 text-sm" />
        {query && <Button type="button" variant="ghost" size="icon" aria-label="Limpar busca" title="Limpar busca" onClick={() => onQueryChange('')} className="absolute right-1 top-1 h-9 w-9 hover:bg-muted hover:text-foreground"><X /></Button>}
      </form>
      <div className="flex items-center justify-end gap-2 lg:col-start-3">
        <ThemeToggle />
        {user ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="max-w-44 hover:bg-muted hover:text-foreground"><User /><span className="hidden truncate sm:inline">{name.split(' ')[0]}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link to="/profile"><User className="mr-2 h-4 w-4" />Meu Perfil</Link></DropdownMenuItem>
          {isAdmin && <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Painel Admin</Link></DropdownMenuItem>}
          <DropdownMenuSeparator /><DropdownMenuItem onClick={() => void signOut()}><LogOut className="mr-2 h-4 w-4" />Sair</DropdownMenuItem>
        </DropdownMenuContent></DropdownMenu> : <Button variant="outline" asChild className="px-3 text-xs hover:bg-muted hover:text-foreground sm:text-sm"><Link to="/auth"><User /><span className="sm:hidden">Entrar</span><span className="hidden sm:inline">Login / Cadastro</span></Link></Button>}
      </div>
    </div>
  </header>;
}
