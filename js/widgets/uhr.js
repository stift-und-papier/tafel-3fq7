/* ============================================================
   UHR – aktuelle Uhrzeit, digital mit Datum oder analog als
   Zifferblatt (SVG, glatt). Umschalten über das Zahnrad.
   daten: { analog: true/false }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;

  function zwei(n) { return (n < 10 ? "0" : "") + n; }

  T.registriere("uhr", {
    titel: "Uhr", icon: "uhr", groesse: { b: 400, h: 280 }, min: { b: 240, h: 200 },
    erstelle: function (el, d, speichere) {
      el.innerHTML = '<div class="uhr"><div class="uhr__zeit"></div><div class="uhr__datum"></div><div class="uhr__analog"></div></div>';
      var uhr = el.firstChild;
      var zeit = uhr.querySelector(".uhr__zeit"), datum = uhr.querySelector(".uhr__datum");
      // Zifferblatt: 12 Striche, Zeiger drehen sich per transform (0° = 12 Uhr)
      var striche = "";
      for (var i = 0; i < 12; i++) {
        striche += '<line class="uhr__strich' + (i % 3 ? "" : " uhr__strich--gross") + '" x1="50" y1="' + (i % 3 ? 11 : 9) +
          '" x2="50" y2="17" transform="rotate(' + i * 30 + ' 50 50)"/>';
      }
      uhr.querySelector(".uhr__analog").innerHTML =
        '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="uhr__blatt" cx="50" cy="50" r="45"/>' + striche +
        '<line class="uhr__zeiger uhr__zeiger--h" x1="50" y1="54" x2="50" y2="27"/>' +
        '<line class="uhr__zeiger uhr__zeiger--m" x1="50" y1="56" x2="50" y2="16"/>' +
        '<line class="uhr__zeiger uhr__zeiger--s" x1="50" y1="58" x2="50" y2="13"/>' +
        '<circle class="uhr__mitte" cx="50" cy="50" r="3"/></svg>';
      var zeiger = uhr.querySelectorAll(".uhr__zeiger");
      var zuletzt = "";

      function drehe(z, grad) { z.setAttribute("transform", "rotate(" + grad + " 50 50)"); }
      function zeichne(t) {
        var h = t.getHours() % 12, m = t.getMinutes(), sek = t.getSeconds();
        drehe(zeiger[0], (h + m / 60) * 30);
        drehe(zeiger[1], (m + sek / 60) * 6);
        drehe(zeiger[2], sek * 6);
      }

      function tick() {
        var t = new Date(), schluessel = (d.analog ? "a" : "d") + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
        if (schluessel === zuletzt) return;
        zuletzt = schluessel;
        uhr.classList.toggle("ist-analog", !!d.analog);
        if (d.analog) {
          zeichne(t);
        } else {
          zeit.textContent = zwei(t.getHours()) + ":" + zwei(t.getMinutes());
          datum.textContent = t.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
        }
      }
      tick();
      var takt = setInterval(tick, 250);

      return {
        entferne: function () { clearInterval(takt); },
        einstellungen: function () {
          var wahl = T.wahl("Anzeige", "uhr-anzeige", [["digital", "Digital"], ["analog", "Analog"]], d.analog ? "analog" : "digital");
          T.dialog({ titel: "Einstellungen", icon: "zahnrad", inhalt: wahl,
            knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
            if (w !== "ok") return;
            d.analog = wahl.querySelector("input:checked").value === "analog";
            speichere();
            zuletzt = "";
            tick();
          });
        }
      };
    }
  });
})();
