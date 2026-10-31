/**
 * audio-engine.js
 * Silnik syntezy dźwięku oparty na Web Audio API.
 * Zapewnia naturalne brzmienie instrumentów (Pianino, Wibrafon, Ciepły Synth),
 * polifonię oraz precyzyjne odtwarzanie sekwencji interwałowych.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.currentInstrument = "piano"; // 'piano' | 'vibes' | 'synth'
    this.volume = 0.8;
    this.tempoSpeed = 1.0; // 0.8 = wolniej, 1.0 = normalnie, 1.25 = szybciej
    this.activeTimeouts = [];
    this.activeVoices = [];

    // Callbacks dla UI
    this.onNoteStart = null;
    this.onNoteEnd = null;
    this.onPlaybackFinished = null;
  }

  /**
   * Inicjalizuje AudioContext po pierwszej interakcji użytkownika
   */
  async init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Dynamiczny kompresor zapobiegający przesterowaniom
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setInstrument(instrumentName) {
    this.currentInstrument = instrumentName;
  }

  setSpeed(speedVal) {
    this.tempoSpeed = Math.max(0.5, Math.min(2.0, speedVal));
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Zatrzymuje wszelkie zaplanowane nuty i czyści aktywne dźwięki
   */
  stopAll() {
    this.activeTimeouts.forEach(t => clearTimeout(t));
    this.activeTimeouts = [];

    this.activeVoices.forEach(voice => {
      try {
        if (voice.gainNode && this.ctx) {
          voice.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
          voice.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        }
        if (voice.nodes) {
          voice.nodes.forEach(n => {
            if (n.stop) n.stop(this.ctx.currentTime + 0.05);
          });
        }
      } catch (e) {
        // Ignoruj błędy przy zatrzymywaniu
      }
    });
    this.activeVoices = [];

    if (this.onPlaybackFinished) {
      this.onPlaybackFinished();
    }
  }

  /**
   * Odtwarza pojedynczą nutę o zadanym numerze MIDI i długości trwania
   */
  async playNote(midiNumber, duration = 1.0, startTimeOffset = 0, isSimultaneous = false) {
    await this.init();
    const now = this.ctx.currentTime + startTimeOffset;
    const freq = this.midiToFreq(midiNumber);

    const voiceGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const createdNodes = [];
    let noteGainVal = isSimultaneous ? 0.35 : 0.5;

    if (this.currentInstrument === "piano") {
      // Naturalny model pianina: fala podstawowa + składowe harmoniczne z szybkim atakiem
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), now);
      filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 2, 3500), now + duration);

      const harmonics = [
        { mult: 1.0, gain: 0.75, detune: 0 },
        { mult: 1.0, gain: 0.35, detune: 2 }, // lekki chorusing strun
        { mult: 2.0, gain: 0.35, detune: -1 },
        { mult: 3.0, gain: 0.15, detune: 0 },
        { mult: 4.0, gain: 0.08, detune: 1 }
      ];

      harmonics.forEach(h => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * h.mult, now);
        osc.detune.setValueAtTime(h.detune, now);

        const hGain = this.ctx.createGain();
        hGain.gain.setValueAtTime(h.gain, now);

        osc.connect(hGain);
        hGain.connect(filter);
        osc.start(now);
        osc.stop(now + duration + 0.2);
        createdNodes.push(osc, hGain);
      });

      // Perkusyjny impuls uderzenia młoteczka w strunę
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(freq * 1.5, now);
      clickGain.gain.setValueAtTime(0.12, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(filter);
      clickOsc.start(now);
      clickOsc.stop(now + 0.05);
      createdNodes.push(clickOsc, clickGain);

      // Obwiednia głośności (ADSR dla pianina)
      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.exponentialRampToValueAtTime(noteGainVal, now + 0.008);
      voiceGain.gain.exponentialRampToValueAtTime(noteGainVal * 0.7, now + 0.15);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    } else if (this.currentInstrument === "vibes") {
      // Wibrafon / dzwonki: czysty dźwięk z wyrazistą oktawą i dzwonkowym wybrzmieniem
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2.0, now);

      const h2Gain = this.ctx.createGain();
      h2Gain.gain.setValueAtTime(0.3, now);
      h2Gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.5);

      osc1.connect(filter);
      osc2.connect(h2Gain);
      h2Gain.connect(filter);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.2);
      osc2.stop(now + duration + 0.2);
      createdNodes.push(osc1, osc2, h2Gain);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(5000, now);

      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.exponentialRampToValueAtTime(noteGainVal * 0.9, now + 0.005);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.2);

    } else {
      // Warm Synth: ciepła fala piłokształtna i trójkątna z miękkim filtrem
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = "sawtooth";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq, now);
      osc2.detune.setValueAtTime(5, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2, now);

      osc1.connect(filter);
      osc2.connect(filter);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.2);
      osc2.stop(now + duration + 0.2);
      createdNodes.push(osc1, osc2);

      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.exponentialRampToValueAtTime(noteGainVal * 0.6, now + 0.04);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    filter.connect(voiceGain);
    voiceGain.connect(this.compressor);
    createdNodes.push(voiceGain, filter);

    const voiceRecord = { gainNode: voiceGain, nodes: createdNodes };
    this.activeVoices.push(voiceRecord);

    // Wywołanie callbacków UI
    const delayMs = startTimeOffset * 1000;
    if (this.onNoteStart) {
      const tStart = setTimeout(() => {
        if (this.onNoteStart) this.onNoteStart(midiNumber, duration);
      }, Math.max(0, delayMs));
      this.activeTimeouts.push(tStart);
    }

    if (this.onNoteEnd) {
      const tEnd = setTimeout(() => {
        if (this.onNoteEnd) this.onNoteEnd(midiNumber);
      }, Math.max(0, delayMs + duration * 1000));
      this.activeTimeouts.push(tEnd);
    }
  }

  /**
   * Odtwarza pełny interwał zgodnie ze wskazanym kierunkiem:
   * 'up', 'down', 'up_down', 'together', 'up_together', 'down_together', 'random'
   */
  async playInterval(rootMidi, semitones, direction = "up") {
    this.stopAll();
    await this.init();

    // Obsługa losowego stylu
    let actualDirection = direction;
    if (actualDirection === "random") {
      const styles = ["up", "down", "up_down", "together", "up_together", "down_together"];
      actualDirection = styles[Math.floor(Math.random() * styles.length)];
    }

    const noteDur = (0.75 / this.tempoSpeed);
    const pause = (0.15 / this.tempoSpeed);
    const longDur = (1.5 / this.tempoSpeed);

    let totalDuration = 0;

    switch (actualDirection) {
      case "up": {
        const targetMidi = rootMidi + semitones;
        this.playNote(rootMidi, noteDur, 0);
        this.playNote(targetMidi, noteDur * 1.2, noteDur + pause);
        totalDuration = (noteDur * 2.2 + pause);
        break;
      }

      case "down": {
        const targetMidi = rootMidi - semitones;
        this.playNote(rootMidi, noteDur, 0);
        this.playNote(targetMidi, noteDur * 1.2, noteDur + pause);
        totalDuration = (noteDur * 2.2 + pause);
        break;
      }

      case "up_down": {
        const targetMidi = rootMidi + semitones;
        this.playNote(rootMidi, noteDur, 0);
        this.playNote(targetMidi, noteDur, noteDur + pause);
        this.playNote(rootMidi, noteDur * 1.2, (noteDur + pause) * 2);
        totalDuration = ((noteDur + pause) * 2 + noteDur * 1.2);
        break;
      }

      case "together": {
        const targetMidi = rootMidi + semitones;
        this.playNote(rootMidi, longDur, 0, true);
        this.playNote(targetMidi, longDur, 0, true);
        totalDuration = longDur;
        break;
      }

      case "up_together": {
        const targetMidi = rootMidi + semitones;
        // Krok 1: w górę
        this.playNote(rootMidi, noteDur, 0);
        this.playNote(targetMidi, noteDur, noteDur + pause);
        // Krok 2: naraz po chwili oddechu
        const togetherStart = (noteDur + pause) * 2;
        this.playNote(rootMidi, longDur, togetherStart, true);
        this.playNote(targetMidi, longDur, togetherStart, true);
        totalDuration = togetherStart + longDur;
        break;
      }

      case "down_together": {
        const targetMidi = rootMidi - semitones;
        // Krok 1: w dół
        this.playNote(rootMidi, noteDur, 0);
        this.playNote(targetMidi, noteDur, noteDur + pause);
        // Krok 2: naraz po chwili oddechu
        const togetherStart = (noteDur + pause) * 2;
        this.playNote(rootMidi, longDur, togetherStart, true);
        this.playNote(targetMidi, longDur, togetherStart, true);
        totalDuration = togetherStart + longDur;
        break;
      }

      default: {
        const targetMidi = rootMidi + semitones;
        this.playNote(rootMidi, noteDur, 0);
        this.playNote(targetMidi, noteDur, noteDur + pause);
        totalDuration = noteDur * 2 + pause;
      }
    }

    const tFinish = setTimeout(() => {
      if (this.onPlaybackFinished) {
        this.onPlaybackFinished();
      }
    }, totalDuration * 1000 + 100);
    this.activeTimeouts.push(tFinish);

    return {
      direction: actualDirection,
      duration: totalDuration
    };
  }

  /**
   * Krótki przyjemny dźwięk sukcesu
   */
  async playSuccessSound() {
    await this.init();
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
    osc1.frequency.setValueAtTime(1046.50, now + 0.24); // C6

    osc2.frequency.setValueAtTime(1046.50, now + 0.24);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now + 0.24);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  }

  /**
   * Krótki, łagodny dźwięk błędu
   */
  async playErrorSound() {
    await this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(174.61, now + 0.2); // F3

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

export const audio = new AudioEngine();
