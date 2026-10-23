import type { Article } from '@/hooks/useArticles';

export const studyAreas = ['Educação Física Escolar', 'Formação Docente', 'Inclusão', 'Esporte e Sociedade'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const areaTerms: Record<string, string[]> = {
  'Educação Física Escolar': ['escolar', 'escola', 'educacao fisica'],
  'Formação Docente': ['formacao', 'docente', 'professor'],
  'Inclusão': ['inclusao', 'inclusiva', 'deficiencia'],
  'Esporte e Sociedade': ['esporte', 'sociedade', 'esportivo'],
};

export function filterPublications(articles: Article[], query: string, area: string, documentType: string, sort: string, facets: { year?: string; author?: string; category?: string } = {}) {
  return articles.filter(article => {
    if (article.content_type === 'news') return false;
    if (documentType && article.category !== documentType) return false;
    if (facets.category && article.category !== facets.category) return false;
    if (facets.year && article.publish_date.slice(0, 4) !== facets.year) return false;
    if (facets.author && !article.authors.some(author => normalize(author.replace(' (GEPEFE)', '')) === normalize(facets.author || ''))) return false;
    const searchable = normalize([article.title, ...article.authors, article.abstract, ...article.tags, article.publish_date.slice(0, 4)].join(' '));
    if (area && !(areaTerms[area] || [normalize(area)]).some(term => searchable.includes(term))) return false;
    return normalize(query.trim()).split(/\s+/).every(term => searchable.includes(term));
  }).sort((a, b) => sort === 'downloads' ? b.download_count - a.download_count : sort === 'title' ? a.title.localeCompare(b.title, 'pt-BR') : b.publish_date.localeCompare(a.publish_date));
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
  return `${authors}. ${article.title}. ${article.category}, ${article.publish_date.slice(0, 4)}. Disponível em: ${url}.`;
}
