import { en } from './i18n-en';
import { es } from './i18n-es';

export type AppLanguage = 'pt' | 'en' | 'es';
export const languageStorageKey = 'language';
export function readLanguage(): AppLanguage {
  try { const v = localStorage.getItem(languageStorageKey); return v === 'en' || v === 'es' ? v : 'pt'; } catch { return 'pt'; }
}
export function saveLanguage(language: AppLanguage) {
  try { localStorage.setItem(languageStorageKey, language); } catch { /* storage unavailable */ }
  document.documentElement.lang = language === 'pt' ? 'pt-BR' : language;
}

const normalize = (dict: Record<string, string>) => new Map(Object.entries(dict).map(([k, v]) => [k.replace(/\s+/g, ' ').trim(), v]));
const dictionaries: Record<'en' | 'es', Map<string, string>> = { en: normalize(en), es: normalize(es) };
export function translate(text: string, language: AppLanguage = readLanguage()): string | undefined {
  if (language === 'pt') return undefined;
  const key = text.replace(/\s+/g, ' ').trim();
  return key ? dictionaries[language].get(key) : undefined;
}

const ATTRS = ['placeholder', 'aria-label', 'title'];
function translateNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const out = translate(node.nodeValue ?? '');
    const next = out && node.nodeValue!.replace(node.nodeValue!.trim(), out);
    if (next && next !== node.nodeValue) node.nodeValue = next;
    return;
  }
  if (!(node instanceof Element) || node.closest('[data-no-translate], script, style, .prose')) return;
  for (const a of ATTRS) { const v = node.getAttribute(a); const out = v && translate(v); if (out && out !== v) node.setAttribute(a, out); }
  node.childNodes.forEach(translateNode);
}

/** Translates the UI by rewriting rendered text; Portuguese is the source language. */
export function startTranslation(native: boolean) {
  if (!native) { saveLanguage('pt'); return; }
  saveLanguage(readLanguage());
  if (readLanguage() === 'pt') return;
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
