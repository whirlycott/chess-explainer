import { CONFUSABLE, LESSONS, lessonById } from '../data';
import type { CategoryId, Lesson, Puzzle, Question } from '../data/types';

/** A seeded random number generator (mulberry32) so quizzes are testable. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pairs of strategies whose example positions also show the other idea, so
 * they must never be offered as competing answers in "name that strategy".
 */
const OVERLAPS: [string, string][] = [
  ['double-check', 'discovered-check'],
  ['discovered-attack', 'fork'],
  ['discovered-check', 'fork'],
  ['decoy', 'fork'],
  ['cct', 'fork'],
  ['cct', 'values'],
  ['values', 'remove-defender'],
  ['stalemate', 'queen-mate'],
  ['overloading', 'back-rank'],
  ['remove-defender', 'back-rank'],
  ['deflection', 'passed-pawn'],
  ['passed-pawn', 'square'],
  ['opposition', 'king-activity'],
  ['weak-squares', 'queen-mate'],
  ['greek-gift', 'remove-defender'],
  ['smothered', 'decoy'],
  ['anastasia', 'decoy'],
  ['boden', 'decoy'],
  ['legal', 'early-mates'],
  ['trade-ahead', 'values'],
  ['in-between', 'values'],
];

function overlaps(a: string, b: string): boolean {
  return OVERLAPS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** Lessons whose puzzles are really examples of other tactics; skip them in "name" items. */
const NOT_NAMEABLE = new Set(['cct']);

/** Pick `n` wrong answers for a lesson, preferring easily-confused strategies. */
export function distractors(id: string, n: number, rand: () => number): Lesson[] {
  const lesson = lessonById(id)!;
  const allowed = (l: Lesson) => l.id !== id && !overlaps(id, l.id);
  const confusable = shuffle(
    [...new Set(CONFUSABLE.filter((g) => g.includes(id)).flat())].map((x) => lessonById(x)!).filter(allowed),
    rand,
  );
  const sameCategory = shuffle(LESSONS.filter((l) => l.category === lesson.category && allowed(l)), rand);
  const anywhere = shuffle(LESSONS.filter(allowed), rand);
  const picked: Lesson[] = [];
  for (const l of [...confusable, ...sameCategory, ...anywhere]) {
    if (picked.length >= n) break;
    if (!picked.includes(l)) picked.push(l);
  }
  return picked;
}

export type QuizItem =
  | { kind: 'move'; lessonId: string; positionKey: string; puzzle: Puzzle }
  | { kind: 'name'; lessonId: string; positionKey: string; puzzle: Puzzle; choices: string[]; answer: number }
  | { kind: 'idea'; lessonId: string; text: string; choices: string[]; answer: number }
  | { kind: 'concept'; lessonId: string; question: Question };

function choicesFor(lesson: Lesson, rand: () => number): { choices: string[]; answer: number } {
  const options = shuffle([lesson, ...distractors(lesson.id, 3, rand)], rand);
  return { choices: options.map((l) => l.id), answer: options.indexOf(lesson) };
}

export function makeItem(lesson: Lesson, kind: QuizItem['kind'], rand: () => number): QuizItem {
  const p = Math.floor(rand() * lesson.puzzles.length);
  const positionKey = `${lesson.id}:p${p}`;
  const puzzle = lesson.puzzles[p];
  switch (kind) {
    case 'move':
      return { kind, lessonId: lesson.id, positionKey, puzzle };
    case 'name':
      if (NOT_NAMEABLE.has(lesson.id)) return makeItem(lesson, 'idea', rand);
      return { kind, lessonId: lesson.id, positionKey, puzzle, ...choicesFor(lesson, rand) };
    case 'idea':
      return { kind, lessonId: lesson.id, text: lesson.bigIdea, ...choicesFor(lesson, rand) };
    case 'concept':
      return { kind, lessonId: lesson.id, question: lesson.check };
  }
}

export type QuizMode = 'mixed' | 'name' | 'move' | 'review';

export interface BuildOptions {
  mode: QuizMode;
  /** Lessons to draw from (for review: the due lessons). */
  lessonIds: string[];
  size: number;
  /** Lessons that still need a "find the move" success for mastery. */
  needsMove?: Set<string>;
  seed?: number;
}

/**
 * Build an interleaved quiz: lessons are shuffled so neighbouring questions
 * come from different strategies, which trains choosing the right one.
 */
export function buildQuiz(opts: BuildOptions): QuizItem[] {
  const rand = rng(opts.seed ?? Date.now());
  const pool = opts.lessonIds.map((id) => lessonById(id)!).filter(Boolean);
  if (pool.length === 0) return [];
  const items: QuizItem[] = [];
  let order = shuffle(pool, rand);
  let i = 0;
  while (items.length < opts.size) {
    if (i >= order.length) {
      // Start another round, avoiding the same lesson twice in a row.
      const last = order[order.length - 1];
      order = shuffle(pool, rand);
      if (order.length > 1 && order[0] === last) order.push(order.shift()!);
      i = 0;
      if (opts.mode === 'review') break; // review asks once per due lesson
    }
    const lesson = order[i++];
    items.push(makeItem(lesson, pickKind(opts, lesson, rand), rand));
  }
  return items;
}

function pickKind(opts: BuildOptions, lesson: Lesson, rand: () => number): QuizItem['kind'] {
  if (opts.mode === 'name') return 'name';
  if (opts.mode === 'move') return 'move';
  if (opts.needsMove?.has(lesson.id)) return 'move';
  const r = rand();
  if (r < 0.45) return 'move';
  if (r < 0.75) return 'name';
  if (r < 0.9) return 'idea';
  return 'concept';
}

export function lessonsInCategories(categories: CategoryId[]): string[] {
  return LESSONS.filter((l) => categories.includes(l.category)).map((l) => l.id);
}
