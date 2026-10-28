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

export function mobileNavigation(signedIn: boolean) {
  return [
    { label: 'Início', href: '/todos', icon: 'home' },
    { label: 'Notícias', href: '/noticias', icon: 'news' },
    ...(signedIn ? [{ label: 'Salvos', href: '/favoritos', icon: 'saved' }] : []),
    { label: signedIn ? 'Perfil' : 'Entrar', href: signedIn ? '/profile' : '/auth', icon: 'user' },
  ];
}

export function isCollectionRoute(path: string) {
  return ['/', '/todos', '/repositorio', '/busca', '/artigos-completos', '/textos-academicos', '/pesquisas', '/dissertacoes', '/teses'].includes(path);
}
