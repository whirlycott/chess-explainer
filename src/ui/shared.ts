import { css } from 'lit';

/** Styles shared by all components (custom properties come from global.css). */
export const shared = css`
  :host {
    color: var(--text);
    font: inherit;
  }
  * {
    box-sizing: border-box;
  }
  h1, h2, h3 {
    line-height: 1.15;
    margin: 0 0 0.4em;
    text-wrap: balance;
  }
  p {
    margin: 0 0 0.8em;
    line-height: 1.55;
    text-wrap: pretty;
  }
  .btn {
    --b: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45em;
    min-height: 44px;
    padding: 0.55em 1.1em;
    border-radius: 999px;
    border: 1px solid color-mix(in oklch, var(--b) 60%, transparent);
    background: color-mix(in oklch, var(--b) 18%, transparent);
    color: var(--text);
    font: inherit;
    font-weight: 650;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.15s, background 0.2s, box-shadow 0.2s;

    &:hover {
      background: color-mix(in oklch, var(--b) 30%, transparent);
      box-shadow: 0 0 0 4px color-mix(in oklch, var(--b) 18%, transparent);
    }
    &:active {
      transform: scale(0.97);
    }
    &.primary {
      background: linear-gradient(135deg, var(--b), color-mix(in oklch, var(--b) 70%, white));
      color: oklch(0.18 0.03 260);
      border-color: transparent;
    }
    &.ghost {
      background: transparent;
      border-color: var(--line);
    }
    &[disabled] {
      opacity: 0.45;
      pointer-events: none;
    }
  }
  :focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  .card {
    background: var(--glass);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    backdrop-filter: blur(14px) saturate(1.3);
    box-shadow: var(--shadow);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 0.2em 0.65em;
    border-radius: 999px;
    background: color-mix(in oklch, var(--chip, var(--accent)) 22%, transparent);
    border: 1px solid color-mix(in oklch, var(--chip, var(--accent)) 50%, transparent);
  }
  .muted {
    color: var(--muted);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;

export const LEVEL_NAMES = ['', 'Beginner', 'Intermediate', 'Advanced'] as const;
export const LEVEL_HUES = [0, 150, 75, 25] as const;
