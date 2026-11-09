import type { Base } from './types.js';
import { createDigitValidator } from './createDigitValidator.js';

export function isValidGuess(
  guess: string,
  length: number,
  base: Base,
): boolean {
  const normalizedDigits = [...guess.toLowerCase()];
  const isDigit = createDigitValidator(base);

  return (
    normalizedDigits.length === length &&
    normalizedDigits.every(isDigit) &&
    new Set(normalizedDigits).size === length
  );
}
