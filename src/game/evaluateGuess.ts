export interface GuessResult {
  bulls: number;
  cows: number;
}

export function evaluateGuess(secret: string, guess: string): GuessResult {
  const secretDigits = [...secret.toLowerCase()];
  const guessDigits = [...guess.toLowerCase()];

  return {
    bulls: guessDigits.filter((digit, index) => digit === secretDigits[index])
      .length,
    cows: guessDigits.filter(
      (digit, index) =>
        digit !== secretDigits[index] && secretDigits.includes(digit),
    ).length,
  };
}
