/**
 * app.js
 * Główny kontroler aplikacji do nauki interwałów muzycznych.
 * Obsługuje 3 tryby, losowanie dźwięków początkowych, active learning,
 * klawiaturę fortepianową, skróty klawiszowe i LocalStorage.
 */

import {
  INTERVALS,
  INTERVAL_PRESETS,
  PLAYBACK_DIRECTIONS,
  getNoteDetails,
  isAnswerMatching
} from "./intervals-data.js";
import { audio } from "./audio-engine.js";
import { storage } from "./storage.js";
import { activeLearning } from "./active-learning.js";
import { PianoKeyboard } from "./piano.js";

class IntervalTrainerApp {
  constructor() {
    this.currentMode = storage.get("mode") || "choice";
    this.currentQuestion = null;
    this.isPlaying = false;
    this.lastRootMidi = null;
    this.recentRootPitches = [];

    // Elementy DOM
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

    // Jeśli startujemy w trybie testowym, przygotowujemy pierwsze pytanie
    if (this.currentMode === "choice" || this.currentMode === "input") {
      this.generateNewQuestion(false); // nie graj automatycznie przed pierwszym kliknięciem użytkownika (polityka audio przeglądarek)
    }
  }

  cacheDomElements() {
    this.dom = {
      // Header & Navigation
      modeTabs: document.querySelectorAll(".mode-tab"),
      currentStreakEl: document.getElementById("current-streak"),
      bestStreakEl: document.getElementById("best-streak"),
      activeLearningToggleBtn: document.getElementById("toggle-active-learning-btn"),
      activeLearningStatusBadge: document.getElementById("active-learning-badge"),
      openSettingsBtn: document.getElementById("open-settings-btn"),
      settingsModal: document.getElementById("settings-modal"),
      closeSettingsBtn: document.getElementById("close-settings-btn"),
      settingsBackdrop: document.getElementById("settings-backdrop"),

      // Widoki trybów
      studyView: document.getElementById("study-view"),
      quizView: document.getElementById("quiz-view"),

      // Kontener trybu testowego
      quizModeChoiceContainer: document.getElementById("quiz-choice-container"),
      quizModeInputContainer: document.getElementById("quiz-input-container"),

      // Odtwarzanie dźwięków w teście
      quizPlayBtn: document.getElementById("quiz-play-btn"),
      quizReplayBtn: document.getElementById("quiz-replay-btn"),
      quizNextBtn: document.getElementById("quiz-next-btn"),
      quizDirectionSelect: document.getElementById("quiz-direction-select"),
      soundWaveAnim: document.getElementById("sound-wave-anim"),

      // Informacje zwrotne
      feedbackCard: document.getElementById("feedback-card"),
      feedbackTitle: document.getElementById("feedback-title"),
      feedbackDetail: document.getElementById("feedback-detail"),
      feedbackMnemonic: document.getElementById("feedback-mnemonic"),
      feedbackNotes: document.getElementById("feedback-notes"),

      // Przyciski wyboru w trybie 2
      choiceGrid: document.getElementById("choice-grid"),

      // Wpisywanie w trybie 3
      inputForm: document.getElementById("interval-input-form"),
      intervalTextInput: document.getElementById("interval-text-input"),
      inputSubmitBtn: document.getElementById("input-submit-btn"),

      // Widok nauki (Tryb 1)
      studyGrid: document.getElementById("study-grid"),

      // Klawiatura fortepianu
      pianoContainer: document.getElementById("piano-container"),

      // Modal ustawień
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

    // Podpięcie callbacków animacji z silnika audio
    audio.onNoteStart = (midi) => {
      if (this.piano) {
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
      // Zakres klawiatury od C3 (MIDI 48) do E5 (MIDI 76) – 28 klawiszy
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

    // Przełączanie zakładek trybów
    this.dom.modeTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const mode = tab.dataset.mode;
        this.switchMode(mode);
      });
    });

    // Skrót klawisza Active Learning w nagłówku
    if (this.dom.activeLearningToggleBtn) {
      this.dom.activeLearningToggleBtn.addEventListener("click", () => {
        const current = storage.get("activeLearningEnabled");
        const next = !current;
        storage.set("activeLearningEnabled", next);
        this.updateActiveLearningUI();
      });
    }

    // Otwieranie / zamykanie modala ustawień
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

