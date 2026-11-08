/* ============================================================
   TAFEL – zeigt die Widgets des aktiven Kurses.
   Verschieben: irgendwo aufs Widget tippen und ziehen (nicht auf Knöpfe/Felder).
   Größe: an den vier Ecken ziehen. Auswahl zeigt Ecken und Werkzeugleiste.

   Ein Widget-Typ meldet sich mit Tafel.registriere(typ, art) an:
   art = { titel, icon, frei?, vorher()?, groesse: {b, h}, min: {b, h},
           erstelle(inhaltEl, daten, speichere) → optional { entferne(), einstellungen() } }
   „daten“ ist das gespeicherte Objekt des Widgets: ändern, dann speichere() aufrufen.
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var RASTER = 4;   // = --px in tokens.css: Lage und Größe rasten auf dem Pixel-Raster ein
  var tafel = document.getElementById("tafel");
  var leer = document.getElementById("tafel-leer");
  var instanzen = {};   // Widget-ID → Rückgabe von erstelle()
  var zug = null;       // laufendes Ziehen

  T.widgets = {};
  T.widgetReihenfolge = ["zufall", "bild", "text", "timer", "uhr", "stundenplan", "folien", "lehrerin"];   // Reihenfolge in der Leiste
  T.registriere = function (typ, art) { T.widgets[typ] = art; };

  var UNBEKANNT = {
    titel: "Unbekannt", icon: "info",
    erstelle: function (el) { el.textContent = "Dieses Widget kennt die App nicht."; }
  };

  function raste(v) { return Math.round(v / RASTER) * RASTER; }
  function kurs() { return T.aktiverKurs(); }
  function art(w) { return T.widgets[w.typ] || UNBEKANNT; }
  function mindest(w) { return art(w).min || { b: 200, h: 160 }; }
  function daten(id) { return kurs().widgets.filter(function (w) { return w.id === id; })[0]; }
  function elVon(id) {
    return Array.prototype.filter.call(tafel.querySelectorAll(".widget"), function (el) { return el.dataset.id === id; })[0];
  }

  // Sichtbare Lage: passt das Widget in die Tafel ein (am iPad ist sie kleiner als am Beamer).
  // Die gespeicherten Werte bleiben, bis das Widget bewegt wird.
  function passeEin(w) {
    var B = tafel.clientWidth, H = tafel.clientHeight;
    var b = Math.min(w.b, B), h = Math.min(w.h, H);
    return { x: Math.max(0, Math.min(w.x, B - b)), y: Math.max(0, Math.min(w.y, H - h)), b: b, h: h };
  }
  function setzeLage(el, w) {
    var l = passeEin(w);
    el.style.left = l.x + "px";
    el.style.top = l.y + "px";
    el.style.width = l.b + "px";
    el.style.height = l.h + "px";
  }

  function baue(w, z) {
    var a = art(w);
    var el = document.createElement("section");
    el.dataset.id = w.id;
    el.style.zIndex = z;
    el.setAttribute("aria-label", a.titel);
    var ecken = '<span class="widget__ecke" data-ecke="nw"></span><span class="widget__ecke" data-ecke="ne"></span>' +
      '<span class="widget__ecke" data-ecke="sw"></span><span class="widget__ecke" data-ecke="se"></span>';
    if (a.frei) {
      // frei stehend (Lehrer:in): kein Fenster, nur Inhalt und Werkzeug beim Antippen
      el.className = "widget widget--frei";
      el.innerHTML = '<div class="widget__werkzeug"></div><div class="widget__inhalt"></div>' + ecken;
    } else {
      el.className = "widget window";
      el.innerHTML =
        '<div class="window__titlebar"><h2 class="window__title">' + T.icon(a.icon, 14) + '<span></span></h2>' +
        '<div class="window__tools"><div class="widget__werkzeug"></div>' +
        '<div class="window__buttons" aria-hidden="true"><i></i><i></i><i></i></div></div></div>' +
        '<div class="widget__inhalt"></div>' + ecken;
      el.querySelector(".window__title span").textContent = a.titel;
    }
    tafel.appendChild(el);
    setzeLage(el, w);
    var inst = a.erstelle(el.querySelector(".widget__inhalt"), w.daten, T.speichere) || {};
    instanzen[w.id] = inst;
    var wz = el.querySelector(".widget__werkzeug");
    if (inst.einstellungen) wz.appendChild(T.iconKnopf("zahnrad", "Einstellungen", inst.einstellungen));
    wz.appendChild(T.iconKnopf("muell", "Widget löschen", function () { entferne(w.id); }));
  }

  function leerHinweis() { leer.hidden = kurs().widgets.length > 0; }

  function waehle(id) {
    tafel.querySelectorAll(".widget").forEach(function (el) { el.classList.toggle("is-ausgewaehlt", el.dataset.id === id); });
  }

  // Angetipptes Widget nach vorn holen: Reihenfolge in den Daten = Stapelreihenfolge
  function nachVorn(w) {
    var liste = kurs().widgets;
    if (liste[liste.length - 1] === w) return;
    liste.splice(liste.indexOf(w), 1);
    liste.push(w);
    liste.forEach(function (x, i) { elVon(x.id).style.zIndex = i + 1; });
    T.speichere();
  }

  function entferne(id) {
    var inst = instanzen[id];
    if (inst && inst.entferne) inst.entferne();
    delete instanzen[id];
    var k = kurs();
    k.widgets = k.widgets.filter(function (w) { return w.id !== id; });
    elVon(id).remove();
    T.speichere();
    leerHinweis();
  }

  T.zeigeTafel = function () {
    Object.keys(instanzen).forEach(function (id) { if (instanzen[id].entferne) instanzen[id].entferne(); });
    instanzen = {};
    tafel.querySelectorAll(".widget").forEach(function (el) { el.remove(); });
    kurs().widgets.forEach(function (w, i) { baue(w, i + 1); });
    leerHinweis();
  };

  // art.vorher() darf vorher etwas abfragen (z. B. die Stimmung) → Promise mit Startdaten oder null = abbrechen
  T.fuegeHinzu = function (typ) {
    var a = T.widgets[typ];
    if (!a.vorher) return lege(typ, {});
    a.vorher().then(function (d) { if (d) lege(typ, d); });
  };
  function lege(typ, startDaten) {
    var a = T.widgets[typ], k = kurs();
    var versatz = (k.widgets.length % 5) * 8 * RASTER;   // neue Widgets leicht versetzt, damit sie sich nicht verdecken
    var w = {
      id: T.neueId(), typ: typ, daten: startDaten,
      x: raste((tafel.clientWidth - a.groesse.b) / 2 - 64 + versatz),
      y: raste((tafel.clientHeight - a.groesse.h) / 2 - 64 + versatz),
      b: a.groesse.b, h: a.groesse.h
    };
    var l = passeEin(w);
    w.x = l.x; w.y = l.y; w.b = l.b; w.h = l.h;
    k.widgets.push(w);
    T.speichere();
    baue(w, k.widgets.length);
    waehle(w.id);
    leerHinweis();
  }

  // Eine Achse beim Größe-Ändern: vorn = linke/obere Kante wird gezogen
  function achse(start, groesse, d, vorn, min, max) {
    if (vorn) {
      var ende = start + groesse;
      var s = Math.max(0, Math.min(raste(start + d), ende - min));
      return [s, ende - s];
    }
    return [start, Math.max(min, Math.min(raste(groesse + d), max - start))];
  }

  tafel.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".widget");
    if (!el) { waehle(null); return; }
    var w = daten(el.dataset.id);
    waehle(w.id);
    nachVorn(w);
    var ecke = e.target.closest(".widget__ecke");
    if (!ecke && e.target.closest("button, input, textarea, select, a, label, [contenteditable], .kein-ziehen")) return;
    if (e.button > 0) return;
    zug = { el: el, w: w, ecke: ecke ? ecke.dataset.ecke : null, sx: e.clientX, sy: e.clientY, start: passeEin(w), bewegt: false };
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  tafel.addEventListener("pointermove", function (e) {
    if (!zug) return;
    var dx = e.clientX - zug.sx, dy = e.clientY - zug.sy, s = zug.start, w = zug.w;
    var B = tafel.clientWidth, H = tafel.clientHeight;
    if (!zug.ecke) {
      w.x = Math.max(0, Math.min(raste(s.x + dx), B - s.b));
      w.y = Math.max(0, Math.min(raste(s.y + dy), H - s.h));
      w.b = s.b; w.h = s.h;
    } else {
      var m = mindest(w);
      var x = achse(s.x, s.b, dx, zug.ecke[1] === "w", m.b, B);
      var y = achse(s.y, s.h, dy, zug.ecke[0] === "n", m.h, H);
      w.x = x[0]; w.b = x[1]; w.y = y[0]; w.h = y[1];
    }
    zug.bewegt = true;
    setzeLage(zug.el, w);
  });

  function zugEnde() {
    if (zug && zug.bewegt) T.speichere();
    zug = null;
  }
  tafel.addEventListener("pointerup", zugEnde);
  tafel.addEventListener("pointercancel", zugEnde);

  window.addEventListener("resize", function () {
    kurs().widgets.forEach(function (w) { setzeLage(elVon(w.id), w); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !document.querySelector("dialog[open]")) waehle(null);
  });
})();
