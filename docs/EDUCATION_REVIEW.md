# Education Review of PLAN.md

Scope: learning-science accuracy, lesson and mastery design, curriculum sequencing, narration and feedback for ages 11–14. Overall, the plan is unusually well grounded. Its main weaknesses are **too little practice per pattern** (one example and one puzzle cannot build chess "chunks"), **a mastery rule that is easy to game**, and **missing beginner content** that scholastic coaches treat as essential.

## 1. Evidence table: accuracy check

| Row | Verdict | Correction / caveat |
|---|---|---|
| Pashler et al. 2008 | Correct | — |
| Sweller & Cooper 1985; Atkinson et al. 2000 | Correct | "Strongest for novices" is the expertise-reversal effect. Cite Kalyuga et al. 2003. The implication: fade the examples faster for stronger players. |
| Renkl & Atkinson 2003 | Correct citation, loosely applied | Their fading removes worked steps one at a time across *several* examples (backward fading). One example with prediction steps followed by one puzzle is a minimal version. See §2. |
| Mayer & Chandler 2001 | Correct | — |
| Mayer 2009; van Gog 2014 | Correct | Richter, Scheiter & Eitel 2016 (meta-analysis) found smaller gains for learners with high prior knowledge. |
| Mayer & Moreno 1998; Ginns 2005 | Correct, but overstated | Ginns found the modality effect mainly when the **system sets the pace** and the material is short. This app is learner-paced, which weakens the effect and can even reverse it (Tabbers et al. 2004). Present audio as an option, not as a proven gain. |
| "Kalyuga & Sweller" | Incomplete citation | Cite Kalyuga, Chandler & Sweller 1999 or Kalyuga & Sweller 2014 (Cambridge Handbook). The harm comes from *verbatim* text plus narration next to a picture. Short keyword captions do little harm (Mayer & Johnson 2008), and Adesope & Nesbit 2012 found the effects depend on context. |
| Slamecka & Graf 1978; Brod 2021 | Partly wrong | Slamecka & Graf studied word pairs, so applying it to chess moves is an extrapolation. Brod 2021 (*Educ. Psych. Review*) is an age-focused **review** of generative strategies, not a prediction study. For prediction, cite Brod, Hasselhorn & Bunge 2018. Their benefit depended on **surprise** (prediction error), so feedback after a wrong prediction is the active ingredient. |
| Chi et al. 1989, 1994; Bisra et al. 2018 | Correct | Typed self-explanations in software tend to be skipped or shallow. Menu-based self-explanation works (Aleven & Koedinger 2002). |
| Roediger & Karpicke 2006; Adesope et al. 2017 | Correct | Roediger & Karpicke tested college students. Add a middle-school source: McDaniel, Agarwal et al. 2011, or Agarwal, Nunes & Blunt 2021. |
| Cepeda et al. 2006 | Correct | The Leitner intervals are a heuristic, not derived from Cepeda. Cepeda et al. 2008 suggest the best gap grows with how long you want learners to remember. |
| Rohrer & Taylor 2007; Brunmair & Richter 2019 | Correct | Brunmair & Richter found that interleaving helps when the categories look **similar** (good fit for fork, skewer and pin). It was neutral or harmful for dissimilar material such as expository text. |
| Hattie & Timperley 2007; Shute 2008 | Correct | Shute: immediate feedback suits novices and procedures. Add Kluger & DeNisi 1996: feedback aimed at the self ("you're smart") can lower performance. |
| Sweller (CLT) → reading level | Mislabelled | Cognitive load theory does not set a grade level. Keep the rule but justify it on readability grounds. |
| Chase & Simon 1973; Gobet | Correct, but it implies *more* than the plan delivers | Chunks form from exposure to **many** varied instances (Gobet & Simon 1996). The row says "Concrete → abstract", which is a different idea (concreteness fading, Fyfe et al. 2014). |
| Bloom 1984; Kulik et al. 1990 | Bloom's "2 sigma" figure is overcited | The 2-sigma result came from tutoring *plus* mastery learning. Kulik's ES ≈ 0.5 is the honest number. Bloom's mastery learning also needs **corrective re-teaching** after a failed check, which the plan lacks. |
| SDT; Dweck; Sisk et al. 2018 | Correct and well hedged | Cite Mueller & Dweck 1998 for process praise. Add Deci, Koestner & Ryan 1999: expected rewards undermine intrinsic motivation. |

Add a non-claim: chess instruction shows little far transfer to maths or IQ (Sala & Gobet 2016). The app should not market itself that way.

## 2. Lesson structure

The order is sound. Suggested changes:

