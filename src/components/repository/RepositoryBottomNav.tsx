import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Home, Newspaper, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/contexts/SearchContext';
import { isCollectionRoute, mobileNavigation } from '@/lib/repository-navigation';

const icons = { home: Home, news: Newspaper, saved: Bookmark, user: User };
export function RepositoryBottomNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { setSearchQuery } = useSearch();
  return <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
    {mobileNavigation(Boolean(user)).map(item => {
      const Icon = icons[item.icon as keyof typeof icons];
      const active = item.icon === 'home' ? isCollectionRoute(pathname) : item.icon === 'news' ? pathname.startsWith('/noticia') : pathname === item.href;
      return <Button key={item.href} variant="ghost" asChild className={`h-16 min-w-0 flex-1 flex-col gap-1 rounded-none px-1 text-[11px] hover:bg-muted hover:text-foreground ${active ? 'text-foreground' : 'text-muted-foreground'}`}><Link to={item.href} aria-current={active ? 'page' : undefined} onClick={() => setSearchQuery('')}><Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} /><span>{item.label}</span></Link></Button>;
    })}
  </nav>;
}