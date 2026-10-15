// Kid-friendly audio synthesis using browser Web Audio API
// Lightweight, offline-ready, no external mp3 assets needed.

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play a soft pop sound on button tap
  playPop() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Play twinkling stars celebration sound for correct answers
  playStar() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
    } catch {
      // Fallback
    }
  }

  // Play gentle boing / try-again chime
  playTryAgain() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Fallback
    }
  }

  // Play big victory fanfare for quiz completion
  playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const melody = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5]; // C5, C5, C5, E5, G5, C6
      const times = [0, 0.12, 0.24, 0.38, 0.52, 0.72];
      const durations = [0.1, 0.1, 0.1, 0.12, 0.18, 0.4];
      const now = this.ctx.currentTime;

      melody.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + times[idx]);

        gain.gain.setValueAtTime(0.25, now + times[idx]);
        gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + durations[idx]);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + times[idx]);
        osc.stop(now + times[idx] + durations[idx] + 0.05);
      });
    } catch {
      // Fallback
    }
  }

  // Web Speech API for reading aloud text in English or Hindi
  speakText(text: string, lang: 'en' | 'hi' = 'en') {
    if (!this.enabled || typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`~[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9; // Friendly, slightly slower for kids
      utterance.pitch = 1.1; // Cheerful pitch
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

      // Pick Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'hi') {
        const hiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('HI'));
        if (hiVoice) utterance.voice = hiVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundManager = new SoundFX();
