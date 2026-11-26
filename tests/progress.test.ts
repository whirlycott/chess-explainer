import { describe, expect, it } from 'vitest';
import {
  completeLesson,
  dueLessons,
  emptyState,
  getLesson,
  isMastered,
  load,
  recordAnswer,
  save,
  status,
  weeklyCount,
  weekStart,
  type Answer,
} from '../src/logic/progress';

const move = (key: string, correct = true, hintsUsed = 0): Answer => ({ correct, type: 'move', positionKey: key, hintsUsed });

describe('progress', () => {
  it('enters box 1 when a lesson is completed', () => {
    const s = completeLesson(emptyState(100), 'fork', 100);
    expect(getLesson(s, 'fork').box).toBe(1);
    expect(dueLessons(s, 100)).toEqual(['fork']);
  });

  it('promotes at most once per day', () => {
    let s = completeLesson(emptyState(100), 'fork', 100);
    s = recordAnswer(s, 'fork', move('fork:p0'), 100);
    s = recordAnswer(s, 'fork', move('fork:p1'), 100);
    expect(getLesson(s, 'fork').box).toBe(2);
    expect(getLesson(s, 'fork').due).toBe(101);
  });

  it('drops one box (not to the start) on a wrong answer and makes it due today', () => {
    let s = completeLesson(emptyState(100), 'fork', 100);
    for (let d = 100; d < 104; d++) s = recordAnswer(s, 'fork', move('fork:p0'), d);
    expect(getLesson(s, 'fork').box).toBe(5);
    s = recordAnswer(s, 'fork', move('fork:p0', false), 110);
    expect(getLesson(s, 'fork').box).toBe(4);
    expect(getLesson(s, 'fork').due).toBe(110);
  });

  it('does not count answers that needed two or more hints', () => {
    let s = completeLesson(emptyState(100), 'fork', 100);
    s = recordAnswer(s, 'fork', move('fork:p0', true, 2), 100);
    expect(getLesson(s, 'fork').box).toBe(1);
    expect(getLesson(s, 'fork').positions).toEqual([]);
  });

  it('requires box 5, two positions and a find-the-move answer for mastery', () => {
    let s = completeLesson(emptyState(100), 'fork', 100);
    for (let d = 100; d < 104; d++) s = recordAnswer(s, 'fork', move('fork:p0'), d);
    expect(getLesson(s, 'fork').box).toBe(5);
    expect(isMastered(getLesson(s, 'fork'))).toBe(false); // only one position
    s = recordAnswer(s, 'fork', { correct: true, type: 'name', positionKey: 'fork:p1', hintsUsed: 0 }, 120);
    expect(isMastered(getLesson(s, 'fork'))).toBe(true);
  });

  it('caps the daily review and sorts by most overdue', () => {
    let s = emptyState(100);
    for (let i = 0; i < 20; i++) s = completeLesson(s, `l${i}`, 90 + i);
    const due = dueLessons(s, 200);
    expect(due).toHaveLength(12);
    expect(due[0]).toBe('l0');
  });

  it('counts answers per week and resets on a new week', () => {
    let s = emptyState(100);
    s = recordAnswer(s, 'fork', move('fork:p0'), 100);
    s = recordAnswer(s, 'fork', move('fork:p0'), 100);
    expect(weeklyCount(s, 100)).toBe(2);
    const nextWeek = weekStart(100) + 7;
    expect(weeklyCount(s, nextWeek)).toBe(0);
    s = recordAnswer(s, 'fork', move('fork:p0'), nextWeek);
    expect(weeklyCount(s, nextWeek)).toBe(1);
  });

  it('weeks start on Monday', () => {
    // 2026-11-23 is a Monday.
    const monday = Math.floor(Date.UTC(2026, 10, 23) / 86_400_000);
    expect(weekStart(monday)).toBe(monday);
    expect(weekStart(monday + 6)).toBe(monday);
  });

  it('round-trips through storage and survives bad data', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    } as unknown as Storage;
    const s = completeLesson(emptyState(100), 'pin', 100);
    save(s, storage);
    expect(getLesson(load(100, storage), 'pin').box).toBe(1);
    store.set('chess-explainer:v1', '{not json');
    expect(load(100, storage).lessons).toEqual({});
  });
});

describe('named openings', () => {
  const T = 1000;
  const openingIds = new Set(['italian', 'london', 'french', 'sicilian', 'scotch']);

  function climb(id: string, keys: string[]): ReturnType<typeof emptyState> {
    let s = emptyState(T);
    s = completeLesson(s, id, T);
    let day = T;
    for (let i = 0; i < 6; i++) {
      for (const key of keys) s = recordAnswer(s, id, { correct: true, type: 'move', positionKey: key, hintsUsed: 0 }, day);
      day += 40;
    }
    return s;
  }

  it('needs both sides of the board and the plan question to master an opening', () => {
    expect(isMastered(getLesson(climb('italian', ['italian:p0', 'italian:p1']), 'italian'), 'opening')).toBe(false);
    expect(isMastered(getLesson(climb('italian', ['italian:p0', 'italian:m0']), 'italian'), 'opening')).toBe(false);
    const all = getLesson(climb('italian', ['italian:p0', 'italian:m0', 'italian:plan']), 'italian');
    expect(isMastered(all, 'opening')).toBe(true);
    expect(status(all, 'opening')).toBe('mastered');
  });

  it('only reviews openings in the repertoire, at most three a day', () => {
    let s = emptyState(T);
    for (const id of ['fork', 'pin', ...openingIds]) s = completeLesson(s, id, T);
    expect(dueLessons(s, T, { openingIds })).toEqual(['fork', 'pin']);
    s = { ...s, repertoire: { white: 'italian', e4: 'french', d4: 'london' } };
    s = completeLesson(s, 'sicilian', T);
    const due = dueLessons(s, T, { openingIds });
    expect(due.filter((id) => openingIds.has(id)).sort()).toEqual(['french', 'italian', 'london']);
    expect(due).toContain('fork');
    expect(due).not.toContain('sicilian');
  });

  it('respects a custom cap on opening items', () => {
    let s = emptyState(T);
    const ids = ['a', 'b', 'c', 'd'];
    for (const id of ids) s = completeLesson(s, id, T);
    s = { ...s, repertoire: { white: 'a', e4: 'b', d4: 'c' } };
    const due = dueLessons(s, T, { openingIds: new Set(ids), openingCap: 2 });
    expect(due).toHaveLength(2);
  });

  it('starts with an empty repertoire and keeps one through save and load', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    } as unknown as Storage;
    expect(load(T, storage).repertoire).toEqual({ white: null, e4: null, d4: null });
    save({ ...emptyState(T), repertoire: { white: 'london', e4: null, d4: 'queens-gambit' } }, storage);
    expect(load(T, storage).repertoire).toEqual({ white: 'london', e4: null, d4: 'queens-gambit' });
  });
});
