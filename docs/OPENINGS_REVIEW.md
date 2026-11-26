# Review: Named Openings and Defensive Strategies

Scope: Proposal A (about 13 named-opening lessons with "How to counter it"), the gaps in defensive content, and what both mean for the "50 strategies" framing and the mastery system. Audience: ages 11–14 who know the moves.

## Verdict summary

- **Add named openings, but as a separate, optional "Openings" section outside the core 50.** Recommend it after Stage 2 of the Path, not before. Both the evidence and the coaches agree that opening study pays off least at this level. Kids still ask for opening names, though, and the names help them remember positions.
- **Teach a playable repertoire of three openings and only recognise the rest.** Each child picks one White opening, one answer to 1.e4 and one answer to 1.d4. Those three get full spaced review. The other openings appear only in recognition quizzes.
- **Depth: the defining 3–6 moves, then a plan in words.** No book moves beyond that. Opening puzzles accept any sound, principled move.
- **"How to counter it" is a good idea.** It is threat-spotting and prophylaxis applied to the opening. Name it **"Meeting the …"**, not "Beating the …". Most of these openings cannot be refuted.
- **11 lessons, in 3 tiers, not 13.** Keep the English (as Philippe asked), the Sicilian and the King's Indian, but tag them Advanced and recognise-first. The Scandinavian and the London are fine for beginners.
- **Defence is under-covered, and that matters more than openings.** Add **6 core defensive lessons** (two Beginner, four Intermediate) and 2 optional Advanced ones.
- **Drop "top 50" as a fixed number.** The core grows to 56. Openings get their own progress map and do not count toward core mastery.
- **One naming bug:** the endgame lesson "Philidor Defense" will collide with the *opening* that club players call the Philidor Defence (1.e4 e5 2.Nf3 d6). Rename the endgame lesson **"Philidor Position"**.

## 1. Recommendation

### 1a. Openings section (separate from the core; own progress map)

| Tier (unlock hint) | Lesson | Level | Links to existing lessons | "Meeting it" section | Trap |
|---|---|---|---|---|---|
| **1 · Starter** (after Stage 2) | Italian Game | B | center, develop, castle, cct | Two Knights Defence; meeting Ng5 and the Fried Liver (…d5, then …Na5) | Fried Liver (Nxf7) |
| | Scotch Game | B | center (already uses this line) | Black's quick …Bc5 / …Nf6 development | Early queen grab on e5 |
| | London System | B | develop, castle | …c5 and …Qb6 hitting b2 | Qb6xb2 when b2 is undefended |
| | Queen's Gambit (Declined and Accepted) | I | center, pin | QGD: keep the d5 pawn, develop. QGA: give the pawn back | Elephant Trap (QGD); …b5? a4 trap (QGA) |
| | Scandinavian Defence | B | queen-early (a principled exception) | Nc3 gains time on the queen | Queen chased into a trap |
| **2 · Club** (after Stage 4) | Ruy Lopez | I | pin, trapped-piece, prophylaxis | Morphy Defence …a6; the Exchange line 4.Bxc6 dxc6 5.Nxe5? Qd4 | Noah's Ark Trap |
| | French Defence | I | bad-bishop, pawn chains | White's Advance plan; Black's …c5 break | Bad light-squared bishop |
| | Caro-Kann Defence | I | develop, smothered | Black develops the bishop *before* …e6 | 5…Ngf6?? 6.Nd6# (smothered) |
| **3 · Recognise first** (after Stage 5) | Sicilian Defence | A | pawn-storm (Dragon), open-file | The c3 setup (Alapin) as a simple anti-Sicilian | Early …Nf6 in some lines; mainly ideas, not traps |
| | King's Indian Defence | A | fianchetto, pawn-storm | White's space plan (queenside c5 push) | Black's …e5 / …f5 attack shown, not memorised |
| | English Opening | A | fianchetto, center | 1…e5: "a Sicilian with colours reversed" | Ideas only |

