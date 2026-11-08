/* ============================================================
   TEXT – direkt ins Widget tippen. Leiste (nur sichtbar, wenn das Widget
   ausgewählt ist): Fett, Kursiv, Unterstrichen, markierten Text kleiner/größer (A− / A+),
   Textmarker in 5 Farben, Aufzählung mit Punkten oder Nummern.
   Zahnrad: Form (Fenster, Gedankenblase, Sprechblase, Infokasten – die drei stehen frei
   auf der Tafel, ohne Fenster), bei Blasen die Richtung des Zipfels, Grundgröße der Schrift.
   Gespeichert wird nur erlaubtes HTML (b, i, u, mark[data-farbe], span[data-groesse], ul, ol, li, br, div, p),
   alles andere wird beim Laden und Speichern entfernt.
   daten: { html: "", groesse: "normal"|"gross"|"riesig", form: "fenster"|"gedanke"|"sprechblase"|"info",
            zipfel: "unten-links"|"unten-rechts"|"oben-links"|"oben-rechts"|"links"|"rechts" }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var ERLAUBT = { B: "b", STRONG: "b", I: "i", EM: "i", U: "u", MARK: "mark", UL: "ul", OL: "ol", LI: "li", BR: "br", DIV: "div", P: "p" };
  // Markerfarben (CSS: mark[data-farbe]) – ohne Angabe gelb
  var MARKER = [["gelb", "Gelb"], ["tuerkis", "Türkis"], ["gruen", "Grün"], ["orange", "Orange"], ["rosa", "Rosa"]];
  var MARKER_IDS = MARKER.map(function (m) { return m[0]; });
  // Größen für markierten Text, relativ zur Grundgröße (CSS: span[data-groesse]); "normal" = kein span
  var STUFEN = ["klein", "normal", "gross", "riesig"];
  var WEG = /^(SCRIPT|STYLE|TEMPLATE|IFRAME|OBJECT|EMBED|SVG|MATH|NOSCRIPT)$/;

  // Baut den Text aus erlaubten Teilen neu auf (Schutz vor manipulierten Sicherungsdateien)
  function saeubere(html) {
    var quelle = new DOMParser().parseFromString("<body>" + (html || ""), "text/html").body;
    var ziel = document.createElement("div");
    (function kopiere(von, nach) {
      Array.prototype.forEach.call(von.childNodes, function (n) {
        if (n.nodeType === 3) nach.appendChild(document.createTextNode(n.nodeValue));
        else if (n.nodeType === 1 && ERLAUBT[n.tagName]) {
          var neu = nach.appendChild(document.createElement(ERLAUBT[n.tagName]));
          if (n.tagName === "MARK" && MARKER_IDS.indexOf(n.getAttribute("data-farbe")) > 0) neu.dataset.farbe = n.getAttribute("data-farbe");
          kopiere(n, neu);
        }
        else if (n.nodeType === 1 && n.tagName === "SPAN" && STUFEN.indexOf(n.getAttribute("data-groesse")) >= 0 && n.getAttribute("data-groesse") !== "normal") {
          var sp = nach.appendChild(document.createElement("span"));
          sp.dataset.groesse = n.getAttribute("data-groesse");
          kopiere(n, sp);
        }
        else if (n.nodeType === 1 && !WEG.test(n.tagName.toUpperCase())) kopiere(n, nach);   // z. B. <span>: Inhalt behalten
      });
    })(quelle, ziel);
    return ziel.innerHTML;
  }
  T.saeubereText = saeubere;   // nur für den Selbsttest

  function vorfahr(n, tag, grenze) {
    for (; n && n !== grenze; n = n.parentNode) if (n.nodeName === tag) return n;
    return null;
  }
  function groessenSpan(n, grenze) {
    for (; n && n !== grenze; n = n.parentNode) if (n.nodeName === "SPAN" && n.dataset.groesse) return n;
    return null;
  }
  function auspacken(m) {
    while (m.firstChild) m.parentNode.insertBefore(m.firstChild, m);
    m.remove();
  }

  var FORMEN = [["fenster", "Fenster"], ["gedanke", "Gedankenblase"], ["sprechblase", "Sprechblase"], ["info", "Infokasten"]];
  function form(d) { return FORMEN.some(function (f) { return f[0] === d.form; }) ? d.form : "fenster"; }
  var ZIPFEL = [["unten-links", "Unten links"], ["unten-rechts", "Unten rechts"], ["oben-links", "Oben links"],
    ["oben-rechts", "Oben rechts"], ["links", "Links"], ["rechts", "Rechts"]];
  function zipfel(d) { return ZIPFEL.some(function (z) { return z[0] === d.zipfel; }) ? d.zipfel : "unten-links"; }

  T.registriere("text", {
    titel: "Text", icon: "text", farbwahl: true, frei: function (d) { return form(d) !== "fenster"; }, groesse: { b: 480, h: 280 }, min: { b: 240, h: 160 },
    erstelle: function (el, d, speichere) {
      if (!d.groesse) d.groesse = "gross";
      el.innerHTML = '<div class="text"><div class="text__leiste" role="toolbar" aria-label="Text gestalten"></div>' +
        '<div class="text__feld kein-ziehen" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Text" ' +
        'data-leer="Tippe hier deinen Text …" spellcheck="true"></div></div>';
      var box = el.firstChild, leiste = box.firstChild, feld = box.lastChild;
      feld.innerHTML = saeubere(d.html);

      // ---------- Knöpfe ----------
      var KNOEPFE = [
        ["fett", "<b>F</b>", "Fett", function () { document.execCommand("bold"); }],
        ["kursiv", "<i>K</i>", "Kursiv", function () { document.execCommand("italic"); }],
        ["unter", "<u>U</u>", "Unterstrichen", function () { document.execCommand("underline"); }],
        ["kleiner", "A−", "Markierten Text kleiner", function () { stufe(-1); }],
        ["groesser", "A+", "Markierten Text größer", function () { stufe(1); }]
      ].concat(MARKER.map(function (m) {
        return ["mark-" + m[0], '<mark data-farbe="' + m[0] + '">ab</mark>', "Textmarker " + m[1], function () { markiere(m[0]); }];
      })).concat([
        ["ul", "• Liste", "Aufzählung mit Punkten", function () { document.execCommand("insertUnorderedList"); }],
        ["ol", "1. Liste", "Aufzählung mit Nummern", function () { document.execCommand("insertOrderedList"); }]
      ]);
      var knoepfe = {};
      KNOEPFE.forEach(function (k) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn btn--small";
        b.innerHTML = k[1];
        b.title = k[2];
        b.setAttribute("aria-label", k[2]);
        b.setAttribute("aria-pressed", "false");
        // Fokus und Markierung im Textfeld lassen
        b.addEventListener("mousedown", function (e) { e.preventDefault(); });
        b.addEventListener("click", function () {
          stelleAuswahlWiederHer();
          document.execCommand("styleWithCSS", false, false);
          k[3]();
          geaendert();
        });
        leiste.appendChild(b);
        knoepfe[k[0]] = b;
      });

      // letzte Markierung im Feld merken (das iPad verliert sie beim Antippen eines Knopfs manchmal)
      var gemerkt = null;
      function imFeld(r) { return r && feld.contains(r.commonAncestorContainer); }
      function stelleAuswahlWiederHer() {
        var sel = getSelection();
        if (sel.rangeCount && imFeld(sel.getRangeAt(0))) return;
        feld.focus();
        if (gemerkt) { sel.removeAllRanges(); sel.addRange(gemerkt); }
      }
      function auswahlGeaendert() {
        var sel = getSelection();
        if (!sel.rangeCount || !imFeld(sel.getRangeAt(0))) return;
        gemerkt = sel.getRangeAt(0).cloneRange();
        var r = gemerkt;
        knoepfe.fett.setAttribute("aria-pressed", String(document.queryCommandState("bold")));
        knoepfe.kursiv.setAttribute("aria-pressed", String(document.queryCommandState("italic")));
        knoepfe.unter.setAttribute("aria-pressed", String(document.queryCommandState("underline")));
        var stuecke = textKnoten(r);
        if (!stuecke.length) stuecke = [r.startContainer];
        MARKER_IDS.forEach(function (id) {
          knoepfe["mark-" + id].setAttribute("aria-pressed", String(stuecke.every(function (n) { return markerFarbe(n) === id; })));
        });
        knoepfe.ul.setAttribute("aria-pressed", String(!!vorfahr(r.startContainer, "UL", feld)));
        knoepfe.ol.setAttribute("aria-pressed", String(!!vorfahr(r.startContainer, "OL", feld)));
      }
      document.addEventListener("selectionchange", auswahlGeaendert);

      // Alle Textstücke, die die Markierung berührt
      function textKnoten(r) {
        if (r.collapsed) return [];
        var wurzel = r.commonAncestorContainer.nodeType === 3 ? r.commonAncestorContainer.parentNode : r.commonAncestorContainer;
        var w = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT), out = [], n;
        while ((n = w.nextNode())) if (r.intersectsNode(n) && n.nodeValue.length) out.push(n);
        return out.filter(function (x) {
          return !(x === r.endContainer && r.endOffset === 0) && !(x === r.startContainer && r.startOffset === x.nodeValue.length);
        });
      }

      function markerFarbe(n) {
        var m = vorfahr(n, "MARK", feld);
        return m ? (m.dataset.farbe || "gelb") : null;
      }
      // Textstücke an den Rändern der Markierung abschneiden
      function teile(r, stuecke) {
        var start = r.startContainer, so = r.startOffset, ende = r.endContainer, eo = r.endOffset;
        return stuecke.map(function (n) {
          if (n === ende && eo < n.nodeValue.length) n.splitText(eo);
          if (n === start && so > 0) n = n.splitText(so);
          return n;
        });
      }
      function waehleNeu(t) {
        var neu = document.createRange(), letztes = t[t.length - 1];
        neu.setStart(t[0], 0);
        neu.setEnd(letztes, letztes.nodeValue.length);
        var sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(neu);
      }
      function huelle(n, tag) {
        var h = document.createElement(tag);
        n.parentNode.insertBefore(h, n);
        h.appendChild(n);
        return h;
      }
      function auswahl() {
        var sel = getSelection();
        if (!sel.rangeCount) return null;
        var r = sel.getRangeAt(0);
        return imFeld(r) ? r : null;
      }

      // Textmarker in einer Farbe an/aus. Jedes Textstück einzeln einpacken, damit Listen heil bleiben.
      // Schon markierter Text in anderer Farbe bekommt die neue Farbe.
      function markiere(farbe) {
        var r = auswahl();
        if (!r) return;
        var stuecke = textKnoten(r);
        if (!stuecke.length) {   // nur Cursor: Markierung um den Cursor entfernen
          var m = vorfahr(r.startContainer, "MARK", feld);
          if (m) auspacken(m);
          return;
        }
        if (stuecke.every(function (n) { return markerFarbe(n) === farbe; })) {
          stuecke.forEach(function (n) { var m = vorfahr(n, "MARK", feld); if (m && m.parentNode) auspacken(m); });
          return;
        }
        var t = teile(r, stuecke);
        t.forEach(function (n) {
          // shortcut: ein schon vorhandener Marker wird ganz umgefärbt, auch über die Markierung hinaus
          var m = vorfahr(n, "MARK", feld) || huelle(n, "mark");
          if (farbe === "gelb") delete m.dataset.farbe; else m.dataset.farbe = farbe;
        });
        waehleNeu(t);
      }

      // Markierten Text eine Stufe kleiner (-1) oder größer (+1)
      function stufe(richtung) {
        var r = auswahl();
        if (!r) return;
        var stuecke = textKnoten(r);
        if (!stuecke.length) return;
        var t = teile(r, stuecke);
        t.forEach(function (n) {
          // shortcut: ein vorhandener Größen-Bereich ändert sich ganz, auch über die Markierung hinaus
          var sp = groessenSpan(n, feld);
          var jetzt = STUFEN.indexOf(sp ? sp.dataset.groesse : "normal");
          var neu = STUFEN[Math.max(0, Math.min(STUFEN.length - 1, jetzt + richtung))];
          if (neu === "normal") { if (sp) auspacken(sp); }
          else (sp || huelle(n, "span")).dataset.groesse = neu;
        });
        waehleNeu(t);
      }

      // ---------- Eingabe ----------
      // Einfügen nur als reiner Text, damit keine fremden Formate oder Bilder hineinkommen
      feld.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = e.clipboardData ? e.clipboardData.getData("text/plain") : "";
        document.execCommand("insertText", false, text);
      });
      feld.addEventListener("drop", function (e) { e.preventDefault(); });

      var warte = null;
      function geaendert() {
        feld.classList.toggle("is-leer", !feld.textContent.trim() && !feld.querySelector("li"));
        clearTimeout(warte);
        warte = setTimeout(sichere, 400);
      }
      function sichere() {
        clearTimeout(warte);
        warte = null;
        d.html = saeubere(feld.innerHTML);
        speichere();
      }
      feld.addEventListener("input", geaendert);
      feld.addEventListener("blur", function () { if (warte) sichere(); });

      function zeigeGroesse() { box.dataset.groesse = d.groesse; box.dataset.form = form(d); box.dataset.zipfel = zipfel(d); }
      zeigeGroesse();
      geaendert();
      clearTimeout(warte);   // beim Start nichts speichern
      warte = null;

      return {
        entferne: function () {
          if (warte) sichere();
          document.removeEventListener("selectionchange", auswahlGeaendert);
        },
        einstellungen: function () {
          var wahl = document.createElement("div");
          var zipfelWahl = T.wahl("Zipfel der Blase zeigt nach", "text-zipfel", ZIPFEL, zipfel(d));
          wahl.append(T.wahl("Form", "text-form", FORMEN, form(d)), zipfelWahl,
            T.wahl("Grundgröße der Schrift", "text-groesse", [["normal", "Normal"], ["gross", "Groß"], ["riesig", "Sehr groß"]], d.groesse));
          // Zipfel-Wahl nur bei Gedanken- und Sprechblase
          function zeigeZipfelWahl() {
            var f = wahl.querySelector("[name=text-form]:checked").value;
            zipfelWahl.hidden = f !== "gedanke" && f !== "sprechblase";
          }
          wahl.addEventListener("change", zeigeZipfelWahl);
          zeigeZipfelWahl();
          T.dialog({ titel: "Einstellungen", icon: "zahnrad", inhalt: wahl,
            knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
            if (w !== "ok") return;
            var alteForm = form(d);
            d.groesse = wahl.querySelector("[name=text-groesse]:checked").value;
            d.form = wahl.querySelector("[name=text-form]:checked").value;
            d.zipfel = wahl.querySelector("[name=text-zipfel]:checked").value;
            if (warte) sichere();
            speichere();
            zeigeGroesse();
            // Fenster ↔ frei braucht einen anderen Rahmen: Tafel neu aufbauen
            if (form(d) !== alteForm) T.zeigeTafel();
          });
        }
      };
    }
  });
})();
