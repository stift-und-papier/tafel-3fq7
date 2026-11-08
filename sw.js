/* ============================================================
   OFFLINE-SPEICHER (Service Worker) – damit die Tafel ohne Internet startet.
   Jede Datei der Seite wird beim Laden gemerkt. Danach kommt sie sofort aus dem
   Speicher, und im Hintergrund wird die neue Fassung geholt (beim nächsten Öffnen aktiv).
   Nur Dateien dieser Seite, nichts von anderen Servern.
   ============================================================ */
"use strict";
var SPEICHER = "tafel-dateien";

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SPEICHER).then(function (c) { return c.add("./"); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

function lege(c, anfrage, antwort) {
  // alte Fassungen derselben Datei (anderes ?v=) wegräumen
  var neu = new URL(anfrage.url);
  return c.put(anfrage, antwort).then(function () { return c.keys(); }).then(function (alle) {
    alle.forEach(function (k) {
      var u = new URL(k.url);
      if (u.pathname === neu.pathname && u.search !== neu.search) c.delete(k);
    });
  });
}

// Neue Seite (HTML) erst merken, wenn alle Dateien, die sie lädt, auch gemerkt sind.
// Sonst startet sie offline mit fehlenden Dateien.
function merke(anfrage, antwort) {
  if (!antwort || !antwort.ok || antwort.type !== "basic") return Promise.resolve();
  var kopie = antwort.clone();
  return caches.open(SPEICHER).then(function (c) {
    if ((kopie.headers.get("content-type") || "").indexOf("text/html") < 0) return lege(c, anfrage, kopie);
    return kopie.clone().text().then(function (html) {
      var urls = [], m, muster = /(?:src|href)="([^"#:]+)"/g;
      while ((m = muster.exec(html))) urls.push(new URL(m[1], anfrage.url).href);
      return Promise.all(urls.map(function (url) {
        return c.match(url).then(function (da) {
          return da || fetch(url).then(function (r) { if (r.ok) return lege(c, new Request(url), r); });
        });
      }));
    }).then(function () { return lege(c, anfrage, kopie); }, function () {});
  });
}

self.addEventListener("fetch", function (e) {
  var anfrage = e.request;
  if (anfrage.method !== "GET" || new URL(anfrage.url).origin !== location.origin) return;
  e.respondWith(caches.match(anfrage).then(function (gemerkt) {
    var fertig;
    var neu = fetch(anfrage).then(function (antwort) { fertig = merke(anfrage, antwort); return antwort; });
    e.waitUntil(neu.then(function () { return fertig; }).catch(function () {}));
    return gemerkt || neu;
  }));
});

// Die Seite schickt nach dem Start die Liste ihrer Dateien: die erste Ladung wird so auch gemerkt
self.addEventListener("message", function (e) {
  if (!e.data || e.data.art !== "merken" || !Array.isArray(e.data.dateien)) return;
  e.waitUntil(Promise.all(e.data.dateien.map(function (url) {
    if (new URL(url).origin !== location.origin) return null;
    return caches.match(url).then(function (da) {
      if (da) return null;
      return fetch(url).then(function (antwort) { return merke(new Request(url), antwort); }, function () {});
    });
  })));
});
