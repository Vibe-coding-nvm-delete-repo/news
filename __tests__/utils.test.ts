import { isValidOpenRouterApiKey } from '@/lib/utils';

describe('isValidOpenRouterApiKey', () => {
  test('accepts valid key format (lowercase hex)', () => {
    const key = 'sk-or-v1-' + 'a'.repeat(64);
    expect(isValidOpenRouterApiKey(key)).toBe(true);
  });

  test('accepts valid key format (uppercase hex)', () => {
    const key = 'sk-or-v1-' + 'A'.repeat(64);
    expect(isValidOpenRouterApiKey(key)).toBe(true);
  });

  test('trims whitespace', () => {
    const key = '  sk-or-v1-' + 'b'.repeat(64) + '  ';
    expect(isValidOpenRouterApiKey(key)).toBe(true);
  });

  test('rejects wrong prefix', () => {
    const key = 'sk-xx-v1-' + 'a'.repeat(64);
    expect(isValidOpenRouterApiKey(key)).toBe(false);
  });

  test('rejects non-hex characters', () => {
    const key = 'sk-or-v1-' + ('g'.repeat(64)); // g is not hex
    expect(isValidOpenRouterApiKey(key)).toBe(false);
  });

  test('rejects wrong length (too short)', () => {
    const key = 'sk-or-v1-' + 'a'.repeat(63);
    expect(isValidOpenRouterApiKey(key)).toBe(false);
  });

  test('rejects empty or null', () => {
    // @ts-expect-error testing runtime guard
    expect(isValidOpenRouterApiKey(null)).toBe(false);
    // @ts-expect-error testing runtime guard
    expect(isValidOpenRouterApiKey(undefined)).toBe(false);
    expect(isValidOpenRouterApiKey('')).toBe(false);
  });
});
