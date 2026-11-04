import { describe, expect, it } from 'bun:test';
import type { User } from '@supabase/supabase-js';
import { userAvatarUrl, userDisplayName } from './user-avatar';

const fakeUser = (user_metadata: Record<string, unknown>) => ({ user_metadata }) as unknown as User;

describe('userAvatarUrl', () => {
  it('reads avatar_url when present', () => {
    expect(userAvatarUrl(fakeUser({ avatar_url: 'https://lh3.googleusercontent.com/a/photo' }))).toBe('https://lh3.googleusercontent.com/a/photo');
  });

  it('falls back to picture (newer Google metadata)', () => {
    expect(userAvatarUrl(fakeUser({ picture: 'https://lh3.googleusercontent.com/a/pic' }))).toBe('https://lh3.googleusercontent.com/a/pic');
  });

  it('prefers avatar_url over picture', () => {
    expect(userAvatarUrl(fakeUser({ avatar_url: 'https://a', picture: 'https://b' }))).toBe('https://a');
  });

  it('returns undefined without a user or photo', () => {
    expect(userAvatarUrl(null)).toBeUndefined();
    expect(userAvatarUrl(fakeUser({}))).toBeUndefined();
    expect(userAvatarUrl(fakeUser({ avatar_url: '' }))).toBeUndefined();
  });
});

describe('userDisplayName', () => {
  it('reads display_name, full_name or name', () => {
    expect(userDisplayName(fakeUser({ display_name: 'Ana' }), 'x')).toBe('Ana');
    expect(userDisplayName(fakeUser({ full_name: 'Bruno' }), 'x')).toBe('Bruno');
    expect(userDisplayName(fakeUser({ name: 'Caio' }), 'x')).toBe('Caio');
  });

  it('uses the fallback when there is no name', () => {
    expect(userDisplayName(null, 'Minha conta')).toBe('Minha conta');
    expect(userDisplayName(fakeUser({ full_name: '  ' }), 'Minha conta')).toBe('Minha conta');
  });
});
