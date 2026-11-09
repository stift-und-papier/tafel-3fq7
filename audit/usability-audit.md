# Usability-Audit Klassenzimmer-Tafel

Stand: 08.11.2026 · geprüfte Fassung: `?v=19` (Commit `870f2a4`) · reines Audit, kein Code geändert.

**Wie geprüft wurde:** Den ganzen Code gelesen (`js/`, `css/`, `index.html`, `sw.js`, `DESIGN.md`, `README.md`). Die App lokal über einen kleinen Webserver gestartet und im eingebauten Browser (Chromium) bei 1180×820, 1024×768 und 820×1180 gemessen und bedient. Klicks und Wischbewegungen habe ich per Skript als Touch-Zeigerereignisse ausgelöst (`pointerType: "touch"`). Echtes Safari-Verhalten (Gesten, Tastatur, Ton, Sperrbildschirm) konnte ich nicht sehen.

**Nachweis-Kennzeichnung:** (a) im Code nachweisbar · (b) in der Emulation beobachtet · (c) Vermutung, am echten iPad prüfen.

**Hinweis vorab:** Eine Funktion „Hintergrund“ (Tafel-Hintergrund wählen) gibt es im Code nicht. Das Widget „Stundenplan“ heißt in der App **„To-Do“** (Aufgabenliste, intern Typ `stundenplan`). Ich habe beides so geprüft, wie es im Code steht. Falls ein Hintergrund-Wähler geplant war: Er fehlt.

---

## 1. Zusammenfassung

1. **Der Bildschirm kann mitten im Timer ausgehen:** Die App hält das iPad nicht wach (keine Wake-Lock-Anfrage), bei Auto-Sperre nach 2–5 Minuten wird die Projektion während einer 7:30-Arbeitsphase schwarz.
2. **Ein Fingertipp löscht ein Widget sofort und endgültig:** Der Mülleimer sitzt 6 px neben dem Einklapp-Knopf (−), es gibt weder Rückfrage noch Rückgängig. Genauso leert ein leeres Namensfeld mit „Fertig“ die ganze Schülerliste ohne Nachfrage.
3. **Aus 5–8 m kaum lesbar sind Gruppenkarten (Namen 16 px, Überschrift 13 px), Fenstertitel und der Folienzähler.** Im Standardformat passen außerdem nur etwa 2 von 6–7 Gruppen ins Widget, der Rest muss gescrollt werden. Timer, Uhr und gezogener Name sind dagegen gut groß.
4. **Im Hochformat (820 px) ragt die untere Leiste über den Rand:** „Sicherung“ ist nicht mehr sichtbar, „Vollbild“ nur halb. Wischen auf einer Folie verschiebt das ganze Widget, statt zu blättern, und schon 3 px Fingerzittern verschieben ein Widget.
5. **Die Daten liegen nur im Browser-Speicher, und den kann Safari löschen.** Safari räumt ihn nach 7 Tagen ohne Besuch, die App erinnert aber erst nach 14 Tagen an eine Sicherung. Dazu zählt eine abgebrochene Sicherung trotzdem als „gesichert“.

---

## 2. Befundtabelle

