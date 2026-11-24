import { Chess } from 'chess.js';
import type { PositionSource } from '../data/types';

/** Split a move list like "1.e4 e5 2.Nf3" into SAN tokens. */
export function splitMoves(moves: string): string[] {
  return moves
    .split(/\s+/)
    .map((t) => t.replace(/^\d+\.(\.\.)?/, ''))
    .filter((t) => t.length > 0);
}

/** Build a game positioned at the start of a walkthrough or puzzle. */
export function resolveStart(src: PositionSource): Chess {
  const game = src.fen ? new Chess(src.fen) : new Chess();
  if (src.setup) {
    for (const san of splitMoves(src.setup)) game.move(san);
  }
  return game;
}

export function startFen(src: PositionSource): string {
  return resolveStart(src).fen();
}

/** Which side moves first in this position. */
export function sideToMove(src: PositionSource): 'white' | 'black' {
  return resolveStart(src).turn() === 'w' ? 'white' : 'black';
}

const PIECE_WORDS: Record<string, string> = {
  K: 'King',
  Q: 'Queen',
  R: 'Rook',
  B: 'Bishop',
  N: 'Knight',
};

/** Turn SAN into words that read well aloud: "Nxf7+" -> "Knight takes f7, check". */
export function sanToWords(san: string): string {
  if (san.startsWith('O-O-O')) return 'Castles queenside' + suffixWords(san);
  if (san.startsWith('O-O')) return 'Castles kingside' + suffixWords(san);
  const core = san.replace(/[+#!?]/g, '');
  const promo = core.match(/=([QRBN])$/);
  const body = core.replace(/=([QRBN])$/, '');
  const target = body.slice(-2);
  const first = body[0];
  const piece = PIECE_WORDS[first] ?? 'Pawn';
  const takes = body.includes('x');
  let words = takes ? `${piece} takes ${target}` : piece === 'Pawn' ? `Pawn to ${target}` : `${piece} to ${target}`;
  if (promo) words += `, promotes to a ${PIECE_WORDS[promo[1]].toLowerCase()}`;
  return words + suffixWords(san);
}

function suffixWords(san: string): string {
  if (san.includes('#')) return ', checkmate!';
  if (san.includes('+')) return ', check';
  return '';
}
