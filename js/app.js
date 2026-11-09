/* ============================================================
   APP – baut die Widget-Leiste, Vollbild und das Sicherungs-Menü
   und startet die Tafel. Wird als letztes Skript geladen.
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var TAG = 864e5;

  // ---------- Widget-Leiste: Icon über Text ----------
  var leiste = document.getElementById("leiste-widgets");
  T.widgetReihenfolge.forEach(function (typ) {
    var a = T.widgets[typ];
    if (!a) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "leiste__knopf";
    b.innerHTML = T.icon(a.icon, 56) + "<span></span>";
    b.querySelector("span").textContent = a.titel;
    b.addEventListener("click", function () { T.fuegeHinzu(typ); });
    leiste.appendChild(b);
  });

  // ---------- Vollbild (am iPad mit webkit-Vorsilbe) ----------
  var vollbild = document.getElementById("knopf-vollbild"), root = document.documentElement;
  var vollbildAn = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!vollbildAn) vollbild.hidden = true;
  vollbild.addEventListener("click", function () {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      vollbildAn.call(root);
    }
  });
  // Beschriftung zeigt, was der Knopf als Nächstes tut
  function zeigeVollbild() {
    vollbild.querySelector("span").textContent = document.fullscreenElement || document.webkitFullscreenElement ? "Vollbild aus" : "Vollbild";
  }
  document.addEventListener("fullscreenchange", zeigeVollbild);
  document.addEventListener("webkitfullscreenchange", zeigeVollbild);

  // ---------- Bildschirm wach halten, solange ein Timer oder eine Stoppuhr läuft ----------
  // Sonst sperrt das iPad nach der Auto-Sperre-Zeit und die Projektion wird schwarz.
  var wach = null;   // Promise der laufenden Anfrage
  function wachHalten() {
    var soll = document.visibilityState === "visible" && T.laeuftEinTimer(T.zustand, Date.now());
    if (soll && !wach && navigator.wakeLock) {
      var p = wach = navigator.wakeLock.request("screen").then(function (s) {
        s.addEventListener("release", function () { if (wach === p) wach = null; });   // z. B. App im Hintergrund
        return s;
      }, function () { if (wach === p) wach = null; return null; });
    } else if (!soll && wach) {
      wach.then(function (s) { if (s) s.release(); });
      wach = null;
    }
  }
  document.addEventListener("tafel:gespeichert", wachHalten);   // Start, Pause, Stopp speichern
  document.addEventListener("visibilitychange", wachHalten);
  setInterval(wachHalten, 10000);   // Timer, der in einem anderen Kurs abläuft

  // ---------- Sicherung: Menü, Erinnerung nach 6 Tagen ----------
  var sicherung = document.getElementById("knopf-sicherung");

  function tageSeitSicherung() {
    var d = T.zustand.letzteSicherung;
    if (!d) return null;
    var mitternacht = function (t) { t = new Date(t); t.setHours(0, 0, 0, 0); return t; };
    return Math.round((mitternacht(Date.now()) - mitternacht(d)) / TAG);
  }
  function brauchtSicherung() {
    var tage = tageSeitSicherung();
    if (tage === null) return T.zustand.kurse.some(function (k) { return k.widgets.length > 0; });
    return tage >= 6;   // Safari löscht Daten einer Seite nach 7 Tagen ohne Besuch
  }
  function sicherungsText() {
    var tage = tageSeitSicherung();
    if (tage === null) return "Du hast noch keine Sicherung gespeichert.";
    var wann = tage === 0 ? "heute" : tage === 1 ? "gestern" : "vor " + tage + " Tagen";
    return "Zuletzt gesichert am " + new Date(T.zustand.letzteSicherung).toLocaleDateString("de-DE") + " (" + wann + ").";
  }
  function erinnerung() {
    var noetig = brauchtSicherung();
    sicherung.classList.toggle("hat-hinweis", noetig);
    sicherung.title = noetig ? "Zeit für eine neue Sicherung" : sicherungsText();
  }
  document.addEventListener("tafel:gespeichert", erinnerung);

  function zeigeFehler() {
    T.dialog({ titel: "Das hat nicht geklappt", icon: "verbot",
      inhalt: "Diese Datei ist keine gültige Tafel-Sicherung." });
  }

  function ladeSicherung(datei) {
    T.sicherungLesen(datei).then(function (z) {
      var vom = z.letzteSicherung ? " vom " + new Date(z.letzteSicherung).toLocaleDateString("de-DE") : "";
      return T.frage("Sicherung laden?", "Die Sicherung" + vom + " ersetzt alle Kurse, die gerade auf diesem Gerät sind. " +
        "Das lässt sich nicht rückgängig machen.", "Ja, ersetzen").then(function (ja) {
        if (!ja) return;
        T.ersetze(z);
        T.zeigeReiter();
        T.zeigeTafel();
      });
    }, zeigeFehler);
  }

  sicherung.addEventListener("click", function () {
    var inhalt = document.createElement("div");
    inhalt.innerHTML =
      '<p class="dialog__wichtig"></p>' +
      "<p>Die Sicherung ist eine Datei mit allen Kursen, auch mit den Kürzeln deiner Schüler:innen. " +
      "Bewahre sie gut auf und lade sie nirgends öffentlich hoch.</p>" +
      '<div class="dialog__aktionen">' +
      '<button type="button" class="btn btn--primary">' + T.icon("speichern", 28) + "Sicherung speichern</button>" +
      '<label class="btn">' + T.icon("laden", 28) + "Sicherung laden" +
      '<input type="file" class="unsichtbar" accept=".json,application/json"></label></div>';
    var text = sicherungsText() + (brauchtSicherung() ? " Zeit für eine neue!" : "");
    inhalt.querySelector(".dialog__wichtig").textContent = text;
    // nur in Safari am iPad/iPhone (nicht in der App vom Home-Bildschirm)
    if (navigator.standalone === false) {
      var tipp = document.createElement("p");
      tipp.className = "dialog__hinweis";
      tipp.textContent = "Tipp: Öffnest du die Tafel eine Woche lang nicht, kann Safari deine Daten löschen. " +
        "Als App vom Home-Bildschirm passiert das nicht.";
      inhalt.appendChild(tipp);
    }
    inhalt.querySelector("button").addEventListener("click", function () {
      T.sicherungSpeichern();
      inhalt.closest("dialog").close();
    });
    inhalt.querySelector("input").addEventListener("change", function (e) {
      var datei = e.target.files[0];
      inhalt.closest("dialog").close();
      if (datei) ladeSicherung(datei);
    });
    T.dialog({ titel: "Sicherung", icon: "speichern", inhalt: inhalt, knoepfe: [{ text: "Schließen", wert: "", hell: true }] });
  });

  // ---------- Start ----------
  T.zeigeReiter();
  T.zeigeTafel();
  erinnerung();
  // Browser bitten, die Daten nicht von selbst zu löschen (wirkt nicht überall, schadet nie)
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});

  // ---------- Offline-Speicher (sw.js): nur über http(s), nicht beim Öffnen per Doppelklick ----------
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("sw.js").then(function () { return navigator.serviceWorker.ready; }).then(function (reg) {
      // alles, was diese Seite schon geladen hat, auch für den Start ohne Internet merken
      var dateien = performance.getEntriesByType("resource").map(function (r) { return r.name; }).concat(location.href.split("#")[0]);
      reg.active.postMessage({ art: "merken", dateien: dateien });
    }).catch(function () {});
  }
})();