| Nr. | Bereich | Fundstelle | Problem | Auswirkung im Unterricht | Schweregrad | Nachweis | Lösungsvorschlag | Aufwand |
|---|---|---|---|---|---|---|---|---|
| 1 | iPad | Timer · `js/widgets/timer.js` (ganz), kein `navigator.wakeLock` im Projekt | Kein Wake Lock: Das iPad sperrt bzw. dimmt nach der Auto-Sperre-Zeit. | Projektion wird während der Arbeitsphase schwarz, Lehrkraft muss entsperren (Code eingeben vor der Klasse). | kritisch | (a) fehlt im Code; Wirkung (c) | Beim Start des Timers/der Stoppuhr `navigator.wakeLock.request("screen")` anfordern, bei Pause/Ende freigeben, bei `visibilitychange` neu anfordern. Fallback-Hinweis: „Auto-Sperre auf Nie stellen“. | klein |
| 2 | Interface | Alle Fenster · `js/tafel.js:153`, `:172–181` | „Widget löschen“ löscht sofort, ohne Rückfrage und ohne Rückgängig. | Ein Fehltipp vernichtet Folien, Texte, Gruppen, To-Do-Listen. Erarbeitete Inhalte sind weg. | kritisch | (a), (b) beobachtet | „Rückgängig“-Leiste für ca. 8 s nach dem Löschen (gelöschtes Widget im Speicher halten), alternativ Rückfrage bei Widgets mit Inhalt. | mittel |
| 3 | iPad | Titelleiste · `css/app.css:128`, `:548–564` | Mülleimer (40×40) und Einklapp-Knopf (−, 28×28, Trefferfläche 44) liegen 6 px auseinander, die Trefferfläche von − ragt 2 px in den Mülleimer. Einstellungen ↔ Löschen ebenfalls nur 6 px. | Wer einklappen will, trifft leicht den Mülleimer, zusammen mit Nr. 2 ist das Datenverlust. | kritisch | (a), (b) gemessen | Mülleimer ans andere Ende rücken oder mit Abstand ≥ 16 px absetzen, alle Werkzeugknöpfe auf 44×44. | klein |
| 4 | Interface | Zufall → Liste · `js/widgets/zufall.js:288–306` | Leeres Namensfeld + „Fertig“ löscht alle Namen ohne Rückfrage (auch „Nicht zusammen“-Paare verfallen über `paare()`). | Klassenliste weg; nur über eine Sicherungsdatei wiederherstellbar. | hoch | (a), (b) beobachtet | Rückfrage, wenn Namen wegfallen („5 Namen werden entfernt“), oder Rückgängig. | klein |
| 5 | iPad | Speicher · `js/speicher.js`, `js/app.js:45–49` | Nur `localStorage`, kein `navigator.storage.persist()`. Safari löscht skriptbaren Speicher nach 7 Tagen Safari-Nutzung ohne Besuch der Seite (ITP); die Erinnerung kommt erst nach 14 Tagen. | Nach Ferien/Krankheit sind alle Kurse, Namen und Folien weg (im Safari-Tab; Home-Bildschirm-App ist davon ausgenommen). | hoch | (a) Code; Löschverhalten (c) | Erinnerung auf ≤ 6 Tage senken, `navigator.storage.persist()` anfragen, in der Sicherung klar empfehlen: „Nutze die App vom Home-Bildschirm“. | klein |
| 6 | Interface | Sicherung · `js/speicher.js:90–101` | `letzteSicherung` wird gesetzt, bevor feststeht, dass die Datei wirklich gespeichert wurde. Keine Erfolgsmeldung. | Bricht die Lehrkraft den Download-Dialog ab, verschwindet das gelbe „!“ trotzdem. Sie glaubt, gesichert zu haben. | hoch | (a), (b) beobachtet | Kurze Bestätigung „Datei *tafel-sicherung-….json* wurde erstellt – liegt in ‚Dateien → Downloads‘“; auf iPad `navigator.share({files})` anbieten (dann erst Datum setzen). | mittel |
| 7 | iPad | Leiste unten · `css/app.css:169–181` | Bei 820 px (Hochformat) ist die Leiste 954 px breit; „Sicherung“ liegt außerhalb, „Vollbild“ halb. `body { overflow:hidden }` verhindert Scrollen. | Im Hochformat keine Sicherung möglich; Bedienelemente abgeschnitten. | hoch | (b) gemessen | Leiste umbrechen oder Knöpfe ab < 960 px schmaler (nur Icon + kurzer Text, 64 px). | klein |
| 8 | Interface | Gruppen · `css/app.css:377–389` | Gruppennamen 16 px (`clamp(1rem, 3cqw, …)`), Gruppen-Überschrift 13 px Mono. Bei 24 Anwesenden/4er-Gruppen: Inhalt 390 px hoch, sichtbar 172 px (Widget 560×440). | Klasse kann ihre Gruppe aus 4–8 m nicht lesen; Lehrkraft muss scrollen oder Widget groß ziehen. | hoch | (b) gemessen | Gruppenseite: Bedienleiste nach dem Einteilen einklappen, Schrift an Widgethöhe koppeln (wie beim gezogenen Namen), Gruppen-Überschrift ≥ 24 px; Knopf „Groß zeigen“. | mittel |
| 9 | iPad | Folien · `js/tafel.js:225–237`, `js/widgets/folien.js` | Keine Wischgeste zum Blättern; Wischen auf der Folie verschiebt das ganze Widget (beobachtet: 168 px → 0 px, Folie unverändert). | Natürliche iPad-Geste macht das Gegenteil; Folie rutscht vor der Klasse weg. | hoch | (b) beobachtet | Folienbühne `kein-ziehen` + horizontale Wischgeste → blättern; Verschieben nur über die Titelleiste. | mittel |
| 10 | iPad | Alle Widgets · `js/tafel.js:239–255` | Ziehen startet ohne Schwelle; 3 px Fingerzittern beim Antippen verschieben das Widget um ein Rasterfeld (4 px) und speichern. Jedes Antippen holt das Widget nach vorn und speichert den ganzen Zustand. | Layout „wandert“ beim Bedienen; kein Rückgängig für versehentliches Verschieben. | mittel | (b) beobachtet | Ziehen erst ab ca. 8 px Bewegung beginnen; optional „Anordnung sperren“. | klein |
| 11 | Interface | Folien · `js/widgets/folien.js:92–121` | Keine Möglichkeit, eine bestimmte Folie direkt anzuspringen (nur Pfeile; im Bearbeiten-Dialog kein „Hierhin“). | Bei Rückfragen („Zeig nochmal Folie 3“) muss sie durchklicken. | mittel | (a) | Zähler „02 / 08“ antippbar → Übersicht mit Vorschaubildern zum Antippen. | mittel |
| 12 | Interface | Vollbild · `js/app.js:25–34` | Nur ganze Seite im Vollbild, kein Präsentationsmodus für eine Folie. Knopf heißt in beiden Zuständen „Vollbild“; in der Home-Bildschirm-App ist er ausgeblendet. | Folie bleibt klein zwischen Reitern und Leiste; Lehrkraft weiß nicht, wie sie zurückkommt. | mittel | (a) | Knopftext/Icon wechseln („Vollbild aus“); im Folien-Widget eigener Knopf „Folie groß“ (Widget füllt Tafel, Leisten ausgeblendet). | mittel |
| 13 | Interface | Folien-Text, Zähler · `css/app.css:523`, `components.css:148–158` | Folientext ~23 px, Zähler 13 px bei Standardgröße 720×520. | Ab ca. 5 m schwer lesbar (abhängig von Bildbreite der Projektion). | mittel | (b) gemessen | Standardgröße des Folien-Widgets größer; Text an `cqh` ohne 3,4-cqw-Deckel; Grundgröße wählbar wie beim Text-Widget. | klein |
| 14 | Interface | Zufall · `js/widgets/zufall.js:232–256` | Wird nach dem Einteilen jemand als „fehlt“ markiert, fällt der Name still aus seiner Gruppe (beobachtet: Gruppe mit 2 statt 4). | Ungleiche Gruppen, ohne dass es jemand merkt. | mittel | (b) beobachtet | Hinweis „Anwesenheit geändert – neu einteilen?“ oder Knopf „Neu mischen“ hervorheben. | klein |
| 15 | Interface | Zufall · `js/widgets/zufall.js:105`, `:120` | „Neue Runde“ steht 10 px neben „Ziehen“ und setzt die Ziehliste ohne Rückfrage zurück. Bei „Noch 0 von 24“ beginnt die neue Runde stillschweigend. | Fehltipp → bereits Gezogene sind wieder dran. | mittel | (a), (b) gemessen | „Neue Runde“ in das Zahnrad oder mit Abstand/Rückfrage; Meldung „Alle waren dran – neue Runde“. | klein |
| 16 | iPad | Freistehende Widgets · `css/app.css:145` | Bei Lehrer:in, Sprech-/Gedankenblase, Infokasten erscheinen Zahnrad/Mülleimer 52 px *über* dem Widget. Steht es oben am Rand, sind die Knöpfe abgeschnitten (gemessen: 57 px statt ≥ 109 px). | Widget lässt sich nicht löschen/einstellen, bis man es herunterzieht – nicht erkennbar. | mittel | (b) gemessen | Werkzeug unterhalb anzeigen, wenn oben kein Platz ist. | klein |
| 17 | Interface | Kurs-Reiter · `js/kurse.js:29–54`, `css/app.css:42–76` | Umbenennen/Löschen nur durch zweites Antippen des aktiven Reiters (oder Doppeltipp) – nicht entdeckbar. Lange Namen werden auf ~94 px gekürzt („7b Deu…“). Ab 10 Reitern (1180 px) bzw. 8 Reitern (820 px) laufen Reiter ohne sichtbaren Hinweis aus dem Bild. | Lehrkraft findet „Umbenennen“ nicht; Kurse mit gleichem Anfang sind nicht unterscheidbar; ausgeblendete Kurse werden übersehen. | mittel | (a), (b) beobachtet | Kleiner Stift dauerhaft am aktiven Reiter; Schatten/Pfeil am Rand bei Überlauf; aktiven Reiter breiter zeigen. | klein |
| 18 | Interface | Neuer Kurs · `js/kurse.js:138–143` | „+“ legt den Kurs sofort an; „Abbrechen“ im folgenden Dialog lässt „Kurs 10“ trotzdem stehen. | Ungewollte Leerkurse sammeln sich an. | niedrig | (b) beobachtet | Bei „Abbrechen“ den frisch angelegten, leeren Kurs wieder entfernen. | klein |
| 19 | Interface | Namen importieren · `js/widgets/zufall.js:300–304` | Nur „ein Name pro Zeile“. Kommagetrennte Listen werden ein einziger Name; > 60 Namen und > 30 Zeichen werden still abgeschnitten. | Import aus Notenprogramm/Mail klappt nicht auf Anhieb; fehlende Kinder fallen nicht auf. | niedrig | (a) | Auch Komma/Semikolon/Tab trennen; Rückmeldung „26 Namen übernommen“ bzw. „3 zu lang gekürzt“. | klein |
| 20 | iPad | Timer · `js/widgets/timer.js:126–133`, `css/app.css:309–321` | Zeit nur über 8 kleine +/−-Knöpfe (Zehnerminuten-Knöpfe 41×44). 10:00 → 7:30 braucht 6 Tipps; während der Timer läuft, ist nichts verstellbar (auch kein „+1 Minute“). | Unter Zeitdruck viele präzise Tipps; Verlängern heißt Pause → stellen → Start. | mittel | (a), (b) gemessen | Schnellwahl (1/3/5/10/15 min) und „+1 min“ während des Laufs; Ziffern zum Eintippen. | mittel |
| 21 | iPad | Glocke · `js/ton.js`, `js/widgets/timer.js:84–97` | Ton klingt nur, wenn der Kurs des Timers gerade angezeigt wird (das Widget ist sonst zerstört), und erst beim Zurückwechseln (verspätet). AudioContext wird ohne Nutzergeste per `resume()` geweckt – nach App-Wechsel/Unterbrechung kann iOS das verweigern. | Ende der Arbeitsphase bleibt still. | mittel | (a) Kurswechsel; Ton nach Unterbrechung (c) | Timer-Ende global prüfen (nicht im Widget); bei jeder Berührung Audio erneut freischalten. | mittel |
| 22 | Interface | Projektion/Lage · `js/tafel.js:42–54` | Lage und Größe in absoluten Pixeln. Am Laptop (1366 px) angelegte Tafeln werden am iPad (1180 px) nur an den Rand gedrückt, Widgets stapeln sich rechts. Neue Widgets landen mittig über bestehenden (Zufall überdeckte den Timer). | Tafel sieht je nach Gerät anders/unordentlich aus. | mittel | (a), (b) beobachtet | Lage relativ zur Tafel speichern (Prozent) oder beim Einpassen proportional skalieren; neue Widgets an freie Stelle. | groß |
| 23 | iPad | Text-Leiste, Folien-/To-Do-Dialog · `css/app.css:422`, `:536`, `:635` | Touch-Ziele unter 44 pt: Formatknöpfe F/K/U 34–37×40, Werkzeugknöpfe 40×40, ↑/↓/Stift/Mülleimer 40×40 mit 4 px Abstand, Farbkästchen 40×40. | Fehltipps, besonders Mülleimer neben Stift (Folie/Aufgabe löschen). | mittel | (b) gemessen | Einheitlich 44×44, Löschen-Knopf abgesetzt. | klein |
| 24 | iPad | Gesten · `css/app.css:7–9`, `index.html:5` | Pinch-Zoom und Doppeltipp-Zoom sind auf der leeren Tafelfläche nicht abgeschaltet (`touch-action` nur an Widgets/Knöpfen). Randwischen von links kann in Safari „Zurück“ auslösen und die Seite verlassen. | Versehentlich gezoomte Tafel; Seite weg (Daten bleiben, aber Hektik). | mittel | (c) | `.tafel { touch-action: none }` bzw. `manipulation` für die ganze App; Nutzung als Home-Bildschirm-App empfehlen (keine Zurück-Geste). | klein |
| 25 | iPad | Dialoge mit Tastatur · `css/app.css:223–232` | Dialog nutzt `92dvh`; die iPad-Tastatur verkleinert `dvh` nicht. Bei „Namen bearbeiten“ (Feld 280 px hoch) liegen „Fertig/Abbrechen“ evtl. unter der Tastatur. | Lehrkraft findet „Fertig“ nicht, schließt Tastatur erst. | niedrig | (c) | Knöpfe oben in den Dialog oder `visualViewport` nutzen; Textfeld niedriger. | klein |
| 26 | Interface | Sprache/Benennung · `js/widgets/stundenplan.js:26`, `README.md:16` | „To-Do“ mit Kalender-Icon (Code-Name „Stundenplan“); Leiste in Großbuchstaben-Mono 13 px; Gruppen-Zahnrad ohne Text (bewusst); „Fertig“/„OK“/„Auf die Tafel“ wechseln. | Leichte Verwirrung, welches Widget wofür ist. | niedrig | (a) | Einheitliche Namen („Aufgaben“ statt „To-Do“), Icon passend; Hauptknopf überall „Fertig“. | klein |
| 27 | Interface | Kopfzeile · `css/components.css:126–131` | Aktiver Kurs steht zusätzlich nur in 13-px-Label „KLASSENZIMMER // KURS 2“. | Für die Klasse ist der Kurs (bei gekürztem Reiter) kaum erkennbar. | niedrig | (b) gemessen | Kursname im Label größer oder ausblendbar machen. | klein |
| 28 | iPad | Leistung · `js/tafel.js:163–170`, `js/speicher.js:61–75` | Jedes Antippen eines hinteren Widgets speichert den ganzen Zustand (inkl. aller Bilder als Base64) synchron. Gemessen am PC mit 3 MB Bild: ~12 ms, am iPad vermutlich mehrfach. | Bei vielen Bildern ruckelt Antippen/Ziehen. | niedrig | (b) PC gemessen; iPad (c) | `nachVorn` ohne Speichern oder verzögert speichern; Bilder später in IndexedDB. | mittel |
| 29 | Interface | CSS · `css/components.css:289` | Verirrtes `&` vor `.btn--small`. Moderne Browser lesen es als `& .btn--small`, ältere Safari (vor 17.2) verwerfen die Regel → kleine Knöpfe werden dort 48 px groß. | Uneinheitliches Aussehen auf älteren iPads. | niedrig | (a), (b) Regel heißt im Browser `& .btn--small` | Zeichen entfernen. | klein |
| 30 | Interface | Wiederherstellen · `js/app.js:68–79` | „Sicherung laden“ ersetzt alles (mit guter Rückfrage), legt aber vorher keine automatische Kopie des aktuellen Stands an. | Falsche Datei gewählt → heutiger Stand weg. | niedrig | (a) | Vor dem Ersetzen den alten Stand in `tafel.v1.vorher` ablegen, „Letzten Stand zurückholen“ anbieten. | klein |

