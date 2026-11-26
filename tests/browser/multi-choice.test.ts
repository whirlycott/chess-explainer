import { afterEach, expect, it } from 'vitest';
import { MultiChoice } from '../../src/ui/multi-choice';

afterEach(() => document.body.replaceChildren());

async function mount(question: string): Promise<MultiChoice> {
  const mc = document.createElement('multi-choice') as MultiChoice;
  mc.question = question;
  mc.choices = ['Right', 'Wrong one', 'Wrong two', 'Wrong three'];
  mc.answer = 0;
  document.body.append(mc);
  await mc.updateComplete;
  return mc;
}

function buttons(mc: MultiChoice): HTMLButtonElement[] {
  return [...mc.shadowRoot!.querySelectorAll<HTMLButtonElement>('button.choice')];
}

it('does not always show the right answer as choice A', async () => {
  const positions = new Set<number>();
  for (let i = 0; i < 30; i++) {
    const mc = await mount(`Question ${i}?`);
    positions.add(buttons(mc).findIndex((b) => b.textContent!.includes('Right')));
    mc.remove();
  }
  expect(positions.size).toBeGreaterThan(1);
});

it('keeps letters A to D in order and judges the shuffled right answer as correct', async () => {
  const mc = await mount('Which is right?');
  const bs = buttons(mc);
  expect(bs.map((b) => b.querySelector('.letter')!.textContent)).toEqual(['A', 'B', 'C', 'D']);
  let detail: { correct: boolean } | undefined;
  mc.addEventListener('answered', (e) => (detail = (e as CustomEvent).detail));
  bs.find((b) => b.textContent!.includes('Right'))!.click();
  await mc.updateComplete;
  expect(detail?.correct).toBe(true);
  expect(buttons(mc).find((b) => b.textContent!.includes('Right'))!.classList.contains('right')).toBe(true);
});
