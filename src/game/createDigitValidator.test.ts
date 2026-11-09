import { describe, expect, it } from 'vitest';
import { createDigitValidator } from './createDigitValidator.js';

describe('createDigitValidator', () => {
  it('accepts only binary digits for base 2', () => {
    const isBinaryDigit = createDigitValidator(2);
    expect(isBinaryDigit('0')).toBe(true);
    expect(isBinaryDigit('1')).toBe(true);
    expect(isBinaryDigit('2')).toBe(false);
  });

  it('accepts uppercase and lowercase hexadecimal digits', () => {
    const isHexDigit = createDigitValidator(16);
    expect(isHexDigit('a')).toBe(true);
    expect(isHexDigit('F')).toBe(true);
    expect(isHexDigit('g')).toBe(false);
  });

  it('rejects empty and multi-character input', () => {
    const isDecimalDigit = createDigitValidator(10);
    expect(isDecimalDigit('')).toBe(false);
    expect(isDecimalDigit('10')).toBe(false);
    expect(isDecimalDigit('9')).toBe(true);
  });
});
