import { LitElement, css, html, nothing } from 'lit';
import { shared } from './shared';
import { narrate, playSfx } from './store';

export interface AnsweredDetail {
  /** Right on the first try. */
  correct: boolean;
  attempts: number;
}

/**
 * Multiple-choice question with one retry: a wrong first answer shows a clue,
 * a second wrong answer reveals the right one with the explanation.
 */
export class MultiChoice extends LitElement {
  static properties = {
    question: { type: String },
    choices: { type: Array },
    answer: { type: Number },
    why: { type: String },
    clue: { type: String },
    _picked: { state: true },
    _wrong: { state: true },
    _done: { state: true },
  };

  declare question: string;
  declare choices: string[];
  declare answer: number;
  declare why: string;
  declare clue: string;
  declare _picked: number | null;
  declare _wrong: number[];
  declare _done: boolean;

  constructor() {
    super();
    this.question = '';
    this.choices = [];
    this.answer = 0;
    this.why = '';
    this.clue = '';
    this.reset();
  }

  reset(): void {
    this._picked = null;
    this._wrong = [];
    this._done = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    narrate(this.question);
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('question') && changed.get('question') !== undefined) {
      this.reset();
      narrate(this.question);
    }
  }

  private choose(i: number): void {
    if (this._done || this._wrong.includes(i)) return;
    this._picked = i;
    if (i === this.answer) {
      this._done = true;
      playSfx('success');
      narrate(this._wrong.length === 0 ? `Correct! ${this.why}` : `That's it. ${this.why}`);
      this.finish(this._wrong.length === 0, this._wrong.length + 1);
      return;
    }
    playSfx('oops');
    this._wrong = [...this._wrong, i];
    if (this._wrong.length >= 2) {
      this._done = true;
      narrate(`The answer is: ${this.choices[this.answer]}. ${this.why}`);
      this.finish(false, 2);
    } else {
      narrate(`Not quite. ${this.clue || 'Read each choice again and try once more.'}`);
    }
  }

  private finish(correct: boolean, attempts: number): void {
    this.dispatchEvent(new CustomEvent<AnsweredDetail>('answered', { detail: { correct, attempts }, bubbles: true, composed: true }));
  }

  render() {
    const firstWrong = this._wrong.length === 1 && !this._done;
    return html`
      <p class="q">${this.question}</p>
      <div class="choices" role="group" aria-label="Answer choices">
        ${this.choices.map((c, i) => {
          const state =
            this._done && i === this.answer ? 'right' : this._wrong.includes(i) ? 'wrong' : this._done ? 'dim' : '';
          return html`<button class="choice ${state}" ?disabled=${this._done || this._wrong.includes(i)} @click=${() => this.choose(i)}>
            <span class="letter">${'ABCD'[i]}</span><span>${c}</span>
          </button>`;
        })}
      </div>
      <div class="feedback" aria-live="polite">
        ${firstWrong
          ? html`<p class="msg try">Not quite. ${this.clue || 'Read each choice again and try once more.'}</p>`
          : nothing}
        ${this._done
          ? html`<p class="msg ${this._wrong.length === 0 ? 'good' : 'info'}">
              <strong>${this._wrong.length === 0 ? 'Correct!' : this._wrong.length === 1 ? 'Got it on the second try.' : `The answer is: ${this.choices[this.answer]}.`}</strong>
              ${this.why}
            </p>`
          : nothing}
      </div>
    `;
  }

  static styles = [
    shared,
    css`
      .q {
        font-size: 1.2rem;
        font-weight: 650;
      }
      .choices {
        display: grid;
        gap: 0.6rem;
      }
      .choice {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        text-align: left;
        min-height: 52px;
        padding: 0.7rem 1rem;
        border-radius: 14px;
        border: 1px solid var(--line);
        background: var(--glass-strong);
        color: var(--text);
        font: inherit;
        line-height: 1.4;
        cursor: pointer;
        transition: transform 0.15s, border-color 0.2s, background 0.2s;

        &:hover:not([disabled]) {
          border-color: var(--accent);
          transform: translateX(3px);
        }
        &.right {
          border-color: var(--good);
          background: color-mix(in oklch, var(--good) 22%, transparent);
        }
        &.wrong {
          border-color: var(--bad);
          background: color-mix(in oklch, var(--bad) 16%, transparent);
          text-decoration: line-through;
          text-decoration-color: color-mix(in oklch, var(--bad) 70%, transparent);
        }
        &.dim {
          opacity: 0.55;
        }
        &[disabled] {
          cursor: default;
        }
      }
      .letter {
        flex: none;
        display: grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        font-weight: 800;
        background: color-mix(in oklch, var(--accent) 25%, transparent);
      }
      .msg {
        margin-top: 0.9rem;
        padding: 0.8rem 1rem;
        border-radius: 12px;
        border-left: 4px solid var(--accent);
        background: var(--glass-strong);
      }
      .good {
        border-color: var(--good);
      }
      .try {
        border-color: var(--warn);
      }
    `,
  ];
}

customElements.define('multi-choice', MultiChoice);
