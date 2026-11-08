/* ============================================================
   TIMER UND STOPPUHR – links Ring, Mitte Minuten:Sekunden mit
   + und − über/unter jeder Ziffer (nur Timer), rechts Start/Pause und Stopp.
   Am Ende: Glockenton und blinkender Ring. Umschalten über das Zahnrad.
   Gespeichert werden Zeitpunkte, darum läuft die Zeit auch beim Kurswechsel weiter.
   daten: { modus: "timer"|"stoppuhr",
            dauer (s), rest (ms), endeUm (Zeitstempel oder null)   ← Timer
            startUm (Zeitstempel oder null), bisher (ms)            ← Stoppuhr }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var MAX = 99 * 60 + 59;     // shortcut: höchstens 99:59, reicht für jede Doppelstunde; für mehr wäre eine Stundenanzeige nötig
  var STELLEN = [[600, "zehn Minuten"], [60, "eine Minute"], [10, "zehn Sekunden"], [1, "eine Sekunde"]];

  function zwei(n) { return (n < 10 ? "0" : "") + n; }

  T.registriere("timer", {
    titel: "Timer", icon: "wecker", groesse: { b: 640, h: 320 }, min: { b: 440, h: 240 },
    erstelle: function (el, d, speichere) {
      if (!d.modus) {
        d.modus = "timer"; d.dauer = 600; d.rest = 600000; d.endeUm = null; d.startUm = null; d.bisher = 0;
      }
      el.innerHTML = '<div class="timer"><div class="timer__ring"></div><div class="timer__zeit"></div><div class="timer__knoepfe"></div></div>';
      var timer = el.firstChild, zeit = timer.querySelector(".timer__zeit");
      // Ring als SVG (glatt, gut erkennbar): Hintergrundkreis, gefüllter Bogen, zwei Konturen
      timer.querySelector(".timer__ring").innerHTML =
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="timer__spur" cx="50" cy="50" r="40"/>' +
        '<circle class="timer__bogen" cx="50" cy="50" r="40" pathLength="360" transform="rotate(-90 50 50)"/>' +
        '<circle class="timer__kontur" cx="50" cy="50" r="47"/><circle class="timer__kontur" cx="50" cy="50" r="33"/></svg>';
      var bogen = timer.querySelector(".timer__bogen");
      var letzterWinkel = null;

      // Vier Ziffern, jede mit + darüber und − darunter
      var ziffern = STELLEN.map(function (s, i) {
        if (i === 2) zeit.insertAdjacentHTML("beforeend", '<div class="timer__ziffer"><span class="timer__platz"></span><span>:</span><span class="timer__platz"></span></div>');
        var spalte = document.createElement("div");
        spalte.className = "timer__ziffer";
        spalte.innerHTML = '<button type="button" class="timer__pm">+</button><span>0</span><button type="button" class="timer__pm">−</button>';
        var plus = spalte.children[0], minus = spalte.children[2];
        plus.setAttribute("aria-label", s[1] + " mehr");
        minus.setAttribute("aria-label", s[1] + " weniger");
        plus.addEventListener("click", function () { stelle(s[0]); });
        minus.addEventListener("click", function () { stelle(-s[0]); });
        zeit.appendChild(spalte);
        return spalte.children[1];
      });

      var startKnopf = T.iconKnopf("start", "Start", startPause);
      var stoppKnopf = T.iconKnopf("stopp", "Stopp und zurücksetzen", stopp);
      timer.querySelector(".timer__knoepfe").append(startKnopf, stoppKnopf);

      function jetzt() { return Date.now(); }
      function laeuft() { return d.modus === "timer" ? d.endeUm !== null : d.startUm !== null; }
      function restMs() { return d.endeUm !== null ? Math.max(0, d.endeUm - jetzt()) : d.rest; }
      function vergangenMs() { return d.bisher + (d.startUm !== null ? jetzt() - d.startUm : 0); }
      function sekunden() {
        return d.modus === "timer" ? Math.ceil(restMs() / 1000) : Math.min(MAX, Math.floor(vergangenMs() / 1000));
      }
      // Gefüllter Teil des Rings: Timer = verbleibende Zeit, Stoppuhr = laufende Minute
      function anteil() {
        if (d.modus === "timer") return d.dauer ? restMs() / (d.dauer * 1000) : 0;
        return (vergangenMs() % 60000) / 60000;
      }

      function zeichneRing(grad) { bogen.setAttribute("stroke-dasharray", grad + " 360"); }

      function zeige() {
        var s = sekunden(), text = zwei(Math.floor(s / 60)) + zwei(s % 60);
        ziffern.forEach(function (z, i) { z.textContent = text[i]; });
        var l = laeuft();
        if (l !== timer.classList.contains("laeuft")) {
          startKnopf.querySelector("img").src = "assets/icons/" + (l ? "pause" : "start") + ".svg";
          startKnopf.setAttribute("aria-label", l ? "Pause" : "Start");
          startKnopf.title = l ? "Pause" : "Start";
        }
        timer.classList.toggle("ist-stoppuhr", d.modus === "stoppuhr");
        timer.classList.toggle("laeuft", l);
        var winkel = Math.round(anteil() * 360);
        if (s === 0 && d.modus === "timer") winkel = 0;
        if (winkel !== letzterWinkel) { letzterWinkel = winkel; zeichneRing(winkel); }
      }

      function fertig(an) {
        timer.classList.toggle("is-fertig", an);
        if (an) T.glocke();
      }

      function tick() {
        if (d.modus === "timer" && d.endeUm !== null && d.endeUm <= jetzt()) {
          d.endeUm = null;
          d.rest = 0;
          speichere();
          fertig(true);
        }
        zeige();
      }

      function startPause() {
        fertig(false);
        if (d.modus === "timer") {
          if (d.endeUm !== null) {
            d.rest = restMs();
            d.endeUm = null;
          } else {
            if (d.rest <= 0) d.rest = d.dauer * 1000;   // nach Ablauf: neu starten
            if (d.rest > 0) d.endeUm = jetzt() + d.rest;
          }
        } else if (d.startUm !== null) {
          d.bisher = vergangenMs();
          d.startUm = null;
        } else {
          d.startUm = jetzt();
        }
        speichere();
        zeige();
      }

      function stopp() {
        fertig(false);
        d.endeUm = null; d.rest = d.dauer * 1000; d.startUm = null; d.bisher = 0;
        speichere();
        zeige();
      }

      function stelle(delta) {
        if (laeuft()) return;
        fertig(false);
        d.dauer = Math.max(0, Math.min(MAX, d.dauer + delta));
        d.rest = d.dauer * 1000;
        speichere();
        zeige();
      }

      function titel() {
        el.closest(".widget").querySelector(".window__title span").textContent = d.modus === "timer" ? "Timer" : "Stoppuhr";
      }

      titel();
      zeige();
      var takt = setInterval(tick, 250);

      return {
        entferne: function () { clearInterval(takt); },
        einstellungen: function () {
          var wahl = T.wahl("Art", "timer-art", [["timer", "Timer"], ["stoppuhr", "Stoppuhr"]], d.modus);
          T.dialog({ titel: "Einstellungen", icon: "zahnrad", inhalt: wahl,
            knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
            var neu = wahl.querySelector("input:checked").value;
            if (w !== "ok" || neu === d.modus) return;
            d.modus = neu;
            titel();
            stopp();
          });
        }
      };
    }
  });
})();
