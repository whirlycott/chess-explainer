/**
 * Spaced-repetition progress (Leitner boxes) and mastery rules.
 *
 * Box 0 = not started. Boxes 1..6 review after INTERVAL_DAYS[box] days.
 * - A correct answer (with fewer than 2 hints) moves the lesson up one box,
 *   at most once per day, so mastery needs spaced success.
 * - A wrong answer moves it down one box (never below 1) and makes it due today.
 * - Mastered = box 5 or higher, at least 2 different positions solved, and at
 *   least one "find the move" answer.
 * All functions are pure; callers pass `today` as a day number.
 */

export const INTERVAL_DAYS = [0, 0, 1, 3, 7, 16, 35] as const;
export const MAX_BOX = 6;
export const MASTERY_BOX = 5;
export const REVIEW_CAP = 12;
export const WEEKLY_GOAL = 30;

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

export interface ProgressState {
  version: 1;
  lessons: Record<string, LessonProgress>;
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
  return { version: 1, lessons: {}, week: { start: weekStart(today), count: 0 }, settings: { ...DEFAULT_SETTINGS } };
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

export function isMastered(lp: LessonProgress): boolean {
  return lp.box >= MASTERY_BOX && lp.positions.length >= 2 && lp.movesSolved >= 1;
}

export type Status = 'new' | 'learning' | 'mastered';

export function status(lp: LessonProgress): Status {
  if (isMastered(lp)) return 'mastered';
  if (lp.box > 0 || lp.lessonDone) return 'learning';
  return 'new';
}

/** Lessons due for review today, most overdue first, capped. */
export function dueLessons(state: ProgressState, today: number, cap = REVIEW_CAP): string[] {
  return Object.entries(state.lessons)
    .filter(([, lp]) => lp.box >= 1 && lp.due <= today)
    .sort(([, a], [, b]) => a.due - b.due || a.box - b.box)
    .slice(0, cap)
    .map(([id]) => id);
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
    return { ...emptyState(today), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
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
