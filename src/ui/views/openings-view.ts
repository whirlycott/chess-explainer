import { LitElement, css, html, nothing } from 'lit';
import { OPENINGS_CATEGORY, OPENING_LESSONS, SLOT_NAMES, STARTER_KIT, TIER_AFTER_STAGE, TIER_NAMES, repertoireOptions } from '../../data';
import type { RepertoireSlot } from '../../data/types';
import { getLesson } from '../../logic/progress';
import { pieceSvg } from '../pieces';
import { LEVEL_HUES, LEVEL_NAMES, shared } from '../shared';
import { StoreController, statusOf, store } from '../store';

const SLOTS: RepertoireSlot[] = ['white', 'e4', 'd4'];

/**
 * The Named Openings section: an optional side quest outside the Core Path.
 * The learner picks a three-opening repertoire; only those come back in Daily Review.
 */
export class OpeningsView extends LitElement {
  protected readonly _store = new StoreController(this);

  private setSlot(slot: RepertoireSlot, id: string | null): void {
    store.update((s) => ({ ...s, repertoire: { ...s.repertoire, [slot]: id } }));
  }

  render() {
    const c = OPENINGS_CATEGORY;
    const rep = store.state.repertoire;
    const chosen = new Set(Object.values(rep).filter(Boolean));
    const empty = chosen.size === 0;
    return html`
      <header style="--hue:${c.hue}">
        <a class="crumb" href="#/">← Home</a>
        <div class="title">
          <div class="emblem">${pieceSvg('w', c.icon)}</div>
          <div>
            <h1>${c.title}</h1>
            <p class="muted lead">${c.blurb}</p>
          </div>
        </div>
        <p class="note">
          Openings are a side quest, not the main path. Strong players learn each opening as a few moves plus a plan, not
          a long list of moves to memorise. They are best started after <strong>Stage 2</strong> of the Core Path, once
          you know the opening principles and the first tactics.
        </p>
        <div class="row">
          <a class="btn primary" href="#/quiz/openings">📖 Name That Opening</a>
        </div>
      </header>

      <section class="card pad repertoire" style="--hue:${c.hue}">
        <h2>My Repertoire</h2>
        <p class="muted">
          Pick one opening for each situation and really learn it. Only these three come back in Daily Review (at most
          three a day), so they never crowd out your core practice. You can still explore every opening.
        </p>
        <div class="slots">
          ${SLOTS.map(
            (slot) => html`<label>
              <span>${SLOT_NAMES[slot]}</span>
              <select @change=${(e: Event) => this.setSlot(slot, (e.target as HTMLSelectElement).value || null)}>
                <option value="" ?selected=${!rep[slot]}>Not chosen yet</option>
                ${repertoireOptions(slot).map((o) => html`<option value=${o.id} ?selected=${rep[slot] === o.id}>${o.label}</option>`)}
              </select>
            </label>`,
          )}
        </div>
        ${empty
          ? html`<div class="row">
              <button class="btn" @click=${() => store.update((s) => ({ ...s, repertoire: { ...STARTER_KIT } }))}>
                Use the starter kit
              </button>
              <span class="muted small">Italian Game as White, the Two Knights against e4, and the Queen's Gambit Declined against d4.</span>
            </div>`
          : nothing}
      </section>

      ${([1, 2, 3] as const).map((tier) => {
        const lessons = OPENING_LESSONS.filter((l) => l.opening!.tier === tier);
        return html`<section>
          <h2 class="tier">
            <span class="num">${tier}</span>${TIER_NAMES[tier]}
            <span class="muted small">suggested after Stage ${TIER_AFTER_STAGE[tier]}</span>
          </h2>
          ${tier === 3
            ? html`<p class="muted">You will meet these at clubs. Learn to recognise them first; they have a lot of theory.</p>`
            : nothing}
          <ol class="grid">
            ${lessons.map((l, i) => {
              const lp = getLesson(store.state, l.id);
              const st = statusOf(l.id);
              return html`<li>
                <a class="card lesson ${st}" href="#/lesson/${l.id}" style="--hue:${c.hue}; --d:${i * 40}ms">
                  <div class="top">
                    <span class="chip" style="--chip: oklch(0.75 0.15 ${LEVEL_HUES[l.level]})">${LEVEL_NAMES[l.level]}</span>
                    <span class="state">${st === 'mastered' ? '★ Mastered' : st === 'learning' ? '◐ Learning' : 'New'}</span>
                  </div>
                  <h3>${l.title}</h3>
                  <p class="moves">${l.opening!.moves}</p>
                  <p class="muted">${l.bigIdea}</p>
                  ${chosen.has(l.id) ? html`<span class="mine">In my repertoire</span>` : nothing}
                  <div class="boxes" aria-label="Review level ${lp.box} of 5">
                    ${[1, 2, 3, 4, 5].map((b) => html`<span class=${lp.box >= b ? 'on' : ''}></span>`)}
                  </div>
                </a>
              </li>`;
            })}
          </ol>
        </section>`;
      })}
    `;
  }

