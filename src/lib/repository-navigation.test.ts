/// <reference types="bun" />
import { expect, test } from 'bun:test';
import { bibliotecaHref, bibliotecaTabs, footerLinks, institutionalLinks, institutionalRedirectTarget, isSearchRoute, mobileNavigation, normalizeBibliotecaFilter, privacyPath, searchPath, sidebarLinks } from './repository-navigation';

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

test('the bottom navigation is always the same four tabs', () => {
  expect(mobileNavigation().map(item => item.href)).toEqual(['/todos', '/noticias', '/busca', '/biblioteca']);
  expect(mobileNavigation().map(item => item.label)).toEqual(['Início', 'Notícias', 'Pesquisar', 'Biblioteca']);
});
test('the library offers Baixados only inside the native app', () => {
  expect(bibliotecaTabs(true).map(tab => tab.key)).toEqual(['todos', 'salvos', 'baixados', 'historico']);
  expect(bibliotecaTabs(false).map(tab => tab.key)).toEqual(['todos', 'salvos', 'historico']);
});
test('library filters fall back to Todos and Baixados is native-only', () => {
  expect(normalizeBibliotecaFilter('salvos', false)).toBe('salvos');
  expect(normalizeBibliotecaFilter('historico', false)).toBe('historico');
  expect(normalizeBibliotecaFilter('baixados', true)).toBe('baixados');
  expect(normalizeBibliotecaFilter('baixados', false)).toBe('todos');
  expect(normalizeBibliotecaFilter('qualquer', true)).toBe('todos');
  expect(normalizeBibliotecaFilter(null, true)).toBe('todos');
});
test('legacy personal addresses land on the matching library filter', () => {
  expect(bibliotecaHref('todos')).toBe('/biblioteca');
  expect(bibliotecaHref('salvos')).toBe('/biblioteca?filtro=salvos');
  expect(bibliotecaHref('baixados')).toBe('/biblioteca?filtro=baixados');
  expect(bibliotecaHref('historico')).toBe('/biblioteca?filtro=historico');
});
