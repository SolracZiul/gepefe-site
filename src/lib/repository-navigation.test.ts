/// <reference types="bun" />
import { expect, test } from 'bun:test';
import { mobileNavigation, sidebarLinks } from './repository-navigation';

test('sidebar menu keeps the institutional order without a Sobre o GEPEFE entry', () => {
  expect(sidebarLinks.map(item => item.label)).toEqual(['Acervo Completo', 'Notícias', 'Linhas de Pesquisa', 'Integrantes / Pesquisadores']);
});

test('signed-out mobile users have no saved-publications shortcut', () => {
  expect(mobileNavigation(false).map(item => item.href)).toEqual(['/todos', '/noticias', '/auth']);
});
test('signed-in mobile users have favorites and their profile shortcut', () => {
  expect(mobileNavigation(true).map(item => item.href)).toEqual(['/todos', '/noticias', '/favoritos', '/profile']);
});