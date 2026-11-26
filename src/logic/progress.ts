/**
 * Spaced-repetition progress (Leitner boxes) and mastery rules.
 *
 * Box 0 = not started. Boxes 1..6 review after INTERVAL_DAYS[box] days.
 * - A correct answer (with fewer than 2 hints) moves the lesson up one box,
 *   at most once per day, so mastery needs spaced success.
 * - A wrong answer moves it down one box (never below 1) and makes it due today.
 * - Mastered = box 5 or higher, at least 2 different positions solved, and at
 *   least one "find the move" answer.
 * - A named opening is mastered at box 5 or higher once it has been solved from
 *   both sides of the board (a main puzzle and the "Meeting it" puzzle) and its
 *   plan question has been answered.
 * - Daily Review only includes openings in the learner's repertoire, and at most
 *   OPENING_REVIEW_CAP of them, so openings never crowd out the core.
 * All functions are pure; callers pass `today` as a day number.
 */

import type { RepertoireSlot } from '../data/types';

export type { RepertoireSlot };

export const INTERVAL_DAYS = [0, 0, 1, 3, 7, 16, 35] as const;
export const MAX_BOX = 6;
export const MASTERY_BOX = 5;
export const REVIEW_CAP = 12;
export const WEEKLY_GOAL = 30;
export const OPENING_REVIEW_CAP = 3;

export type ItemType = 'move' | 'name' | 'idea' | 'concept' | 'explain';

export interface LessonProgress {
  box: number;
  due: number;
  lastPromotedDay: number;
  /** Distinct position keys (e.g. "fork:p0") answered correctly. */
  positions: string[];
  movesSolved: number;
  correct: number;
  wrong: number;
  lessonDone: boolean;
}

export interface Settings {
  audio: boolean;
  voiceURI: string | null;
  rate: number;
  board3d: boolean;
  /** When audio is on, show only a short caption unless expanded. */
  shortCaptions: boolean;
  sound: boolean;
}

/** The learner's chosen openings: one lesson id per slot. */
export type Repertoire = Record<RepertoireSlot, string | null>;

export interface ProgressState {
  version: 1;
  lessons: Record<string, LessonProgress>;
  repertoire: Repertoire;
  week: { start: number; count: number };
  settings: Settings;
}

export interface Answer {
  correct: boolean;
  type: ItemType;
  /** Position key such as "fork:p1"; omit for non-position items. */
  positionKey?: string;
  hintsUsed: number;
}

export const DEFAULT_SETTINGS: Settings = {
  audio: false,
  voiceURI: null,
  rate: 0.9,
  board3d: false,
  shortCaptions: true,
  sound: true,
};

