import { LitElement, css, html, svg, nothing, type PropertyValues } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { Chess, type Square } from 'chess.js';
import type { Arrow } from '../data/types';
import { track, type TrackedPiece } from '../logic/diff';
import { pieceSvg } from './pieces';

/** How long a captured or removed piece stays on screen while it fades out. */
const LEAVE_MS = 300;

export interface BoardMoveDetail {
  from: string;
  to: string;
  promotion?: string;
  san: string;
}

const FILES = 'abcdefgh';
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const PIECE_NAMES: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

/** Arrow colours and dash patterns (patterns make them distinguishable without colour). */
export const ARROW_STYLE: Record<string, { color: string; dash: string }> = {
  green: { color: 'oklch(0.78 0.2 150)', dash: '' },
  red: { color: 'oklch(0.68 0.24 25)', dash: '' },
  blue: { color: 'oklch(0.72 0.16 245)', dash: '26 16' },
  yellow: { color: 'oklch(0.86 0.17 90)', dash: '10 12' },
};

/**
 * Shared click / drag move-input logic for the 2D and 3D boards.
 * Holds the selected square and its legal targets.
 */
export class MoveInput {
  selected: string | null = null;
  targets: string[] = [];

  constructor(private fen: () => string, private enabled: () => boolean) {}

  private game(): Chess {
    return new Chess(this.fen());
  }

  canPick(square: string): boolean {
    if (!this.enabled()) return false;
    const g = this.game();
    const p = g.get(square as Square);
    return !!p && p.color === g.turn();
  }

  pick(square: string): void {
    this.selected = square;
    this.targets = this.game()
      .moves({ square: square as Square, verbose: true })
      .map((m) => m.to);
  }

  clear(): void {
    this.selected = null;
    this.targets = [];
  }

  /** Try to move the selected piece to `to`. Returns the move or null if illegal. */
  attempt(from: string, to: string): BoardMoveDetail | null {
    const g = this.game();
    try {
      const m = g.move({ from, to, promotion: 'q' });
      return { from, to, promotion: m.promotion, san: m.san };
    } catch {
      return null;
    }
  }
}

export class ChessBoard extends LitElement {
  static properties = {
    fen: { type: String },
    orientation: { type: String },
    arrows: { type: Array },
    highlights: { type: Array },
    lastMove: { type: Array },
    interactive: { type: Boolean },
    label: { type: String },
    _pieces: { state: true },
    _leaving: { state: true },
    _drag: { state: true },
    _shake: { state: true },
  };

  declare fen: string;
  declare orientation: 'white' | 'black';
  declare arrows: Arrow[];
  declare highlights: string[];
  declare lastMove: [string, string] | null;
  declare interactive: boolean;
  declare label: string;
  declare _pieces: TrackedPiece[];
  /** Pieces that just left the board (captured or gone); kept briefly so they fade out. */
  declare _leaving: TrackedPiece[];
  declare _drag: { id: number; from: string; x: number; y: number } | null;
  declare _shake: boolean;

  private input = new MoveInput(
    () => this.fen,
    () => this.interactive,
  );
  private dragStart: { x: number; y: number } | null = null;
  private leaveTimer = 0;

