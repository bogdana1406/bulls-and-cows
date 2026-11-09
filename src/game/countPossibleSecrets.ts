import type { Base } from './types.js';

const countCache = new Map<string, number>();

function countPermutations(length: number, availableDigits: number): number {
  if (length === 0) return 1;

  const key = `${length}:${availableDigits}`;
  const cached = countCache.get(key);
  if (cached !== undefined) return cached;

  const result =
    availableDigits * countPermutations(length - 1, availableDigits - 1);
  countCache.set(key, result);
  return result;
}

export function countPossibleSecrets(length: number, base: Base): number {
  if (!Number.isInteger(length) || length < 0 || length > base) {
    throw new RangeError('Secret length must be between 0 and the base');
  }
  return countPermutations(length, base);
}
