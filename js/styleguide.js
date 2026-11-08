/* Nur für styleguide.html: Farbtafel, Icon-Übersicht und Kontrast-Tabelle.
   Liest die Farben direkt aus tokens.css, damit nichts doppelt gepflegt wird. */
(function () {
  "use strict";
  var css = getComputedStyle(document.documentElement);
  function wert(name) { return css.getPropertyValue(name).trim().toUpperCase(); }

  // ---------- Farbtafel ----------
  var FARBEN = ["--c-petrol-dark", "--c-petrol", "--c-teal", "--c-sage", "--c-sun", "--c-honey", "--c-orange", "--c-orange-deep",
    "--c-coral", "--c-coral-soft", "--white", "--cream", "--cream-deep", "--brown",
    "--tint-teal-8", "--tint-teal-10", "--tint-teal-20", "--tint-teal-35", "--tint-sun-40", "--tint-coral-soft-15",
    "--tint-orange-20", "--tint-orange-40", "--tint-petrol-dark-6", "--tint-petrol-dark-12", "--tint-sage-20", "--tint-sage-60", "--tint-coral-soft-50"];
  var ROLLEN = { "--text": "Haupttext", "--text-muted": "gedämpfter Text", "--line-color": "dünne Rahmen", "--shadow-color": "Schatten",
    "--shadow-small": "kleiner Schatten", "--mark": "Textmarker", "--focus": "Fokus", "--active-bg": "aktiv", "--active-accent": "aktiv, Rand", "--grid-line": "Seitengitter" };
  var tafel = document.getElementById("sg-farben");
  FARBEN.forEach(function (n) {
    var rollen = Object.keys(ROLLEN).filter(function (r) { return wert(r) === wert(n); }).map(function (r) { return ROLLEN[r]; });
    var el = document.createElement("div");
    el.className = "sg-farbe";
    el.innerHTML = '<div style="background: var(' + n + ')"></div><p>' + n + "<br>" + wert(n) + (rollen.length ? "<br><b>" + rollen.join(", ") + "</b>" : "") + "</p>";
    tafel.appendChild(el);
  });
  var titel = document.createElement("div");
  titel.className = "sg-farbe";
  titel.style.gridColumn = "1 / -1";
  titel.innerHTML = '<div style="background: var(--titlebar)"></div><p>--titlebar (Verlauf Titelleiste)</p>';
  tafel.appendChild(titel);
  var hero = titel.cloneNode(true);
  hero.innerHTML = '<div style="background: var(--hero-bg)"></div><p>--hero-bg (Verlauf Titelkarte)</p>';
  tafel.appendChild(hero);

  // ---------- Icons auf vier Flächen, 2-fach ----------
  var ICONS = ["wuerfel", "bild", "text", "uhr", "kalender", "folien", "herz", "zahnrad", "muell", "stift", "start", "pause", "stopp",
    "vollbild", "speichern", "laden", "pfeil-links", "pfeil-rechts", "kreuz", "info", "wecker", "sonne", "mond", "sonne-auf", "verbot", "waage", "teller"];
  var FLAECHEN = ["var(--white)", "var(--cream)", "var(--tint-orange-20)", "var(--titlebar)"];
  var box = document.getElementById("sg-icons");
  ICONS.forEach(function (n) {
    var el = document.createElement("div");
    el.className = "sg-icon";
    el.innerHTML = "<div>" + FLAECHEN.map(function (f) { return '<span style="background: ' + f + '"><img class="pixel" src="assets/icons/' + n + '.svg" alt=""></span>'; }).join("") + "</div>" + n;
    box.appendChild(el);
  });

  // ---------- Kontraste (WCAG 2) ----------
  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function verhaeltnis(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  // [Text, Hintergrund, nötig, wofür]
  var PAARE = [
    ["--c-petrol-dark", "--white", 4.5], ["--c-petrol-dark", "--cream", 4.5], ["--c-petrol-dark", "--cream-deep", 4.5],
    ["--c-petrol-dark", "--tint-teal-8", 4.5], ["--c-petrol-dark", "--tint-teal-10", 4.5], ["--c-petrol-dark", "--tint-sun-40", 4.5],
    ["--c-petrol-dark", "--tint-coral-soft-15", 4.5], ["--c-petrol-dark", "--tint-orange-20", 4.5], ["--c-petrol-dark", "--c-sun", 4.5],
    ["--c-petrol-dark", "--c-orange", 4.5], ["--c-petrol-dark", "--c-honey", 4.5],
    ["--c-petrol-dark", "--tint-teal-35", 4.5], ["--c-petrol-dark", "--tint-sage-60", 4.5], ["--c-petrol-dark", "--tint-coral-soft-50", 4.5],
    ["--c-petrol", "--white", 4.5], ["--c-petrol", "--cream", 4.5], ["--c-petrol", "--cream-deep", 4.5], ["--c-petrol", "--tint-teal-8", 4.5],
    ["--c-petrol", "--tint-sun-40", 4.5], ["--c-petrol", "--tint-orange-20", 4.5],
    ["--brown", "--tint-orange-20", 4.5], ["--brown", "--white", 4.5],
    ["--white", "--c-petrol-dark", 4.5], ["--white", "--c-petrol", 4.5],
    ["--white", "--c-teal", 3], ["--white", "--c-orange", 3],
    ["--c-petrol-dark", "--cream", 3, "Fokusrahmen"]
  ];
  var tbody = document.querySelector("#sg-kontrast tbody");
  PAARE.forEach(function (p) {
    var v = verhaeltnis(wert(p[0]), wert(p[1])), ok = v >= p[2];
    var tr = document.createElement("tr");
    tr.innerHTML = '<td style="color: var(' + p[0] + "); background: var(" + p[1] + ')">' + p[0] + (p[3] ? " (" + p[3] + ")" : "") + "</td><td>" + p[1] +
      "</td><td>" + v.toFixed(2) + " : 1</td><td>" + p[2] + " : 1</td><td>" + (ok ? "✔ bestanden" : "✘ nicht verwenden") + "</td>";
    tbody.appendChild(tr);
  });
})();