---

## 3. Ergebnisse der Aufgabenszenarien

Gezählt sind Fingertipps ab der leeren Tafel, ohne Tippen von Text.

### 3.1 Stundenbeginn: Kurs wechseln, Timer 7:30, Start — **mit Problemen**
Schritte: Reiter antippen (1) → „Timer“ in der Leiste (1) → Minuten-Einer − ×3 (3) → Zehnsekunden + ×3 (3) → Start (1) = **9 Tipps**, mit vorhandenem Timer 7.
Stolperstellen: Kein Direkteingeben/keine Schnellwahl. Zehnerminuten-Knöpfe nur 41 px breit. Neues Widget kann ein bestehendes überdecken. Während des Laufs nicht verstellbar (Nr. 20). Bildschirm-Sperre (Nr. 1). Ziffern sind mit ~89 px gut lesbar.

### 3.2 Gruppen à 4, zwei Abwesende, neu mischen — **mit Problemen**
Schritte (Zufall-Widget vorhanden, Namen eingetragen): „Liste“ (1) → 2 Namen antippen (2) → „Gruppen“ (1) → „Personen pro Gruppe“ (1) → 4 ist voreingestellt (0) → „Einteilen“ (1) = **6 Tipps**. Neu mischen = erneut „Einteilen“ (1).
Ergebnis: 24 Anwesende → 6 Gruppen à 4, korrekt. Stolperstellen: nur ~2 Gruppen sichtbar, Rest scrollen; Namen 16 px (Nr. 8). Abwesende nach dem Einteilen → Gruppe still zu klein (Nr. 14). Es gibt keinen eigenen Knopf „Neu mischen“, man muss wissen, dass „Einteilen“ das tut.

