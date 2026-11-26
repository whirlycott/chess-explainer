import { afterEach, describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { ChessBoard } from '../../src/ui/chess-board';

async function mount(fen: string): Promise<ChessBoard> {
  const board = document.createElement('chess-board') as ChessBoard;
  board.fen = fen;
  board.style.width = '400px';
  board.style.display = 'block';
  document.body.append(board);
  await board.updateComplete;
  // Let fade-in animations from the first render settle.
  await new Promise((r) => setTimeout(r, 350));
  return board;
}

const pieceOn = (board: ChessBoard, square: string) =>
  board.shadowRoot!.querySelector<HTMLElement>(`.piece:not(.leaving)[data-square="${square}"]`)!;

const runs = (el: Element, property: string) =>
  el.getAnimations().some((a) => (a as CSSTransition).transitionProperty === property);

async function play(board: ChessBoard, game: Chess, ...moves: string[]): Promise<void> {
  for (const m of moves) game.move(m);
  board.fen = game.fen();
  await board.updateComplete;
}

afterEach(() => document.body.replaceChildren());

describe('chess-board animation', () => {
  it('glides the moved piece, using the same element', async () => {
    const game = new Chess();
    const board = await mount(game.fen());
    for (const [from, to, san] of [
      ['e2', 'e4', 'e4'],
      ['g8', 'f6', 'Nf6'],
      ['g1', 'f3', 'Nf3'],
    ]) {
      const el = pieceOn(board, from);
      await play(board, game, san);
      expect(pieceOn(board, to), `${san} should reuse the element`).toBe(el);
      expect(runs(el, 'transform'), `${san} should glide`).toBe(true);
    }
  });

  it('fades out a captured piece while the capturing piece glides in', async () => {
    const game = new Chess();
    for (const m of ['e4', 'd5']) game.move(m);
    const board = await mount(game.fen());
    const capturer = pieceOn(board, 'e4');
    await play(board, game, 'exd5');
    const leaving = board.shadowRoot!.querySelector('.piece.leaving[data-square="d5"]')!;
    expect(leaving).not.toBeNull();
    expect(runs(leaving, 'opacity')).toBe(true);
    expect(runs(capturer, 'transform')).toBe(true);
    await new Promise((r) => setTimeout(r, 400));
    expect(board.shadowRoot!.querySelector('.piece.leaving')).toBeNull();
  });

  it('glides pieces when the position jumps several moves', async () => {
    const game = new Chess();
    const board = await mount(game.fen());
    const pawn = pieceOn(board, 'e2');
    const knight = pieceOn(board, 'b8');
    await play(board, game, 'e4', 'e5', 'Nf3', 'Nc6');
    expect(pieceOn(board, 'e4')).toBe(pawn);
    expect(pieceOn(board, 'c6')).toBe(knight);
    expect(runs(pawn, 'transform')).toBe(true);
    expect(runs(knight, 'transform')).toBe(true);
  });
});
