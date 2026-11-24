import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { Chess } from 'chess.js';
import { PATH, categoryById, lessonById } from '../../data';
import type { Lesson, Step } from '../../data/types';
import { resolveStart, sanToWords } from '../../logic/position';
import { completeLesson, recordAnswer } from '../../logic/progress';
import type { BoardMoveDetail } from '../chess-board';
import type { AnsweredDetail } from '../multi-choice';
import type { PuzzleDoneDetail } from '../puzzle-runner';
import { LEVEL_HUES, LEVEL_NAMES, shared } from '../shared';
import { StoreController, go, narrate, playSfx, quiet, store } from '../store';
import '../board-view';
import '../multi-choice';
import '../puzzle-runner';

type Phase = 'intro' | 'example' | 'explain' | 'watch' | 'practice' | 'check' | 'done';
const PHASES: { id: Phase; label: string }[] = [
  { id: 'intro', label: 'Big idea' },
  { id: 'example', label: 'Watch' },
  { id: 'explain', label: 'Why?' },
  { id: 'watch', label: 'Watch out' },
  { id: 'practice', label: 'Your turn' },
  { id: 'check', label: 'Quick check' },
];

interface Frame {
  before: string;
  after: string;
  last: [string, string] | null;
}

export class LessonView extends LitElement {
  static properties = {
    lessonId: { type: String },
    _phase: { state: true },
    _step: { state: true },
    _predictOpen: { state: true },
    _predictNote: { state: true },
    _puzzle: { state: true },
    _puzzleDone: { state: true },
    _answered: { state: true },
    _expanded: { state: true },
  };

  declare lessonId: string;
  declare _phase: Phase;
  declare _step: number;
  declare _predictOpen: boolean;
  declare _predictNote: string;
  declare _puzzle: number;
  declare _puzzleDone: boolean;
  declare _answered: boolean;
  declare _expanded: boolean;

  protected readonly _store = new StoreController(this);
  private frames: Frame[] = [];
  private onKey = (e: KeyboardEvent) => {
    if (this._phase !== 'example' || (e.target as HTMLElement)?.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.back();
  };

  constructor() {
    super();
    this.lessonId = '';
    this.resetState();
  }

  private resetState(): void {
    this._phase = 'intro';
    this._step = 0;
    this._predictOpen = false;
    this._predictNote = '';
    this._puzzle = 0;
    this._puzzleDone = false;
    this._answered = false;
    this._expanded = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('keydown', this.onKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.onKey);
    quiet();
  }

  get lesson(): Lesson | undefined {
    return lessonById(this.lessonId);
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('lessonId') && this.lesson) {
      this.resetState();
      this.buildFrames(this.lesson);
      narrate(`${this.lesson.title}. ${this.lesson.bigIdea}`);
    }
  }

  private buildFrames(lesson: Lesson): void {
    const g = resolveStart(lesson.walkthrough);
    let last: [string, string] | null = null;
    this.frames = lesson.walkthrough.steps.map((s) => {
      const before = g.fen();
      if (s.san) {
        const m = g.move(s.san);
        last = [m.from, m.to];
      }
      return { before, after: g.fen(), last };
    });
  }

  private get orientation(): 'white' | 'black' {
    const w = this.lesson!.walkthrough;
    return w.orientation ?? (resolveStart(w).turn() === 'w' ? 'white' : 'black');
  }

  private setPhase(p: Phase): void {
    quiet();
    this._phase = p;
    this._answered = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const l = this.lesson!;
    if (p === 'example') this.enterStep(0);
    if (p === 'watch') narrate(`Watch out! ${l.mistake}`);
    if (p === 'done') {
      store.update((s) => completeLesson(s, l.id, store.today));
      playSfx('success');
      narrate(`Lesson complete. Great work learning ${l.title}.`);
    }
  }

  private narrateStep(step: Step): void {
    narrate(step.san ? `${sanToWords(step.san)}. ${step.say}` : step.say);
  }

  private enterStep(i: number): void {
    this._step = i;
    this._expanded = false;
    const step = this.lesson!.walkthrough.steps[i];
    this._predictOpen = !!step.predict;
    this._predictNote = '';
    if (step.predict) narrate(step.predict);
    else this.narrateStep(step);
    if (step.san && !step.predict) playSfx(step.san.includes('x') ? 'capture' : 'move');
  }

  private next(): void {
    const steps = this.lesson!.walkthrough.steps;
    if (this._predictOpen) return this.reveal('');
    if (this._step < steps.length - 1) this.enterStep(this._step + 1);
    else this.setPhase('explain');
  }