### 3.3 Schüler ziehen, ohne Wiederholung weitermachen — **bestanden**
1 Tipp pro Ziehung. „Jede:r nur einmal“ ist Standard; 24 Ziehungen ergaben 24 verschiedene Namen, „Noch 23 von 24“ zählt sichtbar herunter. Der gezogene Name ist mit ~62 px gut lesbar. Stolperstellen: „Neue Runde“ direkt neben „Ziehen“ ohne Rückfrage (Nr. 15); die Einstellung „nur einmal“ steckt unbeschriftet im Zahnrad.

### 3.4 Folien erstellen, durchklicken, Seite anspringen, Vollbild — **nicht bestanden**
Erstellen: Folien-Widget (1) → „Folien hinzufügen“ (1) → „Text-Folie hinzufügen“ (1) → Felder → „Fertig“ (1), je weitere Folie +2 → „Fertig“ (1). Bild-Folien über „Bilder hinzufügen“ (Dateiauswahl konnte ich nicht automatisch bedienen, nur Code gelesen: Mehrfachauswahl, Verkleinerung auf 1600 px, Speicher-voll-Schutz – gut).
Durchklicken: Pfeile (68 px) und Zähler funktionieren. **Seite anspringen geht nicht** (Nr. 11). Wischen verschiebt das Widget statt zu blättern (Nr. 9). Vollbild betrifft die ganze Seite, Knopf zeigt den Zustand nicht (Nr. 12).

