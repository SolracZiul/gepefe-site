import { Link, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RepositoryCollection } from '@/components/repository/RepositoryCollection';
import { DownloadsList } from '@/components/repository/DownloadsList';
import { useAuth } from '@/hooks/useAuth';
import { useNativeOffline } from '@/hooks/useNativeOffline';
import { bibliotecaHref, bibliotecaTabs, normalizeBibliotecaFilter } from '@/lib/repository-navigation';

export default function Biblioteca() {
  const isNative = Capacitor.isNativePlatform();
  const { user, loading: authLoading } = useAuth();
  const offline = useNativeOffline();
  const [params] = useSearchParams();
  // Offline in the native app, only the downloads stored on the device are reachable.
  const filter = offline ? 'baixados' : normalizeBibliotecaFilter(params.get('filtro'), isNative);
  const tabs = bibliotecaTabs(isNative);
  const needsAccount = filter === 'salvos' || filter === 'historico' || filter === 'todos';
  return <main className="min-w-0 pb-24">
    <h1 className="mb-4 text-2xl font-semibold">Biblioteca</h1>
    <nav aria-label="Filtros da biblioteca" className="repository-chip-scroll mb-5 flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto py-1">
      {tabs.map(tab => {
        const selected = filter === tab.key;
        return <Button key={tab.key} variant={selected ? 'secondary' : 'outline'} size="sm" asChild aria-pressed={selected} className={`h-9 shrink-0 whitespace-nowrap rounded-full px-3 text-xs ${selected ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background' : 'bg-card'}`}><Link to={bibliotecaHref(tab.key)} replace>{tab.label}</Link></Button>;
      })}
    </nav>
    {needsAccount && !authLoading && !user ? <section className="py-16 text-center">
      <BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
      <p className="mb-5 text-sm text-muted-foreground">Entre na sua conta para acessar seus artigos.</p>
      <Button asChild><Link to="/auth">Fazer Login</Link></Button>
    </section> : filter === 'baixados' ? <DownloadsList /> : filter === 'salvos' ? <RepositoryCollection title="Salvos" mode="favorites" headerless /> : filter === 'historico' ? <RepositoryCollection title="Histórico" mode="history" headerless /> : <>
      <RepositoryCollection title="Salvos" mode="favorites" headerless />
      {isNative && <section aria-label="Baixados" className="mt-8 border-t border-border pt-6">
        <h2 className="mb-4 text-lg font-semibold">Baixados</h2>
        <DownloadsList />
      </section>}
    </>}
  </main>;
}
