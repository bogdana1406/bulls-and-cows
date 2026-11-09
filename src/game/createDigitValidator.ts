import type { Base } from './types.js';

export function createDigitValidator(base: Base): (char: string) => boolean {
  void base;
  return (_char: string) => false;
}
