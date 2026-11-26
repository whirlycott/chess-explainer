import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { placement, track } from '../src/logic/diff';

describe('piece tracking', () => {
  it('parses a FEN placement', () => {
    const start = placement(new Chess().fen());
    expect(start).toHaveLength(32);
    expect(start.find((p) => p.square === 'e1')).toEqual({ square: 'e1', color: 'w', type: 'k' });
  });

  it('keeps the id of a piece that moved', () => {
    const g = new Chess();
    const a = track([], g.fen());
    const knight = a.find((p) => p.square === 'g1')!;
    g.move('Nf3');
    const b = track(a, g.fen());
    expect(b.find((p) => p.square === 'f3')!.id).toBe(knight.id);
    expect(b).toHaveLength(32);
  });

  it('handles castling and captures', () => {
    const g = new Chess();
    let t = track([], g.fen());
    const rook = t.find((p) => p.square === 'h1')!.id;
    const queen = t.find((p) => p.square === 'd8')!.id;
    for (const m of ['e4', 'd5', 'exd5', 'Qxd5', 'Nf3', 'Nf6', 'Be2', 'e6', 'O-O']) {
      g.move(m);
      t = track(t, g.fen());
    }
    expect(t.find((p) => p.square === 'f1')!.id).toBe(rook);
    expect(t.find((p) => p.square === 'd5')!.id).toBe(queen);
    expect(t).toHaveLength(30);
  });

  it('keeps the id when a pawn promotes', () => {
    const a = track([], '8/P7/8/8/8/8/8/k6K w - - 0 1');
    const pawn = a.find((p) => p.square === 'a7')!.id;
    const b = track(a, 'Q7/8/8/8/8/8/8/k6K b - - 0 1');
    expect(b.find((p) => p.square === 'a8')).toMatchObject({ id: pawn, type: 'q' });
  });
  it('does not slide pieces when jumping to a position more than one move away', () => {
    const a = track([], new Chess().fen());
    const g = new Chess();
    for (const m of ['e4', 'e5', 'Nf3', 'Nc6']) g.move(m);
    const b = track(a, g.fen());
    const moved = b.filter((p) => {
      const old = a.find((o) => o.id === p.id);
      return old && old.square !== p.square;
    });
    expect(moved).toHaveLength(0);
    // Pieces that stayed put keep their ids.
    expect(b.find((p) => p.square === 'a1')!.id).toBe(a.find((p) => p.square === 'a1')!.id);
    expect(b).toHaveLength(32);
  });

  it('does not slide pieces into an unrelated puzzle position', () => {
    const a = track([], 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4');
    const b = track(a, '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1');
    const slid = b.filter((p) => a.some((o) => o.id === p.id && o.square !== p.square));
    expect(slid).toHaveLength(0);
  });
});

