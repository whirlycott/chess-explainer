import { describe, expect, it } from 'vitest';
import { Chess, type Square } from 'chess.js';
import {
  CATEGORIES,
  CONFUSABLE,
  CORE_LESSONS,
  LESSONS,
  OPENING_LESSONS,
  PATH,
  STARTER_KIT,
  repertoireOptions,
} from '../src/data';
import type { Puzzle, Walkthrough } from '../src/data/types';
import { resolveStart } from '../src/logic/position';

const SQUARE = /^[a-h][1-8]$/;

describe('curriculum', () => {
  it('has 56 Core Path strategies and 11 named openings, all with unique ids', () => {
    expect(CORE_LESSONS).toHaveLength(56);
    expect(OPENING_LESSONS).toHaveLength(11);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(67);
  });

  it('puts every core lesson in a core category, and every category has lessons', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id));
    for (const l of CORE_LESSONS) expect(ids.has(l.category), l.id).toBe(true);
    for (const c of CATEGORIES) expect(CORE_LESSONS.some((l) => l.category === c.id), c.id).toBe(true);
    for (const l of OPENING_LESSONS) expect(l.category, l.id).toBe('openings');
  });

  it('has a learning path that covers every core lesson exactly once', () => {
    const ids = PATH.flatMap((s) => s.ids);
    expect(ids).toHaveLength(56);
    expect(new Set(ids)).toEqual(new Set(CORE_LESSONS.map((l) => l.id)));
  });

  it('offers at least one opening for every repertoire slot, and a valid starter kit', () => {
    for (const slot of ['white', 'e4', 'd4'] as const) {
      const options = repertoireOptions(slot).map((o) => o.id);
      expect(options.length, slot).toBeGreaterThan(0);
      expect(options, slot).toContain(STARTER_KIT[slot]);
    }
  });

  it('only references real lessons in confusable groups', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    for (const group of CONFUSABLE) for (const id of group) expect(ids.has(id), id).toBe(true);
  });
});

describe('knight outpost', () => {
  // An outpost is a square that no enemy pawn can ever attack.
  function enemyPawnCanAttack(fen: string, square: string, mover: 'w' | 'b'): boolean {
    const game = new Chess(fen);
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]);
    for (const df of [-1, 1]) {
      const f = file + df;
      if (f < 0 || f > 7) continue;
      for (let r = 1; r <= 8; r++) {
        const piece = game.get(`${String.fromCharCode(97 + f)}${r}` as Square);
        if (!piece || piece.type !== 'p' || piece.color === mover) continue;
        // A White pawn attacks upward, so it must still be below the square; a Black pawn the reverse.
        if (piece.color === 'w' && r < rank) return true;
        if (piece.color === 'b' && r > rank) return true;
      }
    }
    return false;
  }

  it('only accepts answers on squares no enemy pawn can ever attack', () => {
    const lesson = LESSONS.find((l) => l.id === 'outpost')!;
    for (const p of lesson.puzzles) {
      const start = resolveStart(p);
      for (const line of p.lines) {
        const move = new Chess(start.fen()).move(line[0]);
        expect(enemyPawnCanAttack(start.fen(), move.to, move.color), `${line[0]} lands on ${move.to}`).toBe(false);
      }
    }
  });
});

describe.each(LESSONS.map((l) => [l.id, l] as const))('lesson %s', (_id, lesson) => {
  it('has the required text', () => {
    expect(lesson.bigIdea.length).toBeGreaterThan(10);
    expect(lesson.cues.length).toBeGreaterThanOrEqual(2);
    expect(lesson.mistake.length).toBeGreaterThan(10);
    for (const q of [lesson.check, lesson.explain]) {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.choices.length);
    }
  });

  it('keeps narration short and free of move notation', () => checkNarration(lesson.walkthrough));

  it('has a legal walkthrough', () => checkWalkthrough(lesson.walkthrough, lesson.id));

  it('has at least two legal puzzles', () => {
    expect(lesson.puzzles.length).toBeGreaterThanOrEqual(2);
    lesson.puzzles.forEach((p, i) => checkPuzzle(p, `${lesson.id} puzzle ${i}`));
  });
});

describe.each(OPENING_LESSONS.map((l) => [l.id, l] as const))('opening %s', (_id, lesson) => {
  const info = lesson.opening!;

  it('has legal defining moves that the main walkthrough reaches', () => {
    const defining = resolveStart({ setup: info.moves }).fen();
    const game = resolveStart(lesson.walkthrough);
    const seen = [game.fen()];
    for (const step of lesson.walkthrough.steps) if (step.san) seen.push(game.move(step.san) && game.fen());
    expect(seen, 'the walkthrough should pass through the defining position').toContain(defining);
  });

  it('shows the main walkthrough from the side that plays it', () => {
    expect(lesson.walkthrough.orientation).toBe(info.plays);
    expect(info.meeting.walkthrough.orientation).toBe(info.plays === 'white' ? 'black' : 'white');
  });

  it('has a plan and a tier', () => {
    expect(info.plan.length).toBeGreaterThan(20);
    expect([1, 2, 3]).toContain(info.tier);
  });

  it('has a short, notation-free Meeting walkthrough', () => checkNarration(info.meeting.walkthrough));

  it('has a legal Meeting walkthrough', () => checkWalkthrough(info.meeting.walkthrough, `${lesson.id} meeting`));

  it('has a legal Meeting puzzle', () => checkPuzzle(info.meeting.puzzle, `${lesson.id} meeting puzzle`));
});

function checkNarration(walkthrough: Walkthrough): void {
  for (const step of walkthrough.steps) {
    const words = step.say.split(/\s+/).length;
    expect(words, step.say).toBeLessThanOrEqual(45);
    expect(step.say, 'narration should not contain SAN').not.toMatch(/\b[KQRBN]x?[a-h][1-8]\b|O-O/);
  }
}

function checkWalkthrough(walkthrough: Walkthrough, label: string): void {
  const game = resolveStart(walkthrough);
  for (const step of walkthrough.steps) {
    for (const sq of step.highlights ?? []) expect(sq).toMatch(SQUARE);
    for (const [from, to] of step.arrows ?? []) {
      expect(from).toMatch(SQUARE);
      expect(to).toMatch(SQUARE);
    }
    if (step.predict) expect(step.san, 'predict needs a move').toBeDefined();
    if (step.san) {
      for (const alt of step.alsoGood ?? []) {
        const probe = new Chess(game.fen());
        expect(() => probe.move(alt), `${label} alsoGood ${alt}`).not.toThrow();
      }
      const move = game.move(step.san);
      expect(move.san, `${label}: SAN should be written canonically`).toBe(step.san);
    }
  }
  const last = [...walkthrough.steps].reverse().find((s) => s.san);
  if (last?.san?.endsWith('#')) expect(game.isCheckmate()).toBe(true);
}

function checkPuzzle(p: Puzzle, label: string): void {
  expect(p.lines.length, label).toBeGreaterThanOrEqual(1);
  expect(p.hints.length, `${label} hints`).toBeGreaterThanOrEqual(1);
  const start = resolveStart(p);
  for (const line of p.lines) {
    expect(line.length % 2, `${label} lines end on the learner's move`).toBe(1);
    const game = new Chess(start.fen());
    for (const san of line) {
      const move = game.move(san);
      expect(move.san, label).toBe(san);
    }
    if (line[line.length - 1].endsWith('#')) expect(game.isCheckmate()).toBe(true);
  }
  if (p.orientation) {
    expect(p.orientation).toBe(start.turn() === 'w' ? 'white' : 'black');
  }
}
