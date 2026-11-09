import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from './countPossibleSecrets.js';

describe('countPossibleSecrets', () => {
  it('includes secrets that start with zero', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it('counts hexadecimal permutations', () => {
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('returns one empty permutation for zero length', () => {
    expect(countPossibleSecrets(0, 8)).toBe(1);
  });

  it('returns a stable result on repeated calls', () => {
    expect(countPossibleSecrets(3, 8)).toBe(336);
    expect(countPossibleSecrets(3, 8)).toBe(336);
  });

  it('rejects impossible lengths', () => {
    expect(() => countPossibleSecrets(3, 2)).toThrow(RangeError);
  });
});
