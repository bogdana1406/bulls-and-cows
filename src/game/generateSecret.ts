import type { Base } from './types.js';

export function generateSecret(
  length: number,
  base: Base,
  random: () => number = Math.random,
): string {
  if (!Number.isInteger(length) || length < 1 || length > base) {
    throw new RangeError('Secret length must be between 1 and the base');
  }

  const digits = [...'0123456789abcdef'.slice(0, base)];
  for (let index = 0; index < length; index += 1) {
    const selectedIndex = index + Math.floor(random() * (base - index));
    [digits[index], digits[selectedIndex]] = [
      digits[selectedIndex],
      digits[index],
    ];
  }

  return digits.slice(0, length).join('');
}
