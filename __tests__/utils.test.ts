import {
  isValidOpenRouterApiKey,
  cn,
  formatCost,
  parseJSON,
} from '@/lib/utils';

describe('cn', () => {
  test('merges class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  test('handles conditional classes', () => {
    expect(cn('base-class', false && 'hidden', 'visible')).toBe(
      'base-class visible'
    );
  });

  test('merges tailwind classes with conflicts', () => {
    // tailwind-merge should resolve conflicts, keeping the last one
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  test('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn(null, undefined)).toBe('');
  });

  test('handles arrays and objects', () => {
    expect(cn(['text-sm', 'font-bold'])).toContain('text-sm');
    expect(cn({ 'text-red-500': true, 'bg-blue-500': false })).toBe(
      'text-red-500'
    );
  });
});

describe('formatCost', () => {
  test('formats cost with 4 decimal places', () => {
    expect(formatCost(1.23456)).toBe('$1.2346 / 1M tokens');
  });

  test('formats zero cost', () => {
    expect(formatCost(0)).toBe('$0.0000 / 1M tokens');
  });

  test('formats small costs', () => {
    expect(formatCost(0.00001)).toBe('$0.0000 / 1M tokens');
  });

  test('formats large costs', () => {
    expect(formatCost(999.9999)).toBe('$999.9999 / 1M tokens');
  });

  test('rounds correctly', () => {
    expect(formatCost(1.23445)).toBe('$1.2345 / 1M tokens');
    expect(formatCost(1.23455)).toBe('$1.2346 / 1M tokens');
  });
});

describe('parseJSON', () => {
  test('parses clean JSON', () => {
    const input = '{"key": "value"}';
    expect(parseJSON(input)).toEqual({ key: 'value' });
  });

  test('extracts JSON from markdown code blocks', () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(parseJSON(input)).toEqual({ key: 'value' });
  });

  test('extracts JSON without language specifier in code blocks', () => {
    const input = '```\n{"key": "value"}\n```';
    expect(parseJSON(input)).toEqual({ key: 'value' });
  });

  test('extracts JSON from surrounding text', () => {
    const input = 'Here is the data: {"key": "value"} and more text';
    expect(parseJSON(input)).toEqual({ key: 'value' });
  });

  test('handles nested objects', () => {
    const input = '{"outer": {"inner": "value"}}';
    expect(parseJSON(input)).toEqual({ outer: { inner: 'value' } });
  });

  test('handles arrays and wraps in stories', () => {
    const input = '[1, 2, 3]';
    expect(parseJSON(input)).toEqual({ stories: [1, 2, 3] });
  });

  test('handles arrays in objects', () => {
    const input = '{"items": [1, 2, 3]}';
    expect(parseJSON(input)).toEqual({ items: [1, 2, 3] });
  });

  test('throws error for invalid JSON', () => {
    expect(() => parseJSON('not json at all')).toThrow(
      'Failed to parse JSON response'
    );
  });

  test('throws error for malformed JSON', () => {
    expect(() => parseJSON('{"key": invalid}')).toThrow();
  });

  test('handles whitespace in JSON', () => {
    const input = '  \n  {"key": "value"}  \n  ';
    expect(parseJSON(input)).toEqual({ key: 'value' });
  });

  test('extracts first JSON object from multiple objects', () => {
    const input = '{"first": 1} and {"second": 2}';
    expect(parseJSON(input)).toEqual({ first: 1 });
  });
});

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
    const key = 'sk-or-v1-' + 'g'.repeat(64); // g is not hex
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
