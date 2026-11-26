import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { CATEGORIES, LESSONS, CONFUSABLE, PATH } from '../src/data';
import { resolveStart } from '../src/logic/position';

const SQUARE = /^[a-h][1-8]$/;

describe('curriculum', () => {
  it('has exactly 56 Core Path strategies with unique ids', () => {
    expect(LESSONS).toHaveLength(56);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(56);
  });

  it('puts every lesson in a known category, and every category has lessons', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id));
    for (const l of LESSONS) expect(ids.has(l.category), l.id).toBe(true);
    for (const c of CATEGORIES) expect(LESSONS.some((l) => l.category === c.id), c.id).toBe(true);
  });

  it('has a learning path that covers every lesson exactly once', () => {
    const ids = PATH.flatMap((s) => s.ids);
    expect(ids).toHaveLength(56);
    expect(new Set(ids)).toEqual(new Set(LESSONS.map((l) => l.id)));
  });

  it('only references real lessons in confusable groups', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    for (const group of CONFUSABLE) for (const id of group) expect(ids.has(id), id).toBe(true);
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

  it('keeps narration short and free of move notation', () => {
    for (const step of lesson.walkthrough.steps) {
      const words = step.say.split(/\s+/).length;
      expect(words, step.say).toBeLessThanOrEqual(45);
      expect(step.say, 'narration should not contain SAN').not.toMatch(/\b[KQRBN]x?[a-h][1-8]\b|O-O/);
    }
  });

  it('has a legal walkthrough', () => {
    const game = resolveStart(lesson.walkthrough);
    for (const step of lesson.walkthrough.steps) {
      for (const sq of step.highlights ?? []) expect(sq).toMatch(SQUARE);
      for (const [from, to] of step.arrows ?? []) {
        expect(from).toMatch(SQUARE);
        expect(to).toMatch(SQUARE);
      }
      if (step.predict) expect(step.san, 'predict needs a move').toBeDefined();
      if (step.san) {
        for (const alt of step.alsoGood ?? []) {
          const probe = new Chess(game.fen());
          expect(() => probe.move(alt), `${lesson.id} alsoGood ${alt}`).not.toThrow();
        }
        const move = game.move(step.san);
        expect(move.san, `${lesson.id}: SAN should be written canonically`).toBe(step.san);
      }
    }
    const last = [...lesson.walkthrough.steps].reverse().find((s) => s.san);
    if (last?.san?.endsWith('#')) expect(game.isCheckmate()).toBe(true);
  });

  it('has at least two legal puzzles', () => {
    expect(lesson.puzzles.length).toBeGreaterThanOrEqual(2);
    lesson.puzzles.forEach((p, i) => {
      expect(p.lines.length, `puzzle ${i}`).toBeGreaterThanOrEqual(1);
      expect(p.hints.length, `puzzle ${i} hints`).toBeGreaterThanOrEqual(1);
      const start = resolveStart(p);
      for (const line of p.lines) {
        expect(line.length % 2, `puzzle ${i} lines end on the learner's move`).toBe(1);
        const game = new Chess(start.fen());
        for (const san of line) {
          const move = game.move(san);
          expect(move.san, `${lesson.id} puzzle ${i}`).toBe(san);
        }
        if (line[line.length - 1].endsWith('#')) expect(game.isCheckmate()).toBe(true);
      }
      if (p.orientation) {
        expect(p.orientation).toBe(start.turn() === 'w' ? 'white' : 'black');
      }
    });
  });
});
