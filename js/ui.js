/* ============================================================
   UI-HELFER – Dialogfenster im Kartenstil und Icon-Knöpfe.
   Tafel.dialog({ titel, icon, inhalt, knoepfe }) → Promise mit dem
   Wert des gedrückten Knopfs ("" bei Abbrechen oder Esc).
   Der erste Knopf ist der Hauptknopf (Enter) und steht rechts.
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;

  function icon(name, groesse) {
    return '<img class="pixel" src="assets/icons/' + name + '.svg" width="' + groesse + '" height="' + groesse + '" alt="">';
  }
  T.icon = icon;

  T.dialog = function (o) {
    return new Promise(function (fertig) {
      var d = document.createElement("dialog");
      d.className = "dialog window";
      d.innerHTML =
        '<div class="window__titlebar"><h2 class="window__title">' + icon(o.icon || "info", 14) + '<span></span></h2>' +
        '<div class="window__tools"><div class="window__buttons" aria-hidden="true"><i></i><i></i><i></i></div></div></div>' +
        '<form method="dialog" class="window__body"><div class="dialog__inhalt"></div><div class="dialog__knoepfe"></div></form>';
      d.querySelector(".window__title span").textContent = o.titel;
      var inhalt = d.querySelector(".dialog__inhalt");
      if (typeof o.inhalt === "string") {
        var p = document.createElement("p");
        p.textContent = o.inhalt;
        inhalt.appendChild(p);
      } else if (o.inhalt) {
        inhalt.appendChild(o.inhalt);
      }
      (o.knoepfe || [{ text: "OK", wert: "ok" }]).forEach(function (k) {
        var b = document.createElement("button");
        b.className = "btn" + (k.hell ? "" : " btn--primary");
        b.value = k.wert;
        b.textContent = k.text;
        d.querySelector(".dialog__knoepfe").appendChild(b);
      });
      d.addEventListener("close", function () {
        d.remove();
        fertig(d.returnValue);
      });
      document.body.appendChild(d);
      d.showModal();
    });
  };

  // Ja/Nein-Rückfrage → Promise<boolean>
  T.frage = function (titel, text, jaText) {
    return T.dialog({
      titel: titel, icon: "info", inhalt: text,
      knoepfe: [{ text: jaText, wert: "ja" }, { text: "Abbrechen", wert: "", hell: true }]
    }).then(function (w) { return w === "ja"; });
  };

  // Quadratischer heller Knopf mit Icon (z. B. Werkzeugleiste am Widget)
  T.iconKnopf = function (name, text, aktion) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn--square";
    b.title = text;
    b.setAttribute("aria-label", text);
    b.innerHTML = icon(name, 28);
    b.addEventListener("click", aktion);
    return b;
  };

  // Auswahl als Knopfreihe (Radio-Knöpfe), z. B. Digital | Analog.
  // optionen: [[wert, text], …]; gewählter Wert: feld.querySelector("input:checked").value
  T.wahl = function (titel, name, optionen, wert) {
    var f = document.createElement("fieldset");
    f.className = "choice";
    f.innerHTML = '<legend class="feld-label"></legend>';
    f.querySelector("legend").textContent = titel;
    optionen.forEach(function (o) {
      var l = document.createElement("label");
      var i = document.createElement("input");
      i.type = "radio";
      i.name = name;
      i.value = o[0];
      i.checked = o[0] === wert;
      l.appendChild(i);
      var t = document.createElement("span");
      t.textContent = o[1];
      l.appendChild(t);
      f.appendChild(l);
    });
    return f;
  };
})();