export function emptyState(today: number): ProgressState {
  return {
    version: 1,
    lessons: {},
    repertoire: { white: null, e4: null, d4: null },
    week: { start: weekStart(today), count: 0 },
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Local calendar day number (days since 1970-01-01 in local time). */
export function dayNumber(date = new Date()): number {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000);
}

/** Day number of the Monday that starts the week containing `day`. */
export function weekStart(day: number): number {
  // Day 0 (1970-01-01) was a Thursday; Monday-based weekday index:
  const weekday = (day + 3) % 7;
  return day - weekday;
}

function blank(): LessonProgress {
  return { box: 0, due: 0, lastPromotedDay: -1, positions: [], movesSolved: 0, correct: 0, wrong: 0, lessonDone: false };
}

export function getLesson(state: ProgressState, id: string): LessonProgress {
  return state.lessons[id] ?? blank();
}

function withLesson(state: ProgressState, id: string, lp: LessonProgress): ProgressState {
  return { ...state, lessons: { ...state.lessons, [id]: lp } };
}

/** Called when the learner finishes the lesson flow: enters the review schedule. */
export function completeLesson(state: ProgressState, id: string, today: number): ProgressState {
  const lp = getLesson(state, id);
  const next: LessonProgress = { ...lp, lessonDone: true };
  if (next.box === 0) {
    next.box = 1;
    next.due = today + INTERVAL_DAYS[1];
  }
  return withLesson(state, id, next);
}

export function countsAsCorrect(answer: Answer): boolean {
  return answer.correct && answer.hintsUsed < 2;
}

export function recordAnswer(state: ProgressState, id: string, answer: Answer, today: number): ProgressState {
  const lp = { ...getLesson(state, id), positions: [...getLesson(state, id).positions] };
  if (lp.box === 0) lp.box = 1;

  if (countsAsCorrect(answer)) {
    lp.correct += 1;
    if (answer.positionKey && !lp.positions.includes(answer.positionKey)) lp.positions.push(answer.positionKey);
    if (answer.type === 'move') lp.movesSolved += 1;
    if (lp.lastPromotedDay !== today && lp.box < MAX_BOX) {
      lp.box += 1;
      lp.lastPromotedDay = today;
    }
    lp.due = today + INTERVAL_DAYS[lp.box];
  } else {
    lp.wrong += 1;
    lp.box = Math.max(1, lp.box - 1);
    lp.due = today;
  }

  const week = state.week.start === weekStart(today) ? { ...state.week } : { start: weekStart(today), count: 0 };
  week.count += 1;
  return { ...withLesson(state, id, lp), week };
}

export type LessonKind = 'core' | 'opening';

export function isMastered(lp: LessonProgress, kind: LessonKind = 'core'): boolean {
  if (kind === 'opening') {
    return (
      lp.box >= MASTERY_BOX &&
      lp.positions.some((k) => /:p\d+$/.test(k)) &&
      lp.positions.some((k) => k.endsWith(':m0')) &&
      lp.positions.some((k) => k.endsWith(':plan'))
    );
  }
  return lp.box >= MASTERY_BOX && lp.positions.length >= 2 && lp.movesSolved >= 1;
}

export type Status = 'new' | 'learning' | 'mastered';

export function status(lp: LessonProgress, kind: LessonKind = 'core'): Status {
  if (isMastered(lp, kind)) return 'mastered';
  if (lp.box > 0 || lp.lessonDone) return 'learning';
  return 'new';
}

export interface DueOptions {
  cap?: number;
  /** Ids of named-opening lessons; these are reviewed only if in the repertoire. */
  openingIds?: Set<string>;
  openingCap?: number;
}

/** Lessons due for review today, most overdue first, capped. */
export function dueLessons(state: ProgressState, today: number, options: DueOptions = {}): string[] {
  const { cap = REVIEW_CAP, openingIds = new Set<string>(), openingCap = OPENING_REVIEW_CAP } = options;
  const chosen = new Set(Object.values(state.repertoire ?? {}).filter((id): id is string => !!id));
  let openings = 0;
  const out: string[] = [];
  const sorted = Object.entries(state.lessons)
    .filter(([, lp]) => lp.box >= 1 && lp.due <= today)
    .sort(([, a], [, b]) => a.due - b.due || a.box - b.box);
  for (const [id] of sorted) {
    if (out.length >= cap) break;
    if (openingIds.has(id)) {
      if (!chosen.has(id) || openings >= openingCap) continue;
      openings += 1;
    }
    out.push(id);
  }
  return out;
}

export function weeklyCount(state: ProgressState, today: number): number {
  return state.week.start === weekStart(today) ? state.week.count : 0;
}

// ---- storage -------------------------------------------------------------

const KEY = 'chess-explainer:v1';

export function load(today: number, storage: Storage | undefined = globalThis.localStorage): ProgressState {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return emptyState(today);
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed.version !== 1) return emptyState(today);
    const empty = emptyState(today);
    return {
      ...empty,
      ...parsed,
      repertoire: { ...empty.repertoire, ...parsed.repertoire },
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return emptyState(today);
  }
}

export function save(state: ProgressState, storage: Storage | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): progress just won't persist.
  }
}
