/* ============================================================
   TON – Glockenton mit der Web Audio API (keine Audiodatei nötig).
   Das iPad spielt Ton erst nach einer Berührung: Beim ersten Tippen
   irgendwo auf der Seite wird der Ton still freigeschaltet.
   Tafel.glocke() spielt drei Glockenschläge.
   ============================================================ */
(function () {
  "use strict";
  var T = window.Tafel;
  var ctx = null;

  // iPad/iPhone: auch bei Stummschalter Ton abspielen (iOS 17+, sonst ohne Wirkung)
  if (navigator.audioSession) navigator.audioSession.type = "playback";

  function kontext() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function freischalten() {
    var c = kontext();
    if (c) {
      var still = c.createBufferSource();
      still.buffer = c.createBuffer(1, 1, 22050);
      still.connect(c.destination);
      still.start(0);
    }
    ["click", "touchend", "keydown"].forEach(function (art) { document.removeEventListener(art, freischalten, true); });
  }
  ["click", "touchend", "keydown"].forEach(function (art) { document.addEventListener(art, freischalten, true); });

  // Ein Glockenschlag: Grundton plus unharmonische Obertöne, die schnell verklingen
  function schlag(c, t0) {
    [[1, 0.5], [2.76, 0.22], [5.4, 0.1], [8.93, 0.05]].forEach(function (p) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = "sine";
      o.frequency.value = 660 * p[0];
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(p[1], t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4 / Math.sqrt(p[0]));
      o.connect(g);
      g.connect(c.destination);
      o.start(t0);
      o.stop(t0 + 2.5);
    });
  }

  T.glocke = function () {
    var c = kontext();
    if (!c) return;
    var t = c.currentTime + 0.05;
    for (var i = 0; i < 3; i++) schlag(c, t + i * 1.3);
  };
})();
