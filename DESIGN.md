# Design-Handbuch (Design v2 „Retro-Fenster“)

Die Tafel sieht aus wie ein freundlicher, alter Computer-Schreibtisch: cremefarbener Grund mit feinem Gitter, weiße Fenster-Karten mit dünnem Rahmen, einer bunten Titelleiste und einem harten orangen Schatten. Pixel-Art gibt es nur bei den Icons und der Lehrer:in-Figur.

**Alle Bausteine auf einen Blick:** Öffne `styleguide.html` im Browser. Dort stehen auch die Farbtafel und die Kontrast-Tabelle, die direkt aus `tokens.css` gerechnet werden.

| Datei | Inhalt |
|---|---|
| `css/tokens.css` | alle Farben, Größen und Schriften. Hier änderst du das Aussehen. |
| `css/components.css` | die Bausteine (Fenster-Karte, Chips, Zeilen, Knöpfe, Tabs …) |
| `css/app.css` | Aufbau der Tafel: Reiter, Widgets, Leiste, Dialoge |
| `styleguide.html` | Stilvorlage zum Nachschauen |
| `tools/pixel-motive.mjs` | Werkzeug, um Pixel-Motive zu zeichnen |

---

## 1. Die Regeln

1. **Farben nur aus `tokens.css`.** Nirgends sonst stehen Farbcodes. Neue Farbe? In `tokens.css` anlegen und den Kontrast in `styleguide.html` prüfen.
2. **Nur die Palette:** die zehn Palettenfarben, Weiß, die beiden Creme-Töne und Tönungen davon (Palettenfarbe mit Weiß gemischt). Einzige Mischfarbe: `--brown` (Koralle + Petrol-dunkel 50 : 50) für Text auf hellem Orange.
3. **Scharfe Ecken**, kein `border-radius`.
4. **Weiche Verläufe nur** in der Titelleiste (`.window__titlebar`) und im Hintergrund der Titelkarte (`.window--hero`).
5. **Dünne Linien** (1–2 px) und **harter, versetzter Schatten** in Orange (`--shadow`), bei kleinen Teilen in Honig (`--shadow-sm`).
6. **Pixel-Grafik bleibt scharf:** nur ganzzahlig vergrößern (2-fach, 3-fach …), immer mit `image-rendering: pixelated` (Klasse `.pixel`). Nie glätten, nie umfärben, nie mit Bild-KI neu erzeugen.
7. **Deko** hat `alt=""` und `aria-hidden="true"`.

---

## 2. Farben

### Palette

| Variable | Farbe | Rolle |
|---|---|---|
| `--c-petrol-dark` | #264653 | Haupttext, Überschriften, aktiver Reiter/Knopf, Fokusrahmen |
| `--c-petrol` | #287271 | gedämpfter Text (Unterzeilen, Labels) |
| `--c-teal` | #2A9D8F | Hinweis-Kasten (gestrichelter Rahmen), Timer-Ring |
| `--c-sage` | #8AB17D | Verlauf der Titelleiste |
| `--c-sun` | #E9C46A | Textmarker, Hinweis-Punkt an „Sicherung“ |
| `--c-honey` | #EFB366 | kleine Schatten, Rahmen der Orange-Chips |
| `--c-orange` | #F4A261 | großer Schatten, Nummern-Blöcke |
| `--c-orange-deep` | #EE8959 | Rahmen der Nummern-Blöcke |
| `--c-coral` | #E76F51 | Akzentrand am aktiven Reiter, Sekundenzeiger, „Zeit ist um“ |
| `--c-coral-soft` | #E97C61 | Verlauf der Titelkarte, Herz |
| `--white` | #FFFFFF | Fenster-Karten, Zeilen, Chips |
| `--cream` | #FCF6E9 | Seitenhintergrund |
| `--cream-deep` | #F9EED5 | Leiste unten, inaktive Reiter |

### Tönungen (Zahl = Anteil der Farbe, Rest Weiß)

