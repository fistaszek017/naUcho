/**
 * storage.js
 * Zarządzanie LocalStorage: zapisywanie i odczytywanie preferencji użytkownika,
 * wybranych interwałów, kierunku odtwarzania oraz statystyk dla active learningu.
 */

const STORAGE_KEY = "interwaly_app_state_v1";

const DEFAULT_STATE = {
  mode: "choice", // 'study' | 'choice' | 'input'
  selectedIntervalIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  playbackDirection: "up", // 'up' | 'down' | 'up_down' | 'together' | 'up_together' | 'down_together' | 'random'
  activeLearningEnabled: true,
  instrument: "piano",
  volume: 0.8,
  speed: 1.0,
  autoAdvance: false, // domyślnie wyłączone, aby użytkownik mógł spokojnie przeanalizować odpowiedź
  soundFeedback: true,
  stats: {}, // id -> { attempts, correct, wrong, streak, lastMistakeTimestamp }
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

export const storage = new StorageManager();