### 3.5 Neuen Kurs anlegen, umbenennen, Namensliste importieren — **mit Problemen**
Kurs: „+“ (1) → Name tippen → „Fertig“ (1) = **2 Tipps**, gut gelöst (Dialog öffnet sofort). „Abbrechen“ hinterlässt trotzdem einen Kurs (Nr. 18). Späteres Umbenennen ist schwer zu finden (Nr. 17).
Namen: Zufall-Widget (1) → „Liste“ (1) → „Namen bearbeiten“ (1) → einfügen → „Fertig“ (1) = **4 Tipps**. Nur zeilenweise Listen, keine Rückmeldung über die Anzahl (Nr. 19). Datenschutz-Hinweis im Dialog ist vorbildlich.

### 3.6 Widgets verschieben, Größe ändern, löschen — **mit Problemen**
Verschieben: antippen und ziehen (funktioniert sofort). Größe: erst antippen, dann an einer Ecke ziehen (Ecken 20 px, Trefferfläche 48 px – gut). Löschen: antippen (1) → Mülleimer (1).
Stolperstellen: Werkzeug erst nach Antippen sichtbar (lernbar, aber nicht offensichtlich). Zittern verschiebt (Nr. 10). Bei freistehenden Widgets am oberen Rand ist der Mülleimer unerreichbar (Nr. 16).

