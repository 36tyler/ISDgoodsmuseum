/**
 * Synthesizes a realistic rubber stamp sound effect using Web Audio API.
 * No external audio files required - works 100% offline, zero latency, guaranteed reliability.
 */
class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play a cute, squishy, bouncy "꾸우우욱" rubber stamp sound effect!
   * Synthesized using Web Audio API with pitch glide, resonant filter compression, and squish wobble.
   */
  playStampSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Cute Main Squish Oscillator ("꾸우우욱" pitch slide)
      const mainOsc = ctx.createOscillator();
      const mainGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm, rubbery sine + triangle character
      mainOsc.type = 'sine';

      // Pitch trajectory: "꾸" (420Hz) -> slide down "우우우" (270Hz -> 160Hz) -> firm press "욱" (110Hz)
      mainOsc.frequency.setValueAtTime(420, now);
      mainOsc.frequency.exponentialRampToValueAtTime(310, now + 0.06);
      mainOsc.frequency.exponentialRampToValueAtTime(160, now + 0.25);
      mainOsc.frequency.exponentialRampToValueAtTime(105, now + 0.35);

      // Resonant filter gives the squelchy, doughy, rubber-cushion character
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4.2, now);
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(260, now + 0.32);

      // Cute rubber squish wobble (LFO)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(14, now); // 14Hz cute squish tremor
      lfoGain.gain.setValueAtTime(18, now);
      lfoGain.gain.linearRampToValueAtTime(2, now + 0.3);
      lfo.connect(mainOsc.frequency);
      lfo.start(now);
      lfo.stop(now + 0.38);

      // Volume envelope: soft attack, sustained squish, cute punch-out
      mainGain.gain.setValueAtTime(0.001, now);
      mainGain.gain.linearRampToValueAtTime(0.45, now + 0.04);
      mainGain.gain.setValueAtTime(0.45, now + 0.18);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      mainOsc.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(ctx.destination);

      mainOsc.start(now);
      mainOsc.stop(now + 0.4);

      // 2. Harmonic layer for extra "cute squish" squeak tone
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(840, now);
      harmonicOsc.frequency.exponentialRampToValueAtTime(480, now + 0.09);
      harmonicOsc.frequency.exponentialRampToValueAtTime(220, now + 0.28);

      harmonicGain.gain.setValueAtTime(0.001, now);
      harmonicGain.gain.linearRampToValueAtTime(0.16, now + 0.03);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      harmonicOsc.start(now);
      harmonicOsc.stop(now + 0.28);

      // 3. Tactile Stamp Impact "욱!" (Soft cute bass thud when pressed down)
      const impactOsc = ctx.createOscillator();
      const impactGain = ctx.createGain();
      impactOsc.type = 'sine';
      impactOsc.frequency.setValueAtTime(120, now + 0.12);
      impactOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      impactGain.gain.setValueAtTime(0.001, now);
      impactGain.gain.setValueAtTime(0.001, now + 0.12);
      impactGain.gain.linearRampToValueAtTime(0.35, now + 0.16);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      impactOsc.connect(impactGain);
      impactGain.connect(ctx.destination);

      impactOsc.start(now + 0.12);
      impactOsc.stop(now + 0.38);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Play lighter, cute "뽀오옥~" release pop sound when un-stamping
   */
  playUnstampSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Cute upward "뾱!" release
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const soundEffects = new SoundEffects();
