/// <reference types="bun" />
import { expect, test } from 'bun:test';
import { footerLinks, institutionalLinks, institutionalRedirectTarget, mobileNavigation, privacyPath, sidebarLinks } from './repository-navigation';

test('the footer links to the privacy policy while the sidebar menu stays collections-only', () => {
  expect(footerLinks.map(item => item.href)).toEqual(['/todos', '/noticias', '/linhas-de-pesquisa', '/privacidade']);
  expect(sidebarLinks.map(item => item.href)).not.toContain(privacyPath);
});

test('sidebar menu keeps the institutional order without a researchers entry', () => {
  expect(sidebarLinks.map(item => item.label)).toEqual(['Acervo Completo', 'Notícias', 'Linhas de Pesquisa']);
});

test('researchers and sobre are no longer offered as separate destinations', () => {
  expect(institutionalLinks.map(item => item.href)).toEqual(['/todos', '/noticias', '/linhas-de-pesquisa']);
});

test('legacy institutional addresses redirect to the unified page', () => {
  expect(institutionalRedirectTarget('')).toBe('/linhas-de-pesquisa');
  expect(institutionalRedirectTarget('#integrantes')).toBe('/linhas-de-pesquisa#integrantes');
  expect(institutionalRedirectTarget('#linhas-de-pesquisa')).toBe('/linhas-de-pesquisa#linhas-de-pesquisa');
  expect(institutionalRedirectTarget('#qualquer-coisa')).toBe('/linhas-de-pesquisa');
});

test('signed-out mobile users have no saved-publications shortcut', () => {
  expect(mobileNavigation(false).map(item => item.href)).toEqual(['/todos', '/noticias', '/auth']);
});
test('signed-in mobile users have favorites and their profile shortcut', () => {
  expect(mobileNavigation(true).map(item => item.href)).toEqual(['/todos', '/noticias', '/favoritos', '/profile']);
});