### 3.7 Sicherung speichern und laden — **mit Problemen**
Speichern: „Sicherung“ (1) → „Sicherung speichern“ (1) = **2 Tipps**; Dateiname mit Datum. Keine Erfolgsmeldung, Datum wird auch bei Abbruch gesetzt (Nr. 6). Im Hochformat ist der Knopf nicht sichtbar (Nr. 7).
Laden: „Sicherung“ (1) → „Sicherung laden“ (1) → Datei wählen → „Ja, ersetzen“ (1). Ungültige Datei wird sauber abgelehnt („Das hat nicht geklappt“), gültige angenommen. Gute Rückfrage vor dem Ersetzen.

### 3.8 Fehlbedienung: Löschen, Verschieben, Abbrechen, Rückgängig — **nicht bestanden**
- Widget löschen: sofort weg, keine Rückfrage, kein Rückgängig (Nr. 2, 3).
- Namensliste leeren: ohne Rückfrage (Nr. 4).
- Kurs löschen: Rückfrage mit Kursname und „lässt sich nicht rückgängig machen“ – gut; der letzte Kurs ist geschützt.
- Versehentlich verschoben: kein Rückgängig (Nr. 10).
- Abbrechen: in allen Bearbeiten-Dialogen (Folien, To-Do, Namen, Paare, Einstellungen) wird mit einer Arbeitskopie gearbeitet – „Abbrechen“ verwirft wirklich alles. Sehr gut. Ausnahme: „+“ neuer Kurs (Nr. 18).
- Ein allgemeines Rückgängig (Strg+Z / Knopf) gibt es nicht.

