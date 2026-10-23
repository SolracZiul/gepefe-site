import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RepositoryHeader } from './RepositoryHeader';
import { RepositorySidebar } from './RepositorySidebar';
import { RepositoryFooter } from './RepositoryFooter';
import { useSearch } from '@/contexts/SearchContext';
export function RepositoryShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMobileNav(false);
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return <div className="repository min-h-screen bg-background text-foreground">
    <RepositoryHeader query={searchQuery} onQueryChange={setSearchQuery} onSearch={() => navigate('/busca')} onHistory={() => navigate('/historico')} onToggleSidebar={() => { if (window.matchMedia('(min-width: 1024px)').matches) setCollapsed(value => !value); else setMobileNav(true); }} />
    <div className="mx-auto flex max-w-[1680px]">
      <aside className={`sticky top-[77px] hidden h-[calc(100vh-77px)] shrink-0 overflow-y-auto border-r border-border bg-card px-4 py-8 lg:block ${collapsed ? 'w-20' : 'w-64'}`}><RepositorySidebar collapsed={collapsed} /></aside>
      <Sheet open={mobileNav} onOpenChange={setMobileNav}><SheetContent side="left" className="repository w-72 bg-card"><SheetHeader><SheetTitle className="mb-6 text-left">GEPEFE</SheetTitle></SheetHeader><RepositorySidebar onNavigate={() => setMobileNav(false)} /></SheetContent></Sheet>
      <div className="flex min-h-[calc(100vh-77px)] min-w-0 flex-1 flex-col px-4 pb-8 pt-7 sm:px-7 lg:px-9 lg:pt-9"><div className="min-w-0 flex-1">{children}</div><RepositoryFooter /></div>
    </div>
  </div>;
}
