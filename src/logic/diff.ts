/**
 * Keep stable identities for pieces between positions, so a renderer can
 * animate a piece sliding from its old square to its new one.
 */

export interface TrackedPiece {
  id: number;
  color: 'w' | 'b';
  type: string;
  square: string;
}

/** Parse the piece-placement part of a FEN into square -> piece. */
export function placement(fen: string): { square: string; color: 'w' | 'b'; type: string }[] {
  const rows = fen.split(' ')[0].split('/');
  const out: { square: string; color: 'w' | 'b'; type: string }[] = [];
  rows.forEach((row, r) => {
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        file += Number(ch);
        continue;
      }
      out.push({
        square: 'abcdefgh'[file] + String(8 - r),
        color: ch === ch.toUpperCase() ? 'w' : 'b',
        type: ch.toLowerCase(),
      });
      file += 1;
    }
  });
  return out;
}

function distance(a: string, b: string): number {
  return Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) + Math.abs(Number(a[1]) - Number(b[1]));
}

let nextId = 1;

/**
 * Match pieces in the new position to pieces in the old one:
 * 1. same piece on the same square keeps its id;
 * 2. otherwise the nearest unmatched old piece of the same colour and type;
 * 3. a pawn that promoted keeps its id (matched by colour, as a pawn);
 * 4. anything else gets a new id.
 */
export function track(prev: TrackedPiece[], fen: string): TrackedPiece[] {
  const next = placement(fen);
  const unused = new Set(prev);
  const result: (TrackedPiece | null)[] = next.map(() => null);

  next.forEach((p, i) => {
    const same = [...unused].find((o) => o.square === p.square && o.type === p.type && o.color === p.color);
    if (same) {
      unused.delete(same);
      result[i] = { ...same };
    }
  });

  const matchBy = (pred: (o: TrackedPiece, p: (typeof next)[number]) => boolean) => {
    next.forEach((p, i) => {
      if (result[i]) return;
      const options = [...unused].filter((o) => pred(o, p)).sort((a, b) => distance(a.square, p.square) - distance(b.square, p.square));
      if (options[0]) {
        unused.delete(options[0]);
        result[i] = { ...options[0], square: p.square, type: p.type };
      }
    });
  };
  matchBy((o, p) => o.type === p.type && o.color === p.color);
  matchBy((o, p) => o.type === 'p' && o.color === p.color && (p.square[1] === '8' || p.square[1] === '1'));

  return next.map((p, i) => result[i] ?? { id: nextId++, ...p });
}
