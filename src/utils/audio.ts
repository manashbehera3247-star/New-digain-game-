// Web Audio Synthesis for Ludo Sound Effects and Traditional Odia Instruments (Mardala, Mahuri, Sankha)

class AudioEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private bgmIntervalId: any = null;
  private isBgmPlaying: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopTraditionalBGM();
    }
  }

  /**
   * Mardala (Traditional Double-Head Drum) sound synthesis
   * Left Head (Baya) is deep, bassy ("Dhimi" / "Dhum")
   * Right Head (Dahana) is high-frequency resonant ("Takh" / "Ki")
   */
  public playMardala(isLeftHead: boolean = true, velocity: number = 1.0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.connect(this.ctx.destination);

      if (isLeftHead) {
        // Deep bass head - Dhum / Dhimi
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

        gainNode.gain.setValueAtTime(0.4 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.26);
      } else {
        // Right, high head - Takh
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.05);

        // Add rapid treble bandpass filter for ring resonance
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380, now);
        filter.Q.setValueAtTime(8, now);

        gainNode.gain.setValueAtTime(0.3 * velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gainNode);

        osc.start(now);
        osc.stop(now + 0.13);
      }
    } catch (e) {
      console.warn('Mardala play failed', e);
    }
  }

  /**
   * Mahuri (traditional woodwind) single note synthesis.
   * Nasal wooden timber achieved by mixing triangle and sawtooth waves
   * and applying resonant low-pass filter with vibrato LFO.
   */
  public playMahuriNote(freq: number, duration: number, delay: number = 0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime + delay;
      
      const triOsc = this.ctx.createOscillator();
      const sawOsc = this.ctx.createOscillator();
      const mainGain = this.ctx.createGain();
      
      triOsc.type = 'triangle';
      sawOsc.type = 'sawtooth';
      
      // Nasal frequency mapping
      triOsc.frequency.setValueAtTime(freq, now);
      sawOsc.frequency.setValueAtTime(freq, now);

      // Add 6.5Hz vibrato (LFO)
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(6.5, now);
      
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(freq * 0.015, now); // Pitch vibrato depth
      
      lfo.connect(lfoGain);
      lfoGain.connect(triOsc.frequency);
      lfoGain.connect(sawOsc.frequency);

      // Mix oscillators
      const triGain = this.ctx.createGain();
      const sawGain = this.ctx.createGain();
      triGain.gain.setValueAtTime(0.18, now);
      sawGain.gain.setValueAtTime(0.06, now); // Lower sawtooth mix for that hollow nasal reed buzz

      // Filter to simulate wooden body resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(4.0, now);

      // Main ADSR envelope
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(0.2, now + 0.05); // Attack
      mainGain.gain.setValueAtTime(0.2, now + duration - 0.05); 
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release

      triOsc.connect(triGain);
      sawOsc.connect(sawGain);
      
      triGain.connect(filter);
      sawGain.connect(filter);
      
      filter.connect(mainGain);
      mainGain.connect(this.ctx.destination);

      lfo.start(now);
      triOsc.start(now);
      sawOsc.start(now);

      lfo.stop(now + duration);
      triOsc.stop(now + duration + 0.1);
      sawOsc.stop(now + duration + 0.1);
    } catch (e) {
      console.warn('Mahuri note failed', e);
    }
  }

  /**
   * Sankha (Auspicious Conch-shell blow) synthesis.
   * Long sweeping wind sound, begins deep and warm, rises to peak pitch with beautiful vibrato.
   */
  public playSankha() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 2.4;

      const osc = this.ctx.createOscillator();
      const triOsc = this.ctx.createOscillator();
      const mainGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Conch starts around 180Hz and sweeps to 320Hz beautifully
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.6);

      triOsc.type = 'triangle';
      triOsc.frequency.setValueAtTime(180, now);
      triOsc.frequency.exponentialRampToValueAtTime(330, now + 0.6);

      // Pitch vibrato (conch blowing fluctuations)
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(7.0, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(12, now); // fluctuates vibrato by 12Hz
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoGain.connect(triOsc.frequency);

      // Filter conch body
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(330, now);
      filter.Q.setValueAtTime(2.5, now);

      // Envelope: slow rise, holding breath, slow decline
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(0.22, now + 0.5); // Slow puff
      mainGain.gain.exponentialRampToValueAtTime(0.18, now + duration - 0.5);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const oscGain = this.ctx.createGain();
      const triGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.2, now);
      triGain.gain.setValueAtTime(0.08, now); // Add slight reediness

      osc.connect(oscGain);
      triOsc.connect(triGain);

      oscGain.connect(filter);
      triGain.connect(filter);
      
      filter.connect(mainGain);
      mainGain.connect(this.ctx.destination);

      lfo.start(now);
      osc.start(now);
      triOsc.start(now);

      lfo.stop(now + duration + 0.1);
      osc.stop(now + duration + 0.1);
      triOsc.stop(now + duration + 0.1);
    } catch (e) {
      console.warn('Sankha play failed', e);
    }
  }

  /**
   * Mardala-based rolling drum effects
   */
  public playRoll() {
    if (!this.enabled) return;
    this.playMardala(true, 0.7);
    setTimeout(() => this.playMardala(false, 0.9), 100);
    setTimeout(() => this.playMardala(true, 0.6), 200);
    setTimeout(() => this.playMardala(false, 1.1), 300);
  }

  /**
   * Simple Mardala Dahana stroke when taking a step
   */
  public playStep() {
    this.playMardala(false, 0.6);
  }

  /**
   * Dramatic dual-stroke when killing a token
   */
  public playKill() {
    if (!this.enabled) return;
    this.playMardala(true, 1.2);
    setTimeout(() => {
      this.playMardala(false, 1.4);
      // Play a quick downward Mahuri slide
      this.playMahuriNote(440, 0.4);
      setTimeout(() => this.playMahuriNote(330, 0.3), 150);
    }, 120);
  }

  /**
   * Raga Mohana celebratory notes when token reaches home
   */
  public playHome() {
    if (!this.enabled) return;
    const ragaNotes = [261.63, 293.66, 329.63, 392.00, 440.00]; // Sa Re Ga Pa Dha (Mohana)
    ragaNotes.forEach((freq, idx) => {
      this.playMahuriNote(freq, 0.25, idx * 0.12);
    });
    // Add mardala beats underneath
    setTimeout(() => this.playMardala(true, 0.8), 100);
    setTimeout(() => this.playMardala(false, 1.0), 300);
  }

  /**
   * Complete victory fanfare playing classical Odia style welcome motif
   */
  public playFanfare() {
    if (!this.enabled) return;
    // Auspicious Conch blowout
    this.playSankha();
    
    // Quick pentatonic flurry of Mahuri
    const flurry = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    flurry.forEach((freq, idx) => {
      this.playMahuriNote(freq, 0.18, 0.4 + idx * 0.1);
    });

    // Rhythmic celebration mardala roll
    for (let r = 0; r < 8; r++) {
      setTimeout(() => {
        this.playMardala(r % 2 === 0, 0.9);
      }, 500 + r * 150);
    }
  }

  /**
   * Starts live-synthesized local traditional Odia folk background loop.
   * Periodically triggers mardala rhythms and gentle Mahuri licks.
   */
  public playTraditionalBGM() {
    if (!this.enabled || this.isBgmPlaying) return;
    this.init();
    this.isBgmPlaying = true;
    
    let stepCount = 0;
    // 120 BPM = 0.5s per beat
    this.bgmIntervalId = setInterval(() => {
      if (!this.enabled) {
        this.stopTraditionalBGM();
        return;
      }
      
      const beatType = stepCount % 8;
      
      // Perform Mardala patterns
      if (beatType === 0) {
        this.playMardala(true, 0.5); // Deep bass stroke
      } else if (beatType === 2) {
        this.playMardala(false, 0.4); // Treble stroke
      } else if (beatType === 4) {
        this.playMardala(true, 0.45);
        this.playMardala(false, 0.3);
      } else if (beatType === 6) {
        this.playMardala(false, 0.5);
      }
      
      // Perform gentle Mahuri melodies randomly or systematically
      // Pentatonic scale of Raga Mohana: 261.63 (C4), 293.66 (D4), 329.63 (E4), 392.00 (G4), 440.00 (A4)
      if (stepCount % 16 === 0) {
        // Melodic phrase A
        this.playMahuriNote(293.66, 0.25, 0.0);
        this.playMahuriNote(329.63, 0.25, 0.25);
        this.playMahuriNote(392.00, 0.5, 0.5);
      } else if (stepCount % 16 === 8) {
        // Melodic phrase B
        this.playMahuriNote(440.00, 0.25, 0.0);
        this.playMahuriNote(392.00, 0.25, 0.25);
        this.playMahuriNote(329.63, 0.6, 0.5);
      }

      stepCount = (stepCount + 1) % 64;
    }, 350);
  }

  public stopTraditionalBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.isBgmPlaying = false;
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }
}

export const gameAudio = new AudioEngine();
