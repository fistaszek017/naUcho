# 🎵 Trener Interwałów Muzycznych

Kompleksowa, interaktywna aplikacja internetowa do nauki rozpoznawania interwałów muzycznych ze słuchu oraz opanowywania ich nomenklatury (od **Prymy czystej** do **Oktawy czystej**).

Aplikacja działa w 100% w przeglądarce, wykorzystując **Web Audio API** do precyzyjnej syntezy wielogłosowej oraz **LocalStorage** do zapamiętywania preferencji i postępów użytkownika.

---

## 🚀 Jak uruchomić?

Aplikacja nie wymaga żadnej instalacji ani kompilacji:

1. **Najprostszy sposób:** Kliknij dwukrotnie plik `index.html` w eksploratorze plików (działa natychmiast w każdej przeglądarce: Chrome, Edge, Firefox, Safari).
2. **Za pomocą serwera lokalnego (opcjonalnie):**
   ```bash
   npm start
   # lub
   npx serve .
   ```
   i otwórz adres `http://localhost:3000`.

---

## 🎹 Trzy Tryby Pracy

1. **Tryb 1: Nauka (Atlas i Odsłuch)**
   - Przegląd wszystkich 13 interwałów z podziałem na półtony i stosunki częstotliwości.
   - **Wirtualna klawiatura fortepianowa** dostępna wyłącznie w tym trybie do nauki i wizualizacji odległości klawiszy.
   - Szybkie przyciski odsłuchu w 3 wariantach: `▲ W górę`, `▼ W dół`, `♫ Naraz (harmonicznie)`.
   - Zestaw sprawdzonych skojarzeń mnemotechnicznych ze znanymi utworami.
   - Wskaźniki poziomu opanowania dla każdego interwału.

2. **Tryb 2: Odgadywanie (Wybór z listy)**
   - Komputer odtwarza losowy interwał.
   - Czysty test słuchowy bez podpowiedzi wizualnych z klawiatury.
   - Użytkownik wybiera pasujący interwał klikając w kafelek.
   - Natychmiastowa informacja zwrotna (sukces / błąd) oraz szczegółowe wyjaśnienie zagranego interwału.

3. **Tryb 3: Odgadywanie (Wpisywanie z klawiatury)**
   - Nauka profesjonalnej nomenklatury muzycznej poprzez pisanie z klawiatury.
   - Czyste pole tekstowe z autofokusem (bez rozpraszających przycisków pomocniczych).
   - Akceptuje:
     - Skróty: `1`, `2m`, `2w`, `3m`, `3w`, `4`, `tr`, `4>`, `5<`, `5`, `6m`, `6w`, `7m`, `7w`, `8`
     - Pełne nazwy (z polskimi znakami lub bez): `tercja wielka`, `sekunda mala`, `tryton`, `kwarta`, itp.
     - Półtony: np. `4p`, `4 poltony`.

---

## 🛠️ Własna konfiguracja oznaczeń i piosenek

Na samej górze plików `js/intervals-data.js` oraz `js/bundle.js` znajduje się przejrzysta sekcja:
```javascript
export const INTERVALS_CONFIG = [
  {
    semitones: 1,
    short: "2m", // Tutaj możesz zmienić oznaczenie (np. na "sm")
    name: "Sekunda mała",
    mnemonic: "Motyw z filmu 'Szczęki'...", // Tutaj możesz wpisać własną piosenkę
    color: "#ec4899"
  },
  ...
];
```
Wszelkie wprowadzone tam zmiany natychmiast przenoszą się na całą aplikację (przyciski, teksty, sprawdzanie pisowni w trybie 3).

---

## ✨ Kluczowe Funkcjonalności

- **Zmienny dźwięk początkowy (Root Pitch):** Interwały nie zaczynają się zawsze od tego samego dźwięku — losowane są z szerokiego, komfortowego rejestru fortepianowego (C3 – E5), z gwarancją braku bezpośrednich powtórzeń tej samej nuty bazowej.
- **Active Learning (Inteligentne Powtórki):**
  - Algorytm analizuje statystyki Twoich odpowiedzi (błędy, serie, procent skuteczności).
  - Interwały, które sprawiają Ci trudność, pojawiają się na testach ze znacznie większym prawdopodobieństwem.
  - Opanowane interwały są powtarzane rzadziej, w celu utrwalenia materiału.
  - Opcję można w każdej chwili włączyć/wyłączyć jednym kliknięciem.
- **Kierunki odtwarzania:**
  - `Do góry` (melodycznie wznosząco)
  - `W dół` (melodycznie opadająco)
  - `Do góry i w dół` (wznosząco, a potem opadająco)
  - `Naraz` (harmonicznie)
  - `Do góry i naraz`
  - `W dół i naraz`
  - `Losowy kierunek`
- **Wirtualny Fortepian:**
  - Dynamicznie podświetla grane nuty (`1` dla prymy, `2` dla drugiego dźwięku).
  - Pozwala na klikanie i swobodne odsłuchiwanie pojedynczych dźwięków.
- **Filtrowanie i Presety:**
  - Możliwość ćwiczenia dowolnego podzbioru interwałów (np. tylko do kwinty, tylko małe i wielkie, tylko interwały trudne/dysonanse).
- **Brzmienia i Dźwięk:**
  - Trzy barwy syntezy: Fortepian akustyczny / E-Piano, Wibrafon / Dzwonki, Ciepły Syntezator analogowy.
  - Płynna regulacja głośności i tempa odtwarzania.
- **Pełny zapis w LocalStorage:**
  - Aplikacja automatycznie zapamiętuje wybrane interwały, tryb, kierunek odtwarzania, głośność, serię poprawnych odpowiedzi (Streaks) oraz historię nauki.
- **Skróty klawiszowe:**
  - `Spacja`: Powtórz dźwięk interwału.
  - `Enter`: Przejdź do kolejnego pytania / Zatwierdź odpowiedź.
