/**
 * Narration with the Web Speech API, using on-device voices only.
 *
 * Some browsers offer network voices that send the text to a server. To keep
 * every bit of the learner's activity on their device we only ever use voices
 * with `localService === true`.
 */

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function localVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  return speechSynthesis
    .getVoices()
    .filter((v) => v.localService && v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => Number(b.default) - Number(a.default) || a.name.localeCompare(b.name));
}

/** Resolves once the browser has loaded its voice list (it loads lazily). */
export function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const now = localVoices();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(localVoices());
    speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 1500);
  });
}

export interface SpeakOptions {
  voiceURI: string | null;
  rate: number;
}

/** Speak `text`, replacing anything already being spoken. Returns false if no local voice exists. */
export function speak(text: string, opts: SpeakOptions): boolean {
  const voices = localVoices();
  if (voices.length === 0) return false;
  const voice = voices.find((v) => v.voiceURI === opts.voiceURI) ?? voices[0];
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = opts.rate;
  speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking(): void {
  if (speechSupported()) speechSynthesis.cancel();
}
