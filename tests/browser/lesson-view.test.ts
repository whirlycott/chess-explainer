import { afterEach, expect, it } from 'vitest';
import { LessonView } from '../../src/ui/views/lesson-view';

// Private state and methods the test drives directly.
type Internals = { _puzzle: number; _puzzleDone: boolean; setPhase(p: string): void };

afterEach(() => document.body.replaceChildren());

it('restarts practice at the first puzzle when a finished lesson is reviewed', async () => {
  const view = document.createElement('lesson-view') as LessonView;
  view.lessonId = 'fork';
  document.body.append(view);
  await view.updateComplete;
  const internals = view as unknown as Internals;
  // State at the end of the lesson: last puzzle solved.
  internals._puzzle = 1;
  internals._puzzleDone = true;
  internals.setPhase('practice');
  await view.updateComplete;
  const eyebrow = view.shadowRoot!.querySelector('.eyebrow')!.textContent!;
  expect(eyebrow).toContain('puzzle 1 of');
  const next = [...view.shadowRoot!.querySelectorAll('button')].find((b) => /Next puzzle|Quick check/.test(b.textContent!))!;
  expect(next.disabled).toBe(true);
});
