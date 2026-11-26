import type { Category, CategoryId, Lesson, RepertoireSlot } from './types';
import { thinking } from './lessons/thinking';
import { opening } from './lessons/opening';
import { tactics } from './lessons/tactics';
import { mates } from './lessons/mates';
import { middlegame } from './lessons/middlegame';
import { endgame } from './lessons/endgame';
import { openings } from './lessons/openings';

export type * from './types';

export const CATEGORIES: Category[] = [
  { id: 'thinking', title: 'Thinking Habits', blurb: 'The checklist strong players use on every move.', icon: 'k', hue: 300 },
  { id: 'opening', title: 'Opening Principles', blurb: 'Start the game the smart way.', icon: 'p', hue: 150 },
  { id: 'tactics', title: 'Tactics', blurb: 'Short, sharp tricks that win material.', icon: 'n', hue: 25 },
  { id: 'mates', title: 'Checkmate Patterns', blurb: 'Famous ways to trap the king.', icon: 'q', hue: 350 },
  { id: 'middlegame', title: 'Middlegame Strategy', blurb: 'Long-term plans and good squares.', icon: 'b', hue: 250 },
  { id: 'endgame', title: 'Endgames', blurb: 'Win when only a few pieces are left.', icon: 'r', hue: 75 },
];

/** The separate, optional Openings section. Not part of the Core Path or core mastery. */
export const OPENINGS_CATEGORY: Category = {
  id: 'openings',
  title: 'Named Openings',
  blurb: 'Famous openings as ideas and plans, and how to meet them.',
  icon: 'p',
  hue: 195,
};

/** Lessons on the Core Path (the six core categories). */
export const CORE_LESSONS: Lesson[] = [...thinking, ...opening, ...tactics, ...mates, ...middlegame, ...endgame];

/** Named-opening lessons. */
export const OPENING_LESSONS: Lesson[] = openings;

export const OPENING_IDS: Set<string> = new Set(openings.map((l) => l.id));

export const LESSONS: Lesson[] = [...CORE_LESSONS, ...OPENING_LESSONS];

const BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

export function lessonById(id: string): Lesson | undefined {
  return BY_ID.get(id);
}

export function lessonsIn(category: CategoryId): Lesson[] {
  return LESSONS.filter((l) => l.category === category);
}

export function categoryById(id: CategoryId): Category {
  return id === 'openings' ? OPENINGS_CATEGORY : CATEGORIES.find((c) => c.id === id)!;
}

export function isOpening(id: string): boolean {
  return lessonById(id)?.category === 'openings';
}

/** Suggested Core Path stage after which each opening tier is worth starting. */
export const TIER_AFTER_STAGE: Record<1 | 2 | 3, number> = { 1: 2, 2: 4, 3: 5 };

export const TIER_NAMES: Record<1 | 2 | 3, string> = { 1: 'Starter', 2: 'Club', 3: 'Recognise first' };

export const SLOT_NAMES: Record<RepertoireSlot, string> = {
  white: 'When I play White',
  e4: 'When White opens with the king pawn (e4)',
  d4: 'When White opens with the queen pawn (d4)',
};

/** Lesson ids that can fill a repertoire slot, with the label to show for each. */
export function repertoireOptions(slot: RepertoireSlot): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const l of OPENING_LESSONS) {
    if (l.opening!.slot === slot) out.push({ id: l.id, label: l.title });
    else if (l.opening!.meeting.slot === slot) out.push({ id: l.id, label: l.opening!.meeting.title });
  }
  return out;
}

/** A starter repertoire, from the education review. */
export const STARTER_KIT: Record<RepertoireSlot, string> = { white: 'italian', e4: 'italian', d4: 'queens-gambit' };

/**
 * Groups of strategies that look alike. Quizzes draw wrong answers from the
 * same group so the learner has to tell similar ideas apart.
 */
export const CONFUSABLE: string[][] = [
  ['fork', 'pin', 'skewer', 'discovered-attack'],
  ['discovered-attack', 'discovered-check', 'double-check'],
  ['remove-defender', 'deflection', 'decoy', 'overloading'],
  ['in-between', 'remove-defender', 'trapped-piece', 'values'],
  ['back-rank', 'ladder', 'rook-mate', 'anastasia'],
  ['smothered', 'arabian', 'anastasia', 'boden'],
  ['early-mates', 'legal', 'greek-gift', 'queen-early'],
  ['queen-mate', 'stalemate', 'rook-mate', 'perpetual'],
  ['center', 'develop', 'castle', 'connect-rooks', 'fianchetto'],
  ['outpost', 'weak-squares', 'bad-bishop', 'bishop-pair'],
  ['iqp', 'doubled-pawns', 'passed-pawn', 'pawn-storm'],
  ['open-file', 'seventh-rank', 'connect-rooks'],
  ['opposition', 'square', 'king-activity', 'trade-ahead'],
  ['lucena', 'philidor', 'perpetual'],
  ['cct', 'prophylaxis', 'values'],
  ['meet-threat', 'escape-check', 'cct'],
  ['perpetual', 'stalemate-trick', 'philidor'],
  ['blockade', 'passed-pawn', 'outpost'],
  ['break-pin', 'pin', 'skewer'],
  ['trade-attackers', 'trade-ahead', 'prophylaxis'],
  // Named openings
  ['italian', 'ruy-lopez', 'scotch'],
  ['french', 'caro-kann', 'scandinavian'],
  ['queens-gambit', 'london', 'kings-indian'],
  ['english', 'sicilian'],
];

/**
 * Recommended learning path, in stages that mix categories (from the education
 * review). Free choice by category is always available too.
 */
export const PATH: { title: string; ids: string[] }[] = [
  { title: 'Stage 1 · Safe starts', ids: ['values', 'cct', 'meet-threat', 'center', 'develop', 'castle', 'queen-early', 'early-mates'] },
  { title: 'Stage 2 · First wins', ids: ['escape-check', 'back-rank', 'ladder', 'queen-mate', 'rook-mate', 'stalemate', 'fork', 'pin', 'skewer', 'trapped-piece'] },
  { title: 'Stage 3 · Hidden attacks', ids: ['discovered-attack', 'discovered-check', 'double-check', 'remove-defender', 'break-pin', 'king-activity', 'square', 'trade-ahead'] },
  { title: 'Stage 4 · Combinations', ids: ['deflection', 'decoy', 'overloading', 'smothered', 'arabian', 'anastasia', 'boden', 'legal', 'opposition', 'perpetual', 'stalemate-trick', 'trade-attackers'] },
  { title: 'Stage 5 · Plans', ids: ['connect-rooks', 'open-file', 'seventh-rank', 'outpost', 'passed-pawn', 'blockade', 'doubled-pawns', 'bishop-pair', 'fianchetto'] },
  { title: 'Stage 6 · Advanced', ids: ['in-between', 'greek-gift', 'bad-bishop', 'weak-squares', 'iqp', 'prophylaxis', 'pawn-storm', 'lucena', 'philidor'] },
];
