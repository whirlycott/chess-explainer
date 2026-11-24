export type CategoryId = 'thinking' | 'opening' | 'tactics' | 'mates' | 'middlegame' | 'endgame';

export type Level = 1 | 2 | 3; // 1 = beginner, 2 = intermediate, 3 = advanced

/** An arrow drawn on the board: from-square, to-square, optional colour key. */
export type Arrow = [from: string, to: string, color?: ArrowColor];
export type ArrowColor = 'green' | 'red' | 'blue' | 'yellow';

export interface Step {
  /** Move played at this step, in SAN. Omit for a commentary-only step. */
  san?: string;
  /**
   * Narration for this step in plain words (no chess notation, so it reads
   * well aloud). The move itself is shown and spoken separately from `san`.
   */
  say: string;
  arrows?: Arrow[];
  /** Squares to highlight (e.g. the target, the weak square). */
  highlights?: string[];
  /**
   * Prediction step: before the move is shown the learner is asked to try it on
   * the board, with this question. Only valid when `san` is set.
   */
  predict?: string;
  /** Other moves that are equally good answers to the prediction. */
  alsoGood?: string[];
}

/**
 * A position is given either as a FEN, or as SAN moves played from the
 * standard start position (`setup`), or both (moves played from the FEN).
 */
export interface PositionSource {
  fen?: string;
  setup?: string;
}

export interface Walkthrough extends PositionSource {
  orientation?: 'white' | 'black';
  steps: Step[];
}

export interface Puzzle extends PositionSource {
  /** What the learner is asked to do. */
  prompt: string;
  /**
   * Accepted solution lines, each a list of SAN moves. Even indices (0, 2, ...)
   * are the learner's moves; odd indices are the opponent's automatic replies.
   * The first line is the main line. When a line ends in checkmate, any
   * mating move is accepted for that final move.
   */
  lines: string[][];
  /** Hints shown one at a time, from gentle to specific. */
  hints: string[];
  /** Shown after the puzzle is solved. */
  explanation: string;
  orientation?: 'white' | 'black';
  /**
   * 'tactic': the solution should be the engine's best move.
   * 'plan': a good principled move; the engine only checks it is not a mistake.
   */
  kind?: 'tactic' | 'plan';
}

export interface Question {
  q: string;
  choices: string[];
  answer: number;
  why: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Short alternative name or fun fact shown under the title. */
  aka?: string;
  category: CategoryId;
  level: Level;
  /** One-sentence big idea. */
  bigIdea: string;
  /** Concrete board cues that signal this strategy is available. */
  cues: string[];
  walkthrough: Walkthrough;
  /** Menu-based self-explanation: "Why does this work?" */
  explain: Question;
  /** The most common mistake learners make. */
  mistake: string;
  /** Practice positions, easiest first. */
  puzzles: Puzzle[];
  check: Question;
}

export interface Category {
  id: CategoryId;
  title: string;
  blurb: string;
  icon: 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
  hue: number; // oklch hue for theming
}
