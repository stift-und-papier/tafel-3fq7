/* ============================================================
   SPEICHER – alle Kurse liegen als ein Objekt im Browser (localStorage).
   Autosave: Wer etwas ändert, ruft Tafel.speichere() auf.
   Sicherung: alles als JSON-Datei exportieren und wieder laden.
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel = window.Tafel || {};
  var SCHLUESSEL = "tafel.v1";

  T.neueId = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  T.neuerKurs = function (name) { return { id: T.neueId(), name: name, widgets: [] }; };

  function startZustand() {
    var kurse = [];
    for (var i = 1; i <= 9; i++) kurse.push(T.neuerKurs("Kurs " + i));
    return { version: 1, aktiv: kurse[0].id, kurse: kurse, letzteSicherung: null };
  }

  // Prüft gespeicherte Daten und Sicherungsdateien, bevor die App sie benutzt
  T.pruefe = function (z) {
    if (!z || z.version !== 1 || !Array.isArray(z.kurse) || !z.kurse.length) return false;
    return z.kurse.every(function (k) {
      return k && typeof k.id === "string" && typeof k.name === "string" && Array.isArray(k.widgets) &&
        (k.schueler === undefined || Array.isArray(k.schueler) && k.schueler.every(function (s) {
          return s && typeof s.id === "string" && typeof s.name === "string";
        })) &&
        (k.trennen === undefined || Array.isArray(k.trennen) && k.trennen.every(function (p) {
          return Array.isArray(p) && p.length === 2 && typeof p[0] === "string" && typeof p[1] === "string";
        })) &&
        k.widgets.every(function (w) {
          return w && typeof w.id === "string" && typeof w.typ === "string" &&
            [w.x, w.y, w.b, w.h].every(Number.isFinite) && typeof w.daten === "object" && w.daten !== null;
        });
    });
  };

  function lade() {
    var roh = null;
    try {
      roh = localStorage.getItem(SCHLUESSEL);
      var z = JSON.parse(roh);
      if (T.pruefe(z)) return z;
      // Unlesbarer Stand: nicht einfach überschreiben, sondern beiseitelegen
      if (roh) localStorage.setItem(SCHLUESSEL + ".kaputt", roh);
    } catch (e) {
      try { if (roh) localStorage.setItem(SCHLUESSEL + ".kaputt", roh); } catch (e2) { /* nichts zu retten */ }
    }
    return startZustand();
  }

  T.zustand = lade();

  T.aktiverKurs = function () {
    var z = T.zustand;
    return z.kurse.filter(function (k) { return k.id === z.aktiv; })[0] || z.kurse[0];
  };

  var vollGemeldet = false;
  // → true, wenn gespeichert. leise = keine eigene Meldung (der Aufrufer meldet selbst, z. B. bei Bildern)
  T.speichere = function (leise) {
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(T.zustand));
      document.dispatchEvent(new CustomEvent("tafel:gespeichert"));
      return true;
    } catch (e) {
      if (leise === true) return false;
      if (!vollGemeldet && T.dialog) {
        vollGemeldet = true;
        T.dialog({ titel: "Speicher voll", icon: "verbot",
          inhalt: "Der Browser-Speicher ist voll, deine letzte Änderung wurde nicht gespeichert. Speichere eine Sicherung und lösche ein paar Bilder oder Widgets." });
      }
      return false;
    }
  };

  // Ganzen Stand durch eine geprüfte Sicherung ersetzen
  T.ersetze = function (z) {
    if (!z.kurse.some(function (k) { return k.id === z.aktiv; })) z.aktiv = z.kurse[0].id;
    T.zustand = z;
    T.speichere();
  };

  // Datum als JJJJ-MM-TT in Ortszeit (für den Dateinamen)
  function heute() {
    var d = new Date(), zwei = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + zwei(d.getMonth() + 1) + "-" + zwei(d.getDate());
  }

  T.sicherungSpeichern = function () {
    T.zustand.letzteSicherung = new Date().toISOString();
    T.speichere();
    var url = URL.createObjectURL(new Blob([JSON.stringify(T.zustand, null, 1)], { type: "application/json" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "tafel-sicherung-" + heute() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  };

  // Liest eine Datei und gibt den geprüften Stand zurück (oder einen Fehler)
  T.sicherungLesen = function (datei) {
    return datei.text().then(JSON.parse).then(function (z) {
      if (!T.pruefe(z)) throw new Error("keine Tafel-Sicherung");
      return z;
    });
  };
})();
