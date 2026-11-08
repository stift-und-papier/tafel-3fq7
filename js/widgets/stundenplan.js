/* ============================================================
   TO-DO – Aufgaben als Liste (Typ heißt weiter „stundenplan“, damit gespeicherte Fenster bleiben).
   Kästchen antippen = abhaken, nochmal antippen = Haken weg (Reihenfolge egal).
   Text antippen = „gerade dran“ (hervorgehoben).
   Zahnrad: Aufgaben eintragen, Farbe wählen, sortieren, löschen.
   daten: { schritte: [{ id, text, farbe, fertig }], jetzt: id | null }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  // Farbstreifen links an der Aufgabe, nur Palettenfarben (CSS: [data-farbe])
  var FARBEN = [["teal", "Türkis"], ["sage", "Salbei"], ["sun", "Sonne"], ["orange", "Orange"], ["coral", "Koralle"], ["petrol", "Petrol"]];
  var FARB_IDS = FARBEN.map(function (f) { return f[0]; });
  function knopf(klasse, html, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = klasse;
    b.innerHTML = html;
    if (label) { b.title = label; b.setAttribute("aria-label", label); }
    return b;
  }
  function gueltig(s) { return s && typeof s.id === "string" && typeof s.text === "string"; }

  T.registriere("stundenplan", {
    titel: "To-Do", icon: "kalender", farbwahl: true, groesse: { b: 520, h: 520 }, min: { b: 280, h: 200 },
    erstelle: function (el, d, speichere) {
      if (!Array.isArray(d.schritte)) d.schritte = [];
      d.schritte = d.schritte.filter(gueltig);
      d.schritte.forEach(function (s) { if (FARB_IDS.indexOf(s.farbe) < 0) s.farbe = "teal"; s.fertig = !!s.fertig; });
      if (!d.schritte.some(function (s) { return s.id === d.jetzt; })) d.jetzt = null;

      el.innerHTML = '<div class="ablauf"><ol class="rows ablauf__liste kein-ziehen"></ol></div>';
      var ol = el.querySelector("ol");

      function zeige() {
        ol.textContent = "";
        if (!d.schritte.length) {
          var leer = document.createElement("li");
          leer.className = "ablauf__leer";
          leer.innerHTML = "<p>Noch keine Aufgaben.</p>";
          var los = knopf("btn btn--primary", T.icon("kalender", 28) + "Aufgaben eintragen");
          los.addEventListener("click", bearbeite);
          leer.appendChild(los);
          ol.appendChild(leer);
          return;
        }
        d.schritte.forEach(function (s, i) {
          var li = document.createElement("li");
          li.className = "row ablauf__schritt" + (s.id === d.jetzt ? " is-jetzt" : "") + (s.fertig ? " is-fertig" : "");
          li.dataset.farbe = s.farbe;
          var haken = knopf("ablauf__haken", s.fertig ? "✓" : "", "Aufgabe " + (i + 1) + " abhaken");
          haken.setAttribute("aria-pressed", s.fertig);
          haken.addEventListener("click", function () {
            s.fertig = !s.fertig;
            if (s.fertig && d.jetzt === s.id) d.jetzt = null;
            speichere();
            zeige();
          });
          var text = knopf("ablauf__text", "");
          text.textContent = s.text;
          if (s.id === d.jetzt) text.setAttribute("aria-current", "step");
          text.addEventListener("click", function () {
            d.jetzt = d.jetzt === s.id ? null : s.id;
            speichere();
            zeige();
          });
          li.append(haken, text);
          ol.appendChild(li);
        });
      }

      // ---------- Aufgaben bearbeiten (Arbeitskopie, erst „Fertig“ speichert) ----------
      function bearbeite() {
        var neu = d.schritte.map(function (s) { return { id: s.id, text: s.text, farbe: s.farbe, fertig: s.fertig }; });
        var box = document.createElement("div");
        box.innerHTML = '<ol class="rows ablauf__bearbeiten"></ol>';
        var liste = box.querySelector("ol");
        var dazu = knopf("btn", "Aufgabe hinzufügen");
        box.appendChild(dazu);
        dazu.addEventListener("click", function () {
          var vorher = neu[neu.length - 1];
          // Vorschlag: nächste Farbe nach der letzten, damit Nachbarn sich unterscheiden
          var farbe = vorher ? FARB_IDS[(FARB_IDS.indexOf(vorher.farbe) + 1) % FARB_IDS.length] : FARB_IDS[0];
          neu.push({ id: T.neueId(), text: "", farbe: farbe, fertig: false });
          male();
          var felder = liste.querySelectorAll("input");
          felder[felder.length - 1].focus();
        });

        function verschiebe(i, r) {
          var j = i + r;
          if (j < 0 || j >= neu.length) return;
          var x = neu[i]; neu[i] = neu[j]; neu[j] = x;
          male();
        }

        function male() {
          liste.textContent = "";
          liste.hidden = !neu.length;
          neu.forEach(function (s, i) {
            var li = document.createElement("li");
            li.className = "row ablauf__zeile";
            li.dataset.farbe = s.farbe;
            var feld = document.createElement("input");
            feld.className = "feld";
            feld.maxLength = 80;
            feld.autocomplete = "off";
            feld.value = s.text;
            feld.placeholder = "z. B. Arbeitsblatt 3 bearbeiten";
            feld.setAttribute("aria-label", "Aufgabe " + (i + 1));
            feld.addEventListener("input", function () { s.text = feld.value; });
            // Enter im Feld legt die nächste Aufgabe an, statt den Dialog zu schließen
            feld.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); dazu.click(); } });
            var knoepfe = document.createElement("span");
            knoepfe.className = "folien__knoepfe";
            var hoch = knopf("btn btn--small", "↑", "Aufgabe " + (i + 1) + " nach oben");
            var runter = knopf("btn btn--small", "↓", "Aufgabe " + (i + 1) + " nach unten");
            var weg = knopf("btn btn--small", T.icon("muell", 14), "Aufgabe " + (i + 1) + " löschen");
            hoch.disabled = i === 0;
            runter.disabled = i === neu.length - 1;
            hoch.addEventListener("click", function () { verschiebe(i, -1); });
            runter.addEventListener("click", function () { verschiebe(i, 1); });
            weg.addEventListener("click", function () { neu.splice(i, 1); male(); });
            knoepfe.append(hoch, runter, weg);
            // Farbe direkt wählen: alle Palettenfarben als Kästchen
            var farben = document.createElement("span");
            farben.className = "ablauf__farben";
            farben.setAttribute("role", "group");
            farben.setAttribute("aria-label", "Farbe von Aufgabe " + (i + 1));
            FARBEN.forEach(function (f) {
              var b = knopf("ablauf__farbe", "", f[1]);
              b.dataset.farbe = f[0];
              b.setAttribute("aria-pressed", s.farbe === f[0]);
              b.addEventListener("click", function () {
                s.farbe = f[0];
                li.dataset.farbe = f[0];
                farben.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
              });
              farben.appendChild(b);
            });
            li.append(feld, farben, knoepfe);
            liste.appendChild(li);
          });
        }
        male();
        if (!neu.length) dazu.click();

        T.dialog({ titel: "To-Do bearbeiten", icon: "kalender", inhalt: box,
          knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
          if (w !== "ok") return;
          d.schritte = neu.filter(function (s) { s.text = s.text.trim(); return s.text; });
          if (!d.schritte.some(function (s) { return s.id === d.jetzt; })) d.jetzt = null;
          speichere();
          zeige();
        });
      }

      zeige();
      return { einstellungen: bearbeite };
    }
  });
})();