1. **Two worked examples, not one,** with different surfaces: say, a knight fork and then a pawn or queen fork, one from Black's side. Comparing examples builds the abstract schema (Alfieri et al. 2013).
2. **Add a "Fork or not?" step after the examples**: two or three quick board yes/no items, including near-misses (the forked piece is defended; it is a skewer, not a fork). Non-examples are what drive discrimination (learning goal 3).
3. **Use at most one or two prediction steps per example, and only on guessable moves.** On a wrong try: "Good idea to check that — but see what it allows," then reveal. Store one or two refutations of common wrong moves in the content files. No engine is needed at runtime.
4. **Make self-explanation a choice**: "Why did Nf7 work?" with three reasons, one of which states the cue. Offer an optional "Say it out loud to someone" for the parent audience.
5. **Turn "Watch out" into a find-the-error item** ("This player tried a fork. What went wrong?"). Erroneous examples help middle schoolers on delayed tests (McLaren et al. 2016). Keep it after the correct examples.
6. **"Your turn" should be a set of 3–5 graded puzzles,** not one. Use tiered hints: (1) the cue ("Look for two undefended pieces"), (2) the piece, (3) the square. If the learner uses hint level 2 or higher, do not count the item as a correct retrieval.
7. **Quick check**: base it on a board position, and do not let it promote the Leitner box. Same-session success mostly measures short-term memory.
8. **Target 5–8 minutes per lesson.** Show a progress bar of the seven steps.

## 3. Quiz and mastery design

