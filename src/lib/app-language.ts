import { en } from './i18n-en';

export type AppLanguage = 'pt' | 'en';
export const languageStorageKey = 'language';
export function readLanguage(): AppLanguage {
  try { return localStorage.getItem(languageStorageKey) === 'en' ? 'en' : 'pt'; } catch { return 'pt'; }
}
export function saveLanguage(language: AppLanguage) {
  try { localStorage.setItem(languageStorageKey, language); } catch { /* storage unavailable */ }
  document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
}

const normalized = new Map(Object.entries(en).map(([k, v]) => [k.replace(/\s+/g, ' ').trim(), v]));
export function translate(text: string): string | undefined {
  const key = text.replace(/\s+/g, ' ').trim();
  return key ? normalized.get(key) : undefined;
}

const ATTRS = ['placeholder', 'aria-label', 'title'];
function translateNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const out = translate(node.nodeValue ?? '');
    if (out) node.nodeValue = node.nodeValue!.replace(node.nodeValue!.trim(), out);
    return;
  }
  if (!(node instanceof Element) || node.closest('[data-no-translate], script, style, .prose')) return;
  for (const a of ATTRS) { const v = node.getAttribute(a); const out = v && translate(v); if (out) node.setAttribute(a, out); }
  node.childNodes.forEach(translateNode);
}

/** Translates the UI into English by rewriting rendered text; Portuguese is the source language. */
export function startTranslation() {
  saveLanguage(readLanguage());
  if (readLanguage() !== 'en') return;
  const run = () => { translateNode(document.body); const t = translate(document.title); if (t) document.title = t; };
  run();
  new MutationObserver(records => {
    for (const r of records) {
      if (r.type === 'characterData') translateNode(r.target);
      else if (r.type === 'attributes') translateNode(r.target);
      else r.addedNodes.forEach(translateNode);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
