import { LitElement, css, html } from 'lit';
import { categoryById, lessonsIn } from '../../data';
import type { CategoryId } from '../../data/types';
import { getLesson, status } from '../../logic/progress';
import { pieceSvg } from '../pieces';
import { LEVEL_HUES, LEVEL_NAMES, shared } from '../shared';
import { StoreController, store } from '../store';

export class CategoryView extends LitElement {
  static properties = { categoryId: { type: String } };
  declare categoryId: CategoryId;
  protected readonly _store = new StoreController(this);

  render() {
    const c = categoryById(this.categoryId);
    if (!c) return html`<p>Category not found. <a href="#/">Go home</a></p>`;
    const lessons = lessonsIn(c.id);
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
        <div class="row">
          <a class="btn primary" href="#/quiz/mixed?cats=${c.id}">🔀 Practise this category</a>
          <a class="btn ghost" href="#/quiz/name?cats=${c.id}">🔎 Name that strategy</a>
        </div>
      </header>
      <ol class="grid">
        ${lessons.map((l, i) => {
          const lp = getLesson(store.state, l.id);
          const st = status(lp);
          return html`<li>
            <a class="card lesson ${st}" href="#/lesson/${l.id}" style="--hue:${c.hue}; --d:${i * 40}ms">
              <div class="top">
                <span class="chip" style="--chip: oklch(0.75 0.15 ${LEVEL_HUES[l.level]})">${LEVEL_NAMES[l.level]}</span>
                <span class="state">${st === 'mastered' ? '★ Mastered' : st === 'learning' ? '◐ Learning' : 'New'}</span>
              </div>
              <h2>${l.title}</h2>
              <p class="muted">${l.bigIdea}</p>
              <div class="boxes" aria-label="Review level ${lp.box} of 5">
                ${[1, 2, 3, 4, 5].map((b) => html`<span class=${lp.box >= b ? 'on' : ''}></span>`)}
              </div>
            </a>
          </li>`;
        })}
      </ol>
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
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-top: 1.2rem;
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
        h2 {
          font-size: 1.25rem;
          margin-top: 0.7rem;
        }
        p {
          flex: 1;
        }
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

customElements.define('category-view', CategoryView);
