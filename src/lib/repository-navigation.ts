// The institutional page is a single destination: mission, objectives, research lines and researchers.
export const institutionalPath = '/linhas-de-pesquisa';

// Owner-authored policy page, linked from the site footer.
export const privacyPath = '/privacidade';
export const privacyContact = 'gepefe@unesc.net';
export const privacyEffectiveDate = 'Outubro de 2026';

export const institutionalLinks = [
  { label: 'Acervo Completo', href: '/todos', icon: 'library' },
  { label: 'Notícias', href: '/noticias', icon: 'news' },
  { label: 'Linhas de Pesquisa', href: institutionalPath, icon: 'research' },
] as const;

// The footer repeats the institutional destinations and adds the policy page, which stays out of the sidebar menu.
export const footerLinks = [
  ...institutionalLinks.map(({ label, href }) => ({ label, href })),
  { label: 'Política de Privacidade', href: privacyPath },
];

export const sidebarLinks = institutionalLinks;

const institutionalSections = ['#linhas-de-pesquisa', '#integrantes'];

// Old institutional destinations (/sobre, /integrantes) land on the unified page, keeping a known section anchor.
export function institutionalRedirectTarget(hash: string) {
  return institutionalPath + (institutionalSections.includes(hash) ? hash : '');
}

// The search tab opens the search bar; keeping it on its own route preserves deep links and offline blocking.
export const searchPath = '/busca';
export function isSearchRoute(path: string) {
  return path === searchPath;
}

// The bottom navigation is always the same four destinations, signed in or out, web or native.
export function mobileNavigation() {
  return [
    { label: 'Início', href: '/todos', icon: 'home' },
    { label: 'Notícias', href: '/noticias', icon: 'news' },
    { label: 'Pesquisar', href: searchPath, icon: 'search' },
    { label: 'Biblioteca', href: '/biblioteca', icon: 'library' },
  ];
}

export const bibliotecaPath = '/biblioteca';

export type BibliotecaFilter = 'todos' | 'salvos' | 'baixados' | 'historico';

// Baixados exists only inside the native app; on the web the pill is never offered.
export function bibliotecaTabs(isNative: boolean): { key: BibliotecaFilter; label: string }[] {
  return [
    { key: 'todos', label: 'Todos' },
    { key: 'salvos', label: 'Salvos' },
    ...(isNative ? [{ key: 'baixados' as const, label: 'Baixados' }] : []),
    { key: 'historico', label: 'Histórico' },
  ];
}

export function normalizeBibliotecaFilter(value: string | null, isNative: boolean): BibliotecaFilter {
  if (value === 'salvos' || value === 'historico') return value;
  if (value === 'baixados' && isNative) return 'baixados';
  return 'todos';
}

export function bibliotecaHref(filter: BibliotecaFilter) {
  return filter === 'todos' ? bibliotecaPath : `${bibliotecaPath}?filtro=${filter}`;
}

export function isCollectionRoute(path: string) {
  return ['/', '/todos', '/repositorio', '/artigos-completos', '/textos-academicos', '/pesquisas', '/dissertacoes', '/teses'].includes(path);
}
