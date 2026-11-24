// Cross-checks every puzzle solution with the Stockfish engine.
//
//   npm run validate:engine            (depth 16)
//   npm run validate:engine -- 20      (custom depth)
//
// For 'tactic' puzzles, each learner move must be (close to) the engine's best.
// For 'plan' puzzles, each learner move must not be a clear mistake.
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const DEPTH = Number(process.argv[2] ?? 16);
const TACTIC_TOLERANCE = 60; // centipawns
const PLAN_TOLERANCE = 120;

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { LESSONS } = await server.ssrLoadModule('/src/data/index.ts');
const { resolveStart } = await server.ssrLoadModule('/src/logic/position.ts');
const { Chess } = await server.ssrLoadModule('chess.js');

function makeEngine() {
  let listener = () => {};
  const engine = require('stockfish')('lite-single', (line) => listener(line));
  const send = (cmd) => engine.processCommand(cmd);
  return {
    async init() {
      await new Promise((resolve) => {
        listener = (line) => line === 'uciok' && resolve();
        send('uci');
      });
      await this.ready();
    },
    ready() {
      return new Promise((resolve) => {
        listener = (line) => line === 'readyok' && resolve();
        send('isready');
      });
    },
    /** Score of the position for the side to move, in centipawns (mates are +-100000). */
    evaluate(fen) {
      return new Promise((resolve) => {
        let score = 0;
        let best = '';
        listener = (line) => {
          const cp = line.match(/ score cp (-?\d+)/);
          const mate = line.match(/ score mate (-?\d+)/);
          if (cp) score = Number(cp[1]);
          if (mate) {
            const n = Number(mate[1]);
            score = n > 0 ? 100000 - n * 100 : -100000 - n * 100;
          }
          const bm = line.match(/^bestmove (\S+)/);
          if (bm) {
            best = bm[1];
            resolve({ score, best });
          }
        };
        send('ucinewgame');
        send(`position fen ${fen}`);
        send(`go depth ${DEPTH}`);
      });
    },
    quit() {
      engine.terminate?.();
    },
  };
}

function terminalScore(game) {
  // Score for the side to move in a finished position.
  if (game.isCheckmate()) return -100000;
  return 0;
}

const engine = makeEngine();
await engine.init();

let problems = 0;
for (const lesson of LESSONS) {
  for (const [i, puzzle] of lesson.puzzles.entries()) {
    const kind = puzzle.kind ?? 'tactic';
    const tolerance = kind === 'tactic' ? TACTIC_TOLERANCE : PLAN_TOLERANCE;
    for (const line of puzzle.lines) {
      const game = resolveStart(puzzle);
      for (let m = 0; m < line.length; m += 2) {
      const fen = game.fen();
      const { score: bestScore, best } = await engine.evaluate(fen);
      const probe = new Chess(fen);
      probe.move(line[m]);
      const after = probe.isGameOver()
        ? -terminalScore(probe)
        : -(await engine.evaluate(probe.fen())).score;
      const loss = bestScore - after;
      const bestSan = new Chess(fen).move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] }).san;
      const isMate = line[m].endsWith('#');
      // A move that keeps a big winning advantage also counts, as long as it does
      // not throw away much of it.
      const stillWinning = after >= 300 && loss <= 150;
      const ok =
        isMate || bestSan === line[m] || loss <= tolerance || stillWinning || (bestScore > 90000 && after > 90000);
      const tag = ok ? 'ok ' : 'BAD';
      if (!ok) problems++;
      console.log(
        `${tag} ${lesson.id}#${i} move ${m / 2 + 1} ${line[m].padEnd(7)} engine ${bestSan.padEnd(7)} best ${bestScore} after ${after} (${kind})`,
      );
      game.move(line[m]);
      if (m + 1 < line.length) game.move(line[m + 1]);
    }
    }
  }
}

// Walkthroughs: report (do not fail on) moves that lose a lot by engine
// standards, so they can be reviewed by hand. Some are deliberate mistakes
// that the lesson punishes.
console.log('\nWalkthrough moves the engine dislikes (review by hand):');
for (const lesson of LESSONS) {
  const game = resolveStart(lesson.walkthrough);
  for (const step of lesson.walkthrough.steps) {
    if (!step.san) continue;
    const fen = game.fen();
    const { score: bestScore, best } = await engine.evaluate(fen);
    const probe = new Chess(fen);
    probe.move(step.san);
    const after = probe.isGameOver() ? -terminalScore(probe) : -(await engine.evaluate(probe.fen())).score;
    const bestSan = new Chess(fen).move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] }).san;
    if (bestSan !== step.san && bestScore - after > 150 && !(bestScore > 90000 && after > 90000)) {
      console.log(`  ${lesson.id}: ${step.san.padEnd(7)} engine ${bestSan.padEnd(7)} best ${bestScore} after ${after}`);
    }
    game.move(step.san);
  }
}
engine.quit();
await server.close();
console.log(problems === 0 ? '\nAll puzzle solutions agree with the engine.' : `\n${problems} puzzle move(s) need review.`);
process.exit(problems === 0 ? 0 : 1);
