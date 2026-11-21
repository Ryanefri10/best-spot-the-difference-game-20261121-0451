// All sound is synthesized with WebAudio — no audio files, no network. A short
// chime marks a find, a low buzz marks a miss, a rising arpeggio marks a cleared
// level, and a soft tick marks a hint. Created lazily on the first gesture so the
// browser's autoplay rules are never fought.
export function createSounds() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(frequency, startAt, duration, type, volume) {
    const ctx = ensure();
    if (ctx === null || muted) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startAt);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime + startAt);
    oscillator.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  return {
    /** Two-note chime, higher when the find streak grows. */
    found(streak) {
      const base = 660 + Math.min(streak, 8) * 24;
      tone(base, 0, 0.16, 'sine', 0.22);
      tone(base * 1.5, 0.07, 0.22, 'sine', 0.2);
    },
    /** Low buzz for a wrong click. */
    wrong() {
      tone(140, 0, 0.18, 'sawtooth', 0.12);
      tone(110, 0.05, 0.18, 'sawtooth', 0.1);
    },
    /** Soft tick when a hint lights up. */
    hint() {
      tone(880, 0, 0.1, 'triangle', 0.16);
      tone(1174, 0.08, 0.14, 'triangle', 0.14);
    },
    /** Rising arpeggio for a cleared level. */
    cleared() {
      [523, 659, 784, 1046].forEach((frequency, index) => {
        tone(frequency, index * 0.09, 0.24, 'triangle', 0.2);
      });
    },
    /** Short fanfare for finishing all three levels. */
    win() {
      [523, 659, 784, 1046, 1318, 1568].forEach((frequency, index) => {
        tone(frequency, index * 0.1, 0.3, 'triangle', 0.2);
      });
    },
    /** A clock tick in the last ten seconds. */
    tick() {
      tone(980, 0, 0.05, 'square', 0.06);
    },
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
  };
}
