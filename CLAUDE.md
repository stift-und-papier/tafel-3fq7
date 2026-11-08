# Arbeitsanweisungen für Claude Code

Die Besitzerin ist Lehrerin, keine Programmiererin. Sie möchte, dass Schritte in **einfachem Deutsch** erklärt werden und dass du **nachfragst statt rätst**.

## Projekt
- Statische Seite (virtuelle Tafel für den Unterricht) mit reinem HTML, CSS und JS. Kein Framework, kein Build-Schritt, keine externen Dienste (kein CDN, keine Google Fonts).
- Die Seite muss per Doppelklick auf `index.html` funktionieren und auf GitHub Pages laufen. Pfade deshalb immer relativ.
- Design-Regeln und Bausteine stehen in `DESIGN.md`. Lies die Datei, bevor du am Aussehen etwas änderst.

## Pixel-Look beibehalten
- Alles auf dem Raster `--px`. Abstände, Rahmen und Icon-Größen sind ganze Vielfache davon.
- Bilder nur ganzzahlig skalieren, mit `image-rendering: pixelated`. Nie glätten, nie hochrechnen, nie LANCZOS, BICUBIC oder BILINEAR.
- Keine Rundungen (`border-radius`), keine weichen Verläufe, keine Schatten, kein `rotate()` auf Pixelgrafik.
- **Keine Bild-KI.** Neue Motive nur als Pixelkarte in `tools/pixel-motive.mjs` zeichnen und erzeugen. Vorher stark vergrößert zeigen und auf ein Okay warten.
- Farben nur aus `css/tokens.css`. Neue Farben dort anlegen und den Kontrast prüfen (Text mindestens 4,5 : 1).

## Inhalt und Sprache
- Texte auf Deutsch, du-Ansprache, freundlich und gern mit einem Augenzwinkern.
- Keine privaten Daten auf die Seite (keine Namen von Schülerinnen und Schülern, Adressen, Telefonnummern). Das Repository ist öffentlich.

## Barrierefreiheit
- Toggle per Tastatur bedienbar halten (Pfeiltasten, Pos1, Ende).
- Deko mit `alt=""` und `aria-hidden="true"`, inhaltliche Bilder mit sinnvollem Alt-Text.
- `prefers-reduced-motion` respektieren.

## Ablauf
- Vor größeren Änderungen kurz den Plan nennen.
- Screenshots in Handy-Breite (375 px) und Laptop-Breite zeigen, für alle Stimmungen.
- Bei Änderungen an CSS oder JS die Versionsnummer `?v=…` in `index.html` hochzählen.
- **Erst nach ihrem Okay pushen** und vorher die geänderten Dateien nennen.