    // Wybór kierunku odtwarzania w quizie
    this.dom.quizDirectionSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      storage.set("playbackDirection", val);
      this.updateDirectionHint(val);
    });

    // Przyciski odtwarzania
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

    // Formularz wpisywania w trybie 3
    if (this.dom.inputForm) {
      this.dom.inputForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleInputSubmission();
      });
    }

    // Ustawienia w modalu
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

    // Globalne skróty klawiszowe
    window.addEventListener("keydown", (e) => {
      // Ignoruj skróty, jeśli kursor jest w polu tekstowym i piszemy
      const isInputActive = document.activeElement === this.dom.intervalTextInput;

      if (e.code === "Space" && !isInputActive) {
        e.preventDefault();
        this.playCurrentQuestion();
      } else if (e.code === "Enter" && !isInputActive) {
        // Jeśli pytanie ma już odpowiedź, Enter przechodzi do kolejnego
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

    // Aktualizacja aktywnego taba
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

      // Jeśli nie ma pytania lub było w innym trybie, wylosuj
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
      opt.textContent = dir.label; // Krótka nazwa bez opisu w nawiasie zapobiega rozjeżdżaniu na telefonach
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

  /**
   * Generuje losowy dźwięk początkowy w bezpiecznym, słyszalnym rejestrze.
   * Gwarantuje, że dźwięki nie leżą tuż obok siebie (skok o min. 3 półtony),
   * dzięki czemu melodie brzmią świeżo i nie powtarzają tego samego rejestru.
   */
  pickRandomRootMidi(semitones, direction) {
    // Zakres klawiatury: C3 (48) do E5 (76)
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

    // Wybieramy dźwięk oddalony o minimum 3 półtony od poprzedniego (nigdy bezpośredni sąsiad)
    // oraz nieobecny w ostatnich 4 losowaniach
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

  /**
   * Generuje nowe pytanie testowe
   */
  generateNewQuestion(autoPlay = true) {
    const selectedIds = storage.get("selectedIntervalIds") || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (selectedIds.length === 0) {
      alert("Proszę wybrać przynajmniej jeden interwał w ustawieniach!");
      return;
    }

    // Wybór interwału za pomocą silnika Active Learning
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

    // Reset UI
    this.hideFeedback();
    this.dom.quizNextBtn.classList.add("hidden");
    this.dom.quizPlayBtn.classList.remove("hidden");
    this.dom.quizReplayBtn.classList.remove("hidden");

    if (this.piano) {
      this.piano.clearHighlights();
    }

    // Reset przycisków wyboru w trybie 2
    const buttons = this.dom.choiceGrid.querySelectorAll(".choice-btn");
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.className = "choice-btn";
    });

    // Reset pola tekstowego w trybie 3
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

    // Zapis w LocalStorage i aktualizacja Active Learning
    storage.recordAnswer(this.currentQuestion.interval.id, isCorrect);
    this.updateStatsDisplay();

    // Dźwięk potwierdzenia
    if (storage.get("soundFeedback")) {
      if (isCorrect) {
        audio.playSuccessSound();
      } else {
        audio.playErrorSound();
      }
    }

    // Podświetlenie na wirtualnym fortepianie wyłącznie w trybie nauki
    if (this.currentMode === "study" && this.piano) {
      this.piano.showInterval(
        this.currentQuestion.rootMidi,
        this.currentQuestion.targetMidi,
        isCorrect
      );
    }

    // Aktualizacja widoku przycisków (tryb 2)
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

    // Aktualizacja widoku wpisywania (tryb 3)
    if (this.currentMode === "input") {
      if (this.dom.intervalTextInput) this.dom.intervalTextInput.disabled = true;
      if (this.dom.inputSubmitBtn) this.dom.inputSubmitBtn.disabled = true;
    }

    // Wyświetlenie karty z wyjaśnieniem
    this.showFeedback(isCorrect);
    this.dom.quizNextBtn.classList.remove("hidden");

    // Auto-advance jeśli włączony w ustawieniach
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
      // Wyświetlamy tylko te interwały, które są zaznaczone w filtrze (lub wszystkie z oznaczeniem)
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

      // Górny pasek karty
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

      // Treść
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

      // Pasek opanowania
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

      // Przyciski odtwarzania w różnych stylach
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

    // Presety
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

    // Checkboxy dla każdego z 13 interwałów
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

    // Tabela podsumowująca wszystkie interwały w responsywnym kontenerze
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

// Inicjalizacja po załadowaniu drzewa DOM
window.addEventListener("DOMContentLoaded", () => {
  window.intervalApp = new IntervalTrainerApp();
});
