import { beforeEach, expect, test } from 'bun:test';
const store = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) };
(globalThis as any).document ??= { documentElement: {} };
const { readLanguage, saveLanguage } = await import('./app-language');
beforeEach(() => store.clear());
test('defaults to Portuguese', () => expect(readLanguage()).toBe('pt'));
test('persists English choice under "language"', () => { saveLanguage('en'); expect(store.get('language')).toBe('en'); expect(readLanguage()).toBe('en'); });
