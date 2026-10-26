/**
 * Procedural Web Audio API Background Music Engine for Random Thinking
 * Lightweight, zero-asset, infinite retro / chill lo-fi soundscapes.
 */
class BackgroundMusicEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.volume = parseFloat(localStorage.getItem('rtg_bgm_volume') || '0.25');
    this.enabled = localStorage.getItem('rtg_bgm_enabled') === 'true';
    this.currentTrack = localStorage.getItem('rtg_bgm_track') || 'synthwave';
    this.step = 0;
    this.masterGain = null;

    // Musical scales (Hz)
    this.tracks = {
      synthwave: {
        name: 'Chill Synthwave',
        tempo: 280, // ms per step
        bass: [110, 110, 130.81, 130.81, 146.83, 146.83, 164.81, 123.47], // A2, C3, D3, E3, B2
        melody: [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 440, 392, 329.63, 293.66, 261.63],
        type: 'sine',
      },
      arcade: {
        name: 'Retro Arcade',
        tempo: 160,
        bass: [130.81, 146.83, 164.81, 174.61, 196.0, 174.61, 164.81, 146.83],
        melody: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 587.33, 659.25],
        type: 'triangle',
      },
      cyberpunk: {
        name: 'Cyberpunk Focus',
        tempo: 360,
        bass: [65.41, 65.41, 73.42, 82.41, 65.41, 87.31, 82.41, 73.42], // Deep C2
        melody: [261.63, 311.13, 349.23, 392.0, 466.16, 392.0, 349.23, 311.13],
        type: 'sawtooth',
      },
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq, duration, type = 'sine', gainScale = 0.05) {
    if (!this.ctx || !this.isPlaying || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const targetGain = this.volume * gainScale;
      gain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio node cleanup
    }
  }

  tick() {
    const track = this.tracks[this.currentTrack] || this.tracks.synthwave;
    this.step++;

    // Bassline note
    const bassFreq = track.bass[this.step % track.bass.length];
    this.playNote(bassFreq, (track.tempo / 1000) * 1.8, 'sine', 0.12);

    // Melody note (every other step or pattern)
    if (this.step % 2 === 0 || this.currentTrack === 'arcade') {
      const melodyFreq = track.melody[(this.step / 2) % track.melody.length];
      this.playNote(melodyFreq, (track.tempo / 1000) * 1.2, track.type, 0.06);
    }
  }

  start() {
    if (this.isPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.isPlaying = true;
    const track = this.tracks[this.currentTrack] || this.tracks.synthwave;
    this.intervalId = setInterval(() => this.tick(), track.tempo);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('rtg_bgm_enabled', String(this.enabled));

    if (this.enabled) {
      this.init();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
      this.start();
    } else {
      this.stop();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    }
    return this.enabled;
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, parseFloat(newVol)));
    localStorage.setItem('rtg_bgm_volume', String(this.volume));
    if (this.masterGain && this.ctx && this.enabled) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setTrack(trackKey) {
    if (!this.tracks[trackKey]) return;
    this.currentTrack = trackKey;
    localStorage.setItem('rtg_bgm_track', trackKey);
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  getTracksList() {
    return Object.entries(this.tracks).map(([key, val]) => ({
      key,
      name: val.name,
    }));
  }
}

const backgroundMusic = new BackgroundMusicEngine();
export default backgroundMusic;
