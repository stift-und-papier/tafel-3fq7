# Arbeitsanweisungen für Claude Code

Die Besitzerin ist Lehrerin, keine Programmiererin. Sie möchte, dass Schritte in **einfachem Deutsch** erklärt werden und dass du **nachfragst statt rätst**.

## Projekt
- Statische Seite (virtuelle Tafel für den Unterricht) mit reinem HTML, CSS und JS. Kein Framework, kein Build-Schritt, keine externen Dienste (kein CDN, keine Google Fonts).
- Die Seite muss per Doppelklick auf `index.html` funktionieren und auf GitHub Pages laufen. Pfade deshalb immer relativ.
- Design-Regeln und Bausteine stehen in `DESIGN.md`. Lies die Datei, bevor du am Aussehen etwas änderst.

## Design (v2 „Retro-Fenster“)
- Design-Regeln, Palette und Kontrast-Tabelle stehen in `DESIGN.md`, alle Bausteine zum Anschauen in `styleguide.html`.
- **Farben nur aus `css/tokens.css`.** Nur die zehn Palettenfarben, Weiß, `--cream`, `--cream-deep` und Tönungen davon (mit Weiß gemischt, als benannte Variable). Keine freien Farbcodes im Code. Neue Farbe dort anlegen und den Kontrast prüfen (Text mindestens 4,5 : 1, große/fette Schrift 3 : 1). Weiße Schrift nur auf Petrol-dunkel und Petrol.
- Scharfe Ecken, kein `border-radius`. Weiche Verläufe nur in der Titelleiste (`.window__titlebar`) und im Hintergrund der Titelkarte (`.window--hero`).
- Dünne Linien und harter, versetzter Schatten in Orange bzw. Honig.
- Bausteine mit allgemeinen Namen in `css/components.css` (`.window`, `.chip`, `.row`, `.callout`, `.btn` …), nichts doppelt.
- Schriften nur lokal aus `assets/fonts/` (Source Sans 3, JetBrains Mono).

## Pixel-Art (Icons und Figur)
- Bilder nur ganzzahlig skalieren, mit `image-rendering: pixelated`. Nie glätten, nie hochrechnen, nie LANCZOS, BICUBIC oder BILINEAR. Kein `rotate()` auf Pixelgrafik.
- **Keine Bild-KI.** Neue Motive nur als Pixelkarte in `tools/pixel-motive.mjs` zeichnen und erzeugen. Vorher stark vergrößert zeigen und auf ein Okay warten.
- Die Lehrer:in-Figur nicht neu zeichnen und nicht umfärben. Sie behält ihre eigenen Farben.

## Inhalt und Sprache
- Texte auf Deutsch, du-Ansprache, freundlich und gern mit einem Augenzwinkern.
- Keine privaten Daten auf die Seite (keine Namen von Schülerinnen und Schülern, Adressen, Telefonnummern). Das Repository ist öffentlich.

## Barrierefreiheit
- Kurs-Reiter per Tastatur bedienbar halten (Pfeiltasten, Pos1, Ende). Sichtbarer Fokus.
- Deko mit `alt=""` und `aria-hidden="true"`, inhaltliche Bilder mit sinnvollem Alt-Text.
- `prefers-reduced-motion` respektieren.

## Ablauf
- Vor größeren Änderungen kurz den Plan nennen.
- Screenshots in iPad-quer-Breite (1180 px) und Laptop-Breite (1366 px) zeigen. Handybreite ist nicht nötig.
- Bei Änderungen an CSS oder JS die Versionsnummer `?v=…` in `index.html` hochzählen.
- **Erst nach ihrem Okay pushen** und vorher die geänderten Dateien nennen.