`--tint-teal-8` #EEF7F6 · `--tint-teal-10` #EAF5F4 · `--tint-teal-20` #D4EBE9 · `--tint-teal-35` #B4DDD8 (dünne Rahmen) · `--tint-sun-40` #F6E7C3 · `--tint-coral-soft-15` #FCEBE7 · `--tint-orange-20` #FDECDF (Orange-Chips, Hover) · `--tint-orange-40` #FBDAC0 · `--tint-petrol-dark-6` #F2F4F5 (Gitter) · `--tint-petrol-dark-12` #E5E9EA · `--tint-sage-20` #E8EFE5 · `--brown` #875B52 · `--veil` Petrol-dunkel halb durchsichtig (hinter Dialogen)

### Geprüfte Kontraste

Regel: normaler Text mindestens 4,5 : 1, große oder fette Schrift (ab 24 px bzw. 19 px fett) mindestens 3 : 1.

| Text | Hintergrund | Kontrast | Ergebnis |
|---|---|---|---|
| Petrol-dunkel | Weiß | 10,08 : 1 | ✔ |
| Petrol-dunkel | Creme | 9,36 : 1 | ✔ |
| Petrol-dunkel | Creme-tief | 8,74 : 1 | ✔ |
| Petrol-dunkel | Teal 8 % (Hinweis-Kasten) | 9,25 : 1 | ✔ |
| Petrol-dunkel | Sonne 40 % (Titelkarte) | 8,23 : 1 | ✔ |
| Petrol-dunkel | Koralle 15 % (Titelkarte) | 8,72 : 1 | ✔ |
| Petrol-dunkel | Orange 20 % | 8,76 : 1 | ✔ |
| Petrol-dunkel | Sonne (Textmarker) | 6,03 : 1 | ✔ |
| Petrol-dunkel | Honig | 5,43 : 1 | ✔ |
| Petrol-dunkel | Orange (Nummern-Block) | 4,89 : 1 | ✔ |
| Petrol | Weiß | 5,62 : 1 | ✔ |
| Petrol | Creme | 5,22 : 1 | ✔ |
| Petrol | Creme-tief | 4,88 : 1 | ✔ |
| Petrol | Teal 8 % | 5,16 : 1 | ✔ |
| Petrol | Sonne 40 % | 4,59 : 1 | ✔ (knapp) |
| Petrol | Orange 20 % | 4,88 : 1 | ✔ |
| Braun | Orange 20 % (Chip, Zähler) | 5,00 : 1 | ✔ |
| Braun | Weiß | 5,76 : 1 | ✔ |
| Weiß | Petrol-dunkel (aktiv) | 10,08 : 1 | ✔ |
| Weiß | Petrol | 5,62 : 1 | ✔ |
| Weiß | Teal | 3,32 : 1 | nur große, fette Schrift |
| Weiß | Orange | 2,06 : 1 | ✘ nie verwenden |
| Koralle | Weiß (Timer „Zeit ist um“, riesige Ziffern) | 3,09 : 1 | ✔ nur große Schrift |

Faustregel: **Weiße Schrift nur auf Petrol-dunkel und Petrol**, sonst immer Petrol-dunkel.

Der Titel in der Titelleiste steht auf einem kleinen cremefarbenen Schild, weil dunkle Schrift direkt auf dem Türkis am Anfang des Verlaufs nur etwa 3 : 1 hätte.

---

## 3. Schriften

| Rolle | Schrift | Variable |
|---|---|---|
| Überschriften | Source Sans 3, 800, eng (`letter-spacing: -0.03em`, Zeilenhöhe 1,05) | `--font-sans`, Klasse `.heading` |
| Fließtext (mind. 16 px) | Source Sans 3, 400 | `--font-sans` |
| Labels, Chips, Dateinamen | JetBrains Mono, fett, Großbuchstaben, weiter Abstand | `--font-mono`, Klasse `.label` |

Beide liegen als Dateien in `assets/fonts/` (Lizenz OFL). Es wird nichts aus dem Internet geladen.

---

## 4. Die Bausteine

Alle Beispiele siehst du in `styleguide.html`. Dort kannst du den HTML-Code abschauen.

