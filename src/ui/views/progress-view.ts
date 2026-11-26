import { LitElement, css, html } from 'lit';
import { CATEGORIES, OPENINGS_CATEGORY, OPENING_LESSONS, lessonsIn } from '../../data';
import type { Lesson } from '../../data/types';
import { emptyState, getLesson, INTERVAL_DAYS, weeklyCount, WEEKLY_GOAL } from '../../logic/progress';
import { shared } from '../shared';
import { StoreController, statusOf, store } from '../store';

export class ProgressView extends LitElement {
  protected readonly _store = new StoreController(this);

  private dueText(due: number, box: number): string {
    if (box === 0) return 'Not started';
    const d = due - store.today;
    if (d <= 0) return 'Due today';
    if (d === 1) return 'Due tomorrow';
    return `Due in ${d} days`;
  }

  private reset(): void {
    const dlg = this.renderRoot.querySelector('dialog')!;
    dlg.showModal();
  }

  render() {
    const all = CATEGORIES.flatMap((c) => lessonsIn(c.id));
    const mastered = all.filter((l) => statusOf(l.id) === 'mastered').length;
    const learning = all.filter((l) => statusOf(l.id) === 'learning').length;
    const week = weeklyCount(store.state, store.today);
    return html`
      <h1>My progress</h1>
      <div class="stats">
        <div class="card stat"><strong>${mastered}</strong><span>mastered</span></div>
        <div class="card stat"><strong>${learning}</strong><span>learning</span></div>
        <div class="card stat"><strong>${all.length - mastered - learning}</strong><span>still new</span></div>
        <div class="card stat"><strong>${week}/${WEEKLY_GOAL}</strong><span>answers this week</span></div>
      </div>
      <p class="muted">
        A strategy is <strong>mastered</strong> when you have answered it correctly on several different days (it climbs
        the review ladder to level 5), on at least two different positions, including at least one "find the move".
        Review gaps grow: ${INTERVAL_DAYS.slice(1).join(', ')} days. These numbers count the Core Path only.
      </p>
      ${CATEGORIES.map((c) => this.renderTable(c.title, c.hue, lessonsIn(c.id)))}
      ${this.renderTable(`${OPENINGS_CATEGORY.title} (side quest)`, OPENINGS_CATEGORY.hue, OPENING_LESSONS)}
      <p class="muted">
        An opening is <strong>mastered</strong> when it reaches level 5, you have solved it from both sides of the board,
        and you have answered its plan question. Only openings in <a href="#/openings">your repertoire</a> come back in
        Daily Review.
      </p>
      <div class="row">
        <button class="btn ghost" @click=${this.reset}>Reset all progress…</button>
      </div>
      <dialog>
        <h2>Start over?</h2>
        <p>This deletes all progress saved in this browser. Your settings stay.</p>
        <div class="row">
          <button
            class="btn primary"
            @click=${() => {
              store.update((s) => ({ ...emptyState(store.today), settings: s.settings }));
              this.renderRoot.querySelector('dialog')!.close();
            }}
          >
            Yes, reset
          </button>
          <button class="btn ghost" @click=${() => this.renderRoot.querySelector('dialog')!.close()}>Cancel</button>
        </div>
      </dialog>
    `;
  }

  private renderTable(title: string, hue: number, lessons: Lesson[]) {
    return html`<section class="card cat" style="--hue:${hue}">
      <h2>${title}</h2>
      <table>
        <thead>
          <tr><th scope="col">Strategy</th><th scope="col">Level</th><th scope="col">Next review</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>
          ${lessons.map((l) => {
            const lp = getLesson(store.state, l.id);
            const st = statusOf(l.id);
            return html`<tr>
              <td><a href="#/lesson/${l.id}">${l.title}</a></td>
              <td>
                <span class="boxes" aria-label="Level ${lp.box} of 6">${[1, 2, 3, 4, 5, 6].map((b) => html`<i class=${lp.box >= b ? 'on' : ''}></i>`)}</span>
              </td>
              <td class="muted">${this.dueText(lp.due, lp.box)}</td>
              <td class=${st}>${st === 'mastered' ? '★ Mastered' : st === 'learning' ? 'Learning' : 'New'}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    </section>`;
  }

  static styles = [
    shared,
    css`
      :host {
        display: grid;
        gap: 1.2rem;
      }
      h1 {
        font-size: clamp(2rem, 5vw, 3rem);
      }
      .stats {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
      .stat {
        padding: 1.1rem;
        display: grid;

        strong {
          font-size: 2rem;
        }
        span {
          color: var(--muted);
        }
      }
      .cat {
        padding: 1.2rem;
        border-color: oklch(0.7 0.12 var(--hue) / 0.35);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 0.55rem 0.4rem;
        border-bottom: 1px solid var(--line);
      }
      th {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }
      a {
        color: var(--text);
        font-weight: 650;
      }
      .boxes {
        display: inline-flex;
        gap: 3px;

        i {
          width: 14px;
          height: 8px;
          border-radius: 3px;
          background: var(--glass-strong);
        }
        .on {
          background: var(--good);
        }
      }
      .mastered {
        color: var(--good);
        font-weight: 700;
      }
      .row {
        display: flex;
        gap: 0.6rem;
      }
      dialog {
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--bg-1);
        color: var(--text);
        padding: 1.5rem;
        max-width: 420px;

        &::backdrop {
          background: oklch(0 0 0 / 0.55);
          backdrop-filter: blur(4px);
        }
      }
    `,
  ];
}

customElements.define('progress-view', ProgressView);
