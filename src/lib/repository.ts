import type { Article } from '@/hooks/useArticles';

export const studyAreas = ['Educação Física Escolar', 'Formação Docente', 'Inclusão', 'Esporte e Sociedade'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const areaTerms: Record<string, string[]> = {
  'Educação Física Escolar': ['escolar', 'escola', 'educacao fisica'],
  'Formação Docente': ['formacao', 'docente', 'professor'],
  'Inclusão': ['inclusao', 'inclusiva', 'deficiencia'],
  'Esporte e Sociedade': ['esporte', 'sociedade', 'esportivo'],
};

export function filterPublications(articles: Article[], query: string, area: string, documentType: string, sort: string, facets: { year?: string; author?: string; category?: string; tag?: string } = {}) {
  return articles.filter(article => {
    if (article.content_type === 'news') return false;
    if (documentType && article.category !== documentType) return false;
    if (facets.category && article.category !== facets.category) return false;
    if (facets.tag && !article.tags.some(tag => normalize(tag.trim()) === normalize(facets.tag || ''))) return false;
    if (facets.year && article.publish_date.slice(0, 4) !== facets.year) return false;
    if (facets.author && !article.authors.some(author => normalize(author.replace(' (GEPEFE)', '')) === normalize(facets.author || ''))) return false;
    const searchable = normalize([article.title, ...article.authors, article.abstract, ...article.tags, article.publish_date.slice(0, 4)].join(' '));
    if (area && !(areaTerms[area] || [normalize(area)]).some(term => searchable.includes(term))) return false;
    return normalize(query.trim()).split(/\s+/).every(term => searchable.includes(term));
  }).sort((a, b) => sort === 'downloads' ? b.download_count - a.download_count : sort === 'title' ? a.title.localeCompare(b.title, 'pt-BR') : b.publish_date.localeCompare(a.publish_date));
}

export interface PublicationChip { kind: 'category'; label: string }

/** Build quick facets from search matches, before the selected chip is applied. */
export function publicationChips(articles: Article[], query: string, category = ''): PublicationChip[] {
  const matching = filterPublications(articles, query, '', '', 'recent', { category });
  const values = (items: string[]) => {
    const unique = new Map<string, string>();
    for (const raw of items) {
      const label = raw.trim();
      if (label && !unique.has(normalize(label))) unique.set(normalize(label), label);
    }
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  };
  return [
    ...values(matching.map(article => article.category)).map(label => ({ kind: 'category' as const, label })),
  ].slice(0, 4);
}

export function formatAcademicAuthor(author: string) {
  const name = author.replace(' (GEPEFE)', '').trim();
  if (name.includes(',')) return name;
  const parts = name.split(/\s+/);
  if (parts.length < 2) return name;
  const surname = parts.pop() || '';
  return `${surname.toLocaleUpperCase('pt-BR')}, ${parts.filter(part => !['de', 'da', 'do', 'dos', 'das', 'e'].includes(part.toLowerCase())).map(part => `${part[0].toLocaleUpperCase('pt-BR')}.`).join(' ')}`;
}

export const collectiveAuthor = 'Integrantes do Grupo de Estudos e Pesquisas em Educação Física e Escola';

export function readHistory(userId: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(`gepefe-reading:${userId}`) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch { return []; }
}

export function recordReading(userId: string, articleId: string) {
  const history = [articleId, ...readHistory(userId).filter(id => id !== articleId)];
  try { localStorage.setItem(`gepefe-reading:${userId}`, JSON.stringify(history)); } catch { /* Reading remains available without browser storage. */ }
  return history;
}
export function formatCitation(article: Article, url: string) {
  const authors = article.authors.length === 1 && article.authors[0] === collectiveAuthor
    ? 'GRUPO DE ESTUDOS E PESQUISAS EM EDUCAÇÃO FÍSICA E ESCOLA'
    : article.authors.map(formatAcademicAuthor).join('; ');
  return `${authors.replace(/\.+$/, '')}. ${article.title.replace(/\.+$/, '')}. ${article.category}, ${article.publish_date.slice(0, 4)}. Disponível em: ${url}.`;
}

/** Key that treats accent, case, spacing and the "(GEPEFE)" marker as the same researcher. */
export function researcherKey(name: string) {
  return name.replace(/\(GEPEFE\)/gi, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,;]+$/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** One display name per researcher, sorted in Portuguese order. */
export function uniqueResearchers(names: string[]) {
  const map = new Map<string, string>();
  for (const raw of names) {
    const name = raw.replace(/\(GEPEFE\)/gi, '').replace(/\s+/g, ' ').trim().replace(/[.,;]+$/, '');
    const key = researcherKey(name);
    if (key && !map.has(key)) map.set(key, name);
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Up to two initials: first and last name, skipping titles like "Dr." or "Profa.". */
export function researcherInitials(name: string) {
  const parts = name.split(' ').filter(part => part && !/\.$/.test(part) && !/^(d[aeo]s?|e)$/i.test(part));
  if (parts.length === 0) return '?';
  return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Every academic item has one canonical address, kept separate from news. */
export function publicationPath(article: Pick<Article, 'id'>) {
  return `/publicacao/${article.id}`;
}
