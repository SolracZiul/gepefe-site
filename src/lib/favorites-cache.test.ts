import { expect, test } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import { readFavoriteCache, writeFavoriteCache, updateFavoriteIds } from './favorites-cache';

test('favorites are immediately available on remount and isolated by account', () => {
  writeFavoriteCache('account-a', ['publication-1']);
  writeFavoriteCache('account-b', ['publication-2']);
  expect(readFavoriteCache('account-a')).toEqual(['publication-1']);
  expect(readFavoriteCache('account-b')).toEqual(['publication-2']);
  expect(readFavoriteCache('account-c')).toBeUndefined();
});

test('rolling back one favorite preserves changes to other publications', () => {
  const first = updateFavoriteIds([], 'publication-1', true);
  const second = updateFavoriteIds(first, 'publication-2', true);
  expect(updateFavoriteIds(second, 'publication-1', false)).toEqual(['publication-2']);
  expect(updateFavoriteIds(second, 'publication-2', true)).toEqual(second);
});

test('publication cache keeps existing items when background refresh fails', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['articles'], [{ id: 'publication-1' }]);
  await client.fetchQuery({ queryKey: ['articles'], staleTime: 0, queryFn: async () => { throw new Error('offline'); } }).catch(() => undefined);
  expect(client.getQueryData(['articles'])).toEqual([{ id: 'publication-1' }]);
  client.clear();
});