  constructor() {
    super();
    this.fen = START;
    this.orientation = 'white';
    this.arrows = [];
    this.highlights = [];
    this.lastMove = null;
    this.interactive = false;
    this.label = 'Chess board';
    this._pieces = [];
    this._leaving = [];
    this._drag = null;
    this._shake = false;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.leaveTimer);
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('fen')) {
      const before = this._pieces;
      this._pieces = track(before, this.fen);
      const kept = new Set(this._pieces.map((p) => p.id));
      this._leaving = before.filter((p) => !kept.has(p.id));
      clearTimeout(this.leaveTimer);
      if (this._leaving.length) this.leaveTimer = window.setTimeout(() => (this._leaving = []), LEAVE_MS);
      this.input.clear();
    }
    if (changed.has('interactive') && !this.interactive) this.input.clear();
  }

  /**
   * Pieces in a stable order (by id), so moving a piece never moves its element in
   * the page. Browsers cancel a running transition when an element is moved, which
   * would make the piece jump instead of glide.
   */
  private renderOrder(): TrackedPiece[] {
    return [...this._leaving, ...this._pieces].sort((a, b) => a.id - b.id);
  }

  /** Board-relative (0..7) coordinates of a square, taking orientation into account. */
  private xy(square: string): [number, number] {
    const f = FILES.indexOf(square[0]);
    const r = Number(square[1]) - 1;
    return this.orientation === 'white' ? [f, 7 - r] : [7 - f, r];
  }

  private squareAt(clientX: number, clientY: number): string | null {
    const box = this.renderRoot.querySelector('.board')!.getBoundingClientRect();
    const x = Math.floor(((clientX - box.left) / box.width) * 8);
    const y = Math.floor(((clientY - box.top) / box.height) * 8);
    if (x < 0 || x > 7 || y < 0 || y > 7) return null;
    const f = this.orientation === 'white' ? x : 7 - x;
    const r = this.orientation === 'white' ? 7 - y : y;
    return FILES[f] + String(r + 1);
  }

  private emit(detail: BoardMoveDetail): void {
    this.input.clear();
    this.dispatchEvent(new CustomEvent<BoardMoveDetail>('board-move', { detail, bubbles: true, composed: true }));
  }

  private reject(): void {
    this._shake = true;
    setTimeout(() => (this._shake = false), 350);
  }

  private onPointerDown(e: PointerEvent): void {
    if (!this.interactive || e.button !== 0) return;
    const sq = this.squareAt(e.clientX, e.clientY);
    if (!sq) return;
    if (this.input.selected && this.input.targets.includes(sq)) {
      const m = this.input.attempt(this.input.selected, sq);
      if (m) this.emit(m);
      this.requestUpdate();
      return;
    }
    if (this.input.canPick(sq)) {
      this.input.pick(sq);
      const piece = this._pieces.find((p) => p.square === sq);
      if (piece) {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        this.dragStart = { x: e.clientX, y: e.clientY };
        this._drag = { id: piece.id, from: sq, x: 0, y: 0 };
      }
    } else {
      if (this.input.selected) this.reject();
      this.input.clear();
    }
    this.requestUpdate();
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this._drag || !this.dragStart) return;
    this._drag = { ...this._drag, x: e.clientX - this.dragStart.x, y: e.clientY - this.dragStart.y };
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this._drag) return;
    const from = this._drag.from;
    const moved = Math.hypot(this._drag.x, this._drag.y) > 6;
    this._drag = null;
    this.dragStart = null;
    if (!moved) return; // a click: keep the selection
    const to = this.squareAt(e.clientX, e.clientY);
    if (to && to !== from && this.input.targets.includes(to)) {
      const m = this.input.attempt(from, to);
      if (m) return this.emit(m);
    }
    if (to !== from) this.reject();
  }

  private squareLabel(sq: string, game: Chess): string {
    const p = game.get(sq as Square);
    return p ? `${sq}, ${p.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[p.type]}` : sq;
  }

  render() {
    const game = new Chess(this.fen);
    const inCheck = game.inCheck();
    const kingSq = inCheck
      ? game
          .board()
          .flat()
          .find((p) => p && p.type === 'k' && p.color === game.turn())?.square
      : undefined;
    const squares = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const f = this.orientation === 'white' ? x : 7 - x;
        const r = this.orientation === 'white' ? 7 - y : y;
        const sq = FILES[f] + String(r + 1);
        const light = (f + r) % 2 === 1;
        const cls = [
          'sq',
          light ? 'light' : 'dark',
          this.highlights.includes(sq) ? 'hl' : '',
          this.lastMove?.includes(sq) ? 'last' : '',
          this.input.selected === sq ? 'sel' : '',
          kingSq === sq ? 'check' : '',
        ].join(' ');
        const target = this.input.targets.includes(sq);
        squares.push(html`<div class=${cls} role="gridcell" aria-label=${this.squareLabel(sq, game)}>
          ${target ? html`<span class=${game.get(sq as Square) ? 'ring' : 'dot'}></span>` : nothing}
          ${x === 0 ? html`<span class="coord rank">${r + 1}</span>` : nothing}
          ${y === 7 ? html`<span class="coord file">${FILES[f]}</span>` : nothing}
        </div>`);
      }
    }

    return html`<div
      class="board ${this._shake ? 'shake' : ''} ${this.interactive ? 'live' : ''}"
      role="grid"
      aria-label=${this.label}
      @pointerdown=${this.onPointerDown}
      @pointermove=${this.onPointerMove}
      @pointerup=${this.onPointerUp}
      @pointercancel=${() => (this._drag = null)}
    >
      <div class="squares">${squares}</div>
      <div class="pieces">
        ${repeat(this.renderOrder(), (p) => p.id, (p) => {
          const [x, y] = this.xy(p.square);
          const dragging = this._drag?.id === p.id;
          const leaving = this._leaving.includes(p);
          const style = dragging
            ? `transform: translate(calc(${x * 100}% + ${this._drag!.x}px), calc(${y * 100}% + ${this._drag!.y}px)) scale(1.12)`
            : `transform: translate(${x * 100}%, ${y * 100}%)`;
          return html`<div class="piece ${dragging ? 'dragging' : ''} ${leaving ? 'leaving' : ''}" data-square=${p.square} style=${style}>
            ${pieceSvg(p.color, p.type)}
          </div>`;
        })}
      </div>
      <svg class="arrows" viewBox="0 0 800 800" aria-hidden="true">
        <defs>
          ${Object.entries(ARROW_STYLE).map(
            ([k, v]) => svg`<marker id="head-${k}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill=${v.color}/></marker>`,
          )}
        </defs>
        ${this.arrows.map(([from, to, color = 'green']) => {
          const [x1, y1] = this.xy(from).map((v) => v * 100 + 50);
          const [x2, y2] = this.xy(to).map((v) => v * 100 + 50);
          const len = Math.hypot(x2 - x1, y2 - y1) || 1;
          const ex = x2 - ((x2 - x1) / len) * 28;
          const ey = y2 - ((y2 - y1) / len) * 28;
          const st = ARROW_STYLE[color];
          return svg`<line x1=${x1} y1=${y1} x2=${ex} y2=${ey} stroke=${st.color} stroke-width="16" stroke-linecap="round"
            stroke-dasharray=${st.dash} marker-end="url(#head-${color})" opacity="0.88"/>`;
        })}
      </svg>
    </div>`;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    .board {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 14px;
      overflow: hidden;
      container-type: inline-size;
      box-shadow:
        0 0 0 6px oklch(0.3 0.04 260),
        0 0 0 7px oklch(0.55 0.06 260 / 0.5),
        0 24px 60px -12px oklch(0 0 0 / 0.65);
    }
    .board.live {
      cursor: pointer;
    }
    .board.shake {
      animation: shake 0.32s;
    }
    @keyframes shake {
      25% { translate: -6px 0; }
      50% { translate: 5px 0; }
      75% { translate: -3px 0; }
    }
    .squares {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template: repeat(8, 1fr) / repeat(8, 1fr);
    }
    .sq {
      position: relative;
    }
    .light {
      background: var(--sq-light, oklch(0.91 0.025 250));
    }
    .dark {
      background: var(--sq-dark, oklch(0.6 0.08 255));
    }
    .last {
      background-image: linear-gradient(oklch(0.88 0.16 95 / 0.45), oklch(0.88 0.16 95 / 0.45));
    }
    .sel {
      background-image: linear-gradient(oklch(0.8 0.17 150 / 0.55), oklch(0.8 0.17 150 / 0.55));
    }
    .hl::after {
      content: '';
      position: absolute;
      inset: 6%;
      border-radius: 18%;
      box-shadow: inset 0 0 0 4px oklch(0.85 0.17 200 / 0.9), 0 0 18px oklch(0.85 0.17 200 / 0.6);
      animation: pulse 2.2s ease-in-out infinite;
    }
    @keyframes pulse {
      50% { opacity: 0.55; }
    }
    .check {
      background-image: radial-gradient(circle, oklch(0.65 0.26 25 / 0.95) 0%, oklch(0.65 0.26 25 / 0.35) 55%, transparent 72%);
    }
    .dot {
      position: absolute;
      inset: 36%;
      border-radius: 50%;
      background: oklch(0.3 0.05 150 / 0.45);
    }
    .ring {
      position: absolute;
      inset: 4%;
      border-radius: 50%;
      box-shadow: inset 0 0 0 5px oklch(0.3 0.05 150 / 0.45);
    }
    .coord {
      position: absolute;
      font-size: clamp(8px, 1.6cqi, 13px);
      font-weight: 700;
      opacity: 0.7;
      color: oklch(0.3 0.05 255);
      pointer-events: none;
    }
    .dark .coord {
      color: oklch(0.95 0.02 250);
    }
    .rank {
      top: 4%;
      left: 5%;
    }
    .file {
      bottom: 3%;
      right: 6%;
    }
    .pieces {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .piece {
      position: absolute;
      width: 12.5%;
      height: 12.5%;
      transition:
        transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1),
        opacity 0.26s ease,
        scale 0.26s ease;
      filter: drop-shadow(0 4px 3px oklch(0 0 0 / 0.35));
      will-change: transform;
    }
    /* New pieces fade in instead of popping into place. */
    @starting-style {
      .piece {
        opacity: 0;
        scale: 0.7;
      }
    }
    /* Pieces that leave fade out under the piece that captures them. */
    .piece.leaving {
      opacity: 0;
      scale: 0.7;
      pointer-events: none;
    }
    .piece.dragging {
      transition: none;
      z-index: 5;
      filter: drop-shadow(0 14px 10px oklch(0 0 0 / 0.45));
    }
    .piece-svg {
      width: 100%;
      height: 100%;
      padding: 4%;
    }
    .arrows {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .piece { transition: none; }
      .piece.leaving { display: none; }
      .hl::after { animation: none; }
      .board.shake { animation: none; }
    }
  `;
}

customElements.define('chess-board', ChessBoard);

declare global {
  interface HTMLElementTagNameMap {
    'chess-board': ChessBoard;
  }
}
