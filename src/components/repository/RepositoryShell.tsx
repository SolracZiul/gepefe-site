import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RepositoryHeader } from './RepositoryHeader';
import { RepositorySidebar } from './RepositorySidebar';
import { RepositoryFooter } from './RepositoryFooter';
import { RepositoryBottomNav } from './RepositoryBottomNav';
import { useSearch } from '@/contexts/SearchContext';
export function RepositoryShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    const shell = shellRef.current;
    if (!header || !shell) return;
    const updateHeight = () => shell.style.setProperty('--repository-header-height', `${header.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return <div ref={shellRef} className="repository repository-shell min-h-screen w-full bg-background text-foreground">
    <div ref={headerRef} className="fixed inset-x-0 top-0 z-40"><RepositoryHeader query={searchQuery} onQueryChange={setSearchQuery} onSearch={() => navigate('/busca')} onHistory={() => navigate('/historico')} onToggleSidebar={() => setCollapsed(value => !value)} /></div>
    <div className="flex w-full pt-[var(--repository-header-height)]">
      <aside className={`sticky top-[var(--repository-header-height)] hidden h-[calc(100dvh-var(--repository-header-height))] shrink-0 overflow-y-auto border-r border-border bg-card px-3 py-4 lg:block ${collapsed ? 'w-20' : 'w-64'}`}><RepositorySidebar collapsed={collapsed} /></aside>
      <div className="flex min-h-[calc(100dvh-var(--repository-header-height))] min-w-0 flex-1 flex-col px-3 pb-[calc(80px+env(safe-area-inset-bottom))] pt-2 sm:px-6 lg:pb-8 lg:pt-4"><div className="min-w-0 flex-1">{children}</div><RepositoryFooter /></div>
    </div>
    <RepositoryBottomNav />
  </div>;
}
