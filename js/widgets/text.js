/* ============================================================
   TEXT – direkt ins Widget tippen. Leiste (nur sichtbar, wenn das Widget
   ausgewählt ist): Fett, Textmarker, Aufzählung mit Punkten oder Nummern.
   Zahnrad: Schriftgröße normal / groß / sehr groß.
   Gespeichert wird nur erlaubtes HTML (b, mark, ul, ol, li, br, div, p),
   alles andere wird beim Laden und Speichern entfernt.
   daten: { html: "", groesse: "normal"|"gross"|"riesig" }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var ERLAUBT = { B: "b", STRONG: "b", MARK: "mark", UL: "ul", OL: "ol", LI: "li", BR: "br", DIV: "div", P: "p" };
  var WEG = /^(SCRIPT|STYLE|TEMPLATE|IFRAME|OBJECT|EMBED|SVG|MATH|NOSCRIPT)$/;

  // Baut den Text aus erlaubten Teilen neu auf (Schutz vor manipulierten Sicherungsdateien)
  function saeubere(html) {
    var quelle = new DOMParser().parseFromString("<body>" + (html || ""), "text/html").body;
    var ziel = document.createElement("div");
    (function kopiere(von, nach) {
      Array.prototype.forEach.call(von.childNodes, function (n) {
        if (n.nodeType === 3) nach.appendChild(document.createTextNode(n.nodeValue));
        else if (n.nodeType === 1 && ERLAUBT[n.tagName]) kopiere(n, nach.appendChild(document.createElement(ERLAUBT[n.tagName])));
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
  function auspacken(m) {
    while (m.firstChild) m.parentNode.insertBefore(m.firstChild, m);
    m.remove();
  }

  T.registriere("text", {
    titel: "Text", icon: "text", farbwahl: true, groesse: { b: 480, h: 280 }, min: { b: 240, h: 160 },
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
        ["mark", "<mark>Marker</mark>", "Textmarker", markiere],
        ["ul", "• Liste", "Aufzählung mit Punkten", function () { document.execCommand("insertUnorderedList"); }],
        ["ol", "1. Liste", "Aufzählung mit Nummern", function () { document.execCommand("insertOrderedList"); }]
      ];
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
        knoepfe.mark.setAttribute("aria-pressed", String(textKnoten(r).length ? textKnoten(r).every(function (n) { return vorfahr(n, "MARK", feld); }) : !!vorfahr(r.startContainer, "MARK", feld)));
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

      // Textmarker an/aus. Jedes Textstück einzeln einpacken, damit Listen heil bleiben.
      function markiere() {
        var sel = getSelection();
        if (!sel.rangeCount) return;
        var r = sel.getRangeAt(0);
        if (!imFeld(r)) return;
        var stuecke = textKnoten(r);
        if (!stuecke.length) {   // nur Cursor: Markierung um den Cursor entfernen
          var m = vorfahr(r.startContainer, "MARK", feld);
          if (m) auspacken(m);
          return;
        }
        var alleMarkiert = stuecke.every(function (n) { return vorfahr(n, "MARK", feld); });
        if (alleMarkiert) {
          stuecke.forEach(function (n) { var m = vorfahr(n, "MARK", feld); if (m && m.parentNode) auspacken(m); });
          return;
        }
        var start = r.startContainer, so = r.startOffset, ende = r.endContainer, eo = r.endOffset, erstes = null, letztes = null;
        stuecke.forEach(function (n) {
          if (n === ende && eo < n.nodeValue.length) n.splitText(eo);
          if (n === start && so > 0) n = n.splitText(so);
          if (!vorfahr(n, "MARK", feld)) {
            var mk = document.createElement("mark");
            n.parentNode.insertBefore(mk, n);
            mk.appendChild(n);
          }
          erstes = erstes || n;
          letztes = n;
        });
        var neu = document.createRange();
        neu.setStartBefore(vorfahr(erstes, "MARK", feld));
        neu.setEndAfter(vorfahr(letztes, "MARK", feld));
        sel.removeAllRanges();
        sel.addRange(neu);
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

      function zeigeGroesse() { box.dataset.groesse = d.groesse; }
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
          var wahl = T.wahl("Schriftgröße", "text-groesse", [["normal", "Normal"], ["gross", "Groß"], ["riesig", "Sehr groß"]], d.groesse);
          T.dialog({ titel: "Einstellungen", icon: "zahnrad", inhalt: wahl,
            knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
            if (w !== "ok") return;
            d.groesse = wahl.querySelector("input:checked").value;
            speichere();
            zeigeGroesse();
          });
        }
      };
    }
  });
})();
