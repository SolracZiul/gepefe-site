export type AppLanguage = 'pt' | 'en';
export const languageStorageKey = 'language';
export function readLanguage(): AppLanguage {
  try { return localStorage.getItem(languageStorageKey) === 'en' ? 'en' : 'pt'; } catch { return 'pt'; }
}
export function saveLanguage(language: AppLanguage) {
  try { localStorage.setItem(languageStorageKey, language); } catch { /* storage unavailable */ }
  document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
}