  static styles = [
    shared,
    css`
      :host {
        display: grid;
        gap: 1.6rem;
      }
      .crumb {
        color: var(--muted);
        text-decoration: none;
        font-weight: 600;
      }
      .title {
        display: flex;
        gap: 1.2rem;
        align-items: center;
        margin-top: 0.8rem;
      }
      h1 {
        font-size: clamp(2rem, 5vw, 3rem);
        margin: 0;
      }
      .lead {
        font-size: 1.15rem;
        margin: 0.3rem 0 0;
      }
      .note {
        max-width: 70ch;
      }
      .emblem {
        flex: none;
        width: 84px;
        height: 84px;
        border-radius: 24px;
        padding: 8px;
        background: radial-gradient(circle at 30% 25%, oklch(0.75 0.16 var(--hue)), oklch(0.4 0.12 var(--hue)));
        box-shadow: 0 16px 40px -12px oklch(0.6 0.2 var(--hue) / 0.6);
      }
      .row {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 1rem;
      }
      .pad {
        padding: clamp(1rem, 3vw, 1.6rem);
      }
      .repertoire {
        border-color: oklch(0.7 0.12 var(--hue) / 0.45);

        h2 {
          margin-top: 0;
        }
      }
      .slots {
        display: grid;
        align-items: end;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      label {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
        font-weight: 650;
      }
      select {
        width: 100%;
        min-width: 0;
        font: inherit;
        padding: 0.55rem;
        border-radius: 10px;
        background: var(--glass-strong);
        color: var(--text);
        border: 1px solid var(--line);
        accent-color: var(--accent);
      }
      .small {
        font-size: 0.85rem;
      }
      .tier {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
        font-size: 1.4rem;
      }
      .num {
        display: grid;
        place-items: center;
        width: 1.9rem;
        height: 1.9rem;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        color: oklch(0.2 0.03 260);
        font-size: 0.95rem;
      }
      .grid {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      .lesson {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 1.2rem;
        text-decoration: none;
        color: inherit;
        animation: rise 0.5s backwards;
        animation-delay: var(--d);
        transition: transform 0.2s, border-color 0.2s;

        &:hover {
          transform: translateY(-4px);
          border-color: oklch(0.75 0.15 var(--hue));
        }
        &.mastered {
          border-color: color-mix(in oklch, var(--good) 60%, transparent);
        }
        h3 {
          font-size: 1.25rem;
          margin: 0.7rem 0 0.2rem;
        }
        p.muted {
          flex: 1;
        }
      }
      .moves {
        font-family: ui-monospace, 'SF Mono', Menlo, monospace;
        font-size: 0.9rem;
        color: var(--accent-2);
        margin: 0;
      }
      .mine {
        align-self: flex-start;
        font-size: 0.8rem;
        font-weight: 750;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        margin-bottom: 0.6rem;
        background: color-mix(in oklch, var(--accent) 25%, transparent);
        border: 1px solid var(--accent);
      }
      @keyframes rise {
        from {
          opacity: 0;
          translate: 0 14px;
        }
      }
      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .state {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--muted);
      }
      .mastered .state {
        color: var(--good);
      }
      .boxes {
        display: flex;
        gap: 4px;

        span {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: var(--glass-strong);
        }
        .on {
          background: linear-gradient(90deg, var(--accent), var(--good));
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .lesson {
          animation: none;
        }
      }
    `,
  ];
}

customElements.define('openings-view', OpeningsView);
