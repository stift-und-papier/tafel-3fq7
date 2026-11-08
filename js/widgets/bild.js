/* ============================================================
   BILD – ein Bild vom Gerät, passt sich ins Widget ein (ganz sichtbar).
   Zahnrad: anderes Bild wählen, Beschreibung für Screenreader.
   daten: { bild: "data:image/…" | null, alt: "" }
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;

  T.registriere("bild", {
    titel: "Bild", icon: "bild", farbwahl: true, groesse: { b: 480, h: 360 }, min: { b: 200, h: 160 },
    erstelle: function (el, d) {
      el.innerHTML = '<div class="bild"><img alt=""><button type="button" class="btn btn--primary">' + T.icon("bild", 28) + "Bild auswählen</button></div>";
      var img = el.querySelector("img"), waehlen = el.querySelector("button");
      waehlen.addEventListener("click", neuesBild);

      function zeige() {
        var da = T.istBild(d.bild);
        img.hidden = !da;
        waehlen.hidden = da;
        if (da) img.src = d.bild; else img.removeAttribute("src");
        img.alt = d.alt || "Bild";
      }

      function neuesBild() {
        T.bilderWaehlen(false).then(function (urls) {
          if (!urls.length) return;
          var alt = d.bild;
          d.bild = urls[0];
          T.speichereBild(function () { d.bild = alt; });
          zeige();
        });
      }

      zeige();
      return {
        einstellungen: function () {
          var f = document.createElement("div");
          f.innerHTML = '<label class="feld-label" for="bild-alt">Was ist zu sehen? (für Screenreader)</label>' +
            '<input class="feld" id="bild-alt" maxlength="120" autocomplete="off">';
          var feld = f.querySelector("input");
          feld.value = d.alt || "";
          // Dateiauswahl direkt im Klick öffnen (das iPad erlaubt sie nur dann)
          var anders = document.createElement("button");
          anders.type = "button";
          anders.className = "btn dialog__extra";
          anders.innerHTML = T.icon("bild", 28) + "Anderes Bild wählen";
          anders.addEventListener("click", function () { neuesBild(); f.closest("dialog").close("ok"); });
          f.appendChild(anders);
          T.dialog({ titel: "Einstellungen", icon: "zahnrad", inhalt: f,
            knoepfe: [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }] }).then(function (w) {
            if (w !== "ok") return;
            d.alt = feld.value.trim();
            T.speichere();
            zeige();
          });
        }
      };
    }
  });
})();
