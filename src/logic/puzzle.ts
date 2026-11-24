import { Chess } from 'chess.js';
import type { Puzzle } from '../data/types';

export type MoveResult =
  | { result: 'wrong' }
  | { result: 'solved' }
  | { result: 'continue'; reply: string };

/**
 * Judge the learner's move in a puzzle.
 *
 * @param played SAN moves already played in this puzzle (learner and replies).
 * @param fenBefore position before the learner's move.
 * @param san the learner's move in SAN.
 */
export function judgeMove(puzzle: Puzzle, played: string[], fenBefore: string, san: string): MoveResult {
  const idx = played.length;
  const candidates = puzzle.lines.filter((line) => played.every((m, i) => line[i] === m) && line.length > idx);
  for (const line of candidates) {
    const isLast = idx === line.length - 1;
    let match = line[idx] === san;
    if (!match && isLast && line[idx].endsWith('#')) {
      // Any checkmate is as good as the listed one.
      const probe = new Chess(fenBefore);
      probe.move(san);
      match = probe.isCheckmate();
    }
    if (match) return isLast ? { result: 'solved' } : { result: 'continue', reply: line[idx + 1] };
  }
  return { result: 'wrong' };
}

/** The main-line move expected next, for "show me" and reveal. */
export function expectedMove(puzzle: Puzzle, played: string[]): string | undefined {
  const line = puzzle.lines.find((l) => played.every((m, i) => l[i] === m) && l.length > played.length);
  return line?.[played.length];
}
