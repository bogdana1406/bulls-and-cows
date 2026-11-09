import type { Base } from './types.js';

export function createDigitValidator(base: Base): (char: string) => boolean {
  const alphabet = '0123456789abcdef'.slice(0, base);
  return (char: string) =>
    char.length === 1 && alphabet.includes(char.toLowerCase());
}
