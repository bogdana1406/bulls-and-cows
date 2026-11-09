import { evaluateGuess, type GuessResult } from './evaluateGuess.js';
import { generateSecret } from './generateSecret.js';
import { isValidGuess } from './isValidGuess.js';
import type { Base } from './types.js';

export interface RoundSettings {
  readonly length: number;
  readonly base: Base;
}

export interface GuessEntry extends GuessResult {
  readonly guess: string;
}

export interface RoundState {
  readonly settings: RoundSettings;
  readonly secret: string;
  readonly startedAt: number;
  readonly finishedAt: number | null;
  readonly status: 'playing' | 'won';
  readonly history: readonly GuessEntry[];
}

export interface RecordEntry extends RoundSettings {
  readonly attempts: number;
  readonly durationMs: number;
  readonly achievedAt: number;
}

export function startRound(
  settings: RoundSettings,
  startedAt: number,
  random: () => number = Math.random,
): RoundState {
  return {
    settings: { ...settings },
    secret: generateSecret(settings.length, settings.base, random),
    startedAt,
    finishedAt: null,
    status: 'playing',
    history: [],
  };
}

export function submitGuess(
  round: RoundState,
  input: string,
  submittedAt: number,
): RoundState {
  const guess = input.toLowerCase();
  if (
    round.status !== 'playing' ||
    !isValidGuess(guess, round.settings.length, round.settings.base) ||
    round.history.some((entry) => entry.guess === guess)
  ) {
    return round;
  }

  const result = evaluateGuess(round.secret, guess);
  const won = result.bulls === round.settings.length;
  return {
    ...round,
    history: [...round.history, { guess, ...result }],
    status: won ? 'won' : 'playing',
    finishedAt: won ? submittedAt : null,
  };
}

export function recordFromRound(round: RoundState): RecordEntry | null {
  if (round.finishedAt === null) return null;
  return {
    ...round.settings,
    attempts: round.history.length,
    durationMs: Math.max(0, round.finishedAt - round.startedAt),
    achievedAt: round.finishedAt,
  };
}

export function rankRecords(
  records: readonly RecordEntry[],
  newRecord: RecordEntry,
  limit = 10,
): RecordEntry[] {
  return [...records, newRecord]
    .sort(
      (left, right) =>
        left.attempts - right.attempts ||
        left.durationMs - right.durationMs ||
        left.achievedAt - right.achievedAt,
    )
    .slice(0, limit);
}
