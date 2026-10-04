// Web Audio API Synthesizer for 8-Bit Sound Effects & Chiptune BGM
// Tanpa file audio eksternal - 100% sintetis real-time, cepat & offline-ready!

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.currentTrack = 0;
    this.volume = 0.3;
    this.sfxEnabled = true;
    this.bgmEnabled = true;

    // Track notes (Frekuensi Hz & Durasi)
    this.tracks = [
      {
        name: "Cozy 8-Bit Cafe",
        tempo: 130,
        // Melody notes: [note, duration in sixteenths]
        melody: [
          ["C4", 2], ["E4", 2], ["G4", 2], ["C5", 2],
          ["B4", 2], ["G4", 2], ["E4", 2], ["D4", 2],
          ["C4", 2], ["E4", 2], ["A4", 2], ["G4", 4],
          ["F4", 2], ["E4", 2], ["D4", 4],
          ["E4", 2], ["G4", 2], ["C5", 2], ["D5", 2],
          ["E5", 4], ["D5", 2], ["C5", 2],
          ["A4", 2], ["C5", 2], ["G4", 4],
          ["D4", 2], ["E4", 2], ["C4", 4]
        ],
        bass: [
          ["C3", 4], ["G2", 4], ["C3", 4], ["G2", 4],
          ["A2", 4], ["E2", 4], ["F2", 4], ["G2", 4],
          ["C3", 4], ["G2", 4], ["C3", 4], ["E3", 4],
          ["F3", 4], ["G3", 4], ["C3", 8]
        ]
      },
      {
        name: "Pixel Cold Brew Beat",
        tempo: 110,
        melody: [
          ["E4", 2], ["G4", 2], ["B4", 4], ["A4", 2], ["G4", 2], ["E4", 4],
          ["D4", 2], ["F#4", 2], ["A4", 4], ["G4", 2], ["F#4", 2], ["D4", 4],
          ["C4", 2], ["E4", 2], ["G4", 4], ["B4", 2], ["A4", 2], ["G4", 4],
          ["B4", 2], ["D5", 2], ["E5", 4], ["B4", 4], ["E4", 4]
        ],
        bass: [
          ["E2", 4], ["B2", 4], ["E2", 4], ["B2", 4],
          ["D2", 4], ["A2", 4], ["D2", 4], ["A2", 4],
          ["C2", 4], ["G2", 4], ["C2", 4], ["G2", 4],
          ["B2", 4], ["F#2", 4], ["E2", 8]
        ]
      }
    ];

    // Frekuensi standar (Hz)
    this.noteFreq = {
      "C2": 65.41, "D2": 73.42, "E2": 82.41, "F2": 87.31, "F#2": 92.50, "G2": 98.00, "A2": 110.00, "B2": 123.47,
      "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "A3": 220.00, "B3": 246.94,
      "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
      "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
      "C6": 1046.50, "E6": 1318.51, "G6": 1567.98
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  toggleBGM() {
    this.init();
    if (this.isPlayingBGM) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    if (this.isPlayingBGM) {
      this.stopBGM();
      this.startBGM();
    }
    return this.tracks[this.currentTrack].name;
  }

  getCurrentTrackName() {
    return this.tracks[this.currentTrack].name;
  }

  startBGM() {
    this.init();
    if (this.isPlayingBGM) return;
    this.isPlayingBGM = true;

    const track = this.tracks[this.currentTrack];
    const beatSec = 60 / track.tempo;
    const sixteenthSec = beatSec / 4;

    let melodyIndex = 0;
    let bassIndex = 0;
    let melodyTime = this.ctx.currentTime + 0.05;
    let bassTime = melodyTime;

    const scheduleLoop = () => {
      if (!this.isPlayingBGM) return;

      const horizon = this.ctx.currentTime + 1.0;

      // Schedule melody
      while (melodyTime < horizon) {
        const item = track.melody[melodyIndex];
        const freq = this.noteFreq[item[0]] || 0;
        const dur = item[1] * sixteenthSec;

        if (freq > 0 && this.bgmEnabled) {
          this.playBgmNote(freq, melodyTime, dur * 0.85, 'square');
        }
        melodyTime += dur;
        melodyIndex = (melodyIndex + 1) % track.melody.length;
      }

      // Schedule bass
      while (bassTime < horizon) {
        const item = track.bass[bassIndex];
        const freq = this.noteFreq[item[0]] || 0;
        const dur = item[1] * sixteenthSec;

        if (freq > 0 && this.bgmEnabled) {
          this.playBgmNote(freq, bassTime, dur * 0.9, 'triangle', 0.6);
        }
        bassTime += dur;
        bassIndex = (bassIndex + 1) % track.bass.length;
      }

      this.bgmTimer = setTimeout(scheduleLoop, 200);
    };

    scheduleLoop();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playBgmNote(freq, startTime, duration, waveType = 'square', vol = 0.35) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    } catch(e) {}
  }

  // --- 8-BIT SOUND EFFECTS (SFX) ---

  playCoinSound() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  playBlipSound() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  playPowerupSound() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      const startTime = t + (idx * 0.06);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  }

  playStartSound() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio + chord
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);

      gain.gain.setValueAtTime(0.35, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.05);
      osc.stop(t + 0.65);
    });
  }

  playPrintSound() {
    // Dot matrix / thermal printer buzzing simulation
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const startTime = t + (i * 0.12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220 + (i % 2) * 60, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.09);
    }
  }

  playGameOverSound() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((freq, i) => {
      const startTime = t + (i * 0.1);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.13);
    });
  }
}

window.soundSystem = new SoundSystem();
