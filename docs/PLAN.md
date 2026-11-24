# Chess Strategy Explorer — Plan

A browser-based chess trainer that walks a learner (target: middle school, ages ~11–14)
through 50 well-known chess strategies, organised by category, with move-by-move
walkthroughs, optional spoken narration, and quizzes that build mastery of *which*
strategy to use and *how* to use it.

This plan was reviewed by an education expert; the full review is in
[`EDUCATION_REVIEW.md`](./EDUCATION_REVIEW.md). Section 8 lists what changed because of it.

## 1. Audience & goals

- Primary learner: a middle-schooler who knows how the pieces move but not much strategy.
- Secondary: a parent/adult learning alongside.
- Learning goals:
  1. **Recognise** the cues in a position that signal a strategy is available ("when").
  2. **Execute** the strategy move by move ("how").
  3. **Discriminate** between similar strategies (fork vs. skewer vs. pin) under mixed practice.
  4. **Explain** why it works.

## 2. Evidence-based learning design

We avoid unsupported ideas: no "learning styles" matching (Pashler et al., 2008), and no claim
that chess improves maths or IQ (little far transfer: Sala & Gobet, 2016).

| Principle | Evidence | How the app uses it |
|---|---|---|
| Worked examples before problem solving | Sweller & Cooper 1985; Atkinson et al. 2000. Benefit shrinks for stronger learners (expertise reversal, Kalyuga et al. 2003) | Every lesson starts with a narrated, step-through example. |
| Fading guidance | Renkl & Atkinson 2003 (our version is minimal: one example, prediction steps, then independent puzzles) | Walkthrough → "Predict the next move" steps → puzzles with hints on demand. |
| Segmenting (learner-paced) | Mayer & Chandler 2001 | One move per step; learner presses Next. No autoplay. |
| Signalling / cueing | Mayer 2009; van Gog 2014 (smaller gains for high prior knowledge: Richter et al. 2016) | Arrows and square highlights show what the narration refers to. Arrows also differ by dash pattern, not only colour. |
| Narration (modality) — offered as an option, not a proven gain | Mayer & Moreno 1998; Ginns 2005: the effect is strongest when the system sets the pace; here the learner sets it (see also Tabbers et al. 2004) | Optional narration (Web Speech API, on-device voices only), default **off**. |
| Redundancy caution | Kalyuga, Chandler & Sweller 1999; short keyword captions do little harm (Mayer & Johnson 2008) | When audio is on, the caption shows only the first sentence, with "Show full text". |
| Prediction | Brod, Hasselhorn & Bunge 2018 (benefit tied to feedback after a wrong prediction) | "What would you play here?" steps; the right move and explanation always follow. |
| Self-explanation | Chi et al. 1989; Bisra et al. 2018; menu-based works in software (Aleven & Koedinger 2002) | "Why does it work?" is a multiple-choice question, not free text. |
| Retrieval practice | Roediger & Karpicke 2006; middle-school classrooms: McDaniel et al. 2011; Agarwal, Nunes & Blunt 2021 | Puzzles and quizzes are the main practice mode. |
| Spacing | Cepeda et al. 2006, 2008 (our intervals are a heuristic) | Leitner boxes; Daily Review of due strategies. |
| Interleaving for discrimination | Rohrer & Taylor 2007; Brunmair & Richter 2019 (helps when categories are similar) | Mixed quizzes; wrong answers are drawn from groups of easily-confused strategies. |
| Elaborated, immediate feedback | Hattie & Timperley 2007; Shute 2008; avoid self-level praise (Kluger & DeNisi 1996) | Wrong → clue + one retry → answer with explanation. Praise names the strategy used. |
| Chunking (pattern recognition) | Chase & Simon 1973; Gobet & Simon 1996 (chunks need many varied instances) | Memorable names; several positions per strategy (see §8 for the gap). |
| Mastery learning with re-teaching | Kulik, Kulik & Bangert-Drowns 1990 (honest effect size ≈ 0.5) | Mastery needs spaced success; a missed quiz item links back to its lesson. |
| Motivation without overclaiming | Self-determination theory (Deci & Ryan); process praise (Mueller & Dweck 1998); expected rewards can undermine motivation (Deci, Koestner & Ryan 1999); mindset effects are small (Sisk et al. 2018) | Learner chooses path or category (autonomy), visible progress (competence). Weekly goal instead of a streak; no timers, no speed points. |
| Readability | Readability research (not cognitive load theory) | Grade 5–6 wording, ≤ 45 words per narration step (checked by a test), no chess notation in spoken text. |

## 3. Lesson structure (every strategy)

1. **Big idea** — one sentence.
2. **Spot it when…** — 2–3 concrete cues on the board.
3. **Worked example** — move-by-move steps with narration, arrows, highlights, and prediction steps.
4. **Why does it work?** — menu-based self-explanation.
5. **Watch out** — the most common mistake.
6. **Your turn** — 2+ puzzles with graded hints (the last hint highlights the piece to move).
7. **Quick check** — one multiple-choice concept question.

## 4. Quizzes & mastery

- **Item types**: *Find the move* (strategy name hidden, so the learner must choose the tool),
  *Name that strategy* (position → which strategy), *Which strategy is this?* (big idea →
  strategy), and concept questions.
