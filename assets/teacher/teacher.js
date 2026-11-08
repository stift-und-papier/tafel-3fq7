/* ============================================================
   LEHRER:IN-FIGUR – Liste aller Emotionen für das Widget „Lehrer:in“.
   Jede Emotion ist ein fertiges Einzelbild: 84 × 160 Pixel,
   durchsichtiger Hintergrund, Figur an derselben Stelle.
   Neue Emotion: Bild „lehrerin-<name>.png“ in diesen Ordner legen
   und hier eine Zeile ergänzen. Sonst muss nichts geändert werden.
   sprites (freiwillig): kleine Deko aus assets/deko, x/y in Figur-Pixeln (oben links).
   (Eine JS-Datei statt JSON, damit es auch per Doppelklick auf index.html läuft.)
   ============================================================ */
window.Tafel = window.Tafel || {};
window.Tafel.lehrerin = {
  breite: 84,
  hoehe: 160,
  emotionen: [
    { id: "winkend",      datei: "lehrerin-winkend.png",      name: "Winkend",      alt: "lächelt und winkt mit der rechten Hand", sprites: [{ bild: "ausrufe", x: 8, y: 10 }, { bild: "herz", x: 70, y: 14 }] },
    { id: "veraergert",   datei: "lehrerin-veraergert.png",   name: "Verärgert",    alt: "schaut streng und hat die Arme verschränkt", sprites: [{ bild: "ausrufe", x: 8, y: 6 }, { bild: "ausrufe", x: 14, y: 4 }] },
    { id: "besorgt",      datei: "lehrerin-besorgt.png",      name: "Besorgt",      alt: "schaut besorgt und hat die Arme verschränkt", sprites: [{ bild: "ausrufe", x: 74, y: 6 }] },
    { id: "nachdenklich", datei: "lehrerin-nachdenklich.png", name: "Nachdenklich", alt: "legt die Hand ans Kinn und überlegt", sprites: [{ bild: "frage", x: 72, y: 2 }] },
    { id: "ruhig",        datei: "lehrerin-ruhig.png",        name: "Ruhig",        alt: "steht entspannt mit geschlossenen Augen da" },
    { id: "erzaehlend",   datei: "lehrerin-erzaehlend.png",   name: "Erzählend",    alt: "zeigt zur Seite und erzählt etwas" },
    { id: "psst",         datei: "lehrerin-psst.png",         name: "Psst!",        alt: "legt den Finger an den Mund" },
    { id: "muede",        datei: "lehrerin-muede.png",        name: "Müde",         alt: "stützt die Wange in die Hand und schließt die Augen" }
  ]
};
