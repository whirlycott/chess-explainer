import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { dayNumber, load, save, type ProgressState } from '../logic/progress';
import { speak, stopSpeaking } from '../logic/speech';
import { sfx } from '../logic/sfx';

class Store extends EventTarget {
  state: ProgressState = load(dayNumber());

  get today(): number {
    return dayNumber();
  }

  update(fn: (s: ProgressState) => ProgressState): void {
    this.state = fn(this.state);
    save(this.state);
    this.dispatchEvent(new Event('change'));
  }
}

export const store = new Store();

/** Re-render a Lit element whenever the store changes. */
export class StoreController implements ReactiveController {
  private onChange = () => this.host.requestUpdate();
  constructor(private host: ReactiveControllerHost) {
    host.addController(this);
  }
  hostConnected(): void {
    store.addEventListener('change', this.onChange);
  }
  hostDisconnected(): void {
    store.removeEventListener('change', this.onChange);
  }
}

/** Speak text if narration is switched on. */
export function narrate(text: string): void {
  const s = store.state.settings;
  if (!s.audio) return;
  speak(text, { voiceURI: s.voiceURI, rate: s.rate });
}

export function quiet(): void {
  stopSpeaking();
}

export function playSfx(kind: keyof typeof sfx): void {
  if (store.state.settings.sound) sfx[kind]();
}

/** Navigate with a View Transition where the browser supports it. */
export function go(hash: string): void {
  quiet();
  location.hash = hash;
}
