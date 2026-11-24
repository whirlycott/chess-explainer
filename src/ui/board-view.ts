import { LitElement, css, html, nothing } from 'lit';
import { Chess } from 'chess.js';
import type { Arrow } from '../data/types';
import type { BoardMoveDetail } from './chess-board';
import { StoreController, store } from './store';
import './chess-board';

let loaded3d: Promise<boolean> | null = null;

/** Load the 3D board on first use (keeps three.js out of the main bundle). */
function load3d(): Promise<boolean> {
  loaded3d ??= import('./board3d').then((m) => m.ChessBoard3D.supported()).catch(() => false);
  return loaded3d;
}

/** Shows the 2D board, or the 3D board when the learner has switched it on. */
export class BoardView extends LitElement {
  static properties = {
    fen: { type: String },
    orientation: { type: String },
    arrows: { type: Array },
    highlights: { type: Array },
    lastMove: { type: Array },
    interactive: { type: Boolean },
    label: { type: String },
    _ready3d: { state: true },
    _typed: { state: true },
  };

  declare fen: string;
  declare orientation: 'white' | 'black';
  declare arrows: Arrow[];
  declare highlights: string[];
  declare lastMove: [string, string] | null;
  declare interactive: boolean;
  declare label: string;
  declare _ready3d: boolean;
  declare _typed: string;

  protected readonly _store = new StoreController(this);

  constructor() {
    super();
    this.orientation = 'white';
    this.arrows = [];
    this.highlights = [];
    this.lastMove = null;
    this.interactive = false;
    this.label = 'Chess board';
    this._ready3d = false;
    this._typed = '';
  }

  /** Accept a typed move like "Nf3", "e2 e4" or "e2-e4" (keyboard and screen-reader friendly). */
  private submitTyped(e: Event): void {
    e.preventDefault();
    const text = this._typed.trim();
    if (!text) return;
    const g = new Chess(this.fen);
    const coords = text.toLowerCase().match(/^([a-h][1-8])\s*(?:-|to|\s)?\s*([a-h][1-8])$/);
    let move;
    try {
      move = coords ? g.move({ from: coords[1], to: coords[2], promotion: 'q' }) : g.move(text);
    } catch {
      this._typed = '';
      this.renderRoot.querySelector('output')!.textContent = `"${text}" is not a legal move here.`;
      return;
    }
    this._typed = '';
    this.renderRoot.querySelector('output')!.textContent = '';
    this.dispatchEvent(
      new CustomEvent<BoardMoveDetail>('board-move', {
        detail: { from: move.from, to: move.to, promotion: move.promotion, san: move.san },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private typedInput() {
    if (!this.interactive) return nothing;
    return html`<form class="typed" @submit=${this.submitTyped}>
      <label>Or type a move <input .value=${this._typed} @input=${(e: Event) => (this._typed = (e.target as HTMLInputElement).value)} placeholder="Nf3 or e2 e4" autocomplete="off" spellcheck="false" /></label>
      <button type="submit">Play</button>
      <output aria-live="polite"></output>
    </form>`;
  }

  render() {
    const want3d = store.state.settings.board3d;
    if (want3d && !this._ready3d) load3d().then((ok) => (this._ready3d = ok));
    if (want3d && this._ready3d) {
      return html`<chess-board-3d
        .fen=${this.fen}
        .orientation=${this.orientation}
        .arrows=${this.arrows}
        .highlights=${this.highlights}
        .lastMove=${this.lastMove}
        .interactive=${this.interactive}
        .label=${this.label}
      ></chess-board-3d>
        ${this.typedInput()}`;
    }
    return html`<chess-board
      .fen=${this.fen}
      .orientation=${this.orientation}
      .arrows=${this.arrows}
      .highlights=${this.highlights}
      .lastMove=${this.lastMove}
      .interactive=${this.interactive}
      .label=${this.label}
    ></chess-board>
    ${this.typedInput()}`;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .typed {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.9rem;
      font-size: 0.9rem;
      color: var(--muted);
    }
    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    input,
    button {
      font: inherit;
      color: var(--text);
      background: var(--glass-strong);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 0.45rem 0.7rem;
      min-height: 40px;
    }
    input {
      width: 9rem;
    }
    button {
      cursor: pointer;
      font-weight: 700;
    }
    :focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }
    output {
      color: var(--warn);
      width: 100%;
    }
  `;
}

customElements.define('board-view', BoardView);
