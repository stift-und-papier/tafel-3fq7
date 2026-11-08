// Baut die Pixel-Motive dieses Projekts aus Pixelkarten.
// Jede Zeile ist eine Pixelreihe, jeder Buchstabe ein Pixel in einer Farbe aus FARBE, "." = durchsichtig.
// Aufruf (nur nötig, wenn du ein Motiv änderst oder neu zeichnest):  node tools/pixel-motive.mjs
// Ergebnis: assets/deko/<name>.svg (Originalgröße) und assets/icons/<name>.svg (in einem 14×14-Feld).
import { writeFileSync } from "node:fs";

const FARBE = {
  K: "#3B2418", // Kontur dunkelbraun
  w: "#FFF7EC", c: "#E3CCB0", a: "#F6C49A", o: "#EE9B5E", y: "#F6D774", Y: "#FBEAA8",
  s: "#9DBB8E", g: "#5F8A50", b: "#A9C8EA", l: "#CDCFEE", r: "#E7A3B2", t: "#E0805E", m: "#E3BC55"
};

// --- Hilfen für runde Formen: Füllung berechnen, Kontur automatisch ---
function raster(w, h, f) {
  const z = [];
  for (let y = 0; y < h; y++) { let s = ""; for (let x = 0; x < w; x++) s += f(x + 0.5, y + 0.5, x, y) || "."; z.push(s); }
  return z;
}
function umriss(z) {
  const h = z.length, w = z[0].length, voll = (x, y) => x >= 0 && y >= 0 && x < w && y < h && z[y][x] !== "." && z[y][x] !== "K";
  return z.map((s, y) => [...s].map((ch, x) => ch === "." && (voll(x - 1, y) || voll(x + 1, y) || voll(x, y - 1) || voll(x, y + 1)) ? "K" : ch).join(""));
}
const d = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);

const KARTEN = {
  // ---------- Deko ----------
  herz: [
    "..KKK..KKK..",
    ".KrrrKKrrrK.",
    "KrwwrrrrrrrK",
    "KrwrrrrrrrrK",
    "KrrrrrrrrrrK",
    ".KrrrrrrrrK.",
    "..KrrrrrrK..",
    "...KrrrrK...",
    "....KrrK....",
    ".....KK....."],
  wolke: [
    ".....KKK......",
    "....KwwwK.....",
    "..KKwwwwwKKK..",
    ".KwwwwwwwwwwK.",
    "KwwwwwwwwwwwwK",
    "KwwwwwwwwwwlwK",
    ".KllwwwwwwllK.",
    "..KKKKKKKKKK.."],
  stern: [
    "....K....",
    "...KyK...",
    "...KyK...",
    ".KKyyyKK.",
    "KyyywyyyK",
    ".KKyyyKK.",
    "...KyK...",
    "...KyK...",
    "....K...."],
  funkel: [
    "..K..",
    ".KyK.",
    "KyYyK",
    ".KyK.",
    "..K.."],
  sonne: [
    ".....oo.....",
    ".o...oo...o.",
    "..o.KKKK.o..",
    "...KyyyyK...",
    "..KyywyyyK..",
    "ooKywyyyyKoo",
    "ooKyyyyyyKoo",
    "..KyyyyyyK..",
    "...KyyyyK...",
    "..o.KKKK.o..",
    ".o...oo...o.",
    ".....oo....."],
  mond: umriss(raster(12, 12, (x, y) => d(x, y, 6, 6) <= 5 && d(x, y, 8.6, 3.6) > 4.4 ? "Y" : "")),

  // ---------- Icons (Reiter, Knöpfe, Listen) ----------
  "sonne-auf": [
    ".....oo.....",
    ".o...oo...o.",
    "..o......o..",
    "....KKKK....",
    "...KyyyyK...",
    "..KyywyyyK..",
    "ooKyyyyyyKoo",
    "KKKKKKKKKKKK"],
  wecker: [
    ".KK......KK.",
    "KttK....KttK",
    "KtKKKKKKKKtK",
    ".KKwwwwwwKK.",
    ".KwwwKwwwwK.",
    "KwwwwKwwwwwK",
    "KwwwwKKKwwwK",
    "KwwwwwwwwwwK",
    ".KwwwwwwwwK.",
    ".KKwwwwwwKK.",
    ".K.KKKKKK.K."],
  teller: umriss(raster(12, 12, (x, y) => d(x, y, 6, 6) <= 3.3 ? "l" : d(x, y, 6, 6) <= 5 ? "w" : "")),
  verbot: umriss(raster(12, 12, (x, y, i, j) => {
    const r = d(x, y, 6, 6);
    if (r > 5) return "";
    if (r >= 3.4) return "t";
    return (i === j || i === j + 1 || i + 1 === j) ? "t" : "w";
  })),
  waage: [
    ".....KK.....",
    "KKKKKKKKKKKK",
    ".K...KK...K.",
    ".K...KK...K.",
    "KyK..KK..KyK",
    "KyyK.KK.KyyK",
    "KKKK.KK.KKKK",
    ".....KK.....",
    "...KKKKKK...",
    "...KccccK...",
    "...KKKKKK..."].map((s, i) => i === 4 ? "KyyK.KK.KyyK" : i === 5 ? "KKKK.KK.KKKK" : i === 6 ? "............" : s).filter((s, i) => i !== 6),
  info: umriss(raster(12, 12, (x, y, i, j) => d(x, y, 6, 6) > 5 ? "" : (i >= 5 && i <= 6 && (j === 3 || (j >= 5 && j <= 8))) ? "w" : "b")),
  zahnrad: umriss(raster(12, 12, (x, y) => {
    const r = d(x, y, 6, 6), a = Math.atan2(y - 6, x - 6);
    if (r < 1.6) return "";
    return r <= (Math.cos(8 * a) > 0.2 ? 5.2 : 3.9) ? "o" : "";
  }))
};

