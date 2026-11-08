/* ============================================================
   TOGGLE – zwischen Abschnitten (Stimmungen) umschalten
   Alles Wichtige steht im HTML, nicht hier:
   - jeder Knopf: role="tab", data-mood="name", aria-controls="id-des-abschnitts"
     optional data-sky="name" (welcher Himmel; sonst gleich data-mood)
   - optional am <nav class="toggle">: data-auto-time="morgen 4-11, mittag 11-17, abend 17-4"
     → beim Laden wird der Abschnitt passend zur Uhrzeit gewählt (Stunden, "bis" ausschließlich)
   - zum Testen: ?stimmung=abend in der Adresse wählt einen Abschnitt fest aus
   Bedienung: Klick, oder Pfeiltasten links/rechts, Pos1, Ende.
   Weiche Übergänge macht nur CSS; bei "Bewegung reduzieren" schaltet CSS sie ab.
   ============================================================ */
(function () {
  "use strict";

  document.querySelectorAll(".toggle").forEach(function (toggle) {
    var tabs = Array.prototype.slice.call(toggle.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    var himmel = Array.prototype.slice.call(document.querySelectorAll(".sky__layer[data-sky]"));

    function waehle(tab, fokus) {
      tabs.forEach(function (t) {
        var aktiv = t === tab;
        t.setAttribute("aria-selected", aktiv ? "true" : "false");
        t.tabIndex = aktiv ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !aktiv;
      });
      if (fokus) tab.focus();
      var mood = tab.dataset.mood || "";
      var sky = tab.dataset.sky || mood;
      document.body.dataset.mood = mood;
      himmel.forEach(function (ebene) { ebene.classList.toggle("is-active", ebene.dataset.sky === sky); });
      document.dispatchEvent(new CustomEvent("toggle:change", { detail: { mood: mood, tab: tab } }));
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { waehle(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var neu = null;
        if (e.key === "ArrowRight") neu = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") neu = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") neu = 0;
        else if (e.key === "End") neu = tabs.length - 1;
        if (neu !== null) {
          e.preventDefault();
          waehle(tabs[neu], true);
        }
      });
    });

    function tabNamens(name) {
      return tabs.filter(function (t) { return t.dataset.mood === name; })[0] || null;
    }

    // "morgen 4-11, mittag 11-17, abend 17-4" → Abschnitt zur aktuellen Stunde
    function nachUhrzeit(regel) {
      if (!regel) return null;
      var h = new Date().getHours();
      var treffer = null;
      regel.split(",").forEach(function (teil) {
        var m = teil.trim().match(/^(\S+)\s+(\d{1,2})\s*-\s*(\d{1,2})$/);
        if (!m || treffer) return;
        var von = +m[2], bis = +m[3];
        var drin = von <= bis ? (h >= von && h < bis) : (h >= von || h < bis);   // auch über Mitternacht
        if (drin) treffer = tabNamens(m[1]);
      });
      return treffer;
    }

    var start =
      tabNamens(new URLSearchParams(location.search).get("stimmung")) ||
      nachUhrzeit(toggle.dataset.autoTime) ||
      tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] ||
      tabs[0];
    waehle(start, false);
  });
})();
