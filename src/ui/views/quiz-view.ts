import { LitElement, css, html, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { CATEGORIES, CORE_LESSONS, OPENING_LESSONS, lessonById } from '../../data';
import type { CategoryId } from '../../data/types';
import { startFen } from '../../logic/position';
import { getLesson, recordAnswer, type ItemType } from '../../logic/progress';
import { buildQuiz, lessonsInCategories, type QuizItem, type QuizMode } from '../../logic/quiz';
import type { AnsweredDetail } from '../multi-choice';
import type { PuzzleDoneDetail } from '../puzzle-runner';
import { shared } from '../shared';
import { StoreController, dueToday, go, quiet, store } from '../store';
import '../board-view';
import '../multi-choice';
import '../puzzle-runner';

const MODES: { id: QuizMode; title: string; blurb: string; icon: string }[] = [
  { id: 'review', title: 'Daily Review', blurb: 'Strategies that are due today. Short and spaced out, the best way to remember.', icon: '📅' },
  { id: 'mixed', title: 'Mixed Practice', blurb: 'Questions from different strategies, all shuffled. Trains you to pick the right tool.', icon: '🔀' },
  { id: 'name', title: 'Name That Strategy', blurb: 'Look at a position and decide which strategy fits it.', icon: '🔎' },
  { id: 'move', title: 'Find the Move', blurb: 'Play the winning move on the board, with no clues about which strategy it is.', icon: '♞' },
  { id: 'openings', title: 'Name That Opening', blurb: 'Openings and their plans, all mixed up. Which opening is it? Mixing look-alikes is supposed to feel hard.', icon: '📖' },
];

interface Result {
  lessonId: string;
  correct: boolean;
}

export class QuizView extends LitElement {
  static properties = {
    mode: { type: String },
    categories: { type: String },
    _items: { state: true },
    _i: { state: true },
    _answered: { state: true },
    _results: { state: true },
    _picked: { state: true },
  };

  declare mode: QuizMode | '';
  /** Comma-separated category ids from the URL. */
  declare categories: string;
  declare _items: QuizItem[] | null;
  declare _i: number;
  declare _answered: boolean;
  declare _results: Result[];
  declare _picked: Set<CategoryId>;

  protected readonly _store = new StoreController(this);

  constructor() {
    super();
    this.mode = '';
    this.categories = '';
    this._items = null;
    this._i = 0;
    this._answered = false;
    this._results = [];
    this._picked = new Set();
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('mode') || changed.has('categories')) {
      const cats = this.categories.split(',').filter(Boolean) as CategoryId[];
      this._items = null;
      this._picked = new Set(cats);
      if (this.mode === 'review' || this.mode === 'openings' || (this.mode && cats.length > 0)) this.begin();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    quiet();
  }

  private pool(): string[] {
    if (this.mode === 'review') return dueToday();
    if (this.mode === 'openings') return OPENING_LESSONS.map((l) => l.id);
    const cats = [...this._picked];
    return cats.length ? lessonsInCategories(cats) : CORE_LESSONS.map((l) => l.id);
  }

  private begin(): void {
    const ids = this.pool();
    // Daily Review makes sure each due strategy gets a "find the move" item until one is solved.
    const needsMove =
      this.mode === 'review' ? new Set(ids.filter((id) => getLesson(store.state, id).movesSolved === 0)) : undefined;
    this._items = buildQuiz({ mode: this.mode as QuizMode, lessonIds: ids, size: this.mode === 'review' ? 12 : 10, needsMove });
    this._i = 0;
    this._answered = false;
    this._results = [];
  }

  private record(item: QuizItem, correct: boolean, type: ItemType, hintsUsed = 0): void {
    this._answered = true;
    this._results = [...this._results, { lessonId: item.lessonId, correct }];
    const positionKey = 'positionKey' in item ? item.positionKey : undefined;
    store.update((s) => recordAnswer(s, item.lessonId, { correct, type, positionKey, hintsUsed }, store.today));
  }

  private next(): void {
    quiet();
    this._i += 1;
    this._answered = false;
  }

  render() {
    if (!this.mode) return this.renderMenu();
    if (!this._items) return this.renderSetup();
    if (this._items.length === 0) {
      return html`<section class="card pad center">
        <h2>Nothing is due right now 🎉</h2>
        <p>Finish a lesson to add it to your review schedule, or try Mixed Practice.</p>
        <div class="row center"><a class="btn primary" href="#/quiz/mixed">Mixed Practice</a><a class="btn ghost" href="#/">Home</a></div>
      </section>`;
    }
    if (this._i >= this._items.length) return this.renderSummary();
    // Keyed by question number so every question gets fresh components and state.
    return keyed(this._i, this.renderItem(this._items[this._i]));
  }

  private renderMenu() {
    const due = dueToday().length;
    return html`<h1>Practice</h1>
      <p class="muted lead">Testing yourself is one of the best-proven ways to learn. Mixing different strategies teaches you which one to use.</p>
      <div class="modes">
        ${MODES.map(
          (m) => html`<a class="card mode" href="#/quiz/${m.id}">
            <span class="icon">${m.icon}</span>
            <h2>${m.title} ${m.id === 'review' ? html`<span class="chip">${due} due</span>` : nothing}</h2>
            <p class="muted">${m.blurb}</p>
          </a>`,
        )}
      </div>`;
  }

  private renderSetup() {
    const mode = MODES.find((m) => m.id === this.mode)!;
    return html`<section class="card pad">
      <h1>${mode.icon} ${mode.title}</h1>
      <p class="muted">Choose the categories to practise. Picking several makes the practice more mixed, and that is a good thing!</p>
      <div class="cats">
        ${CATEGORIES.map(
          (c) => html`<label class="cat" style="--hue:${c.hue}">
            <input
              type="checkbox"
              .checked=${this._picked.has(c.id)}
              @change=${(e: Event) => {
                const next = new Set(this._picked);
                if ((e.target as HTMLInputElement).checked) next.add(c.id);
                else next.delete(c.id);
                this._picked = next;
              }}
            />
            <span>${c.title}</span>
          </label>`,
        )}
      </div>
      <div class="row">
        <button class="btn primary" @click=${() => this.begin()}>
          Start ${this._picked.size === 0 ? 'with all categories' : ''} →
        </button>
        <a class="btn ghost" href="#/quiz">Back</a>
      </div>
    </section>`;
  }

  private renderItem(item: QuizItem) {
    const lesson = lessonById(item.lessonId)!;
    const total = this._items!.length;
    const header = html`<div class="progress" aria-label="Question ${this._i + 1} of ${total}">
      ${this._items!.map(
        (_, i) => html`<span class=${i < this._results.length ? (this._results[i].correct ? 'ok' : 'miss') : i === this._i ? 'now' : ''}></span>`,
      )}
    </div>`;
    const footer = this._answered
      ? html`<div class="row">
          ${this._results.at(-1)?.correct
            ? nothing
            : html`<a class="btn ghost" href="#/lesson/${lesson.id}">Review “${lesson.title}”</a>`}
          <button class="btn primary end" @click=${this.next}>${this._i === total - 1 ? 'See results' : 'Next →'}</button>
        </div>`
      : nothing;

    switch (item.kind) {
      case 'move':
        return html`${header}
          <puzzle-runner
            .puzzle=${item.puzzle}
            .hidePrompt=${true}
            .praise=${`Nice! That is the ${lesson.title.replace(/^The /, '').toLowerCase()} idea.`}
            @puzzle-done=${(e: CustomEvent<PuzzleDoneDetail>) => this.record(item, e.detail.correct, 'move', e.detail.hintsUsed)}
          ></puzzle-runner>
          ${this._answered ? html`<p class="reveal">This position was about <strong>${lesson.title}</strong>.</p>` : nothing}
          ${footer}`;
      case 'name': {
        const fen = startFen(item.puzzle);
        // Openings are shown from the side that plays them; strategies from the side to move.
        const turn = lesson.opening ? lesson.opening.plays : fen.split(' ')[1] === 'w' ? 'white' : 'black';
        return html`${header}
          <div class="split">
            <board-view .fen=${fen} .orientation=${turn} .label=${'Quiz position'}></board-view>
            <div class="card pad">
              <p class="eyebrow">
                ${lesson.opening ? 'Name that opening' : `Name that strategy · ${turn === 'white' ? 'White' : 'Black'} to move`}
              </p>
              <multi-choice
                .question=${lesson.opening ? 'Which opening is this?' : 'Which strategy is the key to this position?'}
                .choices=${item.choices.map((id) => lessonById(id)!.title)}
                .answer=${item.answer}
                .why=${item.puzzle.explanation}
                .clue=${lesson.cues[0]}
                @answered=${(e: CustomEvent<AnsweredDetail>) => this.record(item, e.detail.correct, 'name')}
              ></multi-choice>
              ${footer}
            </div>
          </div>`;
      }
      case 'idea':
        return html`${header}
          <section class="card pad">
            <p class="eyebrow">${lesson.opening ? 'Which opening is aiming for this plan?' : 'Which strategy is this?'}</p>
            <blockquote>${item.text}</blockquote>
            <multi-choice
              .question=${lesson.opening ? 'Pick the opening.' : 'Pick the strategy this describes.'}
              .choices=${item.choices.map((id) => lessonById(id)!.title)}
              .answer=${item.answer}
              .why=${`${lesson.title}: ${lesson.cues[0]}`}
              .clue=${lesson.cues[0]}
              @answered=${(e: CustomEvent<AnsweredDetail>) => this.record(item, e.detail.correct, 'idea')}
            ></multi-choice>
            ${footer}
          </section>`;
      case 'concept':
        return html`${header}
          <section class="card pad">
            <p class="eyebrow">${lesson.title}</p>
            <multi-choice
              .question=${item.question.q}
              .choices=${item.question.choices}
              .answer=${item.question.answer}
              .why=${item.question.why}
              @answered=${(e: CustomEvent<AnsweredDetail>) => this.record(item, e.detail.correct, 'concept')}
            ></multi-choice>
            ${footer}
          </section>`;
    }
  }

  private renderSummary() {
    const right = this._results.filter((r) => r.correct).length;
    const missed = [...new Set(this._results.filter((r) => !r.correct).map((r) => r.lessonId))];
    return html`<section class="card pad center">
      <h1>${right} of ${this._results.length}</h1>
      <p class="lead">
        ${right === this._results.length
          ? 'Every one right. Your pattern spotting is getting sharp!'
          : 'Each mistake shows you what to practise next. That is how strong players get better.'}
      </p>
      ${missed.length
        ? html`<h2>Worth another look</h2>
            <div class="row center">
              ${missed.map((id) => html`<a class="btn ghost" href="#/lesson/${id}">${lessonById(id)!.title}</a>`)}
            </div>`
        : nothing}
      <div class="row center">
        <button class="btn primary" @click=${() => this.begin()}>Practise again</button>
        <button class="btn ghost" @click=${() => go('#/progress')}>See my progress</button>
      </div>
    </section>`;
  }

  static styles = [
    shared,
    css`
      :host {
        display: block;
      }
      h1 {
        font-size: clamp(1.8rem, 4vw, 2.6rem);
      }
      .lead {
        font-size: 1.15rem;
        max-width: 60ch;
      }
      .pad {
        padding: 1.4rem 1.5rem;
      }
      .center {
        text-align: center;
        justify-content: center;
      }
      .modes {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        margin-top: 1.4rem;
      }
      .mode {
        padding: 1.4rem;
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s, border-color 0.2s;

        &:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
        }
        h2 {
          font-size: 1.25rem;
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }
      }
      .icon {
        font-size: 2rem;
      }
      .cats {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin: 1rem 0;
      }
      .cat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.9rem;
        border-radius: 999px;
        border: 1px solid oklch(0.7 0.12 var(--hue) / 0.6);
        background: oklch(0.7 0.12 var(--hue) / 0.12);
        cursor: pointer;
        font-weight: 650;
        min-height: 44px;

        &:has(input:checked) {
          background: oklch(0.7 0.14 var(--hue) / 0.35);
        }
        input {
          width: 1.1rem;
          height: 1.1rem;
          accent-color: oklch(0.75 0.15 var(--hue));
        }
      }
      .row {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-top: 1rem;
        align-items: center;
      }
      .end {
        margin-left: auto;
      }
      .progress {
        display: flex;
        gap: 6px;
        margin-bottom: 1rem;

        span {
          flex: 1;
          height: 8px;
          border-radius: 4px;
          background: var(--glass-strong);
        }
        .now {
          background: var(--accent);
        }
        .ok {
          background: var(--good);
        }
        .miss {
          background: var(--warn);
        }
      }
      .split {
        display: grid;
        gap: 1.2rem;
      }
      @media (min-width: 900px) {
        .split {
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          align-items: start;
        }
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--accent);
      }
      blockquote {
        margin: 0 0 1rem;
        font-size: 1.3rem;
        font-weight: 650;
        line-height: 1.5;
        padding-left: 1rem;
        border-left: 4px solid var(--accent-2);
      }
      .reveal {
        margin-top: 1rem;
        font-size: 1.05rem;
      }
    `,
  ];
}

customElements.define('quiz-view', QuizView);
