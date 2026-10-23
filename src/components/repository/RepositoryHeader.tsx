import { Link } from 'react-router-dom';
import { Search, PanelLeft, User, Bookmark, History, LogOut, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onToggleSidebar: () => void;
  onHistory: () => void;
}

export function RepositoryHeader({ query, onQueryChange, onToggleSidebar, onHistory }: Props) {
  const { user, isAdmin, signOut } = useAuth();
  const name = user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Meu perfil';
  return <header className="sticky top-0 z-40 border-b border-border bg-card">
    <div className="mx-auto grid max-w-[1680px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-3 px-4 py-4 sm:gap-x-5 lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:px-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" aria-label="Alternar navegação" title="Alternar navegação" onClick={onToggleSidebar} className="shrink-0 hover:bg-muted hover:text-foreground"><PanelLeft /></Button>
        <Link to="/" aria-label="GEPEFE — início"><img src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" alt="GEPEFE" className="h-8 w-auto max-w-[100px] object-contain sm:h-10 sm:max-w-[135px]" /></Link>
      </div>
      <form role="search" onSubmit={event => { event.preventDefault(); document.getElementById('publications')?.scrollIntoView({ block: 'start' }); }} className="relative col-span-2 row-start-2 lg:col-span-1 lg:row-start-1 lg:col-start-2 lg:mx-auto lg:w-full lg:max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input aria-label="Buscar por título, autor, palavra-chave ou ano" placeholder="Título, Autor, Palavra-chave ou Ano" value={query} onChange={event => onQueryChange(event.target.value)} className="h-11 rounded-md border-border bg-background pl-11 pr-10 text-sm" />
        {query && <Button type="button" variant="ghost" size="icon" aria-label="Limpar busca" title="Limpar busca" onClick={() => onQueryChange('')} className="absolute right-1 top-1 h-9 w-9 hover:bg-muted hover:text-foreground"><X /></Button>}
      </form>
      <div className="flex items-center justify-end gap-2 lg:col-start-3">
        <ThemeToggle />
        {user ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="max-w-44 hover:bg-muted hover:text-foreground"><User /><span className="hidden truncate sm:inline">{name.split(' ')[0]}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link to="/profile"><User className="mr-2 h-4 w-4" />Meu Perfil</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/favoritos"><Bookmark className="mr-2 h-4 w-4" />Meus Artigos Salvos</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={onHistory}><History className="mr-2 h-4 w-4" />Histórico de Leitura</DropdownMenuItem>
          {isAdmin && <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Painel Admin</Link></DropdownMenuItem>}
          <DropdownMenuSeparator /><DropdownMenuItem onClick={() => void signOut()}><LogOut className="mr-2 h-4 w-4" />Sair</DropdownMenuItem>
        </DropdownMenuContent></DropdownMenu> : <Button variant="outline" asChild className="px-3 text-xs hover:bg-muted hover:text-foreground sm:text-sm"><Link to="/auth"><User /><span className="sm:hidden">Entrar</span><span className="hidden sm:inline">Login / Cadastro</span></Link></Button>}
      </div>
    </div>
  </header>;
}