---

## 4. Was gut funktioniert (bitte beibehalten)

- **Arbeitskopie in Dialogen:** Erst „Fertig“ speichert, „Abbrechen“ und Esc verwerfen zuverlässig.
- **Timer mit Zeitstempeln:** Die Zeit läuft beim Kurswechsel und bei gesperrtem Bildschirm korrekt weiter.
- **Große, gut lesbare Hauptanzeigen:** Timer-Ziffern, Uhr und gezogener Name skalieren mit der Widgetgröße (`cqh/cqw`).
- **„Jede:r nur einmal“ als Standard** mit sichtbarem Zähler „Noch X von Y“, und die Ziehliste bleibt über Stunden erhalten.
- **Gruppen-Algorithmus:** gleich große Gruppen (±1), „Nicht zusammen“-Paare, klare Meldung, wenn es nicht aufgeht.
- **„Fehlt heute“** verfällt automatisch um Mitternacht, kein Aufräumen nötig.
- **Rückfragen bei Kurs löschen und Sicherung laden**, mit Klartext, was verloren geht. Letzter Kurs nicht löschbar.
- **Leere Zustände sind durchweg gut:** neue Tafel („Tippe unten auf ein Widget …“), Zufall ohne Namen („Trage sie unter ‚Liste‘ ein“), Folien und To-Do mit großem Startknopf.
- **Datensicherheit:** Prüfung von Sicherungsdateien, Text-Säuberung, nur `data:image`, kaputter Speicherstand wird beiseitegelegt statt überschrieben, „Speicher voll“ nimmt das letzte Bild zurück.
- **iPad-Grundlagen:** `100dvh`, Safe Area unten, `touch-action: manipulation` an Knöpfen, `user-select: none` und `-webkit-touch-callout: none` an Widgets (keine Lupe/Textauswahl beim Ziehen), Ecken-Trefferfläche 48 px, Reiter 52 px hoch, Hauptknöpfe 48 px.
- **Nichts ist nur per Hover erreichbar.** Hover-Effekte und `title`-Tooltips sind reine Zusatzinfos; die Sicherungs-Erinnerung steht auch im Dialog.
- **Glocke ohne Audiodatei** und Freischalten bei der ersten Berührung; `audioSession.type = "playback"` spielt auch bei Stummschalter (iOS 17+).
- **Offline-Betrieb** über `sw.js` mit sauberem Nachladen neuer Fassungen; Vollbild-Knopf wird ausgeblendet, wo die API fehlt.
- **Kontraste** der Palette sind geprüft und dokumentiert (AA erfüllt; einzige knappe Stelle Petrol auf Sonne 40 % mit 4,59 : 1).

---

## 5. Empfohlene Reihenfolge der Behebung

**Quick Wins (je unter einer Stunde, großer Nutzen):**
1. Wake Lock beim laufenden Timer (Nr. 1).
2. Mülleimer von „−“ und Zahnrad absetzen, Werkzeugknöpfe 44×44 (Nr. 3, 23).
3. Rückfrage beim Leeren der Namensliste (Nr. 4).
4. Leiste im Hochformat umbrechen/verkleinern (Nr. 7).
5. Sicherungs-Erinnerung auf 6 Tage, `storage.persist()`, Hinweis „Home-Bildschirm-App nutzen“ (Nr. 5).
6. Ziehen erst ab 8 px Bewegung (Nr. 10).
7. Verirrtes `&` in `components.css` entfernen (Nr. 29); „Abbrechen“ bei neuem Kurs räumt auf (Nr. 18); Vollbild-Knopf zeigt Zustand (Teil von Nr. 12).

