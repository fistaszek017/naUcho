/**
 * active-learning.js
 * Moduł aktywnego uczenia (Active Learning / Spaced Repetition).
 * Dynamicznie dobiera wagi prawdopodobieństwa dla interwałów,
 * faworyzując te, które sprawiają użytkownikowi trudność.
 */

import { storage } from "./storage.js";
import { INTERVALS } from "./intervals-data.js";

export class ActiveLearningEngine {
  constructor() {
    this.lastSelectedId = null;
    this.recentIds = [];
  }

  /**
   * Oblicza wagę wyboru dla danego interwału.
   * Wyższa waga = większa szansa wylosowania.
   */
  calculateWeight(intervalId) {
    const stats = storage.getStatsForInterval(intervalId);

    // Nowy interwał (jeszcze nie sprawdzany)
    if (stats.attempts === 0) {
      return 1.5; // Dajemy lekkie pierwszeństwo nowym, aby je szybko poznać
    }

    const accuracy = stats.correct / stats.attempts;
    const errorRate = 1 - accuracy;

    // Waga bazowa rośnie wykładniczo z błędem
    let weight = 0.3 + Math.pow(errorRate, 1.4) * 3.5;

    // Dodatkowy bonus za aktualną serię pomyłek (consecutiveWrong)
    if (stats.consecutiveWrong > 0) {
      weight += Math.min(stats.consecutiveWrong * 1.0, 3.0);
    }

    // Kara za wysoką serię sukcesów (interwał już dobrze opanowany)
    if (stats.consecutiveCorrect >= 3 && accuracy >= 0.8) {
      weight = Math.max(0.2, weight * 0.4);
    }

    // Unikanie całkowitego wyzerowania
    return Math.max(0.15, weight);
  }

  /**
   * Wybiera kolejny interwał spośród dostępnych ID.
   * Jeśli activeLearningEnabled = false, losuje równomiernie.
   * Zapobiega powtarzaniu tego samego interwału oraz grupowaniu bezpośrednich sąsiadów.
   */
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
      // Przy wyłączonym active learning losujemy z puli, unikając bezpośrednich sąsiadów
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

    // Losowanie ważone (Active Learning)
    const weights = candidateIds.map(id => {
      let w = this.calculateWeight(id);
      const item = INTERVALS.find(i => i.id === id);

      // Jeśli dany interwał był grany przed chwilą, dajemy rabat na powtórkę, chyba że użytkownik zrobił błąd
      if (id === this.lastSelectedId) {
        const stats = storage.getStatsForInterval(id);
        if (stats.consecutiveWrong === 0) {
          w *= (candidateIds.length === 2 ? 0.5 : 0.2);
        }
      } else if (lastInterval && candidateIds.length >= 4 && item) {
        // Rabat dla bezpośrednio sąsiadujących interwałów półtonowych (np. 2m -> 2w), by dźwięki nie były "jeden koło drugiego"
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

  /**
   * Zwraca procent opanowania oraz status dla danego interwału
   */
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
    // Ważymy wynik również ilością prób (jeśli tylko 1 próba poprawna to jeszcze nie 100% opanowania)
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

  /**
   * Zwraca 3 interwały sprawiające największy problem spośród testowanych
   */
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
      return accA - accB; // Od najniższej skuteczności
    });

    return tested.slice(0, 3);
  }
}

export const activeLearning = new ActiveLearningEngine();
