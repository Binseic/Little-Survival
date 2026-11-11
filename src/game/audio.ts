/**
 * Pure Web Audio API Sound Synthesizer
 * External file-free retro SFX and background music generator
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public bgmEnabled: boolean = true;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Magic arrow firing sound
  playShoot() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Audio might be blocked before interaction
    }
  }

  // Aura blade cutting / touching enemy
  playAuraHit() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.08);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // ignore
    }
  }

  // Enemy hit impact
  playHit() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.06);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    } catch {
      // ignore
    }
  }

  // Enemy death / pop
  playDeath() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // ignore
    }
  }

  // Gem collection chime (pitch steps up based on chain)
  playGem(pitchMod = 0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      const baseFreq = 523.25; // C5
      const pentatonic = [1, 1.125, 1.25, 1.5, 1.667, 2, 2.25];
      const mult = pentatonic[pitchMod % pentatonic.length] || 1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 1.2, t + 0.09);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch {
      // ignore
    }
  }

  // Level-Up fanfare
  playLevelUp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch {
      // ignore
    }
  }

  // Lightning strike thunder sound
  playLightning() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.3);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // ignore
    }
  }

  // Explosion sound
  playExplosion() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch {
      // ignore
    }
  }

  // Player hurt sound
  playPlayerHurt() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // ignore
    }
  }

  // Game over sound
  playGameOver() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [330, 293, 261, 196, 146];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + idx * 0.16;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch {
      // ignore
    }
  }

  // Grim Reaper ominous death bell
  playReaperBell() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Bell fundamental and overtone
      [110, 220, 277.18, 440].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.25 / (i + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 1.8);
      });
    } catch {
      // ignore
    }
  }

  // Grim Reaper lethal scythe slash
  playReaperSlash() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // ignore
    }
  }

  // Start rhythmic background chiptune track
  startBgm() {
    if (this.bgmInterval) return;
    const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 164.81, 146.83, 130.81];
    const highArp = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46];

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.bgmEnabled) return;
      try {
        this.initCtx();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const bassFreq = notes[this.bgmStep % notes.length];
        const leadFreq = highArp[(this.bgmStep * 2) % highArp.length];

        // Bass Pulse
        const oscBass = this.ctx.createOscillator();
        const gainBass = this.ctx.createGain();
        oscBass.type = 'triangle';
        oscBass.frequency.setValueAtTime(bassFreq, t);
        gainBass.gain.setValueAtTime(0.04, t);
        gainBass.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        oscBass.connect(gainBass);
        gainBass.connect(this.ctx.destination);
        oscBass.start(t);
        oscBass.stop(t + 0.18);

        // Hi-hat / tick on 16th step
        if (this.bgmStep % 2 === 1) {
          const oscLead = this.ctx.createOscillator();
          const gainLead = this.ctx.createGain();
          oscLead.type = 'sine';
          oscLead.frequency.setValueAtTime(leadFreq, t);
          gainLead.gain.setValueAtTime(0.02, t);
          gainLead.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          oscLead.connect(gainLead);
          gainLead.connect(this.ctx.destination);
          oscLead.start(t);
          oscLead.stop(t + 0.08);
        }

        this.bgmStep++;
      } catch {
        // audio suspended or inactive
      }
    }, 180);
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  toggleBgm(): boolean {
    this.bgmEnabled = !this.bgmEnabled;
    return this.bgmEnabled;
  }
}

export const sound = new SoundSystem();
