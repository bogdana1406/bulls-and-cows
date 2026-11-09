import { describe, expect, it } from 'vitest';
import {
  rankRecords,
  recordFromRound,
  startRound,
  submitGuess,
  type RecordEntry,
} from './round.js';

describe('round state', () => {
  it('adds attempts without changing prior state or history', () => {
    const initial = startRound({ length: 2, base: 2 }, 100, () => 0);
    const next = submitGuess(initial, '10', 120);
    expect(initial.history).toEqual([]);
    expect(next.history).toEqual([{ guess: '10', bulls: 0, cows: 2 }]);
    expect(next.history).not.toBe(initial.history);
    expect(submitGuess(next, '10', 130)).toBe(next);
  });

  it('finishes on a correct guess and captures attempts and elapsed time', () => {
    const initial = startRound({ length: 2, base: 2 }, 100, () => 0);
    const next = submitGuess(submitGuess(initial, '10', 120), '01', 150);
    expect(next.status).toBe('won');
    expect(next.finishedAt).toBe(150);
    expect(recordFromRound(next)).toEqual({
      length: 2,
      base: 2,
      attempts: 2,
      durationMs: 50,
      achievedAt: 150,
    });
    expect(submitGuess(next, '01', 160)).toBe(next);
  });

  it('sorts records by attempts and then elapsed time without mutation', () => {
    const previous: RecordEntry[] = [
      { length: 2, base: 2, attempts: 2, durationMs: 20, achievedAt: 1 },
    ];
    const newRecord: RecordEntry = {
      length: 4,
      base: 10,
      attempts: 1,
      durationMs: 100,
      achievedAt: 2,
    };
    expect(rankRecords(previous, newRecord, 1)).toEqual([newRecord]);
    expect(previous).toHaveLength(1);
  });
});
