// Web Audio API Procedural Ambient Sound Generator

export interface SoundscapeOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  bgGradient: string;
  color: string;
}

export const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  {
    id: 'romantic_piano',
    name: 'Romantic Piano',
    icon: '🎹',
    description: 'A slow, enchanting piano melody for romantic moments',
    bgGradient: 'from-rose-950 to-pink-900',
    color: 'text-rose-400',
  },

  {
    id: 'rainy_cafe',
    name: 'Rainy Cafe',
    icon: '🌧️',
    description: 'Cozy rain patter on glass with warm indoor ambiance',
    bgGradient: 'from-slate-800 to-indigo-950',
    color: 'text-sky-400',
  },
  {
    id: 'library_whispers',
    name: 'Library Whispers',
    icon: '📚',
    description: 'Quiet sanctuary with page turns and subtle warmth',
    bgGradient: 'from-amber-950 to-amber-900',
    color: 'text-amber-400',
  },
  {
    id: 'cozy_fireplace',
    name: 'Cozy Fireplace',
    icon: '🔥',
    description: 'Warm crackling wood logs on a quiet evening',
    bgGradient: 'from-orange-950 to-amber-950',
    color: 'text-orange-400',
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Waves',
    icon: '🌊',
    description: 'Rhythmic, gentle waves rolling along a calm shoreline',
    bgGradient: 'from-cyan-950 to-blue-900',
    color: 'text-cyan-400',
  },
  {
    id: 'birthday_light',
    name: 'Birthday Light',
    icon: '🎉',
    description: 'Upbeat and cheerful celebration music',
    bgGradient: 'from-pink-900 to-purple-900',
    color: 'text-pink-400',
  },
  {
    id: 'arcade_8bit',
    name: '8-Bit Arcade',
    icon: '🕹️',
    description: 'Retro 8-bit chiptune music',
    bgGradient: 'from-emerald-900 to-black',
    color: 'text-emerald-400',
  },
  {
    id: 'stargazing_night',
    name: 'Deep Space Ambient',
    icon: '🌌',
    description: 'Deep space ambient audio with glowing cosmic pads',
    bgGradient: 'from-purple-950 to-slate-950',
    color: 'text-purple-400',
  },
  {
    id: 'none',
    name: 'Silent (No Sound)',
    icon: '🔇',
    description: 'Mute all background ambient audio',
    bgGradient: 'from-slate-900 to-slate-800',
    color: 'text-slate-400',
  }
];

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSoundId: string = 'none';
  private nodes: (AudioNode | number)[] = [];
  private isPlaying: boolean = false;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) { // 0 to 1
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.3, this.ctx.currentTime);
    }
  }

  public play(soundId: string) {
    this.stop();
    this.currentSoundId = soundId;
    if (soundId === 'none') return;

    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      this.isPlaying = true;

      switch (soundId) {
        case 'rainy_cafe':
          this.createRainyCafeSound();
          break;
        case 'library_whispers':
          this.createLibraryWhispersSound();
          break;
        case 'cozy_fireplace':
          this.createFireplaceSound();
          break;
        case 'ocean_breeze':
          this.createOceanWavesSound();
          break;
        case 'stargazing_night':
          this.createStargazingSound();
          break;
        case 'romantic_piano':
          this.createRomanticPianoSound();
          break;
        case 'birthday_light':
          this.createBirthdayLightSound();
          break;
        case 'arcade_8bit':
          this.createArcade8BitSound();
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  }

  public stop() {
    this.nodes.forEach((n) => {
      if (typeof n === 'number') {
        window.clearInterval(n);
      } else {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop();
          }
          n.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }
    });
    this.nodes = [];
    this.isPlaying = false;
  }

  // 1. Rainy Cafe Generator (Pink noise filter + drop impulses)
  private createRainyCafeSound() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.nodes.push(whiteNoise, filter);
  }

  // 2. Library Whispers (Soft low hum + warm resonance)
  private createLibraryWhispersSound() {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
    osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(this.masterGain);

    osc1.start();
    osc2.start();

    this.nodes.push(osc1, osc2, gainNode, filter);
  }

  // 3. Cozy Fireplace Sound (Crackles + low warm rumble)
  private createFireplaceSound() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    // Crackle pops
    const timerId = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      if (Math.random() < 0.3) {
        const pop = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        pop.type = 'triangle';
        pop.frequency.setValueAtTime(800 + Math.random() * 1200, this.ctx.currentTime);
        popGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        pop.connect(popGain);
        popGain.connect(this.masterGain);
        pop.start();
        pop.stop(this.ctx.currentTime + 0.04);
      }
    }, 150);

    this.nodes.push(noise, filter, gain, timerId);
  }

  // 4. Ocean Waves Sound (LFO swell filter)
  private createOceanWavesSound() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    // LFO to swell wave frequency
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // Wave every 10 sec

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.nodes.push(noise, filter, lfo, lfoGain, gain);
  }


  // 6. Romantic Piano / Music Box
  private createRomanticPianoSound() {
    if (!this.ctx || !this.masterGain) return;
    
    const pad = this.ctx.createOscillator();
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(196, this.ctx.currentTime); // G3
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    pad.connect(padGain);
    padGain.connect(this.masterGain);
    pad.start();
    this.nodes.push(pad, padGain);

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex], this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.0);
      
      noteIndex = (noteIndex + 1) % notes.length;
    };
    
    playNote();
    const timerId = window.setInterval(playNote, 1500);
    this.nodes.push(timerId);
  }

  // 7. Birthday Light Theme Music
  private createBirthdayLightSound() {
    if (!this.ctx || !this.masterGain) return;
    
    // Upbeat baseline pad
    const pad = this.ctx.createOscillator();
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(261.63, this.ctx.currentTime); // C4
    
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    
    pad.connect(padGain);
    padGain.connect(this.masterGain);
    pad.start();
    this.nodes.push(pad, padGain);
    
    // Cheerful arpeggio melody
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C4, E4, G4, C5, G4, E4
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex], this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
      
      noteIndex = (noteIndex + 1) % notes.length;
    };
    
    playNote();
    // Faster tempo for party vibe
    const timerId = window.setInterval(playNote, 400);
    this.nodes.push(timerId);
  }

  // 8. Arcade 8-Bit Theme Music
  private createArcade8BitSound() {
    if (!this.ctx || !this.masterGain) return;
    
    // Fast bassline
    const bass = this.ctx.createOscillator();
    bass.type = 'square';
    bass.frequency.setValueAtTime(130.81, this.ctx.currentTime); // C3
    
    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    
    bass.connect(bassGain);
    bassGain.connect(this.masterGain);
    bass.start();
    this.nodes.push(bass, bassGain);
    
    // 8-bit melody
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25]; // C5, E5, G5, C6, G5, E5
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square'; // 8-bit sound
      osc.frequency.setValueAtTime(notes[noteIndex], this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
      
      noteIndex = (noteIndex + 1) % notes.length;
    };
    
    playNote();
    const timerId = window.setInterval(playNote, 200); // Fast tempo
    this.nodes.push(timerId);
  }

  // 5. Stargazing Night (Cosmic pads with soft chord)
  private createStargazingSound() {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3 chord pad
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    freqs.forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      osc.connect(padGain);
      osc.start();
      this.nodes.push(osc);
    });

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    padGain.connect(filter);
    filter.connect(this.masterGain);

    this.nodes.push(padGain, filter);
  }
}

export const soundscapeEngine = new SoundscapeEngine();
