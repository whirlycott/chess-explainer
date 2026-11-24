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
    for (const m of ['e4', 'd5', 'exd5', 'Qxd5', 'Nf3', 'Nf6', 'Be2', 'e6', 'O-O']) g.move(m);
    let t = track([], new Chess().fen());
    const rook = t.find((p) => p.square === 'h1')!.id;
    const queen = t.find((p) => p.square === 'd8')!.id;
    t = track(t, g.fen());
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
});
