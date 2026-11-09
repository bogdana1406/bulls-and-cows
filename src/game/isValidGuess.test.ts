import { describe, expect, it } from 'vitest';
import { isValidGuess } from './isValidGuess.js';

describe('isValidGuess', () => {
  it('accepts a leading zero and uppercase hex letters', () => {
    expect(isValidGuess('0Af', 3, 16)).toBe(true);
  });

  it('rejects an incorrect length', () => {
    expect(isValidGuess('01', 3, 10)).toBe(false);
  });

  it('rejects digits outside the selected base', () => {
    expect(isValidGuess('02', 2, 2)).toBe(false);
    expect(isValidGuess('89', 2, 8)).toBe(false);
  });

  it('rejects repeated digits without regard to case', () => {
    expect(isValidGuess('aA', 2, 16)).toBe(false);
    expect(isValidGuess('11', 2, 2)).toBe(false);
  });

  it('accepts a complete binary guess', () => {
    expect(isValidGuess('10', 2, 2)).toBe(true);
  });
});
