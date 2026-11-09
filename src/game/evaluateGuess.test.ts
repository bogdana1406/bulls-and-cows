import { describe, expect, it } from 'vitest';
import { evaluateGuess } from './evaluateGuess.js';

describe('evaluateGuess', () => {
  it('counts matching positions and displaced digits', () => {
    expect(evaluateGuess('0123', '0134')).toEqual({ bulls: 2, cows: 1 });
  });

  it('recognizes all digits in reversed positions', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
  });

  it('compares hexadecimal digits without regard to case', () => {
    expect(evaluateGuess('a1F0', 'A1f0')).toEqual({ bulls: 4, cows: 0 });
  });

  it('does not count absent digits', () => {
    expect(evaluateGuess('01', '23')).toEqual({ bulls: 0, cows: 0 });
  });
});
