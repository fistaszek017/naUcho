/**
 * piano.js
 * Interaktywna wizualizacja klawiatury fortepianowej.
 * Podświetla grane nuty, ułatwia zrozumienie odległości półtonów
 * i pozwala na swobodne klikanie w celu odsłuchania pojedynczych dźwięków.
 */

import { getNoteDetails, NOTE_NAMES_PL } from "./intervals-data.js";
import { audio } from "./audio-engine.js";

export class PianoKeyboard {
  constructor(containerElement, startMidi = 48, endMidi = 76) {
    this.container = containerElement;
    this.startMidi = startMidi; // C3 (130.8 Hz)
    this.endMidi = endMidi;     // E5 (659.2 Hz)
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

    // Liczymy białe klawisze, aby poprawnie ustalić szerokości
    let whiteKeyIndex = 0;

    for (let midi = this.startMidi; midi <= this.endMidi; midi++) {
      const isBlack = this.isBlackKey(midi);
      const noteDetails = getNoteDetails(midi);

      const key = document.createElement("div");
      key.className = `piano-key ${isBlack ? "black-key" : "white-key"}`;
      key.dataset.midi = midi;
      key.title = `${noteDetails.namePl} (${noteDetails.nameInt}) - ${Math.round(noteDetails.frequency)} Hz`;

      const label = document.createElement("span");
      label.className = "key-label";
      // Etykieta skrócona dla białych klawiszy C
      if (!isBlack && noteDetails.baseNamePl === "C") {
        label.textContent = noteDetails.namePl;
        label.classList.add("key-label-accent");
      } else if (!isBlack) {
        label.textContent = noteDetails.baseNamePl;
      }
      key.appendChild(label);

      // Kliknięcie w klawisz odtwarza nutę
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

    // Usuń ewentualne stare klasy
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

    // Scroll klawiatury jeśli klawisz jest poza widokiem na małych ekranach
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
