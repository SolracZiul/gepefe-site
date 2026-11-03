import { describe, expect, it } from 'bun:test';
import { addRecentSearch, RECENT_SEARCH_LIMIT } from './recent-searches';

describe('recent searches', () => {
  it('puts the newest term first without duplicates', () => {
    expect(addRecentSearch(['educação', 'física'], 'Física')).toEqual(['Física', 'educação']);
  });
  it('ignores blank terms and caps the list', () => {
    expect(addRecentSearch(['a'], '  ')).toEqual(['a']);
    const many = Array.from({ length: 20 }, (_, i) => `t${i}`);
    expect(addRecentSearch(many, 'novo')).toHaveLength(RECENT_SEARCH_LIMIT);
  });
});
