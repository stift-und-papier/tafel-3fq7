/* ============================================================
   FOLIEN – zum Durchblättern, jede Folie ist ein Bild oder Text.
   Unten: Pfeile und Zähler „01 / 08“. Tastatur: Pfeil links/rechts.
   Zahnrad: Folien hinzufügen, sortieren, ändern, löschen.
   Text-Folien: Überschrift und Zeilen; Zeilen mit „- “ am Anfang werden Punkte.
   daten: { nr, folien: [{ id, art: "bild", bild, alt } | { id, art: "text", titel, text }] }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  function zwei(n) { return (n < 10 ? "0" : "") + n; }
  function knopf(klasse, html, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = klasse;
    b.innerHTML = html;
    if (label) { b.title = label; b.setAttribute("aria-label", label); }
    return b;
  }
  function gueltig(f) { return f && (f.art === "text" || (f.art === "bild" && T.istBild(f.bild))); }

  // Text-Folie anzeigen: Überschrift, Absätze und Punkte-Listen (nur textContent, kein HTML)
  function textFolie(f) {
    var box = document.createElement("div");
    box.className = "folie folie--text";
    if (f.titel) { var h = document.createElement("h3"); h.className = "heading"; h.textContent = f.titel; box.appendChild(h); }
    var liste = null;
    String(f.text || "").split("\n").forEach(function (z) {
      var punkt = /^\s*[-•]\s+/.test(z);
      if (!z.trim()) { liste = null; return; }
      if (punkt) {
        if (!liste) liste = box.appendChild(document.createElement("ul"));
        liste.appendChild(document.createElement("li")).textContent = z.replace(/^\s*[-•]\s+/, "");
      } else {
        liste = null;
        box.appendChild(document.createElement("p")).textContent = z;
      }
    });
    return box;
  }

  // Dialog für eine Text-Folie → Promise mit { titel, text } oder null
  function bearbeiteText(f) {
    var box = document.createElement("div");
    box.innerHTML = '<label class="feld-label" for="folie-titel">Überschrift</label><input class="feld" id="folie-titel" maxlength="80" autocomplete="off">' +
      '<label class="feld-label folie__abstand" for="folie-text">Text (Zeilen mit „- “ am Anfang werden Punkte)</label>' +
      '<textarea class="feld feld--text" id="folie-text" maxlength="1500"></textarea>';
    var titel = box.querySelector("input"), text = box.querySelector("textarea");
    titel.value = f ? f.titel : "";
    text.value = f ? f.text : "";
    return T.dialog({ titel: f ? "Text-Folie ändern" : "Neue Text-Folie", icon: "text", inhalt: box,
      knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
      if (w !== "ok" || !(titel.value.trim() || text.value.trim())) return null;
      return { titel: titel.value.trim(), text: text.value.replace(/\s+$/, "") };
    });
  }

  T.registriere("folien", {
    titel: "Folien", icon: "folien", farbwahl: true, groesse: { b: 720, h: 520 }, min: { b: 320, h: 260 },
    erstelle: function (el, d, speichere) {
      if (!Array.isArray(d.folien)) d.folien = [];
      d.folien = d.folien.filter(gueltig);
      if (!Number.isFinite(d.nr)) d.nr = 0;

      el.innerHTML = '<div class="folien"><div class="folien__buehne"></div><div class="folien__fuss"></div></div>';
      var buehne = el.querySelector(".folien__buehne"), fuss = el.querySelector(".folien__fuss");
      var zurueck = T.iconKnopf("pfeil-links", "Vorherige Folie", function () { blaettere(-1); });
      var weiter = T.iconKnopf("pfeil-rechts", "Nächste Folie", function () { blaettere(1); });
      var zaehler = document.createElement("span");
      zaehler.className = "counter";
      zaehler.setAttribute("aria-live", "polite");
      fuss.append(zurueck, zaehler, weiter);

      function blaettere(r) {
        var n = Math.max(0, Math.min(d.folien.length - 1, d.nr + r));
        if (n === d.nr) return;
        d.nr = n;
        speichere();
        zeige();
      }

      var widget = el.closest(".widget");
      function taste(e) {
        if (e.target.closest("input, textarea, [contenteditable]")) return;
        if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); blaettere(1); }
        if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); blaettere(-1); }
      }
      widget.addEventListener("keydown", taste);
      widget.tabIndex = -1;   // antippen → Pfeiltasten wirken
      widget.addEventListener("pointerdown", function (e) { if (!e.target.closest("button, input, textarea")) widget.focus({ preventScroll: true }); });

      function zeige() {
        var anzahl = d.folien.length;
        d.nr = Math.max(0, Math.min(anzahl - 1, d.nr));
        buehne.textContent = "";
        fuss.hidden = !anzahl;
        if (!anzahl) {
          var leer = document.createElement("div");
          leer.className = "folien__leer";
          leer.innerHTML = "<p>Noch keine Folien.</p>";
          var los = knopf("btn btn--primary", T.icon("folien", 28) + "Folien hinzufügen");
          los.addEventListener("click", bearbeite);
          leer.appendChild(los);
          buehne.appendChild(leer);
          return;
        }
        var f = d.folien[d.nr];
        if (f.art === "bild") {
          var img = document.createElement("img");
          img.className = "folie folie--bild";
          img.src = f.bild;
          img.alt = f.alt || "Folie " + (d.nr + 1);
          buehne.appendChild(img);
        } else {
          buehne.appendChild(textFolie(f));
        }
        zaehler.textContent = zwei(d.nr + 1) + " / " + zwei(anzahl);
        zaehler.setAttribute("aria-label", "Folie " + (d.nr + 1) + " von " + anzahl);
        zurueck.disabled = d.nr === 0;
        weiter.disabled = d.nr === anzahl - 1;
      }

      // ---------- Folien bearbeiten (Arbeitskopie, erst „Fertig“ speichert) ----------
      function bearbeite() {
        var neu = d.folien.slice(), aktuelle = d.folien[d.nr];
        var box = document.createElement("div");
        box.innerHTML = '<ol class="rows folien__liste"></ol><div class="dialog__aktionen"></div>' +
          '<p class="dialog__hinweis">Bilder brauchen viel Platz: Insgesamt passen etwa 15 bis 25 Bilder in den Browser-Speicher.</p>';
        var ol = box.querySelector("ol"), aktionen = box.querySelector(".dialog__aktionen");

        // Dateiauswahl direkt im Klick öffnen (das iPad erlaubt sie nur dann)
        var bilder = knopf("btn", T.icon("bild", 28) + "Bilder hinzufügen");
        bilder.addEventListener("click", function () {
          T.bilderWaehlen(true).then(function (urls) {
            urls.forEach(function (u) { neu.push({ id: T.neueId(), art: "bild", bild: u, alt: "" }); });
            male();
          });
        });
        var text = knopf("btn", T.icon("text", 28) + "Text-Folie hinzufügen");
        text.addEventListener("click", function () {
          bearbeiteText(null).then(function (t) {
            if (t) { neu.push({ id: T.neueId(), art: "text", titel: t.titel, text: t.text }); male(); }
          });
        });
        aktionen.append(bilder, text);

        function verschiebe(i, r) {
          var j = i + r;
          if (j < 0 || j >= neu.length) return;
          var x = neu[i]; neu[i] = neu[j]; neu[j] = x;
          male();
        }

        function male() {
          ol.textContent = "";
          ol.hidden = !neu.length;
          neu.forEach(function (f, i) {
            var li = document.createElement("li");
            li.className = "row folien__zeile";
            var nr = li.appendChild(document.createElement("span"));
            nr.className = "row__num";
            nr.textContent = zwei(i + 1);
            if (f.art === "bild") {
              var img = li.appendChild(document.createElement("img"));
              img.className = "folien__vorschau";
              img.src = f.bild;
              img.alt = "";
            }
            var t = li.appendChild(document.createElement("p"));
            t.className = "row__title";
            t.textContent = f.art === "bild" ? (f.alt || "Bild") : (f.titel || String(f.text).split("\n")[0]);
            var knoepfe = li.appendChild(document.createElement("span"));
            knoepfe.className = "folien__knoepfe";
            var hoch = knopf("btn btn--small", "↑", "Folie " + (i + 1) + " nach vorn");
            var runter = knopf("btn btn--small", "↓", "Folie " + (i + 1) + " nach hinten");
            hoch.disabled = i === 0;
            runter.disabled = i === neu.length - 1;
            hoch.addEventListener("click", function () { verschiebe(i, -1); });
            runter.addEventListener("click", function () { verschiebe(i, 1); });
            knoepfe.append(hoch, runter);
            if (f.art === "text") {
              var aendern = knopf("btn btn--small", T.icon("stift", 14), "Folie " + (i + 1) + " ändern");
              aendern.addEventListener("click", function () {
                bearbeiteText(f).then(function (t) {
                  if (t) { neu[i] = { id: f.id, art: "text", titel: t.titel, text: t.text }; male(); }
                });
              });
              knoepfe.appendChild(aendern);
            }
            var weg = knopf("btn btn--small", T.icon("muell", 14), "Folie " + (i + 1) + " löschen");
            weg.addEventListener("click", function () { neu.splice(i, 1); male(); });
            knoepfe.appendChild(weg);
            ol.appendChild(li);
          });
        }
        male();

        T.dialog({ titel: "Folien bearbeiten", icon: "folien", inhalt: box,
          knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
          if (w !== "ok") return;
          var alt = d.folien, altNr = d.nr;
          d.folien = neu;
          var i = neu.indexOf(aktuelle);
          d.nr = i >= 0 ? i : Math.min(d.nr, neu.length - 1);
          T.speichereBild(function () { d.folien = alt; d.nr = altNr; });
          zeige();
        });
      }

      zeige();
      return {
        entferne: function () { widget.removeEventListener("keydown", taste); },
        einstellungen: bearbeite
      };
    }
  });
})();