- **The mastery rule is too easy.** "Box ≥ 4" can be reached with three correct answers in about 4 days, and the guess rate on 4-option questions is 25%. Change it to **box 5 reached** (a correct answer after a gap of at least 7 days) **on at least two different positions**, with at least one of them a *Find the move* item.
- **Cards need a puzzle bank.** Use 4–6 positions per strategy, never the same position twice in a row. Otherwise children memorise the answer instead of the pattern.
- **Intervals**: keep 0, 1, 3, 7, 16 days and add **box 6 at 35 days** for maintenance. Allow at most one promotion per card per calendar day.
- **Wrong answers drop one box, not all the way to box 1.** Box 4–5 cards drop to box 2. Full resets feel punitive and children quit. Show "needs a refresh" instead of taking away a mastered badge.
- **Cap Daily Review at about 12 items**, most overdue and lowest box first. A child returning after two weeks must not face 50 cards.
- **Interleaving**: block practice inside the lesson, interleave in review, and use only strategies the child has already met. Pick distractors from confusable sets (fork/double attack/skewer, pin/skewer/x-ray, deflection/decoy/overloading), not at random. A coach should check that every "Name that strategy" item has **one** defensible answer, because many real positions are both a pin and a removal of the defender.
- **Mastery check failure → re-teach**: offer the second worked example again (Bloom's correctives).

## 4. Curriculum and sequencing

**Missing beginner essentials**, which most scholastic programmes (e.g. the Steps Method) teach first:
- Piece values and counting attackers vs. defenders
- **Hanging/loose pieces** ("loose pieces drop off")
- **Checks, captures, threats** as a thinking routine and blunder check
- **K+Q vs K and K+R vs K mates**
- **Avoiding stalemate when winning**

At this level, games are lost to hung pieces far more often than to positional errors. Fool's Mate and Scholar's Mate can be merged into one lesson, "Early queen attacks on f7/f2," to free a slot.

**Category fixes**: "Attack & Defense" (4 items) is incoherent. Move *Trade When Ahead* to Endgames or Middlegame, and *Perpetual Check* to Tactics as a drawing resource. *The Fianchetto* is a setup, not a principle, so mark it intermediate. Rephrase "Don't Move a Piece Twice" as "...without a good reason."

**Levels:**
- **Beginner (B)**: Center, Develop, Castle, Queen early, Connect Rooks, Fork, Pin, Skewer, Discovered Attack, Trapped Piece, Back-Rank, Scholar's/Fool's, Ladder, Activate King, Rule of the Square, Trade When Ahead, Rooks on Open Files, plus the missing essentials above.
- **Intermediate (I)**: Fianchetto, Move Twice, Discovered/Double Check, Removing the Defender, Deflection, Decoy, Overloading, X-Ray, Smothered, Arabian, Anastasia, Boden, Epaulette, Légal, Opposition, Perpetual, Outpost, Seventh Rank, Passed Pawns, Doubled Pawns, Bishop Pair.
- **Advanced (A)**: Zwischenzug, Good vs. Bad Bishop, Weak Squares, IQP, Minority Attack, Prophylaxis, Greek Gift, Pawn Storm, Lucena, Philidor.

**Recommended path** (mixing categories, with interleaved review between stages):
1. Values, loose pieces, CCT → Center, Develop, Castle, Queen early → Scholar's/Fool's defence
2. Back-rank, Ladder, K+Q/K+R mates, stalemate → Fork, Pin, Skewer, Trapped Piece
3. Discovered Attack → Discovered Check → Double Check → Removing the Defender → Activate King, Rule of the Square, Trade When Ahead
4. Deflection, Decoy, Overloading, X-Ray → Smothered, Arabian, Anastasia, Boden, Epaulette, Légal → Opposition, Perpetual
5. Connect Rooks, Open Files, Seventh, Outpost, Passed/Doubled Pawns, Bishop Pair, Fianchetto, Move-twice
6. Advanced list (Zwischenzug and Greek Gift first, then the positional topics, then Lucena and Philidor)

Show this as the default "Path." Keep free choice of category for autonomy.

## 5. Narration and on-screen text

- **Separate `say` and `show` fields** in the content. Text-to-speech mangles "Nf7", "O-O" and "Bxf7+". Say "knight takes on f7, check", and show the notation next to the board highlight.
- **Length**: 1–2 sentences per step, at most about 30 words (about 12 seconds of audio). Introduce one new term per step and link it to a glossary pop-up.
- **Reading level**: aim for Flesch-Kincaid grade 5–6 rather than 6–7, because reading ability in grades 6–8 varies widely. Write in the second person, in active voice, with no idioms (helps English-language learners). Use "In-between move" as the primary name and give *Zwischenzug* as a fun fact.
- **Tone**: a friendly coach, not a cartoon. Twelve-year-olds dislike being talked down to.
- **Audio vs. captions**: **default audio off** (classrooms, no headphones). When audio is on, show a **short keyword caption** ("Fork: king + rook") rather than the full text, with a button to expand the full transcript.
- **Privacy catch**: in Chrome, some Web Speech voices (e.g. "Google US English") are network voices, so the text leaves the device. That contradicts §4's "no data leaves the device". Prefer `voice.localService === true`. Offer voice and speed choice, with 0.9× as the default.
- **Accessibility**: if a screen reader is running, mute text-to-speech so the ARIA live region and the narration don't talk over each other. Distinguish arrows by shape or dash pattern, not only red/green. Support text-only moves from the keyboard ("e2 to e4"). Use 1.5 line height and no italics for body text. Allow font scaling.

## 6. Feedback and motivation

- **Wrong answer**: give the cue, then one retry, then reveal. For example: "Not yet. Look at the king and the rook — can one piece hit both?" Then: "Here's the fork: Nc7+. The knight checks the king *and* attacks the rook." Answer-until-correct with elaboration beats one-shot right/wrong feedback (Attali 2015). Avoid "Wrong!", buzzers and big red X's.
- **Wrong puzzle move**: show the stored refutation ("After Qh5, Black just plays g6"). Otherwise give the generic cue hint.
- **Praise**: specific to the process or strategy ("You checked whether the knight was defended — that's why it worked"). Never praise the person ("You're a genius"). Skip praise on trivially easy items. Vary the wording.
- **Normalise errors**: "Even grandmasters miss forks — the habit that saves them is a blunder check."
- **Gamification to avoid**: daily streaks that break (use a **weekly goal** instead), points for speed, badges for opening lessons rather than mastering them, timers, and loss-framed messages. **Do**: a mastery map that fills in, optional surprise unlocks such as a famous game replay or a 3D piece set (unexpected rewards don't undermine motivation), and visible "skills I can use" lists.

## 7. Prioritised recommendations

**Must change**
1. Add a puzzle bank (4–6 positions per strategy) and 3–5 graded puzzles per lesson.
2. Tighten mastery: box 5, at least 2 distinct positions, at least 1 *Find the move*, one promotion per day, hint level 2+ ≠ correct.
3. Add the beginner essentials (values, loose pieces, CCT and blunder check, K+Q/K+R mates, stalemate), and present a sequenced default Path with B/I/A tags.
4. Fix citations: Brod 2018 for prediction, the full Kalyuga citation, the modality caveat for learner-paced material, Bloom's 2-sigma overclaim, and the chunking row label.
5. Use local-only text-to-speech voices, or drop the "no data leaves the device" claim.

**Should change**
6. Wrong answer drops one box; cap Daily Review at about 12; add box 6 at 35 days.
7. Menu-based self-explanation; "Watch out" as a find-the-error item.
8. Add a second worked example and "Fork or not?" non-examples.
9. Choose interleaved distractors from confusable sets, and have a coach check that each item has one answer.
10. Separate `say` and `show` fields; keyword captions when audio is on; default audio off.
11. Regroup "Attack & Defense"; merge Fool's and Scholar's.

**Nice to have**
12. Stored refutations for common wrong moves in puzzles.
13. Puzzles from Black's perspective; "spot the danger" defensive puzzles.
14. Weekly goal instead of a streak; surprise unlocks.
15. Re-teach loop after a failed mastery check.
16. Parent mode with "ask your child why" prompts.
