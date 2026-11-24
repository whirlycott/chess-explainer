import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { Chess } from 'chess.js';
import type { Puzzle } from '../data/types';
import { resolveStart } from '../logic/position';
import { expectedMove, judgeMove } from '../logic/puzzle';
import type { BoardMoveDetail } from './chess-board';
import { shared } from './shared';
import { narrate, playSfx } from './store';
import './board-view';

export interface PuzzleDoneDetail {
  /** Solved with no wrong moves. */
  correct: boolean;
  hintsUsed: number;
  mistakes: number;
  revealed: boolean;
}

type Status = 'play' | 'reply' | 'retry' | 'solved' | 'revealed';

const DELAY = 520;

/**
 * Runs one puzzle: the learner plays moves on the board, the opponent's
 * replies are played automatically. One retry after a wrong move, then the
 * solution is shown.
 */
export class PuzzleRunner extends LitElement {
  static properties = {
    puzzle: { type: Object },
    /** Hide the strategy-specific prompt (quiz mode); it becomes the first hint. */
    hidePrompt: { type: Boolean },
    praise: { type: String },
    _fen: { state: true },
    _last: { state: true },
    _status: { state: true },
    _hints: { state: true },
    _note: { state: true },
  };

  declare puzzle: Puzzle;
  declare hidePrompt: boolean;
  declare praise: string;
  declare _fen: string;
  declare _last: [string, string] | null;
  declare _status: Status;
  declare _hints: number;
  declare _note: string;

  private played: string[] = [];
  private mistakes = 0;
  private side: 'white' | 'black' = 'white';
  private timers: number[] = [];

