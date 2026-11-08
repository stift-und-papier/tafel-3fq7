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

  // ---------- Bilder vom Gerät ----------
  // Öffnet die Dateiauswahl (am iPad auch die Fotos-App) → Promise mit Liste von data:-URLs.
  // Große Bilder werden verkleinert (längste Seite höchstens 1600 px), damit der Browser-Speicher
  // (meist nur etwa 5 MB für alles) nicht sofort voll ist. Fotos als JPEG, Bilder mit Durchsicht als PNG.
  var MAX_SEITE = 1600, KLEIN_GENUG = 300 * 1024;
  T.bilderWaehlen = function (mehrere) {
    return new Promise(function (fertig) {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = !!mehrere;
      input.addEventListener("change", function () {
        Promise.all(Array.prototype.map.call(input.files, verkleinere)).then(function (urls) {
          fertig(urls.filter(Boolean));
        });
      });
      input.click();
    });
  };

  function alsDataUrl(datei) {
    return new Promise(function (fertig) {
      var r = new FileReader();
      r.onload = function () { fertig(r.result); };
      r.onerror = function () { fertig(null); };
      r.readAsDataURL(datei);
    });
  }

  function verkleinere(datei) {
    if (!/^image\//.test(datei.type)) return Promise.resolve(null);
    return new Promise(function (fertig) {
      var url = URL.createObjectURL(datei), img = new Image();
      img.onerror = function () { URL.revokeObjectURL(url); fertig(null); };
      img.onload = function () {
        URL.revokeObjectURL(url);
        var b = img.naturalWidth, h = img.naturalHeight, f = Math.min(1, MAX_SEITE / Math.max(b, h));
        // kleine Dateien unverändert lassen (bleiben scharf, auch Pixelgrafik)
        if (f === 1 && datei.size <= KLEIN_GENUG && /^image\/(png|jpeg|gif|webp)$/.test(datei.type)) return alsDataUrl(datei).then(fertig);
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(b * f));
        c.height = Math.max(1, Math.round(h * f));
        var ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, c.width, c.height);
        fertig(hatDurchsicht(ctx, c) ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
      };
      img.src = url;
    });
  }

  function hatDurchsicht(ctx, c) {
    var px = ctx.getImageData(0, 0, c.width, c.height).data;
    for (var i = 3; i < px.length; i += 4) if (px[i] < 255) return true;
    return false;
  }

  // Nur echte eingebettete Bilder anzeigen (Schutz vor manipulierten Sicherungsdateien)
  T.istBild = function (url) { return typeof url === "string" && /^data:image\/(png|jpeg|gif|webp);base64,/.test(url); };

  // Speichern nach einem neuen Bild; passt es nicht mehr in den Speicher, wird es zurückgenommen
  T.speichereBild = function (zuruecknehmen) {
    if (T.speichere(true)) return true;
    zuruecknehmen();
    T.speichere(true);
    T.dialog({ titel: "Speicher voll", icon: "verbot",
      inhalt: "Das Bild passt nicht mehr in den Browser-Speicher. Lösche ein paar Bilder oder Folien und versuche es noch einmal." });
    return false;
  };
})();
