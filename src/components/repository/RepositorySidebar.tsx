import { Link, useLocation } from 'react-router-dom';
import { Bookmark, FlaskConical, History, Info, Library, LockKeyholeOpen, Newspaper, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/contexts/SearchContext';

export function RepositorySidebar({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const location = useLocation();
  const { setSearchQuery, setSelectedCategory } = useSearch();
  const items = [
    { label: 'Acervo Completo', icon: Library, href: '/todos', active: location.pathname === '/' || ['/todos', '/repositorio', '/busca', '/artigos-completos', '/textos-academicos', '/pesquisas', '/dissertacoes', '/teses'].includes(location.pathname) },
    ...(user ? [{ label: 'Meus Favoritos', icon: Bookmark, href: '/favoritos' }, { label: 'Histórico de Leitura', icon: History, href: '/historico' }] : []),
    { label: 'Sobre o GEPEFE', icon: Info, href: '/sobre' },
    { label: 'Linhas de Pesquisa', icon: FlaskConical, href: '/sobre#linhas-de-pesquisa' },
    { label: 'Integrantes / Pesquisadores', icon: Users, href: '/sobre#integrantes' },
    { label: 'Notícias', icon: Newspaper, href: '/noticias' },
  ];
  return <>
    {!collapsed && <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Repositório</p>}
    <nav aria-label="Navegação institucional" className="space-y-1.5">{items.map(item => <Button key={item.label} variant="ghost" asChild title={collapsed ? item.label : undefined} className={`h-auto min-h-11 w-full gap-3 rounded-md px-3 py-3 text-left text-[13px] hover:bg-muted hover:text-foreground ${collapsed ? 'justify-center' : 'justify-start whitespace-normal'} ${(item.active || location.pathname + location.hash === item.href) ? 'bg-primary/15 font-semibold text-foreground' : 'text-muted-foreground'}`}><Link to={item.href} onClick={() => { setSearchQuery(''); setSelectedCategory(''); onNavigate?.(); }}><item.icon className="shrink-0" />{!collapsed && <span>{item.label}</span>}</Link></Button>)}</nav>
    {!collapsed && <div className="mt-10 border-t border-border px-3 pt-6"><LockKeyholeOpen className="mb-3 h-5 w-5 text-muted-foreground" /><p className="text-xs font-semibold">Conhecimento de acesso aberto</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Educação Física e Escola</p><a href="mailto:gepefe@unesc.net" className="mt-4 block text-xs text-muted-foreground hover:underline">gepefe@unesc.net</a></div>}
  </>;
}
