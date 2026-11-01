/**
 * bundle.js
 * Samowystarczalny, kompletny pakiet skryptu dla aplikacji Interwały Muzyczne.
 * Umożliwia natychmiastowe uruchomienie aplikacji zarówno poprzez bezpośrednie
 * dwukrotne kliknięcie pliku index.html (protokół file://), jak i na serwerze HTTP.
 *
 * ============================================================================
 * 🎵 KONFIGURACJA OZNACZEŃ (SKRÓTÓW) I PIOSENEK MNEMOTECHNICZNYCH
 * ============================================================================
 * TUTAJ MOŻESZ ŁATWO EDYTOWAĆ:
 * 1. Oznaczenia / skróty interwałów (pole "short", np. "2m", "2w", "tr", "4>", "5")
 * 2. Piosenki mnemotechniczne kojarzone z danym interwałem (pole "mnemonic")
 * 3. Pełne nazwy wyświetlane na stronie (pole "name")
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. KONFIGURACJA INTERWAŁÓW I PIOSENEK (DO SZYBKIEJ EDYCJI)
     ========================================================================== */
  const INTERVALS_CONFIG = [
    {
      semitones: 0,
      short: "1",
      name: "Pryma czysta",
      mnemonic: "Dwa identyczne dźwięki o tej samej wysokości (np. początek 'Jingle Bells', 'Happy Birthday', 'Oda do radości')",
      color: "#6366f1"
    },
    {
      semitones: 1,
      short: "2>",
      name: "Sekunda mała",
      mnemonic: "'Różowa Pantera', Hymn Polski ('Jeszcze Polska...'), początek 'Dla Elizy' (E-D#)",
      color: "#ec4899"
    },
    {
      semitones: 2,
      short: "2",
      name: "Sekunda wielka",
      mnemonic: "'Panie Janie' (Frère Jacques), 'Pójdźmy wszyscy do stajenki', 'Pan Jezus już się zbliża'",
      color: "#f43f5e"
    },
    {
      semitones: 3,
      short: "3>",
      name: "Tercja mała",
      mnemonic: "'Sto lat', 'Wlazł kotek na płotek', 'Czerwone jabłuszko (olej kujawski)', Kukułka (w dół)",
      color: "#d946ef"
    },
    {
      semitones: 4,
      short: "3",
      name: "Tercja wielka",
      mnemonic: "'Stary niedźwiedź mocno śpi', 'Crazy frog'",
      color: "#a855f7"
    },
    {
      semitones: 5,
      short: "4",
      name: "Kwarta czysta",
      mnemonic: "'Jedzie pociąg', 'Płonie ognisko w lesie', 'Szła dzieweczka do laseczka'",
      color: "#8b5cf6"
    },
    {
      semitones: 6,
      short: "4</5>",
      name: "Tryton",
      secondaryName: "Kwarta zwiększona (4>) / Kwinta zmniejszona (5<)",
      mnemonic: "nieprzyjemny dźwięk, rozwiązuje się w górę albo w dół",
      color: "#f59e0b"
    },
    {
      semitones: 7,
      short: "5",
      name: "Kwinta czysta",
      mnemonic: "'Gwiezdne Wojny' (Star Wars motyw przewodni), 'Twinkle Twinkle Little Star', 'Wyszły w pole kurki trzy'",
      color: "#06b6d4"
    },
    {
      semitones: 8,
      short: "6>",
      name: "Seksta mała",
      mnemonic: "Motyw miłosny z 'Love Story'",
      color: "#0ea5e9"
    },
    {
      semitones: 9,
      short: "6",
      name: "Seksta wielka",
      mnemonic: "'Barka (o Panie, to Ty na mnie spojrzałeś)', 'Jak długo na Wawelu (hymn Wisły)'",
      color: "#10b981"
    },
    {
      semitones: 10,
      short: "7",
      name: "Septyma mała",
      mnemonic: "'The Winner Takes It All' (ABBA), 'Ja ci powiadała Anielo'",
      color: "#14b8a6"
    },
    {
      semitones: 11,
      short: "7<",
      name: "Septyma wielka",
      mnemonic: "'Take On Me' (A-ha: Take On Me w refrenie)",
      color: "#84cc16"
    },
    {
      semitones: 12,
      short: "8",
      name: "Oktawa czysta",
      mnemonic: "'Bóg się rodzi','Over the Rainbow' (Some-where...), 'Singin' in the Rain'",
      color: "#3b82f6"
    }
  ];

  const DEFAULT_ALIASES = {
    0: ["1", "1cz", "pryma", "pryma czysta", "czysta pryma", "unison", "unisono", "p"],
    1: ["2>","2m", "sekunda mala", "sekunda mała", "sm", "2 mała", "2 mala", "2-", "2b"],
    2: ["2","2w", "sekunda wielka", "sw", "2 wielka", "2+"],
    3: ["3>", "3m", "tercja mala", "tercja mała", "tm", "3 mała", "3 mala", "3-", "3b"],
    4: ["3", "3w", "tercja wielka", "tw", "3 wielka", "3+"],
    5: ["4", "4cz", "kwarta", "kwarta czysta", "czysta kwarta", "k4"],
    6: ["4</5>", "tr", "tryton", "4<", "5>", "4zw", "5zm", "kwarta zwiekszona", "kwarta zwiększona", "kwinta zmniejszona", "diabolus in musica", "tryt"],
    7: ["5", "5cz", "kwinta", "kwinta czysta", "czysta kwinta", "k5"],
    8: ["6>", "6m", "seksta mala", "seksta mała", "sm", "6 mała", "6 mala", "6-", "6b"],
    9: ["6", "6w", "seksta wielka", "sw", "6 wielka", "6+", "6"],
    10: ["7", "7m", "septyma mala", "septyma mała", "sm", "7 mała", "7 mala", "7b"],
    11: ["7<", "7w", "septyma wielka", "sw", "7 wielka", "7+"],
    12: ["8", "8cz", "oktawa", "oktawa czysta", "czysta oktawa", "okt", "8v", "8va"]
  };

  const RATIOS = {
    0: "1:1", 1: "16:15", 2: "9:8", 3: "6:5", 4: "5:4", 5: "4:3",
    6: "45:32", 7: "3:2", 8: "8:5", 9: "5:3", 10: "16:9", 11: "15:8", 12: "2:1"
  };

  const INTERVALS = INTERVALS_CONFIG.map((cfg, index) => {
    const aliasesSet = new Set([
      cfg.short,
      cfg.name,
      ...(DEFAULT_ALIASES[cfg.semitones] || [])
    ]);

    return {
      id: index,
      semitones: cfg.semitones,
      short: cfg.short,
      name: cfg.name,
      secondaryName: cfg.secondaryName || null,
      mnemonic: cfg.mnemonic,
      ratio: RATIOS[cfg.semitones] || "1:1",
      badgeColor: cfg.color || "#6366f1",
      aliases: Array.from(aliasesSet)
    };
  });

  const NOTE_NAMES_PL = [
    "C", "Cis", "D", "Dis", "E", "F", "Fis", "G", "Gis", "A", "B (Ais)", "H"
  ];

  const NOTE_NAMES_INT = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
  ];

  function getNoteDetails(midiNumber) {
    const noteIndex = ((midiNumber % 12) + 12) % 12;
    const octave = Math.floor(midiNumber / 12) - 1;
    const plName = NOTE_NAMES_PL[noteIndex];
    const intName = NOTE_NAMES_INT[noteIndex];
    const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

    return {
      midi: midiNumber,
      namePl: `${plName}${octave}`,
      nameInt: `${intName}${octave}`,
      baseNamePl: plName,
      baseNameInt: intName,
      octave,
      frequency
    };
  }

  function normalizeAnswer(text) {
    if (!text) return "";
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/ł/g, "l")
      .replace(/ą/g, "a")
      .replace(/ę/g, "e")
      .replace(/ć/g, "c")
      .replace(/ń/g, "n")
      .replace(/ó/g, "o")
      .replace(/ś/g, "s")
      .replace(/ź/g, "z")
      .replace(/ż/g, "z");
  }

  function isAnswerMatching(userInput, interval) {
    const cleanInput = normalizeAnswer(userInput);
    if (!cleanInput) return false;
    const noSpaceInput = cleanInput.replace(/\s+/g, "");

    if (cleanInput === normalizeAnswer(interval.short) ||
        noSpaceInput === normalizeAnswer(interval.short).replace(/\s+/g, "")) {
      return true;
    }

    if (cleanInput === `${interval.semitones}p` || 
        noSpaceInput === `${interval.semitones}p` ||
        cleanInput === `${interval.semitones} polton` ||
        cleanInput === `${interval.semitones} poltony` ||
        cleanInput === `${interval.semitones} poltonow`) {
      return true;
    }

    return interval.aliases.some(alias => {
      const normAlias = normalizeAnswer(alias);
      return normAlias === cleanInput || normAlias.replace(/\s+/g, "") === noSpaceInput;
    });
  }

  const INTERVAL_PRESETS = [
    {
      id: "all",
      label: "Wszystkie (1 - 8)",
      description: "Wszystkie 13 interwałów od prymy do oktawy",
      intervalIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      id: "to_fifth",
      label: "Do kwinty (1 - 5)",
      description: "Podstawowe interwały do 7 półtonów",
      intervalIds: [0, 1, 2, 3, 4, 5, 6, 7]
    },
    {
      id: "thirds_and_fifths",
      label: "Tercje i kwinty",
      description: "Kluczowe interwały akordowe (3m, 3w, 5)",
      intervalIds: [3, 4, 7]
    },
    {
      id: "minor_major",
      label: "Tylko małe i wielkie",
      description: "Sekundy, tercje, seksty i septymy",
      intervalIds: [1, 2, 3, 4, 8, 9, 10, 11]
    },
    {
      id: "pure_and_tritone",
      label: "Czyste i tryton",
      description: "Pryma, kwarta, tryton, kwinta, oktawa",
      intervalIds: [0, 5, 6, 7, 12]
    },
    {
      id: "challenging",
      label: "Trudne / dysonanse",
      description: "Sekunda mała, tryton, seksta mała, septyma wielka",
      intervalIds: [1, 6, 8, 11]
    }
  ];

  const PLAYBACK_DIRECTIONS = [
    { id: "up", label: "Do góry", icon: "arrow-up", description: "Dźwięk 1, potem wyższy dźwięk 2" },
    { id: "down", label: "W dół", icon: "arrow-down", description: "Dźwięk 1, potem niższy dźwięk 2" },
    { id: "up_down", label: "Do góry i w dół", icon: "repeat", description: "Dźwięk 1 → wyższy dźwięk 2 → powrót do dźwięku 1" },
    { id: "together", label: "Naraz (harmonicznie)", icon: "music", description: "Oba dźwięki brzmią jednocześnie" },
    { id: "up_together", label: "Do góry i naraz", icon: "layers", description: "Najpierw melodycznie do góry, potem naraz" },
    { id: "down_together", label: "W dół i naraz", icon: "layers", description: "Najpierw melodycznie w dół, potem naraz" },
    { id: "random", label: "Losowy kierunek", icon: "shuffle", description: "Komputer losuje jeden z powyższych stylów" }
  ];

  /* ==========================================================================
     2. SILNIK AUDIO (WEB AUDIO API Z PEŁNĄ OBSŁUGĄ SAFARI / WEBKIT)
     ========================================================================== */
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.currentInstrument = "piano";
      this.volume = 0.8;
      this.tempoSpeed = 1.0;
      this.activeTimeouts = [];
      this.activeVoices = [];
      this.unlocked = false;
      this.silentAudio = null;

      this.onNoteStart = null;
      this.onNoteEnd = null;
      this.onPlaybackFinished = null;
    }

    unlockSafari() {
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            this.ctx = new AudioCtx();
            this.setupAudioGraph();
          }
        }

        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume();
        }

        if (this.ctx && !this.unlocked) {
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);

          try {
            if (!this.silentAudio) {
              this.silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
              this.silentAudio.setAttribute("playsinline", "");
              this.silentAudio.setAttribute("webkit-playsinline", "");
            }
            this.silentAudio.play().catch(() => {});
          } catch (e) {}

          this.unlocked = true;
        }
      } catch (e) {
        console.warn("Audio unlock notice:", e);
      }
    }

    setupAudioGraph() {
      if (!this.ctx || this.masterGain) return;

      try {
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
      } catch (e) {
        console.warn("Błąd konfiguracji grafu audio:", e);
      }
    }

    async init() {
      this.unlockSafari();
      if (this.ctx && this.ctx.state === "suspended") {
        try {
          await this.ctx.resume();
        } catch (e) {}
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
        } catch (e) {}
      });
      this.activeVoices = [];

      if (this.onPlaybackFinished) {
        this.onPlaybackFinished();
      }
    }

    async playNote(midiNumber, duration = 1.0, startTimeOffset = 0, isSimultaneous = false) {
      await this.init();
      if (!this.ctx) return;

      const now = Math.max(this.ctx.currentTime, this.ctx.currentTime + startTimeOffset);
      const freq = this.midiToFreq(midiNumber);

      const voiceGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const createdNodes = [];
      const noteGainVal = isSimultaneous ? 0.35 : 0.5;

      if (this.currentInstrument === "piano") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(Math.min(freq * 5.5, 7500), now);
        filter.frequency.setTargetAtTime(Math.min(freq * 1.8, 2500), now + 0.05, duration * 0.3);

        const harmonics = [
          { mult: 1.0, gain: 0.75, detune: 0 },
          { mult: 1.0, gain: 0.35, detune: 2 },
          { mult: 2.0, gain: 0.32, detune: -1 },
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
          osc.stop(now + duration + 0.25);
          createdNodes.push(osc, hGain);
        });

        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = "triangle";
        clickOsc.frequency.setValueAtTime(freq * 1.5, now);
        clickGain.gain.setValueAtTime(0.1, now);
        clickGain.gain.setTargetAtTime(0.0001, now + 0.01, 0.015);
        clickOsc.connect(clickGain);
        clickGain.connect(filter);
        clickOsc.start(now);
        clickOsc.stop(now + 0.08);
        createdNodes.push(clickOsc, clickGain);

        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.linearRampToValueAtTime(noteGainVal, now + 0.012);
        voiceGain.gain.setValueAtTime(noteGainVal * 0.75, now + 0.1);
        voiceGain.gain.setTargetAtTime(0.0001, now + 0.1, duration * 0.35);

      } else if (this.currentInstrument === "vibes") {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2.0, now);

        const h2Gain = this.ctx.createGain();
        h2Gain.gain.setValueAtTime(0.3, now);
        h2Gain.gain.setTargetAtTime(0.0001, now + 0.05, duration * 0.25);

        osc1.connect(filter);
        osc2.connect(h2Gain);
        h2Gain.connect(filter);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration + 0.25);
        osc2.stop(now + duration + 0.25);
        createdNodes.push(osc1, osc2, h2Gain);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(5000, now);

        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.linearRampToValueAtTime(noteGainVal * 0.9, now + 0.008);
        voiceGain.gain.setTargetAtTime(0.0001, now + 0.08, duration * 0.45);

      } else {
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
        osc1.stop(now + duration + 0.25);
        osc2.stop(now + duration + 0.25);
        createdNodes.push(osc1, osc2);

        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.linearRampToValueAtTime(noteGainVal * 0.65, now + 0.03);
        voiceGain.gain.setTargetAtTime(0.0001, now + 0.06, duration * 0.35);
      }

      filter.connect(voiceGain);
      voiceGain.connect(this.compressor || this.ctx.destination);
      createdNodes.push(voiceGain, filter);

      const voiceRecord = { gainNode: voiceGain, nodes: createdNodes };
      this.activeVoices.push(voiceRecord);

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

    async playInterval(rootMidi, semitones, direction = "up") {
      this.stopAll();
      await this.init();

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
          totalDuration = noteDur * 2.2 + pause;
          break;
        }

        case "down": {
          const targetMidi = rootMidi - semitones;
          this.playNote(rootMidi, noteDur, 0);
          this.playNote(targetMidi, noteDur * 1.2, noteDur + pause);
          totalDuration = noteDur * 2.2 + pause;
          break;
        }

        case "up_down": {
          const targetMidi = rootMidi + semitones;
          this.playNote(rootMidi, noteDur, 0);
          this.playNote(targetMidi, noteDur, noteDur + pause);
          this.playNote(rootMidi, noteDur * 1.2, (noteDur + pause) * 2);
          totalDuration = (noteDur + pause) * 2 + noteDur * 1.2;
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
          this.playNote(rootMidi, noteDur, 0);
          this.playNote(targetMidi, noteDur, noteDur + pause);
          const togetherStart = (noteDur + pause) * 2;
          this.playNote(rootMidi, longDur, togetherStart, true);
          this.playNote(targetMidi, longDur, togetherStart, true);
          totalDuration = togetherStart + longDur;
          break;
        }

        case "down_together": {
          const targetMidi = rootMidi - semitones;
          this.playNote(rootMidi, noteDur, 0);
          this.playNote(targetMidi, noteDur, noteDur + pause);
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

    async playSuccessSound() {
      await this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.08);
      osc1.frequency.setValueAtTime(783.99, now + 0.16);
      osc1.frequency.setValueAtTime(1046.50, now + 0.24);

      osc2.frequency.setValueAtTime(1046.50, now + 0.24);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain.gain.setTargetAtTime(0.0001, now + 0.26, 0.09);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.24);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    }

    async playErrorSound() {
      await this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(174.61, now + 0.18);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.setTargetAtTime(0.0001, now + 0.1, 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  const audio = new AudioEngine();

  /* ==========================================================================
     3. LOCAL STORAGE MANAGER
     ========================================================================== */
  const STORAGE_KEY = "interwaly_app_state_v1";

  const DEFAULT_STATE = {
    mode: "choice",
    selectedIntervalIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    playbackDirection: "up",
    activeLearningEnabled: true,
    instrument: "piano",
    volume: 0.8,
    speed: 1.0,
    autoAdvance: false,
    soundFeedback: true,
    stats: {},
    totalQuestions: 0,
    currentStreak: 0,
    bestStreak: 0
  };

  class StorageManager {
    constructor() {
      this.state = this.loadState();
    }

    loadState() {
      try {
        if (typeof window === "undefined" || typeof localStorage === "undefined") {
          return { ...DEFAULT_STATE, stats: {} };
        }
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return { ...DEFAULT_STATE, stats: {} };
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          stats: parsed.stats || {}
        };
      } catch (e) {
        console.warn("Nie udało się odczytać LocalStorage, używam ustawień domyślnych", e);
        return { ...DEFAULT_STATE, stats: {} };
      }
    }

    saveState() {
      try {
        if (typeof window === "undefined" || typeof localStorage === "undefined") {
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error("Błąd zapisu do LocalStorage", e);
      }
    }

    get(key) {
      return this.state[key];
    }

    set(key, value) {
      this.state[key] = value;
      this.saveState();
    }

    update(updates) {
      this.state = { ...this.state, ...updates };
      this.saveState();
    }

    getStatsForInterval(intervalId) {
      if (!this.state.stats[intervalId]) {
        this.state.stats[intervalId] = {
          attempts: 0,
          correct: 0,
          wrong: 0,
          consecutiveCorrect: 0,
          consecutiveWrong: 0,
          lastAnswerTime: null
        };
      }
      return this.state.stats[intervalId];
    }

    recordAnswer(intervalId, isCorrect) {
      const stats = this.getStatsForInterval(intervalId);
      stats.attempts += 1;
      stats.lastAnswerTime = Date.now();

      if (isCorrect) {
        stats.correct += 1;
        stats.consecutiveCorrect += 1;
        stats.consecutiveWrong = 0;
        this.state.currentStreak += 1;
        if (this.state.currentStreak > this.state.bestStreak) {
          this.state.bestStreak = this.state.currentStreak;
        }
      } else {
        stats.wrong += 1;
        stats.consecutiveWrong += 1;
        stats.consecutiveCorrect = 0;
        this.state.currentStreak = 0;
      }

      this.state.totalQuestions += 1;
      this.state.stats[intervalId] = stats;
      this.saveState();
      return stats;
    }

    resetStats() {
      this.state.stats = {};
      this.state.totalQuestions = 0;
      this.state.currentStreak = 0;
      this.state.bestStreak = 0;
      this.saveState();
    }
  }

  const storage = new StorageManager();

  /* ==========================================================================
     4. SILNIK ACTIVE LEARNING (INTELIGENTNE POWTÓRKI)
     ========================================================================== */
  class ActiveLearningEngine {
    constructor() {
      this.lastSelectedId = null;
      this.recentIds = [];
    }

    calculateWeight(intervalId) {
      const stats = storage.getStatsForInterval(intervalId);

      if (stats.attempts === 0) {
        return 1.5;
      }

      const accuracy = stats.correct / stats.attempts;
      const errorRate = 1 - accuracy;

      let weight = 0.3 + Math.pow(errorRate, 1.4) * 3.5;

      if (stats.consecutiveWrong > 0) {
        weight += Math.min(stats.consecutiveWrong * 1.0, 3.0);
      }

      if (stats.consecutiveCorrect >= 3 && accuracy >= 0.8) {
        weight = Math.max(0.2, weight * 0.4);
      }

      return Math.max(0.15, weight);
    }

    pickNextIntervalId(availableIds, forceActiveLearning = null) {
      if (!availableIds || availableIds.length === 0) return 0;
      if (availableIds.length === 1) return availableIds[0];

      const isEnabled = forceActiveLearning !== null 
        ? forceActiveLearning 
        : storage.get("activeLearningEnabled");

      let candidateIds = [...availableIds];
      const lastInterval = this.lastSelectedId !== null 
        ? INTERVALS.find(i => i.id === this.lastSelectedId) 
        : null;

      if (!isEnabled) {
        let pool = candidateIds.filter(id => !this.recentIds.includes(id));
        if (lastInterval && candidateIds.length >= 4) {
          const nonAdjacent = pool.filter(id => {
            const item = INTERVALS.find(i => i.id === id);
            return item && Math.abs(item.semitones - lastInterval.semitones) > 1;
          });
          if (nonAdjacent.length > 0) pool = nonAdjacent;
        }
        if (pool.length === 0) pool = candidateIds.filter(id => id !== this.lastSelectedId);
        if (pool.length === 0) pool = candidateIds;

        const chosenId = pool[Math.floor(Math.random() * pool.length)];
        this.lastSelectedId = chosenId;
        this.recentIds.push(chosenId);
        if (this.recentIds.length > 2) this.recentIds.shift();
        return chosenId;
      }

      // Losowanie ważone (Active Learning) z ochroną przed grupowaniem obok siebie
      const weights = candidateIds.map(id => {
        let w = this.calculateWeight(id);
        const item = INTERVALS.find(i => i.id === id);

        if (id === this.lastSelectedId) {
          const stats = storage.getStatsForInterval(id);
          if (stats.consecutiveWrong === 0) {
            w *= (candidateIds.length === 2 ? 0.5 : 0.2);
          }
        } else if (lastInterval && candidateIds.length >= 4 && item) {
          const semitoneDiff = Math.abs(item.semitones - lastInterval.semitones);
          if (semitoneDiff <= 1) {
            const stats = storage.getStatsForInterval(id);
            if (stats.consecutiveWrong === 0) {
              w *= 0.35;
            }
          }
        }

        if (this.recentIds.includes(id) && candidateIds.length > 3) {
          w *= 0.4;
        }

        return w;
      });

      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let randomThreshold = Math.random() * totalWeight;
      let chosenId = candidateIds[0];

      for (let i = 0; i < candidateIds.length; i++) {
        randomThreshold -= weights[i];
        if (randomThreshold <= 0) {
          chosenId = candidateIds[i];
          break;
        }
      }

      this.lastSelectedId = chosenId;
      this.recentIds.push(chosenId);
      if (this.recentIds.length > 2) this.recentIds.shift();
      return chosenId;
    }

    getMastery(intervalId) {
      const stats = storage.getStatsForInterval(intervalId);
      if (stats.attempts === 0) {
        return {
          score: 0,
          status: "Nowy",
          badgeClass: "badge-new",
          attempts: 0,
          accuracy: 0
        };
      }

      const accuracy = (stats.correct / stats.attempts) * 100;
      const confidence = Math.min(1.0, stats.attempts / 5);
      const score = Math.round(accuracy * confidence);

      let status = "Wymaga ćwiczeń";
      let badgeClass = "badge-trouble";

      if (score >= 85) {
        status = "Mistrz";
        badgeClass = "badge-master";
      } else if (score >= 65) {
        status = "Dobrze";
        badgeClass = "badge-good";
      } else if (score >= 40) {
        status = "W trakcie nauki";
        badgeClass = "badge-learning";
      }

      return {
        score,
        status,
        badgeClass,
        attempts: stats.attempts,
        correct: stats.correct,
        wrong: stats.wrong,
        accuracy: Math.round(accuracy)
      };
    }

    getTopProblematicIntervals(allIntervals) {
      const tested = allIntervals.filter(item => {
        const stats = storage.getStatsForInterval(item.id);
        return stats.attempts >= 2;
      });

      tested.sort((a, b) => {
        const statsA = storage.getStatsForInterval(a.id);
        const statsB = storage.getStatsForInterval(b.id);
        const accA = statsA.correct / statsA.attempts;
        const accB = statsB.correct / statsB.attempts;
        return accA - accB;
      });

      return tested.slice(0, 3);
    }
  }

  const activeLearning = new ActiveLearningEngine();

  /* ==========================================================================
     5. WIZUALNA KLAWIATURA FORTEPIANOWA (TYLKO DLA TRYBU NAUKI)
     ========================================================================== */
  class PianoKeyboard {
    constructor(containerElement, startMidi = 48, endMidi = 76) {
      this.container = containerElement;
      this.startMidi = startMidi;
      this.endMidi = endMidi;
      this.keyElements = new Map();
      this.render();
    }

    isBlackKey(midi) {
      const semitone = ((midi % 12) + 12) % 12;
      return [1, 3, 6, 8, 10].includes(semitone);
    }

    render() {
      this.container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "piano-wrapper";

      for (let midi = this.startMidi; midi <= this.endMidi; midi++) {
        const isBlack = this.isBlackKey(midi);
        const noteDetails = getNoteDetails(midi);

        const key = document.createElement("div");
        key.className = `piano-key ${isBlack ? "black-key" : "white-key"}`;
        key.dataset.midi = midi;
        key.title = `${noteDetails.namePl} (${noteDetails.nameInt}) - ${Math.round(noteDetails.frequency)} Hz`;

        const label = document.createElement("span");
        label.className = "key-label";
        if (!isBlack && noteDetails.baseNamePl === "C") {
          label.textContent = noteDetails.namePl;
          label.classList.add("key-label-accent");
        } else if (!isBlack) {
          label.textContent = noteDetails.baseNamePl;
        }
        key.appendChild(label);

        key.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          this.highlightKey(midi, "playing", 400);
          audio.playNote(midi, 0.8);
        });

        this.keyElements.set(midi, key);
        wrapper.appendChild(key);
      }

      this.container.appendChild(wrapper);
    }

    highlightKey(midi, type = "playing", durationMs = 0) {
      const key = this.keyElements.get(midi);
      if (!key) return;

      key.classList.remove("key-playing", "key-root", "key-target", "key-wrong");

      if (type === "playing") key.classList.add("key-playing");
      if (type === "root") key.classList.add("key-root");
      if (type === "target") key.classList.add("key-target");
      if (type === "wrong") key.classList.add("key-wrong");

      if (durationMs > 0) {
        setTimeout(() => {
          key.classList.remove("key-playing", "key-root", "key-target", "key-wrong");
        }, durationMs);
      }
    }

    clearHighlights() {
      this.keyElements.forEach(key => {
        key.classList.remove("key-playing", "key-root", "key-target", "key-wrong");
        const badge = key.querySelector(".key-badge");
        if (badge) badge.remove();
      });
    }

    showInterval(rootMidi, targetMidi, isCorrect = true) {
      this.clearHighlights();

      const rootKey = this.keyElements.get(rootMidi);
      if (rootKey) {
        rootKey.classList.add("key-root");
        this.attachBadge(rootKey, "1", "badge-root");
      }

      const targetKey = this.keyElements.get(targetMidi);
      if (targetKey) {
        targetKey.classList.add(isCorrect ? "key-target" : "key-wrong");
        this.attachBadge(targetKey, "2", isCorrect ? "badge-target" : "badge-wrong");
      }

      if (rootKey) {
        rootKey.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }

    attachBadge(keyElement, text, className) {
      const oldBadge = keyElement.querySelector(".key-badge");
      if (oldBadge) oldBadge.remove();

      const badge = document.createElement("div");
      badge.className = `key-badge ${className}`;
      badge.textContent = text;
      keyElement.appendChild(badge);
    }
  }

  /* ==========================================================================
     6. KONTROLER APLIKACJI
     ========================================================================== */
  class IntervalTrainerApp {
    constructor() {
      this.currentMode = storage.get("mode") || "choice";
      this.currentQuestion = null;
      this.isPlaying = false;
      this.lastRootMidi = null;
      this.recentRootPitches = [];

      this.dom = {};
      this.piano = null;

      this.init();
    }

    async init() {
      this.cacheDomElements();
      this.initAudioSettings();
      this.initPiano();
      this.renderSettingsModal();
      this.renderStudyGrid();
      this.renderChoiceButtons();
      this.renderDirectionSelector();
      this.updateStatsDisplay();
      this.bindEvents();
      this.switchMode(this.currentMode);

      if (this.currentMode === "choice" || this.currentMode === "input") {
        this.generateNewQuestion(false);
      }
    }

    cacheDomElements() {
      this.dom = {
        modeTabs: document.querySelectorAll(".mode-tab"),
        currentStreakEl: document.getElementById("current-streak"),
        bestStreakEl: document.getElementById("best-streak"),
        activeLearningToggleBtn: document.getElementById("toggle-active-learning-btn"),
        activeLearningStatusBadge: document.getElementById("active-learning-badge"),
        openSettingsBtn: document.getElementById("open-settings-btn"),
        settingsModal: document.getElementById("settings-modal"),
        closeSettingsBtn: document.getElementById("close-settings-btn"),
        settingsBackdrop: document.getElementById("settings-backdrop"),

        studyView: document.getElementById("study-view"),
        quizView: document.getElementById("quiz-view"),

        quizModeChoiceContainer: document.getElementById("quiz-choice-container"),
        quizModeInputContainer: document.getElementById("quiz-input-container"),

        quizPlayBtn: document.getElementById("quiz-play-btn"),
        quizReplayBtn: document.getElementById("quiz-replay-btn"),
        quizNextBtn: document.getElementById("quiz-next-btn"),
        quizDirectionSelect: document.getElementById("quiz-direction-select"),
        soundWaveAnim: document.getElementById("sound-wave-anim"),

        feedbackCard: document.getElementById("feedback-card"),
        feedbackTitle: document.getElementById("feedback-title"),
        feedbackDetail: document.getElementById("feedback-detail"),
        feedbackMnemonic: document.getElementById("feedback-mnemonic"),
        feedbackNotes: document.getElementById("feedback-notes"),

        choiceGrid: document.getElementById("choice-grid"),

        inputForm: document.getElementById("interval-input-form"),
        intervalTextInput: document.getElementById("interval-text-input"),
        inputSubmitBtn: document.getElementById("input-submit-btn"),

        studyGrid: document.getElementById("study-grid"),
        pianoContainer: document.getElementById("piano-container"),

        presetsContainer: document.getElementById("presets-container"),
        intervalCheckboxesContainer: document.getElementById("interval-checkboxes-container"),
        instrumentSelect: document.getElementById("instrument-select"),
        volumeSlider: document.getElementById("volume-slider"),
        speedSelect: document.getElementById("speed-select"),
        autoAdvanceToggle: document.getElementById("auto-advance-toggle"),
        activeLearningCheckbox: document.getElementById("active-learning-checkbox"),
        resetStatsBtn: document.getElementById("reset-stats-btn"),
        statsSummaryContainer: document.getElementById("stats-summary-container"),
        questionCounter: document.getElementById("question-counter")
      };
    }

    initAudioSettings() {
      const vol = storage.get("volume");
      const inst = storage.get("instrument");
      const speed = storage.get("speed");

      audio.setVolume(vol !== undefined ? vol : 0.8);
      audio.setInstrument(inst || "piano");
      audio.setSpeed(speed !== undefined ? speed : 1.0);

      audio.onNoteStart = (midi) => {
        if (this.currentMode === "study" && this.piano) {
          this.piano.highlightKey(midi, "playing", 450);
        }
        if (this.dom.soundWaveAnim) {
          this.dom.soundWaveAnim.classList.add("is-active");
        }
      };

      audio.onPlaybackFinished = () => {
        this.isPlaying = false;
        if (this.dom.soundWaveAnim) {
          this.dom.soundWaveAnim.classList.remove("is-active");
        }
        if (this.dom.quizPlayBtn) {
          this.dom.quizPlayBtn.classList.remove("btn-playing");
        }
      };
    }

    initPiano() {
      if (this.dom.pianoContainer) {
        this.piano = new PianoKeyboard(this.dom.pianoContainer, 48, 76);
      }
    }

    bindEvents() {
      // Globalne natychmiastowe odblokowanie audio na iOS Safari / WebKit przy pierwszym dotknięciu ekranu
      const unlockAudioOnGesture = () => {
        audio.unlockSafari();
      };
      ["pointerdown", "touchstart", "touchend", "click"].forEach(evtName => {
        window.addEventListener(evtName, unlockAudioOnGesture, { passive: true });
      });

      this.dom.modeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
          const mode = tab.dataset.mode;
          this.switchMode(mode);
        });
      });

      if (this.dom.activeLearningToggleBtn) {
        this.dom.activeLearningToggleBtn.addEventListener("click", () => {
          const current = storage.get("activeLearningEnabled");
          storage.set("activeLearningEnabled", !current);
          this.updateActiveLearningUI();
        });
      }

      const openModal = () => {
        this.renderStatsSummary();
        this.dom.settingsModal.classList.add("modal-open");
        this.dom.settingsBackdrop.classList.add("backdrop-open");
      };
      const closeModal = () => {
        this.dom.settingsModal.classList.remove("modal-open");
        this.dom.settingsBackdrop.classList.remove("backdrop-open");
      };

      this.dom.openSettingsBtn.addEventListener("click", openModal);
      this.dom.closeSettingsBtn.addEventListener("click", closeModal);
      this.dom.settingsBackdrop.addEventListener("click", closeModal);

      this.dom.quizDirectionSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        storage.set("playbackDirection", val);
        this.updateDirectionHint(val);
      });

      this.dom.quizPlayBtn.addEventListener("pointerdown", () => audio.unlockSafari());
      this.dom.quizPlayBtn.addEventListener("click", () => {
        audio.unlockSafari();
        this.playCurrentQuestion();
      });

      this.dom.quizReplayBtn.addEventListener("pointerdown", () => audio.unlockSafari());
      this.dom.quizReplayBtn.addEventListener("click", () => {
        audio.unlockSafari();
        this.playCurrentQuestion();
      });

      this.dom.quizNextBtn.addEventListener("click", () => {
        this.generateNewQuestion(true);
      });

      if (this.dom.inputForm) {
        this.dom.inputForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleInputSubmission();
        });
      }

      if (this.dom.instrumentSelect) {
        this.dom.instrumentSelect.value = storage.get("instrument");
        this.dom.instrumentSelect.addEventListener("change", (e) => {
          const val = e.target.value;
          storage.set("instrument", val);
          audio.setInstrument(val);
        });
      }

      if (this.dom.volumeSlider) {
        this.dom.volumeSlider.value = storage.get("volume");
        this.dom.volumeSlider.addEventListener("input", (e) => {
          const val = parseFloat(e.target.value);
          storage.set("volume", val);
          audio.setVolume(val);
        });
      }

      if (this.dom.speedSelect) {
        this.dom.speedSelect.value = storage.get("speed");
        this.dom.speedSelect.addEventListener("change", (e) => {
          const val = parseFloat(e.target.value);
          storage.set("speed", val);
          audio.setSpeed(val);
        });
      }

      if (this.dom.autoAdvanceToggle) {
        this.dom.autoAdvanceToggle.checked = storage.get("autoAdvance");
        this.dom.autoAdvanceToggle.addEventListener("change", (e) => {
          storage.set("autoAdvance", e.target.checked);
        });
      }

      if (this.dom.activeLearningCheckbox) {
        this.dom.activeLearningCheckbox.checked = storage.get("activeLearningEnabled");
        this.dom.activeLearningCheckbox.addEventListener("change", (e) => {
          storage.set("activeLearningEnabled", e.target.checked);
          this.updateActiveLearningUI();
        });
      }

      if (this.dom.resetStatsBtn) {
        this.dom.resetStatsBtn.addEventListener("click", () => {
          if (confirm("Czy na pewno chcesz zresetować wszystkie statystyki i historię nauki?")) {
            storage.resetStats();
            this.updateStatsDisplay();
            this.renderStatsSummary();
            this.renderStudyGrid();
          }
        });
      }

      window.addEventListener("keydown", (e) => {
        const isInputActive = document.activeElement === this.dom.intervalTextInput;

        if (e.code === "Space" && !isInputActive) {
          e.preventDefault();
          this.playCurrentQuestion();
        } else if (e.code === "Enter" && !isInputActive) {
          if (this.currentQuestion && this.currentQuestion.answered) {
            e.preventDefault();
            this.generateNewQuestion(true);
          }
        }
      });
    }

    switchMode(mode) {
      this.currentMode = mode;
      storage.set("mode", mode);

      this.dom.modeTabs.forEach(t => {
        t.classList.toggle("active", t.dataset.mode === mode);
      });

      if (mode === "study") {
        this.dom.studyView.classList.remove("hidden");
        this.dom.quizView.classList.add("hidden");
        this.renderStudyGrid();
      } else {
        this.dom.studyView.classList.add("hidden");
        this.dom.quizView.classList.remove("hidden");

        if (mode === "choice") {
          this.dom.quizModeChoiceContainer.classList.remove("hidden");
          this.dom.quizModeInputContainer.classList.add("hidden");
        } else if (mode === "input") {
          this.dom.quizModeChoiceContainer.classList.add("hidden");
          this.dom.quizModeInputContainer.classList.remove("hidden");
          setTimeout(() => {
            if (this.dom.intervalTextInput) this.dom.intervalTextInput.focus();
          }, 150);
        }

        if (!this.currentQuestion || this.currentQuestion.answered) {
          this.generateNewQuestion(false);
        }
      }
    }

    updateActiveLearningUI() {
      const isEnabled = storage.get("activeLearningEnabled");
      if (this.dom.activeLearningStatusBadge) {
        this.dom.activeLearningStatusBadge.textContent = isEnabled ? "Active Learning: Włączony" : "Active Learning: Wyłączony";
        this.dom.activeLearningStatusBadge.className = isEnabled ? "badge badge-active-learning-on" : "badge badge-active-learning-off";
      }
      if (this.dom.activeLearningCheckbox) {
        this.dom.activeLearningCheckbox.checked = isEnabled;
      }
    }

    updateStatsDisplay() {
      const currentStreak = storage.get("currentStreak") || 0;
      const bestStreak = storage.get("bestStreak") || 0;
      const totalQuestions = storage.get("totalQuestions") || 0;

      if (this.dom.currentStreakEl) this.dom.currentStreakEl.textContent = currentStreak;
      if (this.dom.bestStreakEl) this.dom.bestStreakEl.textContent = bestStreak;
      if (this.dom.questionCounter) this.dom.questionCounter.textContent = totalQuestions;

      this.updateActiveLearningUI();
    }

    renderDirectionSelector() {
      const currentDirection = storage.get("playbackDirection") || "up";
      this.dom.quizDirectionSelect.innerHTML = "";

      PLAYBACK_DIRECTIONS.forEach(dir => {
        const opt = document.createElement("option");
        opt.value = dir.id;
        opt.textContent = dir.label;
        if (dir.id === currentDirection) {
          opt.selected = true;
        }
        this.dom.quizDirectionSelect.appendChild(opt);
      });

      this.updateDirectionHint(currentDirection);
    }

    updateDirectionHint(directionId) {
      const dir = PLAYBACK_DIRECTIONS.find(d => d.id === directionId);
      const hintEl = document.getElementById("direction-hint");
      if (hintEl && dir) {
        hintEl.textContent = dir.description;
      }
    }

    pickRandomRootMidi(semitones, direction) {
      let minMidi = 48;
      let maxMidi = 65;

      if (direction === "down" || direction === "down_together") {
        minMidi = 48 + semitones;
        maxMidi = 76;
      } else {
        minMidi = 48;
        maxMidi = 76 - semitones;
      }

      if (minMidi > maxMidi) {
        minMidi = 48;
        maxMidi = 64;
      }

      const allPitches = [];
      for (let m = minMidi; m <= maxMidi; m++) {
        allPitches.push(m);
      }

      let candidates = allPitches.filter(m => {
        if (this.recentRootPitches.includes(m)) return false;
        if (this.lastRootMidi !== null && Math.abs(m - this.lastRootMidi) < 3) return false;
        return true;
      });

      if (candidates.length === 0) {
        candidates = allPitches.filter(m => this.lastRootMidi === null || Math.abs(m - this.lastRootMidi) >= 2);
      }
      if (candidates.length === 0) {
        candidates = allPitches.filter(m => m !== this.lastRootMidi);
      }
      if (candidates.length === 0) {
        candidates = allPitches;
      }

      const chosenMidi = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastRootMidi = chosenMidi;
      this.recentRootPitches.push(chosenMidi);
      if (this.recentRootPitches.length > 4) {
        this.recentRootPitches.shift();
      }
      return chosenMidi;
    }

    generateNewQuestion(autoPlay = true) {
      const selectedIds = storage.get("selectedIntervalIds") || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      if (selectedIds.length === 0) {
        alert("Proszę wybrać przynajmniej jeden interwał w ustawieniach!");
        return;
      }

      const chosenIntervalId = activeLearning.pickNextIntervalId(selectedIds);
      const interval = INTERVALS.find(i => i.id === chosenIntervalId);

      const directionSetting = storage.get("playbackDirection") || "up";
      const rootMidi = this.pickRandomRootMidi(interval.semitones, directionSetting);

      let targetMidi;
      if (directionSetting === "down" || directionSetting === "down_together") {
        targetMidi = rootMidi - interval.semitones;
      } else {
        targetMidi = rootMidi + interval.semitones;
      }

      this.currentQuestion = {
        interval,
        rootMidi,
        targetMidi,
        direction: directionSetting,
        answered: false,
        userAnswer: null,
        isCorrect: null
      };

      this.hideFeedback();
      this.dom.quizNextBtn.classList.add("hidden");
      this.dom.quizPlayBtn.classList.remove("hidden");
      this.dom.quizReplayBtn.classList.remove("hidden");

      if (this.piano && this.currentMode === "study") {
        this.piano.clearHighlights();
      }

      const buttons = this.dom.choiceGrid.querySelectorAll(".choice-btn");
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.className = "choice-btn";
      });

      if (this.dom.intervalTextInput) {
        this.dom.intervalTextInput.value = "";
        this.dom.intervalTextInput.disabled = false;
        if (this.currentMode === "input") {
          setTimeout(() => this.dom.intervalTextInput.focus(), 100);
        }
      }
      if (this.dom.inputSubmitBtn) {
        this.dom.inputSubmitBtn.disabled = false;
      }

      if (autoPlay) {
        this.playCurrentQuestion();
      }
    }

    async playCurrentQuestion() {
      if (!this.currentQuestion) return;
      this.isPlaying = true;
      this.dom.quizPlayBtn.classList.add("btn-playing");

      await audio.playInterval(
        this.currentQuestion.rootMidi,
        this.currentQuestion.interval.semitones,
        this.currentQuestion.direction
      );
    }

    handleChoiceSelection(intervalId, buttonElement) {
      if (!this.currentQuestion || this.currentQuestion.answered) return;

      const isCorrect = intervalId === this.currentQuestion.interval.id;
      this.resolveQuestion(isCorrect, intervalId, buttonElement);
    }

    handleInputSubmission() {
      if (!this.currentQuestion || this.currentQuestion.answered) return;

      const rawInput = this.dom.intervalTextInput.value;
      if (!rawInput.trim()) return;

      const isCorrect = isAnswerMatching(rawInput, this.currentQuestion.interval);
      this.resolveQuestion(isCorrect, rawInput);
    }

    resolveQuestion(isCorrect, userChoice, clickedButton = null) {
      this.currentQuestion.answered = true;
      this.currentQuestion.isCorrect = isCorrect;
      this.currentQuestion.userAnswer = userChoice;

      storage.recordAnswer(this.currentQuestion.interval.id, isCorrect);
      this.updateStatsDisplay();

      if (storage.get("soundFeedback")) {
        if (isCorrect) {
          audio.playSuccessSound();
        } else {
          audio.playErrorSound();
        }
      }

      if (this.currentMode === "study" && this.piano) {
        this.piano.showInterval(
          this.currentQuestion.rootMidi,
          this.currentQuestion.targetMidi,
          isCorrect
        );
      }

      if (this.currentMode === "choice") {
        const buttons = this.dom.choiceGrid.querySelectorAll(".choice-btn");
        buttons.forEach(btn => {
          btn.disabled = true;
          const id = parseInt(btn.dataset.id, 10);
          if (id === this.currentQuestion.interval.id) {
            btn.classList.add("choice-btn-correct");
          } else if (clickedButton && btn === clickedButton && !isCorrect) {
            btn.classList.add("choice-btn-wrong");
          }
        });
      }

      if (this.currentMode === "input") {
        if (this.dom.intervalTextInput) this.dom.intervalTextInput.disabled = true;
        if (this.dom.inputSubmitBtn) this.dom.inputSubmitBtn.disabled = true;
      }

      this.showFeedback(isCorrect);
      this.dom.quizNextBtn.classList.remove("hidden");

      if (storage.get("autoAdvance")) {
        setTimeout(() => {
          if (this.currentQuestion && this.currentQuestion.answered) {
            this.generateNewQuestion(true);
          }
        }, isCorrect ? 1800 : 3200);
      }
    }

    showFeedback(isCorrect) {
      const q = this.currentQuestion;
      const interval = q.interval;
      const rootDetails = getNoteDetails(q.rootMidi);
      const targetDetails = getNoteDetails(q.targetMidi);

      this.dom.feedbackCard.classList.remove("hidden", "feedback-success", "feedback-error");
      this.dom.feedbackCard.classList.add(isCorrect ? "feedback-success" : "feedback-error");

      if (isCorrect) {
        this.dom.feedbackTitle.innerHTML = `✓ Świetnie! Prawidłowa odpowiedź: <strong>${interval.name} (${interval.short})</strong>`;
      } else {
        let userDisplay = "";
        if (typeof q.userAnswer === "number") {
          const chosenInt = INTERVALS.find(i => i.id === q.userAnswer);
          userDisplay = chosenInt ? `${chosenInt.name} (${chosenInt.short})` : `${q.userAnswer}`;
        } else {
          userDisplay = `"${q.userAnswer}"`;
        }
        this.dom.feedbackTitle.innerHTML = `✗ Pomyłka! Prawidłowa odpowiedź to <strong>${interval.name} (${interval.short})</strong>. Twój wybór: <em>${userDisplay}</em>`;
      }

      this.dom.feedbackDetail.textContent = `Liczba półtonów: ${interval.semitones} (Stosunek częstotliwości: ${interval.ratio})`;
      this.dom.feedbackMnemonic.innerHTML = `🎵 <strong>Skojarzenie mnemotechniczne:</strong> ${interval.mnemonic}`;
      this.dom.feedbackNotes.innerHTML = `🎹 <strong>Zagrano:</strong> ${rootDetails.namePl} (${rootDetails.nameInt}) → ${targetDetails.namePl} (${targetDetails.nameInt})`;
    }

    hideFeedback() {
      this.dom.feedbackCard.classList.add("hidden");
    }

    renderChoiceButtons() {
      this.dom.choiceGrid.innerHTML = "";
      const selectedIds = storage.get("selectedIntervalIds") || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      INTERVALS.forEach(interval => {
        const isSelected = selectedIds.includes(interval.id);
        if (!isSelected) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.dataset.id = interval.id;

        const shortBadge = document.createElement("span");
        shortBadge.className = "choice-short";
        shortBadge.textContent = interval.short;
        shortBadge.style.color = interval.badgeColor;

        const nameLabel = document.createElement("span");
        nameLabel.className = "choice-name";
        nameLabel.textContent = interval.name;

        btn.appendChild(shortBadge);
        btn.appendChild(nameLabel);

        btn.addEventListener("click", () => {
          this.handleChoiceSelection(interval.id, btn);
        });

        this.dom.choiceGrid.appendChild(btn);
      });
    }

    renderStudyGrid() {
      this.dom.studyGrid.innerHTML = "";

      INTERVALS.forEach(interval => {
        const mastery = activeLearning.getMastery(interval.id);
        const card = document.createElement("div");
        card.className = "study-card";

        const header = document.createElement("div");
        header.className = "study-card-header";

        const badge = document.createElement("span");
        badge.className = "study-badge";
        badge.style.backgroundColor = interval.badgeColor;
        badge.textContent = interval.short;

        const semitonesSpan = document.createElement("span");
        semitonesSpan.className = "study-semitones";
        semitonesSpan.textContent = `${interval.semitones} ${interval.semitones === 1 ? "półton" : (interval.semitones >= 2 && interval.semitones <= 4 ? "półtony" : "półtonów")}`;

        header.appendChild(badge);
        header.appendChild(semitonesSpan);

        const title = document.createElement("h3");
        title.className = "study-card-title";
        title.textContent = interval.name;

        if (interval.secondaryName) {
          const sub = document.createElement("div");
          sub.className = "study-card-sub";
          sub.textContent = interval.secondaryName;
          title.appendChild(sub);
        }

        const mnemonic = document.createElement("p");
        mnemonic.className = "study-card-mnemonic";
        mnemonic.innerHTML = `<strong>Przykłady utworów:</strong> ${interval.mnemonic}`;

        const masteryBarContainer = document.createElement("div");
        masteryBarContainer.className = "mastery-container";
        masteryBarContainer.innerHTML = `
          <div class="mastery-labels">
            <span class="mastery-status ${mastery.badgeClass}">${mastery.status}</span>
            <span class="mastery-score">${mastery.accuracy}% (${mastery.correct}/${mastery.attempts})</span>
          </div>
          <div class="mastery-progress-bg">
            <div class="mastery-progress-bar" style="width: ${mastery.accuracy}%; background-color: ${interval.badgeColor}"></div>
          </div>
        `;

        const playActions = document.createElement("div");
        playActions.className = "study-play-actions";

        const playUpBtn = document.createElement("button");
        playUpBtn.type = "button";
        playUpBtn.className = "btn-study-play";
        playUpBtn.innerHTML = `▲ W górę`;
        playUpBtn.addEventListener("click", () => {
          const root = this.pickRandomRootMidi(interval.semitones, "up");
          if (this.piano) this.piano.showInterval(root, root + interval.semitones, true);
          audio.playInterval(root, interval.semitones, "up");
        });

        const playDownBtn = document.createElement("button");
        playDownBtn.type = "button";
        playDownBtn.className = "btn-study-play";
        playDownBtn.innerHTML = `▼ W dół`;
        playDownBtn.addEventListener("click", () => {
          const root = this.pickRandomRootMidi(interval.semitones, "down");
          if (this.piano) this.piano.showInterval(root, root - interval.semitones, true);
          audio.playInterval(root, interval.semitones, "down");
        });

        const playTogetherBtn = document.createElement("button");
        playTogetherBtn.type = "button";
        playTogetherBtn.className = "btn-study-play";
        playTogetherBtn.innerHTML = `♫ Naraz`;
        playTogetherBtn.addEventListener("click", () => {
          const root = this.pickRandomRootMidi(interval.semitones, "together");
          if (this.piano) this.piano.showInterval(root, root + interval.semitones, true);
          audio.playInterval(root, interval.semitones, "together");
        });

        playActions.appendChild(playUpBtn);
        playActions.appendChild(playDownBtn);
        playActions.appendChild(playTogetherBtn);

        card.appendChild(header);
        card.appendChild(title);
        card.appendChild(mnemonic);
        card.appendChild(masteryBarContainer);
        card.appendChild(playActions);

        this.dom.studyGrid.appendChild(card);
      });
    }

    renderSettingsModal() {
      const selectedIds = storage.get("selectedIntervalIds") || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      this.dom.presetsContainer.innerHTML = "";
      INTERVAL_PRESETS.forEach(preset => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "preset-btn";
        btn.textContent = preset.label;
        btn.title = preset.description;
        btn.addEventListener("click", () => {
          storage.set("selectedIntervalIds", [...preset.intervalIds]);
          this.updateCheckboxSelection(preset.intervalIds);
          this.renderChoiceButtons();
        });
        this.dom.presetsContainer.appendChild(btn);
      });

      this.dom.intervalCheckboxesContainer.innerHTML = "";
      INTERVALS.forEach(interval => {
        const label = document.createElement("label");
        label.className = "interval-checkbox-label";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = interval.id;
        cb.checked = selectedIds.includes(interval.id);

        cb.addEventListener("change", () => {
          const currentChecked = Array.from(
            this.dom.intervalCheckboxesContainer.querySelectorAll("input:checked")
          ).map(el => parseInt(el.value, 10));

          if (currentChecked.length === 0) {
            alert("Przynajmniej jeden interwał musi pozostać zaznaczony!");
            cb.checked = true;
            return;
          }

          storage.set("selectedIntervalIds", currentChecked);
          this.renderChoiceButtons();
        });

        const spanText = document.createElement("span");
        spanText.className = "checkbox-text";
        spanText.innerHTML = `<strong>${interval.short}</strong> - ${interval.name}`;

        label.appendChild(cb);
        label.appendChild(spanText);
        this.dom.intervalCheckboxesContainer.appendChild(label);
      });
    }

    updateCheckboxSelection(activeIds) {
      const checkboxes = this.dom.intervalCheckboxesContainer.querySelectorAll("input[type=checkbox]");
      checkboxes.forEach(cb => {
        cb.checked = activeIds.includes(parseInt(cb.value, 10));
      });
    }

    renderStatsSummary() {
      this.dom.statsSummaryContainer.innerHTML = "";

      const problematic = activeLearning.getTopProblematicIntervals(INTERVALS);
      if (problematic.length > 0) {
        const alertBox = document.createElement("div");
        alertBox.className = "problematic-alert";
        alertBox.innerHTML = `
          <div class="problematic-alert-header">
            <span>🎯</span> <strong>Interwały wymagające największej uwagi (Active Learning):</strong>
          </div>
          <ul class="problematic-list">
            ${problematic.map(p => {
              const mastery = activeLearning.getMastery(p.id);
              return `<li><strong>${p.short}</strong> (${p.name}): ${mastery.accuracy}% skuteczności (${mastery.wrong} błędów)</li>`;
            }).join("")}
          </ul>
        `;
        this.dom.statsSummaryContainer.appendChild(alertBox);
      }

      const tableWrapper = document.createElement("div");
      tableWrapper.className = "table-responsive";

      const table = document.createElement("table");
      table.className = "stats-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Interwał</th>
            <th>Próby</th>
            <th>Poprawne</th>
            <th>Błędy</th>
            <th>Skuteczność</th>
            <th>Waga powtórki</th>
          </tr>
        </thead>
        <tbody>
          ${INTERVALS.map(item => {
            const stats = storage.getStatsForInterval(item.id);
            const weight = activeLearning.calculateWeight(item.id).toFixed(2);
            const acc = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
            return `
              <tr>
                <td><strong>${item.short}</strong> (${item.name})</td>
                <td>${stats.attempts}</td>
                <td class="stat-correct">${stats.correct}</td>
                <td class="stat-wrong">${stats.wrong}</td>
                <td>${stats.attempts > 0 ? `${acc}%` : "-"}</td>
                <td><span class="weight-pill">${weight}x</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      `;

      tableWrapper.appendChild(table);
      this.dom.statsSummaryContainer.appendChild(tableWrapper);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.intervalApp = new IntervalTrainerApp();
  });
})();
