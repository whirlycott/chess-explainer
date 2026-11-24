# Chess Strategy Explorer

Learn 50 well-known chess strategies, move by move. Built for middle-school learners using
research-backed methods: worked examples, prediction, self-explanation, retrieval practice,
spaced review and interleaved quizzes.

- 6 categories: Thinking Habits, Opening Principles, Tactics, Checkmate Patterns, Middlegame Strategy, Endgames
- Every lesson: big idea → cues → narrated worked example with "predict the move" steps → why it works →
  common mistake → puzzles → quick check
- Practice: Daily Review (spaced repetition), Mixed Practice, Name That Strategy, Find the Move
- Optional narration (on-device voices only), optional 3D board, keyboard move entry
- Progress is stored only in your browser

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
```

## Build static files

```sh
npm run build      # outputs dist/ (relative paths: host it from any folder)
npm run preview
```

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` runs the tests, builds, and publishes `dist/` to GitHub Pages on every
push to `main` (or by hand from the Actions tab). In the repository settings, set **Pages → Source** to
**GitHub Actions** once.

## Check it

```sh
npm test                    # content legality + logic tests
npm run validate:engine     # Stockfish cross-check of every puzzle answer
```

See `docs/PLAN.md` for the design and `docs/EDUCATION_REVIEW.md` for the expert review.