- **Modes**: Daily Review (due strategies, capped at 12), Mixed Practice, Name That Strategy,
  Find the Move — each by chosen categories.
- **Leitner schedule**: boxes 1–6, review after 0, 1, 3, 7, 16, 35 days.
  - Correct → up one box, **at most one promotion per day**.
  - Wrong → down **one** box (min 1) and due today.
  - A puzzle solved after using **2+ hints** does not count as correct.
- **Mastered** = box ≥ 5 **and** ≥ 2 different positions solved **and** ≥ 1 *Find the move* success.
- Overlapping strategies (e.g. a double check is also a discovered check) are never offered as
  competing answers.
- All progress is stored in `localStorage`; nothing leaves the device.

## 5. The 50 strategies (6 categories) and learning path

**Thinking Habits (3):** Piece Values & Loose Pieces · Checks, Captures, Threats · Prophylaxis

**Opening Principles (6):** Control the Center · Develop Your Pieces (don't move one piece twice
without a reason) · Castle Early · Don't Bring the Queen Out Early · Connect Your Rooks · The Fianchetto

**Tactics (14):** Fork · Pin · Skewer · Discovered Attack · Discovered Check · Double Check ·
Removing the Defender · Deflection · Decoy · Overloading · In-Between Move (Zwischenzug) ·
Trapped Piece · Greek Gift Sacrifice · Perpetual Check

**Checkmate Patterns (10):** King & Queen Mate · King & Rook Mate · Back-Rank Mate ·
Scholar's & Fool's Mate · Ladder Mate · Smothered Mate · Anastasia's Mate · Arabian Mate ·
Boden's Mate · Légal's Mate

**Middlegame Strategy (10):** Knight Outpost · Rooks on Open Files · Rook on the Seventh ·
The Bishop Pair · Good vs. Bad Bishop · Weak Squares · Isolated Queen's Pawn · Doubled Pawns ·
Passed Pawns · Pawn Storm

**Endgames (7):** Activate Your King · The Opposition · Rule of the Square · Avoid Stalemate ·
Trade When Ahead · Lucena (Build a Bridge) · Philidor Defense

Each lesson is tagged Beginner / Intermediate / Advanced. The default **path** (six stages that
mix categories) follows the review's recommended order; free choice by category is always available.
The exact list lives in `src/data/index.ts` (`PATH`).

## 6. Truth-grounding the chess content

- Every walkthrough and puzzle move is checked for legality with chess.js in the test suite,
  and every line marked as mate is asserted to be checkmate.
- `npm run validate:engine` cross-checks every accepted puzzle answer with Stockfish
  (tactics must match the engine's best move or stay clearly winning; plans must not be mistakes),
  and lists walkthrough moves the engine dislikes for hand review (most are deliberate blunders
  by the losing side that the lesson punishes).
- Real games and openings are used where possible (Réti–Tartakower 1910, Légal 1750,
  Elephant Trap, Noah's Ark Trap, Ruy Lopez, French, Caro-Kann, Nimzo-Indian, Dragon, Pirc).

## 7. Technology

- **Vite** + **TypeScript**; static build (`dist/`, relative paths) deployable anywhere; `npm run dev` for live local work.
- **Lit** web components.
- **chess.js** for rules/legality.
- **2D board**: hand-drawn SVG pieces, animated moves, click or drag to move, typed moves
  ("Nf3" or "e2 e4") for keyboard and screen-reader users.
- **3D board (optional, lazy-loaded)**: Three.js — lathe-turned pieces, physical materials,
  environment lighting, shadows, orbit camera, animated moves.
- Web platform: View Transitions, CSS nesting, container queries, `oklch()`, `@property`,
  `:has()`, `<dialog>`, `prefers-reduced-motion`, Web Speech API, Web Audio (synthesized sound effects).
- **Vitest** tests for content, puzzle judging, spaced repetition, quiz building and piece tracking.

## 8. Changes made after the education review

Done:
- Added beginner essentials: piece values / loose pieces, checks-captures-threats (blunder check),
  K+Q and K+R mates, stalemate. Merged Scholar's and Fool's Mate. Dissolved "Attack & Defense".
- Tightened mastery (box 5, 2 positions, a find-the-move, one promotion per day, hints ≥ 2 don't count,
  wrong drops one box, review cap 12, 35-day box).
- Fixed citations (Brod et al. 2018, Kalyuga et al. 1999, modality caveat, Kulik ES, chunking label,
  readability rationale) and added the non-claims.
- On-device voices only; audio off by default; short captions; plain-language narration kept separate
  from notation.
- Menu-based self-explanation; one retry with a clue; strategy-focused praise; weekly goal instead of streak.
- Confusable-set distractors and an overlap list so each quiz item has one right answer.
- Re-teach link after a missed quiz item; Black-perspective puzzles.

Not yet done (good next steps):
- The review asks for **4–6 positions per strategy**; we currently have 2 puzzles per strategy
  (100 positions total). The data format supports adding more without code changes.
- A second worked example per lesson, "fork or not?" non-examples, and "Watch out" as a find-the-error item.
- Stored refutations for common wrong puzzle moves; parent mode.
