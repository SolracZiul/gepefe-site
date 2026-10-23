/// <reference types="bun" />
import { expect, test } from 'bun:test';
import { mobileNavigation } from './repository-navigation';

test('signed-out mobile users have no saved-publications shortcut', () => {
  expect(mobileNavigation(false).map(item => item.href)).toEqual(['/todos', '/noticias', '/auth']);
});
test('signed-in mobile users have favorites and their profile shortcut', () => {
  expect(mobileNavigation(true).map(item => item.href)).toEqual(['/todos', '/noticias', '/favoritos', '/profile']);
});