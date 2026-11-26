# Chess Strategy Explorer

Browser chess trainer that teaches 56 Core Path strategies and 11 named openings to middle-schoolers. Vite + TypeScript + Lit,
chess.js for rules, optional Three.js 3D board. Design and pedagogy: `docs/PLAN.md` and
`docs/EDUCATION_REVIEW.md` (core) and `docs/OPENINGS_REVIEW.md` (named openings and defence).

## Commands

- `npm install` — install dependencies.
- `npm run dev` — live local development server (Vite).
- `npm test` — run the Vitest suite: unit tests (content legality, puzzle judging, spaced repetition, quizzes,
  piece tracking) and browser tests in `tests/browser/` (piece animation, lesson flow) in headless Chromium.
  First time on a machine: `npx playwright install chromium`.
- `npm run build` — type-check (`tsc --noEmit`) and build static files into `dist/`.
- `npm run preview` — serve the built `dist/` locally.
- `npm run validate:engine [depth]` — cross-check every puzzle answer with Stockfish (WASM, runs in Node).
  Run this after changing any lesson content.

## Layout

- `src/data/lessons/*.ts` — the 56 Core Path lessons, one file per category, plus `openings.ts` (11 named openings).
  `src/data/index.ts` holds categories, the learning path (`PATH`, core only), groups of easily-confused strategies
  (`CONFUSABLE`), and the opening helpers (`OPENING_LESSONS`, `repertoireOptions`, `STARTER_KIT`).
- `src/logic/` — pure, tested logic: positions, puzzle judging, Leitner progress, quiz building, piece tracking,
  speech and sound.
- `src/ui/` — Lit components: boards (2D `chess-board`, 3D `chess-board-3d`, switcher `board-view`),
  `puzzle-runner`, `multi-choice`, `app-shell` (hash router), and `views/`.
- `scripts/validate-engine.mjs` — Stockfish validation.
- `.github/workflows/deploy.yml` — tests, builds and deploys to GitHub Pages on push to `main`.

## Content rules

- Narration (`say`) is plain words with no chess notation, ≤ 45 words (enforced by tests); the move is shown
  and spoken from its SAN separately.
- SAN must be written exactly as chess.js produces it (tests check this).
- Puzzle `lines` end on the learner's move; a final mating move accepts any checkmate.
- Mark puzzles `kind: 'plan'` when several good moves exist; `'tactic'` when the engine's best move is the answer.
- Narration voices must be on-device only (`localService`); never send text to network voices.
- Named openings (`opening` field) are taught as defining moves plus a plan, never long lines. Each has a
  "Meeting it" walkthrough shown from the other side and its own puzzle. Opening puzzles are `kind: 'plan'`
  unless one move is clearly best. They stay out of the Core Path and core mastery; only the learner's
  three repertoire openings enter Daily Review (at most 3 a day).
