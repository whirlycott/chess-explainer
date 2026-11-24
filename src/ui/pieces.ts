import { svg, type SVGTemplateResult } from 'lit';

/** Hand-drawn piece silhouettes on a 45x45 grid. */
const BODY: Record<string, string> = {
  p: 'M22.5 8a5.5 5.5 0 0 0-3.6 9.7C15.7 19.4 14 22.3 14 25.8c0 2.3 1 4 2.7 5L12.6 36h19.8l-4.1-5.2c1.7-1 2.7-2.7 2.7-5 0-3.5-1.7-6.4-4.9-8.1A5.5 5.5 0 0 0 22.5 8z',
  r: 'M15.5 32V17.5h14V32zM13 17.5l1.6-3h15.8l1.6 3zM13 14.5V8.5h4v2.2h3.6V8.5h3.8v2.2H28V8.5h4v6zM14 36l1.5-4h14l1.5 4z',
  b: 'M15 36c1-3 3-4.5 3.2-6.2C15 27.7 13 24.7 13 21c0-5.1 4.8-9.6 9.5-12.2C27.2 11.4 32 15.9 32 21c0 3.7-2 6.7-5.2 8.8.2 1.7 2.2 3.2 3.2 6.2z',
  q: 'M13.5 36L10 15.5l6.3 9.6L18 12.2l4.5 12.2L27 12.2l1.7 12.9 6.3-9.6L31.5 36z',
  k: 'M14 36c-1-5-5.5-8-5.5-13.2 0-3.9 2.9-6.3 6.1-6.3 3.1 0 5.4 2.1 7.9 5.2 2.5-3.1 4.8-5.2 7.9-5.2 3.2 0 6.1 2.4 6.1 6.3C36.5 28 32 31 31 36z',
  n: 'M14 36c0-6.3 2.2-9.5 6.4-12.6 2.1-1.6 2.6-3.2 2.1-5.3-2 1.6-4.2 2.2-6.2 2.6-1.6.4-3.2-.6-3.2-2.3 0-1.2.6-2.1 1.7-2.9L20 10.6c1-2 2.1-4 3.1-5.1l1.5 2.6c1.6-.3 3.1-.3 4.6.4C33.2 10.6 35.6 16 35.6 22.4c0 5.1-1 9.2-2 13.6z',
};

const BASE = 'M11 36h23a1.5 1.5 0 0 1 1.5 1.5V40H9.5v-2.5A1.5 1.5 0 0 1 11 36z';

function details(type: string, line: string): SVGTemplateResult {
  switch (type) {
    case 'b':
      return svg`<circle cx="22.5" cy="6.6" r="2.6" fill="inherit" stroke="inherit"/>
        <path d="M25.4 15.2l-5 6.4" stroke=${line} stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    case 'q':
      return svg`${[10, 16.3, 22.5, 28.7, 35].map(
        (x, i) => svg`<circle cx=${x} cy=${i === 0 || i === 4 ? 13.2 : i === 2 ? 9.6 : 10.2} r="2.3" fill="inherit" stroke="inherit"/>`,
      )}<path d="M14.6 31.5h15.8" stroke=${line} stroke-width="1.4" fill="none"/>`;
    case 'k':
      return svg`<path d="M21.3 3.5h2.4v3.1h3v2.3h-3v6.6h-2.4V8.9h-3V6.6h3z" fill="inherit" stroke="inherit"/>
        <path d="M14.6 31.5h15.8" stroke=${line} stroke-width="1.4" fill="none"/>`;
    case 'n':
      return svg`<circle cx="25" cy="13.4" r="1.3" fill=${line}/>
        <path d="M30.5 12c1.8 3 2.6 6.6 2.4 11" stroke=${line} stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".55"/>`;
    case 'r':
      return svg`<path d="M15.5 21h14" stroke=${line} stroke-width="1.2" fill="none" opacity=".6"/>`;
    default:
      return svg``;
  }
}

/** One piece as an SVG. `color` is 'w' or 'b'; `type` is a chess.js piece letter. */
export function pieceSvg(color: 'w' | 'b', type: string): SVGTemplateResult {
  const fill = color === 'w' ? 'url(#pw)' : 'url(#pb)';
  const stroke = color === 'w' ? '#2b2420' : '#05060a';
  const line = color === 'w' ? '#2b2420' : '#c9d3e6';
  return svg`<svg viewBox="0 0 45 45" class="piece-svg" aria-hidden="true">
    <defs>
      <linearGradient id="pw" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fffdf7"/><stop offset=".55" stop-color="#efe6d3"/><stop offset="1" stop-color="#c9b996"/>
      </linearGradient>
      <linearGradient id="pb" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#59606f"/><stop offset=".5" stop-color="#2a2e38"/><stop offset="1" stop-color="#0f1116"/>
      </linearGradient>
    </defs>
    <g fill=${fill} stroke=${stroke} stroke-width="1.5" stroke-linejoin="round">
      <path d=${BODY[type]}/>
      <path d=${BASE}/>
      ${details(type, line)}
    </g>
  </svg>`;
}
