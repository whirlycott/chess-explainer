import { describe, expect, it } from 'vitest';
import { CORE_LESSONS, LESSONS, OPENING_LESSONS, isOpening } from '../src/data';
import { startFen } from '../src/logic/position';
import { buildQuiz, distractors, makeItem, rng } from '../src/logic/quiz';

describe('quiz', () => {
  it('gives three distinct wrong answers that never include the right one', () => {
    for (const l of LESSONS) {
      const d = distractors(l.id, 3, rng(1));
      expect(d).toHaveLength(3);
      expect(new Set(d.map((x) => x.id)).size).toBe(3);
      expect(d.some((x) => x.id === l.id)).toBe(false);
    }
  });

  it('prefers confusable strategies as distractors', () => {
    const d = distractors('skewer', 3, rng(7)).map((x) => x.id);
    expect(d).toContain('pin');
  });

  it('never offers overlapping strategies as competing answers', () => {
    for (let seed = 0; seed < 50; seed++) {
      expect(distractors('double-check', 3, rng(seed)).map((x) => x.id)).not.toContain('discovered-check');
      expect(distractors('stalemate', 3, rng(seed)).map((x) => x.id)).not.toContain('queen-mate');
    }
  });

  it('builds name items whose answer index points at the lesson', () => {
    for (const l of LESSONS) {
      const item = makeItem(l, 'name', rng(3));
      if (item.kind === 'name' || item.kind === 'idea') {
        expect(item.choices[item.answer]).toBe(l.id);
        expect(item.choices).toHaveLength(4);
      }
    }
  });

  it('interleaves lessons so the same one does not appear twice in a row', () => {
    const ids = ['fork', 'pin', 'skewer', 'back-rank'];
    const quiz = buildQuiz({ mode: 'mixed', lessonIds: ids, size: 16, seed: 42 });
    expect(quiz).toHaveLength(16);
    for (let i = 1; i < quiz.length; i++) expect(quiz[i].lessonId).not.toBe(quiz[i - 1].lessonId);
  });

  it('asks once per due lesson in review mode and forces a move item when needed', () => {
    const quiz = buildQuiz({ mode: 'review', lessonIds: ['fork', 'pin'], size: 12, needsMove: new Set(['fork']), seed: 5 });
    expect(quiz).toHaveLength(2);
    expect(quiz.find((q) => q.lessonId === 'fork')?.kind).toBe('move');
  });

  it('never mixes named openings and core strategies as answer choices', () => {
    const rand = rng(11);
    for (const l of LESSONS) {
      const opening = isOpening(l.id);
      for (const d of distractors(l.id, 3, rand)) expect(isOpening(d.id), `${l.id} vs ${d.id}`).toBe(opening);
    }
  });

  it('builds Name That Opening items from the defining position', () => {
    const ids = OPENING_LESSONS.map((l) => l.id);
    const quiz = buildQuiz({ mode: 'openings', lessonIds: ids, size: 40, seed: 5 });
    expect(quiz).toHaveLength(40);
    const kinds = new Set(quiz.map((q) => q.kind));
    expect(kinds).toEqual(new Set(['name', 'idea', 'move']));
    for (const item of quiz) {
      const lesson = OPENING_LESSONS.find((l) => l.id === item.lessonId)!;
      if (item.kind === 'name') {
        expect(item.positionKey).toBe(`${lesson.id}:name`);
        expect(startFen(item.puzzle)).toBe(startFen({ setup: lesson.opening!.moves }));
        for (const c of item.choices) expect(isOpening(c)).toBe(true);
      }
      if (item.kind === 'idea') {
        expect(item.text).toBe(lesson.opening!.plan);
        expect(item.positionKey).toBe(`${lesson.id}:plan`);
      }
      if (item.kind === 'move') expect(item.positionKey).toMatch(/:(p\d+|m0)$/);
    }
    expect(quiz.some((q) => q.kind === 'move' && q.positionKey.endsWith(':m0'))).toBe(true);
  });

  it('keeps core quizzes free of openings', () => {
    const quiz = buildQuiz({ mode: 'mixed', lessonIds: CORE_LESSONS.map((l) => l.id), size: 60, seed: 9 });
    for (const item of quiz) expect(isOpening(item.lessonId)).toBe(false);
  });
});
