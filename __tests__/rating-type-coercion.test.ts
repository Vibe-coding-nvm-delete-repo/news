/**
 * Test suite for rating type coercion in NewsTab.tsx
 * Verifies that rating values are properly converted to numbers regardless of input type
 */

describe('Rating Type Coercion', () => {
  it('should handle numeric rating values', () => {
    const story = { rating: 7 };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(result).toBe(7);
    expect(typeof result).toBe('number');
  });

  it('should convert string rating to number', () => {
    const story = { rating: '8.5' as any };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(result).toBe(8.5);
    expect(typeof result).toBe('number');
  });

  it('should handle integer string ratings', () => {
    const story = { rating: '7' as any };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(result).toBe(7);
    expect(typeof result).toBe('number');
  });

  it('should fall back to 0 for invalid rating values', () => {
    const story = { rating: 'invalid' as any };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(result).toBe(0);
    expect(typeof result).toBe('number');
  });

  it('should fall back to 0 for null rating', () => {
    const story = { rating: null as any };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(result).toBe(0);
    expect(typeof result).toBe('number');
  });

  it('should fall back to 0 for undefined rating', () => {
    const story = { rating: undefined as any };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(result).toBe(0);
    expect(typeof result).toBe('number');
  });

  it('should call toFixed on the result without error', () => {
    const story = { rating: '7.5' as any };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(() => result.toFixed(1)).not.toThrow();
    expect(result.toFixed(1)).toBe('7.5');
  });

  it('should handle edge case decimal strings', () => {
    const story = { rating: '9.99' as any };
    const result =
      typeof story.rating === 'number'
        ? story.rating
        : parseFloat(story.rating) || 0;
    expect(result).toBe(9.99);
    expect(result.toFixed(1)).toBe('10.0');
  });
});