const DEKO = ["stern", "funkel", "herz", "wolke", "sonne", "mond"];
const ICONS = ["sonne-auf", "sonne", "mond", "wecker", "herz", "info", "verbot", "waage", "zahnrad", "teller"];

// Prüfen: alle Zeilen gleich lang, nur bekannte Farben
for (const n of new Set([...DEKO, ...ICONS])) {
  const z = KARTEN[n];
  if (!z) throw new Error("Motiv fehlt: " + n);
  if (z.some((s) => s.length !== z[0].length)) throw new Error(n + ": Zeilen ungleich lang");
  for (const ch of z.join("")) if (ch !== "." && !FARBE[ch]) throw new Error(n + ": unbekannte Farbe " + ch);
}

// Kästchen: waagerechte Läufe gleicher Farbe, gleiche Läufe untereinander zusammengefasst
function rects(z) {
  const fertig = []; let offen = new Map();
  for (let y = 0; y <= z.length; y++) {
    const neu = new Map();
    if (y < z.length) for (let x = 0; x < z[y].length;) {
      const f = z[y][x]; if (f === ".") { x++; continue; }
      let e = x + 1; while (z[y][e] === f) e++;
      const k = x + "," + (e - x) + "," + f, alt = offen.get(k);
      if (alt) { alt.h++; neu.set(k, alt); offen.delete(k); } else neu.set(k, { x, y, w: e - x, h: 1, f });
      x = e;
    }
    offen.forEach((r) => fertig.push(r)); offen = neu;
  }
  return fertig.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${FARBE[r.f]}"/>`).join("");
}

// Icons stehen mittig (ganzzahliger Versatz) in einem 14×14-Feld, damit alle gleich groß sind
function svgDatei(z, feld) {
  const w = z[0].length, h = z.length;
  const ox = feld ? Math.floor((feld - w) / 2) : 0, oy = feld ? Math.floor((feld - h) / 2) : 0;
  const bw = feld || w, bh = feld || h;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-ox} ${-oy} ${bw} ${bh}" width="${bw}" height="${bh}" shape-rendering="crispEdges">${rects(z)}</svg>\n`;
}

for (const n of DEKO) writeFileSync("assets/deko/" + n + ".svg", svgDatei(KARTEN[n]));
for (const n of ICONS) writeFileSync("assets/icons/" + n + ".svg", svgDatei(KARTEN[n], 14));
console.log("Fertig:", DEKO.length, "Deko-Motive,", ICONS.length, "Icons");