  constructor() {
    super();
    this.hidePrompt = false;
    this.praise = '';
    this._fen = new Chess().fen();
    this._last = null;
    this._status = 'play';
    this._hints = 0;
    this._note = '';
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.timers.forEach(clearTimeout);
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('puzzle') && this.puzzle) this.start();
  }

  private start(): void {
    this.timers.forEach(clearTimeout);
    const g = resolveStart(this.puzzle);
    this._fen = g.fen();
    this.side = g.turn() === 'w' ? 'white' : 'black';
    this._last = null;
    this._status = 'play';
    this._hints = 0;
    this._note = '';
    this.played = [];
    this.mistakes = 0;
    narrate(this.promptText());
  }

  private promptText(): string {
    const who = this.side === 'white' ? 'White' : 'Black';
    return this.hidePrompt ? `${who} to move. Find the best move!` : this.puzzle.prompt;
  }

  private hintList(): string[] {
    return this.hidePrompt ? [this.puzzle.prompt, ...this.puzzle.hints] : this.puzzle.hints;
  }

  private later(fn: () => void, ms = DELAY): void {
    this.timers.push(window.setTimeout(fn, ms));
  }

  private play(san: string): { from: string; to: string; captured: boolean } {
    const g = new Chess(this._fen);
    const m = g.move(san);
    this._fen = g.fen();
    this._last = [m.from, m.to];
    this.played = [...this.played, m.san];
    playSfx(m.captured ? 'capture' : 'move');
    return { from: m.from, to: m.to, captured: !!m.captured };
  }

  private onMove(e: CustomEvent<BoardMoveDetail>): void {
    if (this._status !== 'play' && this._status !== 'retry') return;
    const before = this._fen;
    const prevLast = this._last;
    const verdict = judgeMove(this.puzzle, this.played, before, e.detail.san);
    if (verdict.result === 'wrong') {
      this.mistakes += 1;
      playSfx('oops');
      // Show the wrong move briefly, then take it back.
      const g = new Chess(before);
      const m = g.move(e.detail.san);
      this._fen = g.fen();
      this._last = [m.from, m.to];
      if (this.mistakes >= 2) {
        this._note = 'Here is the solution. Watch closely, then try the next one!';
        this._status = 'revealed';
        this.later(() => {
          this._fen = before;
          this._last = prevLast;
          this.reveal();
        });
      } else {
        const clue = this.hintList()[0];
        this._note = `Not quite. Clue: ${clue}`;
        narrate(this._note);
        this._status = 'reply';
        this.later(() => {
          this._fen = before;
          this._last = prevLast;
          this._status = 'retry';
        });
      }
      return;
    }
    this.play(e.detail.san);
    if (verdict.result === 'solved') return this.solved();
    this._status = 'reply';
    this.later(() => {
      this.play(verdict.reply);
      this._status = this.mistakes > 0 ? 'retry' : 'play';
    });
  }

  private solved(): void {
    this._status = 'solved';
    playSfx('success');
    const head = this.mistakes === 0 ? this.praise || 'Nice work!' : 'You got it on the second try.';
    this._note = `${head} ${this.puzzle.explanation}`;
    narrate(this._note);
    this.done(false);
  }

  private reveal(): void {
    const next = expectedMove(this.puzzle, this.played);
    if (!next) {
      narrate(this.puzzle.explanation);
      this._note = `${this._note} ${this.puzzle.explanation}`;
      return this.done(true);
    }
    this._status = 'revealed';
    this.play(next);
    this.later(() => this.reveal(), 800);
  }

  private done(revealed: boolean): void {
    this.dispatchEvent(
      new CustomEvent<PuzzleDoneDetail>('puzzle-done', {
        detail: { correct: !revealed && this.mistakes === 0, hintsUsed: this._hints, mistakes: this.mistakes, revealed },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private hint(): void {
    const list = this.hintList();
    if (this._hints < list.length) {
      this._hints += 1;
      narrate(list[this._hints - 1]);
    }
  }

  private showMe(): void {
    this._hints = Math.max(this._hints, 2);
    this.mistakes = Math.max(this.mistakes, 1);
    this._note = 'Here is the solution.';
    this.reveal();
  }

  /** Highlight the piece to move once the learner has used every hint. */
  private hintSquares(): string[] {
    if (this._hints < this.hintList().length) return [];
    const next = expectedMove(this.puzzle, this.played);
    if (!next) return [];
    const m = new Chess(this._fen).move(next);
    return [m.from];
  }

  render() {
    if (!this.puzzle) return nothing;
    const live = this._status === 'play' || this._status === 'retry';
    const hints = this.hintList();
    return html`
      <div class="wrap">
        <div class="board">
          <board-view
            .fen=${this._fen}
            .orientation=${this.side}
            .lastMove=${this._last}
            .highlights=${this.hintSquares()}
            .interactive=${live}
            .label=${`Puzzle board. ${this.side === 'white' ? 'White' : 'Black'} to move.`}
            @board-move=${this.onMove}
          ></board-view>
        </div>
        <div class="panel card">
          <div class="turn"><span class="dot ${this.side}"></span>You play ${this.side === 'white' ? 'White' : 'Black'}</div>
          <p class="prompt">${this.promptText()}</p>
          ${this._hints > 0
            ? html`<ol class="hints">${hints.slice(0, this._hints).map((h) => html`<li>${h}</li>`)}</ol>`
            : nothing}
          <div class="note ${this._status}" aria-live="polite">${this._note}</div>
          ${live
            ? html`<div class="row">
                <button class="btn ghost" @click=${this.hint} ?disabled=${this._hints >= hints.length}>
                  Hint ${this._hints > 0 ? `(${this._hints}/${hints.length})` : ''}
                </button>
                <button class="btn ghost" @click=${this.showMe}>Show me</button>
              </div>
              <p class="muted small">Click or drag a piece to move it.</p>`
            : nothing}
        </div>
      </div>
    `;
  }

  static styles = [
    shared,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }
      .wrap {
        display: grid;
        gap: 1.2rem;
        grid-template-columns: minmax(0, 1fr);
      }
      @container (min-width: 760px) {
        .wrap {
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
          align-items: start;
        }
      }
      .board {
        max-width: min(620px, calc(100dvh - 230px));
        width: 100%;
        margin-inline: auto;
      }
      .panel {
        padding: 1.2rem 1.3rem;
      }
      .turn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted);
        margin-bottom: 0.6rem;
      }
      .dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid var(--line);
      }
      .dot.white {
        background: #f3ead8;
      }
      .dot.black {
        background: #23262f;
      }
      .prompt {
        font-size: 1.2rem;
        font-weight: 650;
      }
      .hints {
        padding-left: 1.2rem;
        color: var(--accent-2);
        line-height: 1.5;
      }
      .note:not(:empty) {
        margin: 0.8rem 0;
        padding: 0.8rem 1rem;
        border-radius: 12px;
        background: var(--glass-strong);
        border-left: 4px solid var(--accent);
        line-height: 1.5;
      }
      .note.solved {
        border-color: var(--good);
      }
      .note.retry,
      .note.reply {
        border-color: var(--warn);
      }
      .row {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
      .small {
        font-size: 0.85rem;
        margin-top: 0.8rem;
      }
    `,
  ];
}

customElements.define('puzzle-runner', PuzzleRunner);
