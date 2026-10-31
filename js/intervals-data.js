/**
 * ============================================================================
 * 🎵 KONFIGURACJA OZNACZEŃ (SKRÓTÓW) I PIOSENEK MNEMOTECHNICZNYCH
 * ============================================================================
 * TUTAJ MOŻESZ ŁATWO EDYTOWAĆ:
 * 1. Oznaczenia / skróty interwałów (pole "short", np. "2m", "2w", "tr", "4>", "5")
 * 2. Piosenki mnemotechniczne kojarzone z danym interwałem (pole "mnemonic")
 * 3. Pełne nazwy wyświetlane na stronie (pole "name")
 * ============================================================================
 */
export const INTERVALS_CONFIG = [
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

// Domyślne warianty wpisywania (aliasy) dla każdego interwału
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

/**
 * Główna tablica interwałów tworzona dynamicznie na podstawie powyższej konfiguracji
 */
export const INTERVALS = INTERVALS_CONFIG.map((cfg, index) => {
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

export const NOTE_NAMES_PL = [
  "C", "Cis", "D", "Dis", "E", "F", "Fis", "G", "Gis", "A", "B (Ais)", "H"
];

export const NOTE_NAMES_INT = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

/**
 * Zwraca informację o nucie (nazwa polska, międzynarodowa, oktawa, częstotliwość) dla zadanego numeru MIDI.
 * C4 = MIDI 60 (261.63 Hz).
 */
export function getNoteDetails(midiNumber) {
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

/**
 * Normalizuje ciąg tekstowy wpisany przez użytkownika:
 * usuwa białe znaki, zamienia na małe litery, standaryzuje znaki specjalne.
 */
export function normalizeAnswer(text) {
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

/**
 * Sprawdza czy wpisany tekst pasuje do danego interwału.
 */
export function isAnswerMatching(userInput, interval) {
  const cleanInput = normalizeAnswer(userInput);
  if (!cleanInput) return false;

  // Bezpośrednie dopasowanie do skrótu (np. "3w", "2m", "4", "5", "tr")
  if (cleanInput === normalizeAnswer(interval.short)) return true;

  // Sprawdzenie liczby półtonów z jednostką (np. "4p", "4 poltony", "4 poltonow")
  // Uwaga: sama cyfra np. "4" jest zarezerwowana dla Kwarty czystej!
  if (cleanInput === `${interval.semitones}p` || 
      cleanInput === `${interval.semitones} polton` ||
      cleanInput === `${interval.semitones} poltony` ||
      cleanInput === `${interval.semitones} poltonow`) {
    return true;
  }

  // Sprawdzenie listy aliasów
  return interval.aliases.some(alias => normalizeAnswer(alias) === cleanInput);
}

/**
 * Presety zestawów interwałów
 */
export const INTERVAL_PRESETS = [
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

export const PLAYBACK_DIRECTIONS = [
  { id: "up", label: "Do góry", icon: "arrow-up", description: "Dźwięk 1, potem wyższy dźwięk 2" },
  { id: "down", label: "W dół", icon: "arrow-down", description: "Dźwięk 1, potem niższy dźwięk 2" },
  { id: "up_down", label: "Do góry i w dół", icon: "repeat", description: "Dźwięk 1 → wyższy dźwięk 2 → powrót do dźwięku 1" },
  { id: "together", label: "Naraz (harmonicznie)", icon: "music", description: "Oba dźwięki brzmią jednocześnie" },
  { id: "up_together", label: "Do góry i naraz", icon: "layers", description: "Najpierw melodycznie do góry, potem naraz" },
  { id: "down_together", label: "W dół i naraz", icon: "layers", description: "Najpierw melodycznie w dół, potem naraz" },
  { id: "random", label: "Losowy kierunek", icon: "shuffle", description: "Komputer losuje jeden z powyższych stylów" }
];