**Repertoire picker.** The first time a child enters the section, offer a "starter kit":
- White: Italian (or London for a child who prefers calm positions)
- Against 1.e4: 1…e5, which the Italian, Scotch and Ruy "Meeting it" sections teach
- Against 1.d4: Queen's Gambit Declined

Only the openings the child has chosen go into Daily Review. All 11 are available in *Name That Opening*.

**How to frame the English for kids.** "You don't have to *stand* in the center to *control* it." The c-pawn watches d5, and the fianchettoed bishop sweeps the long diagonal. Teach it as the exception that confirms the center principle: the target is still the center. Do not offer it as a first White opening.

**Lesson format changes** (the rest of Proposal A is sound):
- The worked example covers the defining moves plus **one plan sentence** for moves 6–12. Do not show long lines.
- The "Meeting it" walkthrough is shown from the other side, with the board flipped, and has its own puzzle.
- Opening puzzles use `kind: 'plan'` with generous `alsoGood`. Judge them against principles, not against the book move.
- Reuse the existing traps (Elephant, Noah's Ark, Fried Liver via the cct puzzle). Keep the puzzle-bank rule: the same position must never come up twice in a row across lessons.

**Quizzes**
- *Name That Opening*: use the **defining position** (after moves 2–4) or the typical pawn structure, never a move-15 position. Transpositions make late positions ambiguous. Confusable sets: `[italian, ruy-lopez, scotch]`, `[french, caro-kann, scandinavian]`, `[queens-gambit, london, kings-indian]`, `[english, sicilian]`.
- Replace "Which opening suits this goal" with **"Which opening is aiming for this plan?"** For example: "Black swaps a side pawn for a center pawn and gets a half-open c-file." Drop any "suits your personality" wording (§3e).

### 1b. Defensive lessons (core; count toward the core total)

| Lesson (club name in brackets) | Level | Category | Path placement |
|---|---|---|---|
| **Meet the Threat** (move it, guard it, block, take the attacker, counterattack) | B | Thinking Habits | Stage 1, right after cct |
| **Escape from Check** ("Capture, Block, Run"; ChessKid teaches "CPR") and choosing the *best* escape | B | Thinking Habits | Stage 2, before back-rank |
| **Breaking a Pin** (unpin, "put the question to the bishop" with h6, block, counter-pin) | I | Tactics | Stage 3 |
| **Trade Off the Attackers** (and "when behind, trade pawns, not pieces") | I | Middlegame | Stage 4 |
| **Swindles: the Stalemate Trick** (desperado rook, "swindle") | I | Endgames | Stage 4, next to perpetual |
| **Blockade** (Nimzowitsch: blockade a passed pawn, ideally with a knight) | I | Middlegame | Stage 5, next to passed-pawn |
| *Optional:* Fortress | A | Endgames | Stage 6 |
| *Optional:* Give Material Back ("return the pawn") | A | Middlegame | Stage 6 |

Not as separate lessons:
- **Luft** is already taught in back-rank. Add 2 defensive puzzles there ("make luft before it's too late").
- **Counterattack** is option 5 of *Meet the Threat*, and in-between move already covers it.

New confusable sets:
- `[meet-threat, escape-check, cct]`
- `[perpetual, stalemate-trick, philidor]`
- `[blockade, passed-pawn, outpost]`
- `[break-pin, pin, skewer]`

### 1c. Totals, framing and mastery

- **Core: 56** (50 + 6), with the 2 optional Advanced lessons shown on an "Extras" shelf. **Openings: 11**, on a separate map with their own badge ("My Repertoire").
- **Replace "50 strategies" with "the Core Path"** in the UI and in PLAN.md. If Philippe wants to keep the number 50, move six Advanced lessons to Extras: for example IQP, Pawn Storm, Weak Squares, Boden, Arabian and Greek Gift. That is his call. The evidence does not favour any particular number.
- **Daily Review:** keep the cap at 12, with **at most 3 opening items**, and only from the chosen repertoire. Openings must not crowd out tactics.
- **Opening mastery:** reach box 5 with (a) the defining moves played from *both* sides, (b) the plan question answered, and (c) the trap puzzle solved after a gap of 7 days or more. Openings do not count toward core mastery.

## 2. Reasoning: openings

### 2a. Where and when: after the tactical basics, outside the core

**Evidence.** Among tournament players, the amount of *serious study alone* was the strongest predictor of rating. The activities together explained about 40% of rating variance (Charness et al. 2005; self-report and correlational). A reanalysis found that formal instruction did not make study more effective (Burgoyne et al. 2019). In 57 young players, practice was the strongest predictor of skill (Bilalić, McLeod & Gobet 2007). Gobet & Campitelli (2007) found that practice is necessary but not sufficient, and that group practice matters as well as solo practice.

None of these studies says *what* to study, so they cannot settle openings-versus-tactics. Chassy & Gobet (2011) show that memorised opening knowledge grows steeply with skill: their estimate is about 100,000 opening moves for masters, in players from Class B up to master. Opening knowledge is therefore a *product* of expertise. That does not show that beginners should memorise lines.

**Coach consensus (not experimental evidence).** Heisman answers players under about 1700 directly: "learning another opening line would certainly be far less effective than learning how to recognize if a move is safe" (Chess.com Q&A, 2013, verified). Seirawan's *Winning Chess Openings* is sold on teaching principles "without requiring players to memorize long lines". I verified that from the publisher's description, not from the book's text. The Steps Method starts with rules, mates, capturing and *defending*. Secondary sources place opening basics around Step 3, but I could not confirm that from the publisher. Coaches agree on this ordering, and no study tests it.

**Conclusion.** Put the section after Stage 2, when values, cct, the principles, the first mates and fork/pin/skewer are in place. Keep it optional and outside the core count.

### 2b. Depth and meaning: names + typical position + plan

**Evidence.** Rote learning supports retention but not transfer to new problems. Meaningful learning, which connects new material to what the learner already knows, supports transfer (Mayer 2002). Template theory (Gobet & Simon 1996) proposes that experts store typical positions as "templates" with slots for "the opening such a position is likely to come from, the potential plans and moves". The master they studied labelled positions mainly by **opening names** ("King's Indian"; "Queen's Gambit with a minority attack"), and the paper notes that this labelling helped recall.

That is a strong theoretical reason to teach **name + defining position + plan** together and link each one back to the principles. Caveat: one master, recall tasks; applying this to 12-year-olds is an inference, not a tested result. I found **no controlled study of how children should learn named openings.** Say that plainly in PLAN.md.

### 2c. A repertoire of three vs recognising all

The recommendation to play one opening per slot is coach consensus. Heisman advises choosing openings that keep theory to a minimum, a point quoted secondhand and only partly verified. It also follows from cognitive load and spacing: three openings reviewed deeply beat eleven reviewed shallowly within a 12-item cap. Recognising all eleven is cheap and useful because kids hear the names at clubs. Template theory suggests the name itself is a retrieval cue.

### 2d. "Meeting it" from the other side

Showing the same opening from both sides is a comparison of contrasting cases. Case comparison has a moderate overall benefit, and it helps more when the principle is stated *after* the comparison (Alfieri, Nokes-Malach & Schunn 2013). This section is also the opponent-threat habit that cct and prophylaxis teach (§3).

Expertise reversal (Kalyuga et al. 2003): stronger kids need less step-by-step walkthrough. Let a child skip straight to the "Meeting it" puzzle if they solve the first opening puzzle without hints.

Use the "Meeting…" framing, not "Beating…". It is honest, because none of these openings is refuted, and it avoids teaching kids to hunt for cheap wins. The app already warns against Scholar's Mate for the same reason.

### 2e. Interleaving and the quizzes

Interleaving helps most when categories look **similar** (Carvalho & Goldstone 2014; Brunmair & Richter 2019). The benefit comes from contrasting the categories, not from the time gap (Kang & Pashler 2012). The Italian, Ruy and Scotch, or the French, Caro-Kann and Scandinavian, are exactly that kind of near-twin set, so *Name That Opening* with confusable distractors is well supported. It will feel harder than blocked practice. That is a desirable difficulty (Bjork 1994): tell the kids "mixing is supposed to feel hard."

"Which opening suits your style" is **folklore**. No study matches openings to personality, and the idea sits close to learning-styles matching, which PLAN.md already rejects (Pashler et al. 2008). Asking which opening is aiming for a given plan is legitimate discrimination practice.

### 2f. The candidate list

All 11 stay, but at different levels:
- **Beginner:** the Italian and Scotch are open, principle-driven and full of tactics kids already know, and they are the most common first recommendation in coaching materials. The London is an easy, repeatable setup. The claim that it stunts tactical growth is **opinion; no data**, and its "Meeting it" section teaches the needed …Qb6 lesson. The Scandinavian is a useful *exception* to queen-early that tests understanding rather than recitation.
- **Intermediate:** the Queen's Gambit gives the 1.d4 slot. The Ruy Lopez's ideas run deeper than the Italian's. The French and Caro-Kann are calm, structural defences.
- **Advanced:** the Sicilian is met constantly, so kids need its name and idea, but its main lines are too theory-heavy for a repertoire at this level (coach consensus). The King's Indian is a plan built on the fianchetto. The English is included at Philippe's request.

Coaches widely advise juniors to start with open games (1.e4 e5). One club bans quiet "Old Stodge" lines for its juniors (Exeter Chess Club). That is **coaching tradition, not evidence**, but it matches Tier 1.

## 3. Reasoning: defence

**Is defence under-taught?** Coach sources say so explicitly. Heisman's *Looking for Trouble* (Russell Enterprises; 3rd edition 2023) is described by its publisher as addressing "an underemphasized area of chess training: identifying threats and reacting to them". Heisman coined "Hope Chess": making a move without checking whether the opponent has a threat you can't meet. I verified that definition only through a secondary source. The Steps Method puts a "Defending" lesson in its first step and "Defending against mate" soon after. I saw this in trainer-manual tables of contents, as a secondary source.

**Evidence, and how thin it is.**
- Error rates fall steeply with rating. An analysis of 336 million Chess.com blitz moves found that about a quarter of moves at 800–899 lost at least 100 centipawns, against about 7% at 2800+. That analysis is **a blog, not peer-reviewed**, though older engine studies (Doliner 2015, via ChessBase) show the same trend.
- In solved endgame positions, the *difficulty of the position* predicted errors better than the player's skill or the time left (Anderson, Kleinberg & Mullainathan 2017). That supports training kids on hard-to-see threats, not just easy ones.
- **No study I found separates "missed the opponent's threat" from "missed my own tactic"** as a cause of children's losses. The case for emphasising defence rests on coach consensus plus the general error data, not on a direct test.

**Why these six.**
- *Meet the Threat* and *Escape from Check* turn the second half of cct ("what is my opponent threatening?") into a set of options to choose from. The current cct lesson asks the question but never teaches the answers.
- *Breaking a Pin* is the defensive twin of the pin, which children run into in nearly every Italian and QGD game.
- *Trade Off the Attackers* mirrors trade-when-ahead.
- *Stalemate Trick* pairs with perpetual as a "saving resource" set.
- *Blockade* is the classic defence against passed pawns. It is Nimzowitsch's term, and kids will meet it in *My System*-style teaching.
- Fortress and giving material back are real ideas but rarely decide games at this level, so they are optional.

## 4. Must change vs nice to have

**Must change**
1. Keep openings out of the core path and out of the core mastery count; give them their own map, unlocked (as a suggestion) after Stage 2.
2. Repertoire picker: three openings get spaced review; at most 3 opening items in Daily Review.
3. Show the defining moves plus a plan; judge opening puzzles by principle (`plan`, `alsoGood`).
4. Rename the endgame "Philidor Defense" to "Philidor Position".
5. Add *Meet the Threat* and *Escape from Check* (Beginner, Stages 1–2).
6. *Name That Opening* uses defining positions only, with the confusable sets above.
7. Replace "top 50" with "Core Path" (or demote six Advanced lessons, as Philippe prefers).
8. State in PLAN.md that no direct study exists on teaching named openings to children.

**Should change**
9. Add Breaking a Pin, Trade Off the Attackers, Stalemate Trick and Blockade (Intermediate).
10. Tier 3 openings: recognise first, with the English framed as "control from the side".
11. "Which opening is aiming for this plan?" instead of "suits this goal or style".

**Nice to have**
12. Fortress and Give Material Back (Advanced, Extras).
13. Defensive "make luft in time" puzzles in back-rank.
14. A skip-ahead in opening lessons for kids who solve the first puzzle without hints (expertise reversal).

## References

- Alfieri, L., Nokes-Malach, T. J., & Schunn, C. D. (2013). Learning through case comparisons: A meta-analytic review. *Educational Psychologist, 48*(2), 87–113.
- Anderson, A., Kleinberg, J., & Mullainathan, S. (2017). Assessing human error against a benchmark of perfection. *ACM Transactions on Knowledge Discovery from Data, 11*(4), 45.
- Bilalić, M., McLeod, P., & Gobet, F. (2007). Does chess need intelligence? A study with young chess players. *Intelligence, 35*(5), 457–470.
- Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. In J. Metcalfe & A. Shimamura (Eds.), *Metacognition* (pp. 185–205). MIT Press.
- Brunmair, M., & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin, 145*(11), 1029–1052.
- Burgoyne, A. P., et al. (2019). The impact of domain-specific experience on chess skill: Reanalysis of a key study. *American Journal of Psychology, 132*(1), 27–38.
- Carvalho, P. F., & Goldstone, R. L. (2014). Putting category learning in order: Category structure and temporal arrangement affect the benefit of interleaved over blocked study. *Memory & Cognition, 42*(3), 481–495.
- Charness, N., Tuffiash, M., Krampe, R., Reingold, E., & Vasyukova, E. (2005). The role of deliberate practice in chess expertise. *Applied Cognitive Psychology, 19*, 151–165.
- Chassy, P., & Gobet, F. (2011). Measuring chess experts' single-use sequence knowledge: An archival study of departure from "theoretical" openings. *PLoS ONE, 6*(11), e26692.
- Gobet, F., & Campitelli, G. (2007). The role of domain-specific practice, handedness, and starting age in chess. *Developmental Psychology, 43*(1), 159–172.
- Gobet, F., & Simon, H. A. (1996). Templates in chess memory: A mechanism for recalling several boards. *Cognitive Psychology, 31*(1), 1–40.
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31.
- Kang, S. H. K., & Pashler, H. (2012). Learning painting styles: Spacing is advantageous when it promotes discriminative contrast. *Applied Cognitive Psychology, 26*(1), 97–103.
- Mayer, R. E. (2002). Rote versus meaningful learning. *Theory Into Practice, 41*(4), 226–232.
- Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest, 9*(3), 105–119.

Coaching sources (consensus, not evidence):
- Heisman, D. Q&A with Coach Heisman, Chess.com, 4 Jan 2013.
- Heisman, D. *Looking for Trouble: Recognizing and Meeting Threats in Chess*, 3rd ed., Russell Enterprises, 2023.
- Seirawan, Y. *Winning Chess Openings*, Everyman (publisher's description).
- Brunia, R., & van Wijgerden, C. *The Steps Method* (trainer manual contents, via secondary sources).
- Nimzowitsch, A. *My System* (1925), on blockade.
- ChessKid lesson guide ("CPR: capture, protect, run away").
- Exeter Chess Club junior opening guide.
- Chess.com blog analysis of 336M blitz moves (not peer-reviewed).
