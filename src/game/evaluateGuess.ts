export interface GuessResult {
  bulls: number;
  cows: number;
}

export function evaluateGuess(secret: string, guess: string): GuessResult {
  void secret;
  void guess;
  return { bulls: 0, cows: 0 };
}
