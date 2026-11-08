/* ============================================================
   PLATZHALTER – Widgets, die noch nicht gebaut sind.
   Jede Phase ersetzt ihren Eintrag durch eine eigene Datei in js/widgets/.
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  [
    ["bild", "Bild", "bild", 4, 480, 360],
    ["text", "Text", "text", 4, 480, 280],
    ["stundenplan", "Stundenplan", "kalender", 5, 720, 480],
    ["folien", "Folien", "folien", 4, 720, 520]
  ].forEach(function (p) {
    T.registriere(p[0], {
      titel: p[1], icon: p[2], groesse: { b: p[4], h: p[5] },
      erstelle: function (el) {
        el.innerHTML = '<p class="platzhalter">Kommt in Phase ' + p[3] + "</p>";
      }
    });
  });
})();
