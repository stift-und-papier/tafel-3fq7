/* ============================================================
   KURS-REITER – ein Reiter pro Kurs. Klick wechselt die Tafel,
   Doppelklick oder Stift öffnet „Kurs bearbeiten“ (umbenennen, löschen),
   + legt einen neuen Kurs an. Tastatur: Pfeile links/rechts, Pos1, Ende.
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var liste = document.getElementById("reiter-liste");

  function finde(id) {
    return T.zustand.kurse.filter(function (k) { return k.id === id; })[0];
  }

  T.zeigeReiter = function () {
    liste.textContent = "";
    document.getElementById("kurs-label").textContent = "Klassenzimmer // " + T.aktiverKurs().name;
    T.zustand.kurse.forEach(function (k) {
      var aktiv = k.id === T.aktiverKurs().id;
      var r = document.createElement("div");
      r.className = "reiter" + (aktiv ? " is-aktiv" : "");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "reiter__knopf";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", aktiv ? "true" : "false");
      b.tabIndex = aktiv ? 0 : -1;
      b.dataset.id = k.id;
      b.textContent = k.name;
      r.appendChild(b);
      if (aktiv) {
        var s = document.createElement("button");
        s.type = "button";
        s.className = "reiter__stift";
        s.dataset.bearbeiten = k.id;
        s.title = "Kurs umbenennen oder löschen";
        s.setAttribute("aria-label", "Kurs „" + k.name + "“ umbenennen oder löschen");
        s.innerHTML = T.icon("stift", 28);
        r.appendChild(s);
      }
      liste.appendChild(r);
    });
    var aktiverReiter = liste.querySelector(".is-aktiv");
    if (aktiverReiter && aktiverReiter.scrollIntoView) aktiverReiter.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  function wechsle(id, fokus) {
    if (id !== T.zustand.aktiv) {
      T.zustand.aktiv = id;
      T.speichere();
      T.zeigeReiter();
      T.zeigeTafel();
    }
    if (fokus) liste.querySelector('[aria-selected="true"]').focus();
  }

  function bearbeite(id) {
    var k = finde(id);
    var feld = document.createElement("div");
    feld.innerHTML = '<label class="feld-label" for="kurs-name">Name des Kurses</label>' +
      '<input class="feld" id="kurs-name" maxlength="30" autocomplete="off" enterkeyhint="done">';
    var input = feld.querySelector("input");
    input.value = k.name;
    var knoepfe = [{ text: "Fertig", wert: "ok" }, { text: "Abbrechen", wert: "", hell: true }];
    if (T.zustand.kurse.length > 1) knoepfe.push({ text: "Kurs löschen", wert: "loeschen", hell: true });
    T.dialog({ titel: "Kurs bearbeiten", icon: "stift", inhalt: feld, knoepfe: knoepfe }).then(function (wert) {
      if (wert === "ok" && input.value.trim()) {
        k.name = input.value.trim();
        T.speichere();
        T.zeigeReiter();
      }
      if (wert === "loeschen") loesche(k);
    });
  }

  function loesche(k) {
    T.frage("Kurs löschen?", "„" + k.name + "“ wird mit allen Widgets gelöscht. Das lässt sich nicht rückgängig machen.",
      "Ja, löschen").then(function (ja) {
      if (!ja) return;
      var kurse = T.zustand.kurse, i = kurse.indexOf(k);
      kurse.splice(i, 1);
      if (T.zustand.aktiv === k.id) T.zustand.aktiv = kurse[Math.min(i, kurse.length - 1)].id;
      T.speichere();
      T.zeigeReiter();
      T.zeigeTafel();
    });
  }

  liste.addEventListener("click", function (e) {
    var stift = e.target.closest("[data-bearbeiten]");
    if (stift) return bearbeite(stift.dataset.bearbeiten);
    var tab = e.target.closest('[role="tab"]');
    if (tab) wechsle(tab.dataset.id, false);
  });
  liste.addEventListener("dblclick", function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab) bearbeite(tab.dataset.id);
  });
  liste.addEventListener("keydown", function (e) {
    var kurse = T.zustand.kurse, i = kurse.indexOf(T.aktiverKurs()), neu = null;
    if (!e.target.matches('[role="tab"]')) return;
    if (e.key === "ArrowRight") neu = (i + 1) % kurse.length;
    else if (e.key === "ArrowLeft") neu = (i - 1 + kurse.length) % kurse.length;
    else if (e.key === "Home") neu = 0;
    else if (e.key === "End") neu = kurse.length - 1;
    if (neu === null) return;
    e.preventDefault();
    wechsle(kurse[neu].id, true);
  });

  document.getElementById("knopf-neuer-kurs").addEventListener("click", function () {
    var k = T.neuerKurs("Kurs " + (T.zustand.kurse.length + 1));
    T.zustand.kurse.push(k);
    wechsle(k.id, false);
    bearbeite(k.id);
  });
})();