  private back(): void {
    if (this._step > 0) this.enterStep(this._step - 1);
  }

  private reveal(note: string): void {
    const step = this.lesson!.walkthrough.steps[this._step];
    this._predictOpen = false;
    this._predictNote = note;
    playSfx(step.san!.includes('x') ? 'capture' : 'move');
    narrate(`${note} ${sanToWords(step.san!)}. ${step.say}`);
  }

  private onPredict(e: CustomEvent<BoardMoveDetail>): void {
    const step = this.lesson!.walkthrough.steps[this._step];
    if (e.detail.san === step.san) {
      playSfx('success');
      this.reveal('Yes! You found it.');
    } else if (step.alsoGood?.includes(e.detail.san)) {
      playSfx('success');
      this.reveal(`That works too! In this example we look at ${sanToWords(step.san!).toLowerCase()}.`);
    } else {
      this.reveal('Good try. Here is the move.');
    }
  }

  private onPuzzleDone(e: CustomEvent<PuzzleDoneDetail>): void {
    const l = this.lesson!;
    this._puzzleDone = true;
    store.update((s) =>
      recordAnswer(
        s,
        l.id,
        { correct: e.detail.correct, type: 'move', positionKey: `${l.id}:p${this._puzzle}`, hintsUsed: e.detail.hintsUsed },
        store.today,
      ),
    );
  }

  private onCheck(e: CustomEvent<AnsweredDetail>): void {
    const l = this.lesson!;
    this._answered = true;
    store.update((s) => recordAnswer(s, l.id, { correct: e.detail.correct, type: 'concept', hintsUsed: 0 }, store.today));
  }

  private nextInPath(): string | undefined {
    const ids = PATH.flatMap((s) => s.ids);
    const i = ids.indexOf(this.lessonId);
    return ids.slice(i + 1).find((id) => !store.state.lessons[id]?.lessonDone) ?? ids[i + 1];
  }

  // ------------------------------------------------------------- rendering

  render() {
    const l = this.lesson;
    if (!l) return html`<p>Lesson not found. <a href="#/">Go home</a></p>`;
    const cat = categoryById(l.category);
    const phaseIndex = PHASES.findIndex((p) => p.id === this._phase);
    return html`
      <div class="lesson" style="--hue:${cat.hue}">
        <header class="top">
          <a class="crumb" href="#/category/${cat.id}">← ${cat.title}</a>
          <div class="titlebar">
            <h1>${l.title}</h1>
            <span class="chip" style="--chip: oklch(0.75 0.15 ${LEVEL_HUES[l.level]})">${LEVEL_NAMES[l.level]}</span>
          </div>
          ${l.aka ? html`<p class="aka muted">${l.aka}</p>` : nothing}
          <ol class="phases" aria-label="Lesson steps">
            ${PHASES.map(
              (p, i) => html`<li class=${i < phaseIndex || this._phase === 'done' ? 'past' : i === phaseIndex ? 'now' : ''}>
                <span>${i + 1}</span>${p.label}
              </li>`,
            )}
          </ol>
        </header>
        ${this.renderPhase(l)}
      </div>
    `;
  }

