import { describe, expect, it } from 'vitest';
import { generateSecret } from './generateSecret.js';

describe('generateSecret', () => {
  it('uses an injected source and keeps a leading zero', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('returns unique digits from the selected alphabet', () => {
    const secret = generateSecret(6, 16, () => 0.75);
    expect(secret).toMatch(/^[0-9a-f]{6}$/);
    expect(new Set(secret).size).toBe(6);
  });

  it('rejects a length greater than the base', () => {
    expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
  });
});
