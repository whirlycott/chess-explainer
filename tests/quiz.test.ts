import { describe, expect, it } from 'vitest';
import { LESSONS } from '../src/data';
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
});
