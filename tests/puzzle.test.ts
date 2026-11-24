import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { judgeMove, expectedMove } from '../src/logic/puzzle';
import type { Puzzle } from '../src/data/types';

const multi: Puzzle = {
  fen: '3q2k1/pp3ppp/8/6b1/8/5N2/PP3PPP/4R1K1 w - - 0 1',
  prompt: '',
  lines: [['Nxg5', 'Qxg5', 'Re8#']],
  hints: [''],
  explanation: '',
};

describe('judgeMove', () => {
  it('continues with the scripted reply, then solves', () => {
    const g = new Chess(multi.fen);
    expect(judgeMove(multi, [], g.fen(), 'Nxg5')).toEqual({ result: 'continue', reply: 'Qxg5' });
    g.move('Nxg5');
    g.move('Qxg5');
    expect(judgeMove(multi, ['Nxg5', 'Qxg5'], g.fen(), 'Re8#')).toEqual({ result: 'solved' });
  });

  it('rejects a move that is not in any line', () => {
    expect(judgeMove(multi, [], multi.fen!, 'Re8+')).toEqual({ result: 'wrong' });
  });

  it('accepts any checkmate as the final move', () => {
    const q: Puzzle = { ...multi, fen: '7k/5K2/8/6Q1/8/8/8/8 w - - 0 1', lines: [['Qg7#']] };
    expect(judgeMove(q, [], q.fen!, 'Qh4#')).toEqual({ result: 'solved' });
    expect(judgeMove(q, [], q.fen!, 'Qg6')).toEqual({ result: 'wrong' }); // stalemate, not mate
  });

  it('accepts alternative lines', () => {
    const p: Puzzle = { ...multi, fen: '6k1/ppp2ppp/8/3p4/4n3/2NB4/PPP2PPP/6K1 w - - 0 1', lines: [['Bxe4'], ['Nxe4']] };
    expect(judgeMove(p, [], p.fen!, 'Nxe4')).toEqual({ result: 'solved' });
  });

  it('reports the expected move', () => {
    expect(expectedMove(multi, [])).toBe('Nxg5');
    expect(expectedMove(multi, ['Nxg5', 'Qxg5'])).toBe('Re8#');
  });
});
