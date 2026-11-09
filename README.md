# Klassenzimmer-Tafel

Eine digitale Tafel für den Unterricht im Retro-Fenster-Look. Du legst Widgets auf die Tafel, schiebst sie zurecht und hast für jeden Kurs eine eigene Tafel.

**Live:** https://stift-und-papier.github.io/tafel-3fq7/

## Was die Tafel kann

| Widget | Was es macht |
|---|---|
| Zufall | Namen ziehen (jede:r einmal oder ganz zufällig), Gruppen bilden, „fehlt heute“ antippen |
| Bild | Bild vom Gerät auf die Tafel legen |
| Text | Text mit Fett, Kursiv, Unterstrichen, Marker in 5 Farben, Größen, Listen. Als Fenster, Gedankenblase, Sprechblase oder Infokasten |
| Timer | Countdown und Stoppuhr |
| Uhr | Uhrzeit groß |
| To-Do | Aufgaben mit Farbe, zum Abhaken, einzeln verbergbar |
| Folien | Bilder und Text-Folien zum Durchblättern |
| Lehrer:in | Pixel-Figur in verschiedenen Stimmungen |

- **Kurse:** Oben ein Reiter pro Kurs. `+` legt einen neuen an. Den aktiven Reiter noch einmal antippen zeigt Stift (umbenennen) und Mülleimer (löschen).
- **Widgets:** Antippen und ziehen zum Verschieben, an den Ecken ziehen für die Größe. Zahnrad = Einstellungen, Stift = Name und Farben, − = einklappen.

## Als App aufs iPad

1. Öffne die Live-Adresse oben in **Safari**.
2. Tippe auf **Teilen** (Quadrat mit Pfeil) → **Zum Home-Bildschirm** → **Hinzufügen**.
3. Jetzt ist die Tafel als App mit eigenem Symbol da, ohne Adressleiste.

Einmal mit Internet geöffnet, startet die Tafel danach **auch ohne Internet**. Neue Fassungen holt sie sich im Hintergrund, sie sind dann beim nächsten Öffnen da.

## Wo deine Daten liegen

Alles, was du einträgst (Kurse, Widgets, Namensliste), bleibt **nur auf diesem Gerät, in diesem Browser**. Nichts wird an einen Server geschickt. Es gibt keine Analytics und keine fremden Schriften oder Skripte.

**Wichtig:** Die App auf dem Home-Bildschirm hat einen **eigenen Speicher**, getrennt von Safari. So bringst du deine Tafel mit:

1. In Safari: **Sicherung → Sicherung speichern**. Die Datei landet in „Dateien“.
2. In der App: **Sicherung → Sicherung laden** und die Datei wählen.

Dasselbe gilt für den Umzug auf ein anderes Gerät. Die Tafel erinnert dich nach 6 Tagen an eine neue Sicherung, denn Safari (ohne Home-Bildschirm) kann die Daten löschen, wenn du die Seite eine Woche lang nicht öffnest.

## Seite auf dem eigenen Rechner ansehen

Doppelklick auf **`index.html`**. Sie öffnet sich im Browser, ganz ohne Internet und ohne Programme. (Der Offline-Speicher für die App wirkt nur über die Live-Adresse.)

## Veröffentlichen mit GitHub Pages

Einmalig:

1. Lege auf github.com ein neues Repository an. Es muss **öffentlich** sein, weil GitHub Pages im kostenlosen Konto nur öffentliche Repositories veröffentlicht.
2. Lade die Dateien hoch, entweder mit `git push` oder per „Add file → Upload files“.
3. Öffne im Repository **Settings → Pages**. Wähle bei „Source“ den Punkt **Deploy from a branch**, dann **main** und **/(root)**, und klicke auf **Save**.
4. Nach etwa einer Minute steht oben die Adresse deiner Seite: `https://<dein-name>.github.io/<repository-name>/`

Danach: Jede hochgeladene Änderung ist nach etwa einer Minute online. Siehst du noch die alte Version, lade die Seite neu (`Strg` + `F5`, in der iPad-App: App schließen und noch einmal öffnen).

**Wichtig:** Alles im Repository ist öffentlich sichtbar. Schreibe keine privaten Daten in die Dateien, zum Beispiel keine Namen von Schülerinnen und Schülern. Die Namensliste trägst du nur in der Tafel selbst ein, dort bleibt sie auf deinem Gerät.

## Was ist wo?

```
index.html             die Tafel
styleguide.html        Stilvorlage: alle Bausteine, Farben und Kontraste
test.html              Selbsttest der Datenprüfung
manifest.webmanifest   Name und Symbol der App (Home-Bildschirm)
sw.js                  Offline-Speicher: merkt sich die Dateien der Seite
css/tokens.css         Farben, Größen, Schriften
css/components.css     Bausteine (Fenster-Karte, Chips, Zeilen, Knöpfe …)
css/app.css            Aufbau der Tafel und der Widgets
js/                    Tafel, Kurse, Speicher, Dialoge
js/widgets/            ein Skript pro Widget
assets/app/            App-Symbol in drei Größen
assets/fonts/          Schriften Source Sans 3 und JetBrains Mono (Lizenz: OFL-*.txt)
assets/deko/           Sprites neben der Figur (Ausrufezeichen, Fragezeichen, Herz)
assets/icons/          Pixel-Icons
assets/teacher/        Lehrer:in-Figur, ein Bild pro Stimmung
tools/                 Werkzeug zum Zeichnen neuer Pixel-Motive und des App-Symbols
DESIGN.md              Design-Handbuch
CLAUDE.md              Hinweise für Claude Code
```

## Lizenz der Schriften

Source Sans 3 und JetBrains Mono stehen unter der SIL Open Font License 1.1, siehe `assets/fonts/OFL-source-sans-3.txt` und `assets/fonts/OFL-jetbrains-mono.txt`. Du darfst sie frei verwenden und weitergeben.
