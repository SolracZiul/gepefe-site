import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Download, Home, Newspaper, User } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/contexts/SearchContext';
import { useToast } from '@/hooks/use-toast';
import { useNativeOffline } from '@/hooks/useNativeOffline';
import { isCollectionRoute, mobileNavigation } from '@/lib/repository-navigation';
import { offlineNavigationMessage, offlineNavigationTarget } from '@/lib/native-offline';

const icons = { home: Home, news: Newspaper, saved: Bookmark, user: User, downloads: Download };

export function RepositoryBottomNav() {
  const isNative = Capacitor.isNativePlatform();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSearchQuery } = useSearch();
  const offline = useNativeOffline();
  return <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
    {mobileNavigation(Boolean(user), isNative, isMobile).map(item => {
      const Icon = icons[item.icon as keyof typeof icons];
      const blockTo = offlineNavigationTarget(offline, item.href);
      const active = offline ? item.href === '/baixados' : item.icon === 'home' ? isCollectionRoute(pathname) : item.icon === 'news' ? pathname.startsWith('/noticia') : pathname === item.href;
      return <Button key={item.href} variant="ghost" asChild className={`h-16 min-w-0 flex-1 flex-col gap-1 rounded-none px-1 text-[11px] hover:bg-muted hover:text-foreground ${active ? 'text-foreground' : 'text-muted-foreground'}`}><Link to={item.href} aria-current={active ? 'page' : undefined} aria-disabled={blockTo ? true : undefined} onClick={event => {
        if (blockTo) {
          event.preventDefault();
          if (pathname !== blockTo) navigate(blockTo, { replace: true });
          toast({ title: offlineNavigationMessage });
          return;
        }
        setSearchQuery('');
      }}><Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} /><span>{item.label}</span></Link></Button>;
    })}
  </nav>;
}
