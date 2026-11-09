import type { Base } from './types.js';

export function generateSecret(
  length: number,
  base: Base,
  random: () => number = Math.random,
): string {
  void length;
  void base;
  void random;
  return '';
}
