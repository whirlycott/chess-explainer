import { LitElement, css, html, nothing } from 'lit';
import { Chess } from 'chess.js';
import { CATEGORIES, PATH, lessonById, lessonsIn } from '../../data';
import { dueLessons, getLesson, status, weeklyCount, WEEKLY_GOAL } from '../../logic/progress';
import { pieceSvg } from '../pieces';
import { shared } from '../shared';
import { StoreController, store } from '../store';
import '../chess-board';

// A short famous game that loops on the home page board (Légal's Mate).
const DEMO = ['e4', 'e5', 'Bc4', 'd6', 'Nf3', 'Bg4', 'Nc3', 'g6', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'];

export class HomeView extends LitElement {
  static properties = { _ply: { state: true } };
  declare _ply: number;

  protected readonly _store = new StoreController(this);
  private timer = 0;

  constructor() {
    super();
    this._ply = 0;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.timer = window.setInterval(() => (this._ply = (this._ply + 1) % (DEMO.length + 4)), 1100);
    } else {
      this._ply = DEMO.length;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.timer);
  }

  private demo(): { fen: string; last: [string, string] | null } {
    const g = new Chess();
    let last: [string, string] | null = null;
    for (const san of DEMO.slice(0, Math.min(this._ply, DEMO.length))) {
      const m = g.move(san);
      last = [m.from, m.to];
    }
    return { fen: g.fen(), last };
  }

  private nextLesson(): string {
    const ids = PATH.flatMap((s) => s.ids);
    return ids.find((id) => !getLesson(store.state, id).lessonDone) ?? ids[0];
  }

  render() {
    const demo = this.demo();
    const next = lessonById(this.nextLesson())!;
    const due = dueLessons(store.state, store.today).length;
    const week = weeklyCount(store.state, store.today);
    const started = Object.values(store.state.lessons).some((l) => l.lessonDone);
    return html`
      <section class="hero">
        <div class="copy">
          <p class="eyebrow">50 strategies · step by step</p>
          <h1>Learn to think like a <span class="glow">chess master</span>.</h1>
          <p class="lead">
            Watch each strategy move by move, predict the next move, then prove you've got it with puzzles and spaced
            review.
          </p>
          <div class="row">
            <a class="btn primary big" href="#/lesson/${next.id}">${started ? 'Continue' : 'Start'}: ${next.title} →</a>
            <a class="btn big" href="#/quiz/review">📅 Daily Review ${due ? html`<span class="badge">${due}</span>` : nothing}</a>
          </div>
          <div class="goal" title="Weekly practice goal">
            <div class="ring" style="--p:${Math.min(1, week / WEEKLY_GOAL)}"><span>${week}</span></div>
            <p>
              <strong>This week: ${week} / ${WEEKLY_GOAL} practice answers.</strong><br />
              <span class="muted">A little practice on several days beats one long session.</span>
            </p>
          </div>
        </div>
        <div class="demo" aria-label="Demo: Légal's Mate, a famous trap from 1750">
          <chess-board .fen=${demo.fen} .lastMove=${demo.last} .label=${"Demo board showing Légal's Mate"}></chess-board>
          <p class="muted caption">Légal's Mate, 1750. You will learn it in Stage 4!</p>
        </div>
      </section>

      <section>
        <h2 class="section">Your learning path</h2>
        <div class="path">
          ${PATH.map(
            (stage, si) => html`<article class="card stage">
              <h3><span class="num">${si + 1}</span>${stage.title.replace(/^Stage \d+ · /, '')}</h3>
              <div class="pills">
                ${stage.ids.map((id) => {
                  const l = lessonById(id)!;
                  const st = status(getLesson(store.state, id));
                  return html`<a class="pill ${st}" href="#/lesson/${id}" title=${st === 'mastered' ? 'Mastered' : st === 'learning' ? 'Learning' : 'New'}>
                    ${st === 'mastered' ? '★ ' : st === 'learning' ? '◐ ' : ''}${l.title}
                  </a>`;
                })}
              </div>
            </article>`,
          )}
        </div>
      </section>

      <section>
        <h2 class="section">Explore by category</h2>
        <div class="cats">
          ${CATEGORIES.map((c) => {
            const ls = lessonsIn(c.id);
            const mastered = ls.filter((l) => status(getLesson(store.state, l.id)) === 'mastered').length;
            const learning = ls.filter((l) => status(getLesson(store.state, l.id)) === 'learning').length;
            return html`<a class="card cat" href="#/category/${c.id}" style="--hue:${c.hue}">
              <div class="emblem">${pieceSvg('w', c.icon)}</div>
              <div>
                <h3>${c.title}</h3>
                <p class="muted">${c.blurb}</p>
                <div class="bar" aria-label="${mastered} mastered, ${learning} learning, of ${ls.length}">
                  <span class="m" style="flex:${mastered}"></span><span class="l" style="flex:${learning}"></span
                  ><span class="n" style="flex:${ls.length - mastered - learning}"></span>
                </div>
                <p class="small muted">${ls.length} strategies · ${mastered} mastered</p>
              </div>
            </a>`;
          })}
        </div>
      </section>
    `;
  }

  static styles = [
    shared,
    css`
      :host {
        display: grid;
        gap: 3rem;
      }
      .hero {
        display: grid;
        gap: 2rem;
        align-items: center;
      }
      @media (min-width: 900px) {
        .hero {
          grid-template-columns: 1.1fr 0.9fr;
        }
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-weight: 800;
        font-size: 0.85rem;
        color: var(--accent-2);
      }
      h1 {
        font-size: clamp(2.2rem, 6vw, 4rem);
        letter-spacing: -0.02em;
      }
      .glow {
        background: linear-gradient(100deg, var(--accent), var(--accent-2), oklch(0.8 0.2 330), var(--accent));
        background-size: 300% 100%;
        background-clip: text;
        color: transparent;
        animation: shimmer 8s linear infinite;
      }
      @keyframes shimmer {
        to {
          background-position: 300% 0;
        }
      }
      .lead {
        font-size: 1.2rem;
        max-width: 52ch;
      }
      .row {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        margin: 1.4rem 0;
      }
      .big {
        font-size: 1.05rem;
        padding: 0.8em 1.4em;
      }
      .badge {
        background: var(--warn);
        color: oklch(0.2 0.03 60);
        border-radius: 999px;
        padding: 0 0.5em;
        font-size: 0.85em;
      }
      .goal {
        display: flex;
        gap: 1rem;
        align-items: center;

        p {
          margin: 0;
        }
      }
      .ring {
        --p: 0;
        flex: none;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle, var(--bg-1) 0 23px, transparent 24px),
          conic-gradient(var(--good) calc(var(--p) * 360deg), var(--glass-strong) 0);
        position: relative;
      }
      .ring span {
        position: absolute;
        font-weight: 800;
      }
      .demo {
        max-width: 460px;
        width: 100%;
        justify-self: center;
        transition: rotate 0.4s;

        @media (min-width: 900px) {
          rotate: 2deg;
          &:hover {
            rotate: 0deg;
          }
        }
      }
      .caption {
        text-align: center;
        margin-top: 1rem;
      }
      .section {
        font-size: 1.6rem;
        margin-bottom: 1rem;
      }
      .path {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
      .stage {
        padding: 1.1rem 1.2rem;

        h3 {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.1rem;
        }
      }
      .num {
        display: grid;
        place-items: center;
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        color: oklch(0.2 0.03 260);
        font-size: 0.9rem;
      }
      .pills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }
      .pill {
        text-decoration: none;
        color: var(--text);
        font-size: 0.88rem;
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: var(--glass-strong);
        transition: border-color 0.2s, transform 0.15s;

        &:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        &.learning {
          border-color: color-mix(in oklch, var(--accent-2) 70%, transparent);
        }
        &.mastered {
          border-color: var(--good);
          background: color-mix(in oklch, var(--good) 20%, transparent);
        }
      }
      .cats {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .cat {
        display: flex;
        gap: 1rem;
        padding: 1.2rem;
        text-decoration: none;
        color: inherit;
        border-color: oklch(0.7 0.12 var(--hue) / 0.35);
        transition: transform 0.25s, box-shadow 0.25s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px -16px oklch(0.6 0.2 var(--hue) / 0.55);
        }
        h3 {
          font-size: 1.2rem;
        }
      }
      .emblem {
        flex: none;
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: radial-gradient(circle at 30% 25%, oklch(0.75 0.16 var(--hue)), oklch(0.4 0.12 var(--hue)));
        padding: 6px;
        box-shadow: inset 0 -6px 14px oklch(0 0 0 / 0.3);
      }
      .bar {
        display: flex;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        background: var(--glass-strong);

        .m {
          background: var(--good);
        }
        .l {
          background: var(--accent-2);
        }
      }
      .small {
        font-size: 0.85rem;
        margin: 0.4rem 0 0;
      }
      @media (prefers-reduced-motion: reduce) {
        .glow {
          animation: none;
        }
      }
    `,
  ];
}

customElements.define('home-view', HomeView);
