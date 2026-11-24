import { LitElement, css, html, nothing } from 'lit';
import type { CategoryId } from '../data/types';
import type { QuizMode } from '../logic/quiz';
import { speechSupported, voicesReady } from '../logic/speech';
import { pieceSvg } from './pieces';
import { shared } from './shared';
import { StoreController, quiet, store } from './store';
import './views/home-view';
import './views/category-view';
import './views/lesson-view';
import './views/quiz-view';
import './views/progress-view';
import './views/about-view';

interface Route {
  name: 'home' | 'category' | 'lesson' | 'quiz' | 'progress' | 'about';
  param?: string;
  query: URLSearchParams;
}

function parse(hash: string): Route {
  const [path, qs] = hash.replace(/^#\/?/, '').split('?');
  const [name, param] = path.split('/');
  const query = new URLSearchParams(qs ?? '');
  switch (name) {
    case 'category':
    case 'lesson':
    case 'quiz':
      return { name, param, query };
    case 'progress':
    case 'about':
      return { name, query };
    default:
      return { name: 'home', query };
  }
}

export class AppShell extends LitElement {
  static properties = { _route: { state: true }, _voices: { state: true } };
  declare _route: Route;
  declare _voices: SpeechSynthesisVoice[];

  protected readonly _store = new StoreController(this);
  private onHash = () => this.navigate();

  constructor() {
    super();
    this._route = parse(location.hash);
    this._voices = [];
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('hashchange', this.onHash);
    voicesReady().then((v) => (this._voices = v));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.onHash);
  }

  private navigate(): void {
    quiet();
    const apply = () => {
      this._route = parse(location.hash);
      window.scrollTo({ top: 0 });
      return this.updateComplete;
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce) document.startViewTransition(apply);
    else apply();
  }

  private openSettings(): void {
    voicesReady().then((v) => (this._voices = v));
    this.renderRoot.querySelector<HTMLDialogElement>('#settings')!.showModal();
  }

  private set<K extends keyof typeof store.state.settings>(key: K, value: (typeof store.state.settings)[K]): void {
    store.update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
  }

  private renderView() {
    const r = this._route;
    switch (r.name) {
      case 'category':
        return html`<category-view .categoryId=${r.param as CategoryId}></category-view>`;
      case 'lesson':
        return html`<lesson-view .lessonId=${r.param ?? ''}></lesson-view>`;
      case 'quiz':
        // Categories are passed as a string so re-renders don't look like a new quiz.
        return html`<quiz-view .mode=${(r.param ?? '') as QuizMode} .categories=${r.query.get('cats') ?? ''}></quiz-view>`;
      case 'progress':
        return html`<progress-view></progress-view>`;
      case 'about':
        return html`<about-view></about-view>`;
      default:
        return html`<home-view></home-view>`;
    }
  }

  render() {
    const s = store.state.settings;
    const nav = [
      ['home', '#/', 'Home'],
      ['quiz', '#/quiz', 'Practice'],
      ['progress', '#/progress', 'Progress'],
      ['about', '#/about', 'How it works'],
    ] as const;
    return html`
      <a class="skip" href="#main" @click=${(e: Event) => {
        e.preventDefault();
        this.renderRoot.querySelector<HTMLElement>('main')?.focus();
      }}>Skip to content</a>
      <header class="bar">
        <a class="logo" href="#/" aria-label="Chess Strategy Explorer home">
          <span class="mark">${pieceSvg('w', 'k')}</span>
          <span class="name">Chess Strategy <b>Explorer</b></span>
        </a>
        <nav aria-label="Main">
          ${nav.map(
            ([id, href, label]) => html`<a href=${href} class=${this._route.name === id ? 'on' : ''} aria-current=${this._route.name === id ? 'page' : 'false'}>${label}</a>`,
          )}
        </nav>
        <div class="tools">
          <button
            class="icon ${s.audio ? 'on' : ''}"
            @click=${() => {
              if (s.audio) quiet();
              this.set('audio', !s.audio);
            }}
            aria-pressed=${s.audio}
            title="Narration ${s.audio ? 'on' : 'off'}"
            ?hidden=${!speechSupported()}
          >
            ${s.audio ? '🔊' : '🔈'}<span class="sr-only">Narration</span>
          </button>
          <button class="icon ${s.board3d ? 'on' : ''}" @click=${() => this.set('board3d', !s.board3d)} aria-pressed=${s.board3d} title="3D board ${s.board3d ? 'on' : 'off'}">
            3D<span class="sr-only"> board</span>
          </button>
          <button class="icon" @click=${this.openSettings} title="Settings">⚙️<span class="sr-only">Settings</span></button>
        </div>
      </header>
      <main id="main" tabindex="-1">${this.renderView()}</main>
      <footer class="muted">
        Made for curious minds. Progress stays on this device. <a href="#/about">How it works</a>
      </footer>

      <dialog id="settings" aria-labelledby="settings-title">
        <form method="dialog">
          <h2 id="settings-title">Settings</h2>
          <fieldset>
            <legend>Narration</legend>
            ${speechSupported()
              ? html`
                  <label class="sw"><input type="checkbox" .checked=${s.audio} @change=${(e: Event) => this.set('audio', (e.target as HTMLInputElement).checked)} /> Read lessons aloud</label>
                  ${this._voices.length === 0
                    ? html`<p class="muted small">No on-device voice was found, so narration cannot play. (We never use online voices, so your text stays private.)</p>`
                    : html`<label>Voice
                          <select @change=${(e: Event) => this.set('voiceURI', (e.target as HTMLSelectElement).value)}>
                            ${this._voices.map((v) => html`<option value=${v.voiceURI} ?selected=${v.voiceURI === s.voiceURI}>${v.name}</option>`)}
                          </select>
                        </label>`}
                  <label>Speed: ${s.rate.toFixed(1)}×
                    <input type="range" min="0.6" max="1.4" step="0.1" .value=${String(s.rate)} @input=${(e: Event) => this.set('rate', Number((e.target as HTMLInputElement).value))} />
                  </label>
                  <label class="sw"><input type="checkbox" .checked=${s.shortCaptions} @change=${(e: Event) => this.set('shortCaptions', (e.target as HTMLInputElement).checked)} /> Short captions while narrating</label>
                  <p class="muted small">If you use a screen reader, leave narration off so the two voices don't overlap.</p>
                `
              : html`<p class="muted">This browser does not support speech.</p>`}
          </fieldset>
          <fieldset>
            <legend>Board & sound</legend>
            <label class="sw"><input type="checkbox" .checked=${s.board3d} @change=${(e: Event) => this.set('board3d', (e.target as HTMLInputElement).checked)} /> 3D board (drag to rotate)</label>
            <label class="sw"><input type="checkbox" .checked=${s.sound} @change=${(e: Event) => this.set('sound', (e.target as HTMLInputElement).checked)} /> Sound effects</label>
          </fieldset>
          <div class="end"><button class="btn primary">Done</button></div>
        </form>
      </dialog>
      ${nothing}
    `;
  }

  static styles = [
    shared,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
      }
      .skip {
        position: absolute;
        left: -999px;
        top: 0;
        z-index: 100;
        background: var(--accent);
        color: black;
        padding: 0.6rem 1rem;
        border-radius: 0 0 10px 0;

        &:focus {
          left: 0;
        }
      }
      .bar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.7rem clamp(1rem, 3vw, 2rem);
        background: color-mix(in oklch, var(--bg-0) 72%, transparent);
        backdrop-filter: blur(16px) saturate(1.4);
        border-bottom: 1px solid var(--line);
        view-transition-name: top-bar;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        text-decoration: none;
        color: var(--text);
        font-size: 1.05rem;
        white-space: nowrap;
      }
      .mark {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        padding: 3px;
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
      }
      .name b {
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
        background-clip: text;
        color: transparent;
      }
      nav {
        display: flex;
        gap: 0.3rem;
        margin-left: auto;
        overflow-x: auto;

        a {
          color: var(--muted);
          text-decoration: none;
          font-weight: 650;
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          white-space: nowrap;
        }
        a:hover {
          color: var(--text);
        }
        a.on {
          color: var(--text);
          background: var(--glass-strong);
        }
      }
      .tools {
        display: flex;
        gap: 0.4rem;
      }
      .icon {
        min-width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid var(--line);
        background: var(--glass);
        color: var(--text);
        font: inherit;
        font-weight: 800;
        cursor: pointer;

        &.on {
          border-color: var(--accent);
          background: color-mix(in oklch, var(--accent) 22%, transparent);
        }
      }
      @media (max-width: 720px) {
        .name {
          display: none;
        }
        .bar {
          flex-wrap: wrap;
        }
        nav {
          order: 3;
          width: 100%;
          margin-left: 0;
        }
        .tools {
          margin-left: auto;
        }
      }
      main {
        flex: 1;
        width: min(1240px, 100%);
        margin-inline: auto;
        padding: clamp(1rem, 3vw, 2.2rem);
        outline: none;
        view-transition-name: main;
      }
      footer {
        text-align: center;
        padding: 2rem 1rem;
        font-size: 0.9rem;

        a {
          color: var(--muted);
        }
      }
      dialog {
        width: min(480px, 92vw);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--bg-1);
        color: var(--text);
        padding: 1.5rem;

        &::backdrop {
          background: oklch(0 0 0 / 0.55);
          backdrop-filter: blur(4px);
        }
      }
      fieldset {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 0.8rem 1rem 1rem;
        margin: 0 0 1rem;
        display: grid;
        gap: 0.8rem;
      }
      legend {
        font-weight: 800;
        padding: 0 0.4rem;
      }
      label {
        display: grid;
        gap: 0.3rem;
        font-weight: 600;
      }
      label.sw {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      input[type='checkbox'] {
        width: 1.25rem;
        height: 1.25rem;
        accent-color: var(--accent);
      }
      select,
      input[type='range'] {
        font: inherit;
        accent-color: var(--accent);
      }
      select {
        padding: 0.5rem;
        border-radius: 10px;
        background: var(--glass-strong);
        color: var(--text);
        border: 1px solid var(--line);
      }
      .small {
        font-size: 0.85rem;
        margin: 0;
      }
      .end {
        display: flex;
        justify-content: flex-end;
      }
    `,
  ];
}

customElements.define('app-shell', AppShell);
