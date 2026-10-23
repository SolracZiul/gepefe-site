export const institutionalLinks = [
  { label: 'Acervo Completo', href: '/todos', icon: 'library' },
  { label: 'Notícias', href: '/noticias', icon: 'news' },
  { label: 'Linhas de Pesquisa', href: '/sobre#linhas-de-pesquisa', icon: 'research' },
  { label: 'Integrantes / Pesquisadores', href: '/sobre#integrantes', icon: 'users' },
  { label: 'Sobre o GEPEFE', href: '/sobre', icon: 'info' },
] as const;

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