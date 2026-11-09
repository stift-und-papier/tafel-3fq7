/* ============================================================
   ZUFALL – drei Seiten in einem Widget:
   · Ziehen:  ein Name wird gezogen, die Namen rollen kurz durch.
              Zahnrad: „Jede:r nur einmal“ oder „Ganz zufällig“.
   · Gruppen: nach Anzahl der Gruppen oder Personen pro Gruppe einteilen.
              Zahnrad unten (ohne Text): „Nicht zusammen“-Paare, die nie in dieselbe Gruppe kommen (kurs.trennen).
   · Liste:   Namen antippen = fehlt heute (gilt nur bis Mitternacht),
              „Namen bearbeiten“ öffnet die Liste zum Eintippen.
   Die Namensliste gehört zum Kurs (kurs.schueler: [{ id, name, fehlt? }]),
   alle Zufall-Widgets im Kurs teilen sie, ebenso kurs.trennen: [[idA, idB], …].
   fehlt = Datum (toDateString).
   daten: { seite, einmal, gezogen: [ids], letzter: id|null,
            art: "anzahl"|"groesse", wert, gruppen: [[ids], …] }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var MAX_NAMEN = 60;
  var SEITEN = [["ziehen", "Ziehen"], ["gruppen", "Gruppen"], ["liste", "Liste"]];
  var ruhig = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function liste() { var k = T.aktiverKurs(); if (!Array.isArray(k.schueler)) k.schueler = []; return k.schueler; }
  // „Nicht zusammen“-Paare des Kurses, nur solche, deren Namen es noch gibt
  function paare() {
    var k = T.aktiverKurs(), da = {};
    liste().forEach(function (s) { da[s.id] = s.name; });
    if (!Array.isArray(k.trennen)) k.trennen = [];
    k.trennen = k.trennen.filter(function (p) { return da[p[0]] && da[p[1]]; });
    return k.trennen;
  }
  function fehlt(s) { return s.fehlt === new Date().toDateString(); }
  function anwesend() { return liste().filter(function (s) { return !fehlt(s); }); }
  function nameVon(id) { var s = liste().filter(function (x) { return x.id === id; })[0]; return s && !fehlt(s) ? s.name : null; }
  function zufallsElement(a) { return a[Math.floor(Math.random() * a.length)]; }
  function mische(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  // Gruppen unterscheiden sich um höchstens eine Person.
  // „Personen pro Gruppe“: keine Gruppe wird größer als gewählt.
  // verbote: [[idA, idB], …] kommen nie in dieselbe Gruppe. Jede Person kommt in die kleinste
  // erlaubte Gruppe; geht das nicht auf, neu mischen. → Gruppen oder null (unmöglich)
  function teileEin(ids, art, wert, verbote) {
    if (!ids.length) return [];
    var k = art === "anzahl" ? Math.min(wert, ids.length) : Math.ceil(ids.length / wert), feind = {};
    ids.forEach(function (id) { feind[id] = {}; });
    (verbote || []).forEach(function (p) { if (feind[p[0]] && feind[p[1]]) feind[p[0]][p[1]] = feind[p[1]][p[0]] = true; });
    function zahl(id) { return Object.keys(feind[id]).length; }
    for (var versuch = 0; versuch < 300; versuch++) {
      var g = [];
      for (var i = 0; i < k; i++) g.push([]);
      // wer mehr Verbote hat, kommt zuerst dran
      var ok = mische(ids).sort(function (a, b) { return zahl(b) - zahl(a); }).every(function (id) {
        var frei = g.filter(function (x) { return !x.some(function (y) { return feind[id][y]; }); });
        if (!frei.length) return false;
        var min = Math.min.apply(null, frei.map(function (x) { return x.length; }));
        zufallsElement(frei.filter(function (x) { return x.length === min; })).push(id);
        return true;
      });
      var l = g.map(function (x) { return x.length; });
      if (ok && Math.max.apply(null, l) - Math.min.apply(null, l) <= 1) return g;
    }
    return null;
  }
  T.zufallTeileEin = teileEin;   // nur für den Selbsttest

  function knopf(klasse, text) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = klasse;
    b.textContent = text;
    return b;
  }

  T.registriere("zufall", {
    titel: "Zufall", icon: "wuerfel", groesse: { b: 560, h: 440 }, min: { b: 400, h: 320 },
    erstelle: function (el, d, speichere) {
      if (!d.seite) { d.seite = "ziehen"; d.einmal = true; d.art = "anzahl"; d.wert = 4; }
      if (!Array.isArray(d.gezogen)) d.gezogen = [];
      if (!Array.isArray(d.gruppen)) d.gruppen = [];

      el.innerHTML =
        '<div class="zufall"><div class="tabs zufall__reiter"></div>' +
        '<div class="zufall__seite" data-seite="ziehen"><p class="zufall__name" aria-live="polite"></p>' +
        '<div class="zufall__fuss"><span class="label zufall__stand"></span></div></div>' +
        '<div class="zufall__seite" data-seite="gruppen"><div class="zufall__fuss"></div>' +
        '<div class="zufall__gruppen kein-ziehen"></div></div>' +
        '<div class="zufall__seite" data-seite="liste"><p class="label zufall__stand"></p>' +
        '<div class="chip-list zufall__namen kein-ziehen"></div><div class="zufall__fuss"></div></div></div>';
      var box = el.firstChild, seiten = {};
      box.querySelectorAll(".zufall__seite").forEach(function (s) { seiten[s.dataset.seite] = s; });

      // ---------- Reiter oben ----------
      var reiter = SEITEN.map(function (s) {
        var b = knopf("tab", s[1]);
        b.addEventListener("click", function () { d.seite = s[0]; speichere(); zeige(); });
        box.firstChild.appendChild(b);
        return b;
      });

      // ---------- Ziehen ----------
      var nameEl = seiten.ziehen.querySelector(".zufall__name");
      var standZiehen = seiten.ziehen.querySelector(".zufall__stand");
      var neuKnopf = knopf("btn", "Neue Runde"), ziehKnopf = knopf("btn btn--primary", "Ziehen");
      seiten.ziehen.querySelector(".zufall__fuss").append(neuKnopf, ziehKnopf);
      var rollt = null;

      ziehKnopf.addEventListener("click", function () {
        var da = anwesend();
        if (!da.length) return;
        var offen = d.einmal ? da.filter(function (s) { return d.gezogen.indexOf(s.id) < 0; }) : da;
        if (!offen.length) { d.gezogen = []; offen = da; }   // alle waren dran → neue Runde
        var wahl = zufallsElement(offen);
        if (d.einmal) d.gezogen.push(wahl.id);
        d.letzter = wahl.id;
        speichere();
        rolle(da);
      });
      neuKnopf.addEventListener("click", function () { d.gezogen = []; d.letzter = null; speichere(); zeige(); });

      // Namen laufen durch und werden langsamer, dann steht der gezogene Name da
      function rolle(da) {
        if (ruhig || da.length < 2) return zeige();
        var schritt = 0;
        ziehKnopf.disabled = true;
        nameEl.classList.add("rollt");
        nameEl.setAttribute("aria-busy", "true");
        (function weiter() {
          if (++schritt > 14) {   // zusammen etwa 1,3 Sekunden
            rollt = null;
            ziehKnopf.disabled = false;
            nameEl.classList.remove("rollt");
            nameEl.removeAttribute("aria-busy");
            return zeige();
          }
          nameEl.textContent = zufallsElement(da).name;
          rollt = setTimeout(weiter, 30 + schritt * schritt * 0.8);
        })();
      }

      function zeigeZiehen() {
        var da = anwesend();
        if (rollt) return;
        nameEl.textContent = !liste().length ? "Noch keine Namen. Trage sie unter „Liste“ ein." :
          !da.length ? "Heute fehlen alle." : nameVon(d.letzter) || "Tippe auf „Ziehen“.";
        nameEl.classList.toggle("is-hinweis", !nameVon(d.letzter));
        ziehKnopf.disabled = !da.length;
        neuKnopf.hidden = !d.einmal;
        var offen = da.filter(function (s) { return d.gezogen.indexOf(s.id) < 0; }).length;
        standZiehen.textContent = !da.length ? "" : d.einmal ? "Noch " + offen + " von " + da.length : da.length + " da";
      }

      // ---------- Gruppen ----------
      var fussGruppen = seiten.gruppen.querySelector(".zufall__fuss");
      var art = T.wahl("Einteilen nach", "zufall-art-" + T.neueId(), [["anzahl", "Anzahl Gruppen"], ["groesse", "Personen pro Gruppe"]], d.art);
      var minus = knopf("btn btn--square", "−"), plus = knopf("btn btn--square", "+");
      var zahl = document.createElement("span");
      zahl.className = "zufall__zahl";
      zahl.setAttribute("aria-live", "polite");
      var einteilen = knopf("btn btn--sun", "Einteilen");
      // nur ein Zahnrad ohne Text, damit die Klasse am Beamer nicht liest, worum es geht
      var trennKnopf = T.iconKnopf("zahnrad", "Gruppen-Einstellungen", bearbeitePaare);
      var schritt = document.createElement("div");
      schritt.className = "zufall__schritt";
      schritt.append(minus, zahl, plus);
      fussGruppen.append(art, schritt, trennKnopf, einteilen);
      var gruppenEl = seiten.gruppen.querySelector(".zufall__gruppen");

      art.addEventListener("change", function () { d.art = art.querySelector("input:checked").value; speichere(); zeige(); });
      function stelle(delta) { d.wert = Math.max(2, Math.min(15, d.wert + delta)); speichere(); zeige(); }
      minus.addEventListener("click", function () { stelle(-1); });
      plus.addEventListener("click", function () { stelle(1); });
      einteilen.addEventListener("click", function () {
        var g = teileEin(anwesend().map(function (s) { return s.id; }), d.art, d.wert, paare());
        if (!g) {
          T.dialog({ titel: "Geht nicht auf", icon: "info",
            inhalt: "Mit diesen „Nicht zusammen“-Paaren lassen sich keine passenden Gruppen bilden. Mache mehr Gruppen oder streiche ein Paar." });
          return;
        }
        d.gruppen = g;
        speichere();
        zeige();
      });

      // Dialog: Paare anlegen und streichen. Erst „Fertig“ speichert.
      function bearbeitePaare() {
        var l = liste(), neu = paare().map(function (p) { return p.slice(); });
        var f = document.createElement("div");
        f.innerHTML = '<p>Diese Paare kommen nie in dieselbe Gruppe.</p><ul class="rows zufall__paare"></ul>' +
          '<div class="zufall__paar"><label class="feld-label" for="zufall-a">Erster Name</label><select class="feld" id="zufall-a"></select>' +
          '<span>und</span><label class="feld-label" for="zufall-b">Zweiter Name</label><select class="feld" id="zufall-b"></select></div>';
        var ul = f.querySelector("ul"), a = f.querySelector("#zufall-a"), b = f.querySelector("#zufall-b");
        var dazu = knopf("btn", "Paar hinzufügen");
        f.querySelector(".zufall__paar").appendChild(dazu);
        [a, b].forEach(function (sel, i) {
          l.forEach(function (s) { sel.add(new Option(s.name, s.id)); });
          sel.selectedIndex = Math.min(i, l.length - 1);
        });
        function name(id) { return l.filter(function (s) { return s.id === id; })[0].name; }
        function male() {
          ul.textContent = "";
          neu.forEach(function (p, i) {
            var li = document.createElement("li");
            li.className = "row";
            li.innerHTML = '<p class="row__title"></p>';
            li.firstChild.textContent = name(p[0]) + " und " + name(p[1]);
            var weg = knopf("btn btn--small", "Streichen");
            weg.setAttribute("aria-label", "Paar " + name(p[0]) + " und " + name(p[1]) + " streichen");
            weg.addEventListener("click", function () { neu.splice(i, 1); male(); });
            li.appendChild(weg);
            ul.appendChild(li);
          });
          ul.hidden = !neu.length;
        }
        dazu.addEventListener("click", function () {
          var x = a.value, y = b.value;
          if (!x || x === y) return;
          if (!neu.some(function (p) { return (p[0] === x && p[1] === y) || (p[0] === y && p[1] === x); })) neu.push([x, y]);
          male();
        });
        dazu.disabled = l.length < 2;
        male();
        T.dialog({ titel: "Nicht zusammen", icon: "verbot", inhalt: f,
          knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
          if (w !== "ok") return;
          T.aktiverKurs().trennen = neu;
          geaendert();
        });
      }

      function zeigeGruppen() {
        var anzahl = d.art === "anzahl";
        zahl.textContent = d.wert;
        minus.setAttribute("aria-label", anzahl ? "eine Gruppe weniger" : "eine Person weniger pro Gruppe");
        plus.setAttribute("aria-label", anzahl ? "eine Gruppe mehr" : "eine Person mehr pro Gruppe");
        einteilen.disabled = !anwesend().length;
        trennKnopf.disabled = liste().length < 2;
        gruppenEl.textContent = "";
        var nr = 0;
        d.gruppen.forEach(function (g) {
          var namen = g.map(nameVon).filter(Boolean);   // gelöschte oder heute fehlende Namen fallen weg
          if (!namen.length) return;
          var kasten = document.createElement("section");
          kasten.className = "zufall__gruppe";
          kasten.innerHTML = '<h3 class="label"></h3><ul></ul>';
          kasten.firstChild.textContent = "Gruppe " + (++nr);
          namen.forEach(function (n) { var li = document.createElement("li"); li.textContent = n; kasten.lastChild.appendChild(li); });
          gruppenEl.appendChild(kasten);
        });
        if (!nr) {
          var p = document.createElement("p");
          p.className = "zufall__leer";
          p.textContent = liste().length ? "Wähle oben aus und tippe auf „Einteilen“." : "Noch keine Namen. Trage sie unter „Liste“ ein.";
          gruppenEl.appendChild(p);
        }
      }

      // ---------- Liste ----------
      var namenEl = seiten.liste.querySelector(".zufall__namen");
      var standListe = seiten.liste.querySelector(".zufall__stand");
      var bearbeiten = knopf("btn", "Namen bearbeiten");
      seiten.liste.querySelector(".zufall__fuss").appendChild(bearbeiten);
      bearbeiten.addEventListener("click", bearbeiteNamen);

      namenEl.addEventListener("click", function (e) {
        var b = e.target.closest("[data-id]");
        if (!b) return;
        var s = liste().filter(function (x) { return x.id === b.dataset.id; })[0];
        if (fehlt(s)) delete s.fehlt; else s.fehlt = new Date().toDateString();
        geaendert();
      });

      function zeigeListe() {
        var l = liste(), weg = l.length - anwesend().length;
        standListe.textContent = !l.length ? "Noch keine Namen" :
          l.length + " Namen" + (weg ? " · " + weg + " fehl" + (weg === 1 ? "t" : "en") + " heute" : "") + " · antippen = fehlt heute";
        namenEl.textContent = "";
        l.forEach(function (s) {
          var b = knopf("chip", s.name);
          b.dataset.id = s.id;
          b.setAttribute("aria-pressed", fehlt(s) ? "true" : "false");
          b.title = fehlt(s) ? "fehlt heute – antippen, wenn doch da" : "antippen, wenn heute nicht da";
          namenEl.appendChild(b);
        });
      }

      function bearbeiteNamen() {
        var f = document.createElement("div");
        f.innerHTML = '<label class="feld-label" for="zufall-namen">Ein Name pro Zeile</label>' +
          '<textarea class="feld feld--text" id="zufall-namen" spellcheck="false" autocomplete="off"></textarea>' +
          '<p class="dialog__hinweis">Trage nur Pseudonyme ein. Die Liste bleibt in diesem Browser und in deiner Sicherungsdatei, sie wird nicht ins Internet geschickt.</p>';
        var feld = f.querySelector("textarea");
        feld.value = liste().map(function (s) { return s.name; }).join("\n");
        T.dialog({ titel: "Namen – " + T.aktiverKurs().name, icon: "stift", inhalt: f,
          knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
          if (w !== "ok") return;
          var alt = liste().slice(), k = T.aktiverKurs();
          // Gleiche Namen behalten ihre ID (und damit „fehlt heute“, Ziehungen, Gruppen)
          var neu = feld.value.split("\n").map(function (z) { return z.trim().slice(0, 30); }).filter(Boolean)
            .slice(0, MAX_NAMEN).map(function (n) {
              for (var i = 0; i < alt.length; i++) if (alt[i].name === n) return alt.splice(i, 1)[0];
              return { id: T.neueId(), name: n };
            });
          function uebernehme() { k.schueler = neu; geaendert(); }
          // alt = Namen, die wegfallen. Ein, zwei Tippfehler gehen ohne Frage, mehr (z. B. Feld versehentlich geleert) nicht.
          if (alt.length < 3) return uebernehme();
          var welche = alt.slice(0, 5).map(function (s) { return s.name; }).join(", ") + (alt.length > 5 ? " …" : ".");
          T.frage("Namen entfernen?", (neu.length ? alt.length + " Namen fallen aus der Liste: " + welche
            : "Die ganze Liste mit " + alt.length + " Namen wird geleert.") + " Das lässt sich nicht rückgängig machen.",
            "Ja, entfernen").then(function (ja) { if (ja) uebernehme(); });
        });
        setTimeout(function () { feld.focus(); }, 0);
      }

      // Liste geändert: speichern und alle Zufall-Widgets im Kurs neu zeigen
      function geaendert() {
        speichere();
        document.dispatchEvent(new CustomEvent("tafel:namen"));
      }

      function zeige() {
        reiter.forEach(function (b, i) {
          var an = SEITEN[i][0] === d.seite;
          b.classList.toggle("is-active", an);
          b.setAttribute("aria-pressed", an ? "true" : "false");
        });
        SEITEN.forEach(function (s) { seiten[s[0]].hidden = s[0] !== d.seite; });
        zeigeZiehen();
        zeigeGruppen();
        zeigeListe();
      }

      document.addEventListener("tafel:namen", zeige);
      zeige();

      return {
        entferne: function () { clearTimeout(rollt); document.removeEventListener("tafel:namen", zeige); },
        einstellungen: function () {
          var wahl = T.wahl("Beim Ziehen", "zufall-modus", [["einmal", "Jede:r nur einmal, bis alle dran waren"], ["frei", "Ganz zufällig, auch doppelt"]],
            d.einmal ? "einmal" : "frei");
          T.dialog({ titel: "Einstellungen", icon: "zahnrad", inhalt: wahl,
            knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
            if (w !== "ok") return;
            d.einmal = wahl.querySelector("input:checked").value === "einmal";
            speichere();
            zeige();
          });
        }
      };
    }
  });
})();
