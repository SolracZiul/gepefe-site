/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { filterPublications, formatAcademicAuthor, formatCitation } from './repository';
import type { Article } from '@/hooks/useArticles';

const base: Article = { id: '1', title: 'Educação Física Escolar', authors: ['Vanessa Alves Silva'], abstract: 'Formação docente e inclusão', category: 'Artigos Completos', tags: ['Escola'], publish_date: '2025-01-01', download_count: 10, file_path: null, pdf_url: null, file_size: null, file_type: null, created_at: '', updated_at: '' };
const articles = [base, { ...base, id: '2', title: 'A pesquisa', publish_date: '2026-01-01', download_count: 20 }, { ...base, id: 'news', content_type: 'news' }];
describe('Academic repository', () => {
  test('never includes news in the academic feed', () => expect(filterPublications(articles, '', '', '', 'recent').map(a => a.id)).toEqual(['2', '1']));
  test('searches publication year', () => expect(filterPublications(articles, '2025', '', '', 'recent').map(a => a.id)).toEqual(['1']));
  test('searches authors and accented keywords', () => expect(filterPublications(articles, 'silva inclusao', '', '', 'recent')).toHaveLength(2));
  test('filters document type', () => expect(filterPublications(articles, '', '', 'Relatos de Experiência', 'recent')).toHaveLength(0));
  test('filters study area', () => expect(filterPublications([{ ...base, abstract: '', title: 'Outro tema', tags: [] }], '', 'Inclusão', '', 'recent')).toHaveLength(0));
  test('sorts by actual downloads', () => expect(filterPublications(articles, '', '', '', 'downloads')[0].id).toBe('2'));
  test('sorts alphabetically', () => expect(filterPublications(articles, '', '', '', 'title')[0].title).toBe('A pesquisa'));
  test('filters the selected year exactly', () => expect(filterPublications(articles, '', '', '', 'recent', { year: '2026' }).map(a => a.id)).toEqual(['2']));
  test('filters the selected author, not abstract mentions', () => expect(filterPublications([base, { ...base, id: 'other', authors: ['João Santos'] }], '', '', '', 'recent', { author: 'Vanessa Alves Silva' }).map(a => a.id)).toEqual(['1']));
  test('keeps category constraints alongside document type', () => expect(filterPublications(articles, '', '', 'Teses', 'recent', { category: 'Artigos Completos' })).toHaveLength(0));
  test('builds a bibliographic citation from available metadata', () => expect(formatCitation(base, 'https://example.org/article/1')).toBe('SILVA, V. A. Educação Física Escolar. Artigos Completos, 2025. Disponível em: https://example.org/article/1.'));
  test('formats academic surnames and initials', () => expect(formatAcademicAuthor('Vanessa Alves Silva (GEPEFE)')).toBe('SILVA, V. A.'));
});
import { researcherInitials, uniqueResearchers } from './repository';
describe('researchers', () => {
  it('shows one card per researcher despite accents, case, spacing and GEPEFE marker', () => {
    expect(uniqueResearchers(['João Silva (GEPEFE)', 'joao  silva', 'Maria Souza (GEPEFE)'])).toEqual(['João Silva', 'Maria Souza']);
  });
  it('builds initials from first and last name, skipping titles', () => {
    expect(researcherInitials('Profa. Maria da Costa Souza')).toBe('MS');
  });
});