**Danach (mittlerer Aufwand, hoher Nutzen):**
8. Rückgängig-Leiste nach dem Löschen eines Widgets (Nr. 2).
9. Erfolgsmeldung bzw. Teilen-Blatt für die Sicherung (Nr. 6).
10. Gruppen projektionstauglich: große Schrift, Bedienleiste einklappbar, Hinweis bei geänderter Anwesenheit (Nr. 8, 14).
11. Folien: Wischen blättert, Folienübersicht zum Anspringen, „Folie groß“ (Nr. 9, 11, 12, 13).
12. Timer: Schnellwahl und „+1 min“ (Nr. 20); Glocke unabhängig vom angezeigten Kurs (Nr. 21).

**Später:**
13. Freistehende Widgets: Werkzeug unten, wenn oben kein Platz (Nr. 16); Reiter-Überlauf und Umbenennen sichtbar machen (Nr. 17).
14. Relative Widget-Lagen für verschiedene Geräte (Nr. 22); Bilder in IndexedDB (Nr. 28).

---

## 6. Checkliste für den Test am echten iPad

Am besten einmal in **Safari** und einmal als **Home-Bildschirm-App**, mit Beamer/Apple TV verbunden.

- [ ] **Auto-Sperre** auf 2 Minuten stellen, Timer 5:00 starten, iPad nicht berühren: Geht der Bildschirm aus? (Nr. 1)
- [ ] **Glocke:** Timer 0:10 starten, Stummschalter an, Lautstärke mittel: Ist die Glocke im Raum hörbar? Einmal zu einer anderen App wechseln und zurück, dann erneut testen. (Nr. 21)
- [ ] **Glocke bei Kurswechsel:** Timer starten, anderen Kurs-Reiter öffnen: Klingt es? (Nr. 21)
- [ ] **Mülleimer/Einklappen:** Mit dem Daumen zehnmal schnell auf „−“ tippen: Wird je ein Widget gelöscht? (Nr. 3)
- [ ] **Hochformat:** iPad drehen: Sind „Vollbild“ und „Sicherung“ erreichbar? Lässt sich die Leiste wischen? (Nr. 7)
- [ ] **Folie wischen:** Auf einer Folie nach links wischen: Blättert sie oder rutscht das Fenster? (Nr. 9)
- [ ] **Antippen ohne Bewegung:** Fünfmal auf ein Widget tippen: Verschiebt es sich? (Nr. 10)
- [ ] **Pinch und Doppeltipp** auf leerer Tafelfläche: Zoomt Safari die Seite? (Nr. 24)
- [ ] **Randwischen** vom linken Bildschirmrand in Safari: Verlässt die Seite die Tafel? (Nr. 24)
- [ ] **Langdruck** auf Widget-Titel, Leiste und Gruppenkarte: Erscheinen Lupe, Textauswahl oder Kontextmenü?
- [ ] **Tastatur:** „Namen bearbeiten“ öffnen und tippen: Sind „Fertig“ und „Abbrechen“ sichtbar? Gleiches beim Kursnamen. (Nr. 25)
- [ ] **Vollbild** in Safari an und aus: Funktioniert es, wie kommt man zurück, verdeckt das Safari-„X“ etwas? Als Home-Bildschirm-App: Ist der Knopf weg? (Nr. 12)
- [ ] **Sicherung speichern:** Wo landet die Datei (Safari vs. App)? Abbrechen im Dialog: Verschwindet das gelbe „!“ trotzdem? (Nr. 6)
- [ ] **Sicherung laden** aus „Dateien“ in der Home-Bildschirm-App.
- [ ] **Offline:** Flugmodus an, App öffnen: Startet sie vollständig (Schriften, Icons, Lehrer:in)?
- [ ] **Speicher:** 15 Fotos als Folien laden: Ab wann kommt „Speicher voll“? Ruckelt das Antippen/Ziehen danach? (Nr. 28)
- [ ] **Lesbarkeit:** An die Tafel projizieren, aus 8 m prüfen: Gruppenkarten, Folientext, Zähler, Kursname, Timer. (Nr. 8, 13, 27)
- [ ] **Projektion 16:9:** Bei Spiegelung auf einen 16:9-Beamer: Schwarze Ränder? Bei externem Bildschirm (falls Stage Manager): Passt die Tafel, liegen Widgets richtig? (Nr. 22)
- [ ] **Safe Areas:** Im Querformat mit Home-Balken: Ist die untere Leiste frei bedienbar?