| Klasse | Was | Wo in der Tafel |
|---|---|---|
| `.header-strip` + `.label` + `.counter` | Kopfzeile: Label links, Zähler „01 / 08“ rechts | Label mit dem Kursnamen ganz oben; Zähler später im Folien-Widget |
| `.window` | Fenster-Karte: weiß, dünner Rahmen, oranger Schatten | jedes Widget, jeder Dialog |
| `.window__titlebar`, `.window__title`, `.window__tools`, `.window__buttons` | Titelleiste mit Verlauf, Titel-Schild mit Icon, Werkzeug und drei Deko-Knöpfen | Kopf jedes Widgets |
| `.window__body` | Innenfläche | Dialoge |
| `.window--hero` | Titelkarte mit zartem Verlauf und Gitter | Stilvorlage |
| `.chip`, `.chip--peach` | Tag-Chip (weiß) und Meta-Chip (helles Orange) | später z. B. Gruppen, Folien |
| `mark` | Textmarker (untere Hälfte der Zeile in Sonne) | Text-Widget |
| `.rows` / `.row` / `.row__icon` / `.row__num` | Listenzeilen mit Icon- oder Nummern-Block | später Schülerliste, Gruppen |
| `.callout` | Hinweis-Kasten, gestrichelt | „Tippe unten auf ein Widget …“ |
| `.btn`, `.btn--primary`, `.btn--square`, `.btn--small` | Knöpfe | überall |
| `.tab` | Reiter (aktiv: Petrol-dunkel mit Korallen-Rand) | Stilvorlage; die Kurs-Reiter nutzen `.reiter` mit demselben Aussehen |
| `.choice` | Auswahl als Knopfreihe (Radio-Knöpfe) | Einstellungen, Lehrer:in-Auswahl |
| `.teacher-overlap`, `.sprite` | Figur, die über den Kartenrand ragt, und kleine Sprites | Stilvorlage |

---

## 5. Die Lehrer:in-Figur

- Bilder: `assets/teacher/lehrerin-<stimmung>.png`, je 84 × 160 Pixel, durchsichtiger Hintergrund. Die Liste steht in `assets/teacher/teacher.js`.
- Auf der Tafel steht die Figur **frei**, ohne Fenster. Die Stimmung wählst du beim Hinzufügen. Antippen zeigt den Mülleimer.
- Größe immer ganzzahlig: 84 × 160 mal 2, 3, 4 … (auch auf Retina-Bildschirmen).
- Kleine Sprites (Ausrufezeichen, Fragezeichen, Herz) stehen pro Stimmung in `teacher.js` (`sprites`, Lage in Figur-Pixeln).
- Die Figur behält ihre eigenen Farben und folgt nicht der Palette.

---

## 6. Icons und Sprites

| Ordner | Motive | Größe (Pixel) |
|---|---|---|
| `assets/icons/` | wuerfel, bild, text, uhr, kalender, folien, herz, zahnrad, muell, stift, start, pause, stopp, vollbild, speichern, laden, pfeil-links, pfeil-rechts, kreuz, info, wecker, sonne, mond, sonne-auf, verbot, waage, teller | alle 14 × 14, angezeigt 14, 28 oder 56 px |
| `assets/deko/` | ausrufe, frage, herz | 5 × 14, 9 × 13, 12 × 10 |

Die Icons sind in Palettenfarben gezeichnet, mit Kontur in Petrol-dunkel.

**Eigenes Motiv zeichnen:** Öffne `tools/pixel-motive.mjs`. Jedes Motiv ist dort eine kleine Pixelkarte: eine Zeile pro Pixelreihe, ein Buchstabe pro Pixel, `.` ist durchsichtig. Die Farben stehen oben bei `FARBE`, und zwar nur Werte aus `tokens.css`. Füge eine Karte hinzu, trag den Namen bei `DEKO` oder `ICONS` ein und führe den Befehl aus:

```
node tools/pixel-motive.mjs
```

---

## 7. Barrierefreiheit

- Alle Textfarben erfüllen die Kontrast-Regeln (Tabelle oben).
- Alles lässt sich per Tastatur bedienen. Der Fokus ist ein 3 px breiter Rahmen in Petrol-dunkel, auf dunklen Flächen in Weiß.
- Knöpfe sind mindestens 44–48 px groß, damit sie am iPad gut zu treffen sind.
- Deko hat `alt=""` und `aria-hidden="true"`. Die Figur hat einen kurzen Alt-Text zur Stimmung.
- „Bewegung reduzieren“ im Gerät schaltet Animationen ab (auch das Blinken des Timers).
