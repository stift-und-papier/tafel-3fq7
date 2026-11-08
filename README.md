# Klassenzimmer

Eine Seite im Pixel-Planner-Look als virtuelle Tafel für den Unterricht. Gerade ist sie ein **Starter**: Alle Bausteine sind mit Platzhaltertext gefüllt und warten auf deinen Inhalt.

## Seite auf dem eigenen Rechner ansehen

Doppelklick auf **`index.html`**. Sie öffnet sich im Browser, ganz ohne Internet und ohne Programme.

## Texte ändern

1. Öffne `index.html` mit einem Texteditor, zum Beispiel dem kostenlosen [Visual Studio Code](https://code.visualstudio.com/) oder dem Windows-Editor.
2. Suche nach „Hier kommt“. Dort stehen die Platzhalter.
3. Ersetze sie durch deinen Text, speichere und lade die Seite im Browser neu (`F5`).

Wie du Karten oder Toggle-Knöpfe hinzufügst, steht mit Beispielen in **`DESIGN.md`**.

## Farben ändern

Alle Farben stehen in **`css/tokens.css`**. Was welche Farbe macht, erklärt `DESIGN.md` im Abschnitt 2.

## Veröffentlichen mit GitHub Pages

Einmalig:

1. Lege auf github.com ein neues Repository an. Es muss **öffentlich** sein, weil GitHub Pages im kostenlosen Konto nur öffentliche Repositories veröffentlicht.
2. Lade die Dateien hoch, entweder mit `git push` oder per „Add file → Upload files“.
3. Öffne im Repository **Settings → Pages**. Wähle bei „Source“ den Punkt **Deploy from a branch**, dann **main** und **/(root)**, und klicke auf **Save**.
4. Nach etwa einer Minute steht oben die Adresse deiner Seite: `https://<dein-name>.github.io/<repository-name>/`

Danach: Jede hochgeladene Änderung ist nach etwa einer Minute online. Siehst du noch die alte Version, lade die Seite neu (`Strg` + `F5`).

**Wichtig:** Alles im Repository ist öffentlich sichtbar. Schreibe keine privaten Daten auf die Seite, zum Beispiel keine Namen von Schülerinnen und Schülern.

## Was ist wo?

```
index.html            die Tafel
styleguide.html       Stilvorlage: alle Bausteine, Farben und Kontraste
css/tokens.css        Farben, Größen, Schriften
css/components.css    Bausteine (Fenster-Karte, Chips, Zeilen, Knöpfe …)
css/app.css           Aufbau der Tafel und der Widgets
js/                   Tafel, Kurse, Speicher, Widgets
assets/fonts/         Schriften Source Sans 3 und JetBrains Mono (Lizenz: OFL-*.txt)
assets/deko/          Sprites neben der Figur (Ausrufezeichen, Fragezeichen, Herz)
assets/icons/         Pixel-Icons
assets/teacher/       Lehrer:in-Figur, ein Bild pro Stimmung
tools/                Werkzeug zum Zeichnen neuer Pixel-Motive
DESIGN.md             Design-Handbuch
CLAUDE.md             Hinweise für Claude Code
```

## Lizenz der Schriften

Source Sans 3 und JetBrains Mono stehen unter der SIL Open Font License 1.1, siehe `assets/fonts/OFL-source-sans-3.txt` und `assets/fonts/OFL-jetbrains-mono.txt`. Du darfst sie frei verwenden und weitergeben.
