import { LitElement, css, html } from 'lit';
import { shared } from '../shared';

const PRINCIPLES: { title: string; kid: string; how: string; refs: string }[] = [
  {
    title: 'Worked examples first',
    kid: 'You watch a full example before solving on your own.',
    how: 'Every lesson starts with a step-by-step example. Beginners learn more from studying solved examples than from guessing (this benefit shrinks as you get stronger).',
    refs: 'Sweller & Cooper 1985; Atkinson et al. 2000; Kalyuga et al. 2003 (expertise reversal)',
  },
  {
    title: 'Predict, then check',
    kid: 'You guess the next move before you see it.',
    how: 'Prediction steps inside each example. The surprise when a guess is wrong is part of what helps, so the right move is always shown right after.',
    refs: 'Brod, Hasselhorn & Bunge 2018',
  },
  {
    title: 'Explain why',
    kid: 'You pick the reason a strategy works.',
    how: 'A short "Why does it work?" question. Choosing from a menu works better in software than typing free answers, which are often skipped.',
    refs: 'Chi et al. 1989; Bisra et al. 2018; Aleven & Koedinger 2002',
  },
  {
    title: 'Test yourself (retrieval practice)',
    kid: 'Quizzes are for learning, not just for grades.',
    how: 'Puzzles and quizzes are the main way you practise. Pulling knowledge out of memory makes it stronger, including in middle-school classrooms.',
    refs: 'Roediger & Karpicke 2006; McDaniel et al. 2011; Agarwal, Nunes & Blunt 2021',
  },
  {
    title: 'Spaced review',
    kid: 'Short practice spread over many days.',
    how: 'Daily Review brings back each strategy after growing gaps (0, 1, 3, 7, 16, then 35 days). Mastery needs success on several different days.',
    refs: 'Cepeda et al. 2006, 2008',
  },
  {
    title: 'Mixed practice (interleaving)',
    kid: 'Questions from different strategies are shuffled.',
    how: 'Mixing look-alike strategies (fork, pin, skewer…) trains you to choose the right one. Wrong answers in quizzes are picked from strategies that are easy to confuse.',
    refs: 'Rohrer & Taylor 2007; Brunmair & Richter 2019',
  },
  {
    title: 'Helpful feedback',
    kid: 'You get a clue and one more try.',
    how: 'After a wrong answer you see a clue and can retry once, then the answer and explanation. Praise is about your strategy, never "you are smart".',
    refs: 'Hattie & Timperley 2007; Shute 2008; Kluger & DeNisi 1996; Mueller & Dweck 1998',
  },
  {
    title: 'Pictures plus words',
    kid: 'Arrows and glowing squares show what the words mean.',
    how: 'Arrows and highlights point at exactly what the narration describes. Spoken narration is optional: research shows it helps most when the computer sets the pace, and here you set the pace. When audio is on, captions stay short so you are not reading and listening to the same long text.',
    refs: 'Mayer 2009; Ginns 2005; Kalyuga, Chandler & Sweller 1999',
  },
  {
    title: 'Patterns ("chunks")',
    kid: 'Strong players remember patterns, not just single moves.',
    how: 'Each strategy has a memorable name and several positions, so you learn the pattern rather than one position.',
    refs: 'Chase & Simon 1973; Gobet & Simon 1996',
  },
  {
    title: 'Mastery learning',
    kid: 'Move on when you really know it, and review what you missed.',
    how: 'After a mistake in a quiz you get a link straight back to that lesson.',
    refs: 'Kulik, Kulik & Bangert-Drowns 1990',
  },
];

export class AboutView extends LitElement {
  render() {
    return html`
      <h1>How this app helps you learn</h1>
      <p class="lead">
        Every part of this app is based on research about how people learn. Here is what we use, and why.
      </p>
      <div class="grid">
        ${PRINCIPLES.map(
          (p) => html`<article class="card">
            <h2>${p.title}</h2>
            <p class="kid">${p.kid}</p>
            <p>${p.how}</p>
            <p class="refs">${p.refs}</p>
          </article>`,
        )}
      </div>
      <section class="card honest">
        <h2>What we do <em>not</em> claim</h2>
        <ul>
          <li>
            <strong>"Learning styles"</strong> (visual learner, audio learner…): matching lessons to a style has no good
            evidence (Pashler et al. 2008). Audio is here as an option and for accessibility.
          </li>
          <li>
            <strong>Chess makes you better at math:</strong> studies find little transfer from chess to math or IQ (Sala
            & Gobet 2016). Learn chess because it is fun and challenging!
          </li>
          <li>
            <strong>Exact numbers:</strong> review gaps and the mastery rule are sensible rules of thumb, not exact
            science.
          </li>
        </ul>
      </section>
      <section class="card honest">
        <h2>Privacy</h2>
        <p>
          Your progress is saved only in this browser. Narration uses only voices that run on your device, so no text is
          sent to a speech server. No accounts and no tracking.
        </p>
        <p>
          The chess content is checked automatically: every move is tested for legality, every checkmate is verified, and
          every puzzle answer is cross-checked with the Stockfish chess engine.
        </p>
      </section>
    `;
  }

  static styles = [
    shared,
    css`
      :host {
        display: grid;
        gap: 1.4rem;
      }
      h1 {
        font-size: clamp(2rem, 5vw, 3rem);
      }
      .lead {
        font-size: 1.2rem;
        max-width: 60ch;
      }
      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      }
      article {
        padding: 1.2rem;

        h2 {
          font-size: 1.2rem;
        }
      }
      .kid {
        font-weight: 700;
        color: var(--accent-2);
      }
      .refs {
        font-size: 0.85rem;
        color: var(--muted);
        margin: 0;
      }
      .honest {
        padding: 1.3rem 1.4rem;

        li {
          margin-bottom: 0.6rem;
          line-height: 1.55;
        }
        em {
          font-style: normal;
          text-decoration: underline;
        }
      }
    `,
  ];
}

customElements.define('about-view', AboutView);
