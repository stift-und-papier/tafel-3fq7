/* ============================================================
   LEHRER:IN – frei stehende Pixel-Figur ohne Fenster.
   Beim Hinzufügen wählst du die Stimmung, danach steht nur das Bild
   (durchsichtiger Hintergrund) auf der Tafel. Antippen zeigt den Mülleimer.
   Die Liste der Stimmungen kommt aus assets/teacher/teacher.js.
   Größe: immer ganzzahlig vergrößert, auch in echten Bildschirmpunkten
   (devicePixelRatio), damit alle Pixel gleich groß und scharf sind.
   daten: { emotion: "<id>" }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel, L = T.lehrerin, ORDNER = "assets/teacher/";
  if (!L) return;

  T.registriere("lehrerin", {
    titel: "Lehrer:in", icon: "herz", frei: true,
    groesse: { b: L.breite * 3, h: L.hoehe * 3 }, min: { b: L.breite * 2, h: L.hoehe * 2 },   // mindestens 2-fach

    // Stimmung auswählen, bevor die Figur auf die Tafel kommt
    vorher: function () {
      var f = document.createElement("fieldset");
      f.className = "choice lehrerin__auswahl";
      f.innerHTML = '<legend class="feld-label">Welche Stimmung?</legend>';
      L.emotionen.forEach(function (e, i) {
        var l = document.createElement("label");
        l.innerHTML = '<input type="radio" name="lehrerin-stimmung"><span><img class="pixel" width="' + L.breite +
          '" height="' + L.hoehe + '" alt=""><b></b></span>';
        var input = l.querySelector("input");
        input.value = e.id;
        input.checked = i === 0;
        l.querySelector("img").src = ORDNER + e.datei;
        l.querySelector("b").textContent = e.name;
        f.appendChild(l);
      });
      return T.dialog({
        titel: "Lehrer:in", icon: "herz", inhalt: f,
        knoepfe: [{ text: "Auf die Tafel", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }]
      }).then(function (w) {
        return w === "ok" ? { emotion: f.querySelector("input:checked").value } : null;
      });
    },

    erstelle: function (el, d) {
      var e = L.emotionen.filter(function (x) { return x.id === d.emotion; })[0] || L.emotionen[0];
      el.innerHTML = '<div class="lehrerin"><div class="lehrerin__figur"><img class="pixel" alt=""></div></div>';
      var buehne = el.firstChild, figur = buehne.firstChild, bild = figur.firstChild;
      bild.src = ORDNER + e.datei;
      bild.alt = "Lehrerin: " + e.alt;

      // kleine Pixel-Sprites (Herz, !, ?) – reine Deko
      var sprites = (e.sprites || []).map(function (s) {
        var img = document.createElement("img");
        img.className = "pixel lehrerin__sprite";
        img.src = "assets/deko/" + s.bild + ".svg";
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.onload = groesse;
        figur.appendChild(img);
        return { el: img, x: s.x, y: s.y };
      });

      // Größte ganzzahlige Vergrößerung, die hineinpasst – gerechnet in Gerätepixeln
      function groesse() {
        var dpr = window.devicePixelRatio || 1;
        var k = Math.floor(Math.min(buehne.clientWidth * dpr / L.breite, buehne.clientHeight * dpr / L.hoehe));
        k = Math.max(Math.round(dpr), k);   // nie kleiner als 1 Figurpixel = 1 CSS-Pixel
        var p = k / dpr;                     // ein Figurpixel in CSS-Pixeln
        figur.style.width = L.breite * p + "px";
        figur.style.height = L.hoehe * p + "px";
        sprites.forEach(function (s) {
          s.el.style.left = s.x * p + "px";
          s.el.style.top = s.y * p + "px";
          if (s.el.naturalWidth) { s.el.style.width = s.el.naturalWidth * p + "px"; s.el.style.height = s.el.naturalHeight * p + "px"; }
        });
      }
      var ro = new ResizeObserver(groesse);
      ro.observe(buehne);

      return { entferne: function () { ro.disconnect(); } };
    }
  });
})();