  private renderPhase(l: Lesson) {
    switch (this._phase) {
      case 'intro':
        return html`<section class="card intro">
          <p class="eyebrow">The big idea</p>
          <p class="big">${l.bigIdea}</p>
          <h2>Spot it when...</h2>
          <ul class="cues">
            ${l.cues.map((c) => html`<li>${c}</li>`)}
          </ul>
          <button class="btn primary" @click=${() => this.setPhase('example')}>Watch the example →</button>
        </section>`;
      case 'example':
        return this.renderExample(l);
      case 'explain':
        return html`<section class="card pad">
          <p class="eyebrow">Why does it work?</p>
          <p class="muted">Think about it first, then pick the best explanation.</p>
          <multi-choice
            .question=${l.explain.q}
            .choices=${l.explain.choices}
            .answer=${l.explain.answer}
            .why=${l.explain.why}
            @answered=${() => (this._answered = true)}
          ></multi-choice>
          <div class="nav">
            <button class="btn primary" ?disabled=${!this._answered} @click=${() => this.setPhase('watch')}>Continue →</button>
          </div>
        </section>`;
      case 'watch':
        return html`<section class="card pad watch">
          <p class="eyebrow">Watch out!</p>
          <p class="big">${l.mistake}</p>
          <div class="nav">
            <button class="btn primary" @click=${() => this.setPhase('practice')}>Try it yourself →</button>
          </div>
        </section>`;
      case 'practice': {
        const last = this._puzzle >= l.puzzles.length - 1;
        return html`<section>
          <p class="eyebrow">Your turn · puzzle ${this._puzzle + 1} of ${l.puzzles.length}</p>
          <puzzle-runner
            .puzzle=${l.puzzles[this._puzzle]}
            .praise=${`Nice! You used the ${l.title.replace(/^The /, '').toLowerCase()} idea.`}
            @puzzle-done=${this.onPuzzleDone}
          ></puzzle-runner>
          <div class="nav">
            <button
              class="btn primary"
              ?disabled=${!this._puzzleDone}
              @click=${() => {
                quiet();
                if (last) this.setPhase('check');
                else {
                  this._puzzle += 1;
                  this._puzzleDone = false;
                }
              }}
            >
              ${last ? 'Quick check →' : 'Next puzzle →'}
            </button>
          </div>
        </section>`;
      }
      case 'check':
        return html`<section class="card pad">
          <p class="eyebrow">Quick check</p>
          <multi-choice .question=${l.check.q} .choices=${l.check.choices} .answer=${l.check.answer} .why=${l.check.why} @answered=${this.onCheck}></multi-choice>
          <div class="nav">
            <button class="btn primary" ?disabled=${!this._answered} @click=${() => this.setPhase('done')}>Finish lesson →</button>
          </div>
        </section>`;
      case 'done': {
        const next = this.nextInPath();
        return html`<section class="card pad done">
          <div class="burst" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => html`<i style="--i:${i}"></i>`)}</div>
          <h2>Lesson complete!</h2>
          <p>
            You learned <strong>${l.title}</strong>. It is now in your review schedule. Practising it again on a later day
            is what makes it stick, so come back for Daily Review.
          </p>
          <div class="row">
            ${next
              ? html`<button class="btn primary" @click=${() => go(`#/lesson/${next}`)}>Next: ${lessonById(next)!.title} →</button>`
              : nothing}
            <button class="btn" @click=${() => go(`#/quiz/mixed?cats=${l.category}`)}>Practice this category</button>
            <button class="btn ghost" @click=${() => this.setPhase('intro')}>Review this lesson</button>
          </div>
        </section>`;
      }
    }
  }

  private renderExample(l: Lesson) {
    const steps = l.walkthrough.steps;
    const step = steps[this._step];
    const frame = this.frames[this._step];
    const predicting = this._predictOpen;
    const fen = predicting ? frame.before : frame.after;
    const last = predicting ? (this._step > 0 ? this.frames[this._step - 1].last : null) : frame.last;
    const turn = new Chess(fen).turn() === 'w' ? 'White' : 'Black';
    const s = store.state.settings;
    const short = s.audio && s.shortCaptions && !this._expanded;
    const firstSentence = step.say.match(/^.*?[.!?](\s|$)/)?.[0] ?? step.say;
    return html`<section class="example">
      <div class="board">
        <board-view
          .fen=${fen}
          .orientation=${this.orientation}
          .arrows=${predicting ? [] : (step.arrows ?? [])}
          .highlights=${predicting ? [] : (step.highlights ?? [])}
          .lastMove=${last}
          .interactive=${predicting}
          .label=${`Worked example board, step ${this._step + 1}`}
          @board-move=${this.onPredict}
        ></board-view>
      </div>
      <div class="card pad narration">
        <div class="meter" aria-hidden="true"><div style="width:${((this._step + 1) / steps.length) * 100}%"></div></div>
        <p class="eyebrow">Step ${this._step + 1} of ${steps.length}</p>
        ${predicting
          ? html`<div class="predict">
              <p class="big">🤔 ${step.predict}</p>
              <p class="muted">${turn} to move. Try the move on the board.</p>
              <button class="btn ghost" @click=${() => this.reveal('')}>Show me</button>
            </div>`
          : html`
              ${this._predictNote ? html`<p class="pnote">${this._predictNote}</p>` : nothing}
              ${step.san ? html`<p class="move"><span class="san">${step.san}</span> ${sanToWords(step.san)}</p>` : nothing}
              <p class="say" aria-live="polite">${short ? firstSentence : step.say}</p>
              ${short && firstSentence.length < step.say.length
                ? html`<button class="link" @click=${() => (this._expanded = true)}>Show full text</button>`
                : nothing}
            `}
        <div class="nav">
          <button class="btn ghost" ?disabled=${this._step === 0} @click=${this.back} aria-label="Previous step">← Back</button>
          ${s.audio ? html`<button class="btn ghost" @click=${() => this.narrateStep(step)} aria-label="Read aloud again">🔊 Again</button>` : nothing}
          <button class="btn primary" @click=${this.next}>
            ${predicting ? 'Skip' : this._step === steps.length - 1 ? 'Continue →' : 'Next →'}
          </button>
        </div>
        <p class="muted small">Tip: use the ← and → keys.</p>
      </div>
    </section>`;
  }

  static styles = [
    shared,
    css`
      :host {
        display: block;
      }
      .lesson {
        --accent: oklch(0.78 0.15 var(--hue));
        display: grid;
        gap: 1.2rem;
      }
      .crumb {
        color: var(--muted);
        text-decoration: none;
        font-weight: 600;
      }
      .titlebar {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        flex-wrap: wrap;
        margin-top: 0.4rem;
      }
      h1 {
        font-size: clamp(1.8rem, 4vw, 2.8rem);
        margin: 0;
        view-transition-name: lesson-title;
      }
      .aka {
        margin: 0.2rem 0 0;
      }
      .phases {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;

        li {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem 0.3rem 0.3rem;
          border-radius: 999px;
          border: 1px solid var(--line);
          font-size: 0.85rem;
          font-weight: 650;
          color: var(--muted);
        }
        li span {
          display: grid;
          place-items: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          background: var(--glass-strong);
          font-size: 0.75rem;
        }
        li.now {
          color: var(--text);
          border-color: var(--accent);
          background: color-mix(in oklch, var(--accent) 18%, transparent);
        }
        li.now span,
        li.past span {
          background: var(--accent);
          color: oklch(0.2 0.03 260);
        }
      }
      .pad {
        padding: 1.4rem 1.5rem;
      }
      .intro {
        padding: clamp(1.4rem, 4vw, 2.4rem);
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--accent);
        margin-bottom: 0.4rem;
      }
      .big {
        font-size: clamp(1.25rem, 2.6vw, 1.6rem);
        font-weight: 650;
        line-height: 1.45;
      }
      .cues {
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.6rem;
        margin: 0 0 1.4rem;

        li {
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          border-radius: 12px;
          background: var(--glass-strong);
          position: relative;
          line-height: 1.5;
        }
        li::before {
          content: '👀';
          position: absolute;
          left: 0.9rem;
        }
      }
      .example {
        display: grid;
        gap: 1.2rem;
        container-type: inline-size;
      }
      @media (min-width: 900px) {
        .example {
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
          align-items: start;
        }
        .narration {
          position: sticky;
          top: 90px;
        }
      }
      .board {
        width: 100%;
        max-width: min(640px, calc(100dvh - 170px));
        margin-inline: auto;
      }
      .meter {
        height: 6px;
        border-radius: 3px;
        background: var(--glass-strong);
        margin-bottom: 1rem;
        overflow: hidden;

        div {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          transition: width 0.35s;
        }
      }
      .move {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .san {
        font-family: ui-monospace, 'SF Mono', Menlo, monospace;
        padding: 0.15em 0.55em;
        border-radius: 8px;
        background: color-mix(in oklch, var(--accent) 25%, transparent);
      }
      .say {
        font-size: 1.15rem;
        line-height: 1.6;
        min-height: 3.2em;
      }
      .pnote {
        font-weight: 700;
        color: var(--good);
      }
      .link {
        background: none;
        border: none;
        color: var(--accent);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        padding: 0;
        margin-bottom: 0.8rem;
      }
      .nav,
      .row {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-top: 1rem;
        align-items: center;
      }
      .nav .primary {
        margin-left: auto;
      }
      .small {
        font-size: 0.85rem;
        margin: 0.8rem 0 0;
      }
      .watch {
        border-color: color-mix(in oklch, var(--warn) 60%, transparent);
      }
      .done {
        position: relative;
        overflow: hidden;
        text-align: center;

        .row {
          justify-content: center;
        }
        h2 {
          font-size: 2rem;
        }
      }
      .burst {
        position: absolute;
        inset: 0;
        pointer-events: none;

        i {
          position: absolute;
          left: 50%;
          top: 30%;
          width: 10px;
          height: 16px;
          border-radius: 3px;
          background: oklch(0.8 0.18 calc(var(--i) * 40));
          animation: fly 1.4s ease-out forwards;
          rotate: calc(var(--i) * 20deg);
          --dx: calc((var(--i) - 9) * 34px);
        }
      }
      @keyframes fly {
        from {
          translate: 0 0;
          opacity: 1;
        }
        to {
          translate: var(--dx) 220px;
          opacity: 0;
          rotate: calc(var(--i) * 70deg);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .burst {
          display: none;
        }
      }
    `,
  ];
}

customElements.define('lesson-view', LessonView);
