// Baut die Pixel-Motive dieses Projekts aus Pixelkarten.
// Jede Zeile ist eine Pixelreihe, jeder Buchstabe ein Pixel in einer Farbe aus FARBE, "." = durchsichtig.
// Aufruf (nur nötig, wenn du ein Motiv änderst oder neu zeichnest):  node tools/pixel-motive.mjs
// Ergebnis: assets/deko/<name>.svg (Originalgröße) und assets/icons/<name>.svg (in einem 14×14-Feld).
import { writeFileSync } from "node:fs";

// Farben aus css/tokens.css (Design v2) – Buchstaben bleiben, damit alle Karten weiter passen
const FARBE = {
  K: "#264653", // Kontur: --c-petrol-dark
  w: "#FFFFFF", // --white
  c: "#F9EED5", // --cream-deep
  a: "#FBDAC0", // --tint-orange-40
  o: "#F4A261", // --c-orange
  y: "#E9C46A", // --c-sun
  Y: "#F6E7C3", // --tint-sun-40
  s: "#8AB17D", // --c-sage
  g: "#287271", // --c-petrol
  b: "#2A9D8F", // --c-teal
  l: "#B4DDD8", // --tint-teal-35
  r: "#E97C61", // --c-coral-soft
  t: "#E76F51", // --c-coral
  m: "#EFB366"  // --c-honey
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

const pfeilRechts = [
  ".....K.....",
  ".....KK....",
  ".....KtK...",
  "KKKKKKttK..",
  "KttttttttK.",
  "KtttttttttK",
  "KttttttttK.",
  "KKKKKKttK..",
  ".....KtK...",
  ".....KK....",
  ".....K....."];

const KARTEN = {
  // ---------- Sprites neben der Lehrer:in-Figur ----------
  ausrufe: [".KKK.","KyyyK","KyyyK","KyyyK","KyyyK","KyyyK",".KyK.",".KyK.","..K..",".....",".KKK.","KyyyK","KyyyK",".KKK."],
  frage: ["..KKKKK..",".KbbbbbK.","KbbKKKbbK","KbK...KbK",".K....KbK",".....KbbK","....KbbK.","...KbbK..","...KbK...","....K....","...KKK...","...KbK...","...KKK..."],
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
  wecker: [   // runder Körper (12 × 11), Glocken oben, Füße unten
    ".KK......KK.",
    "KttK....KttK",
    "KtKKKKKKKKtK",
    ".KKwwwwwwKK.",
    ".KwwwwKwwwK.",
    "KwwwwwKwwwwK",
    "KwwwwwKwwwwK",
    "KwwwwwKKKwwK",
    "KwwwwwwwwwwK",
    "KwwwwwwwwwwK",
    ".KwwwwwwwwK.",
    ".KKwwwwwwKK.",
    "..KKKKKKKK..",
    ".K........K."],
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
  })),

  // ---------- Icons für die Tafel-App ----------
  // Widget-Leiste
  wuerfel: [
    ".KKKKKKKKKK.",
    "KwwwwwwwwwwK",
    "KwKKwwwwKKwK",
    "KwKKwwwwKKwK",
    "KwwwwwwwwwwK",
    "KwwwwKKwwwwK",
    "KwwwwKKwwwwK",
    "KwwwwwwwwwwK",
    "KwKKwwwwKKwK",
    "KwKKwwwwKKwK",
    "KccccccccccK",
    ".KKKKKKKKKK."],
  bild: [
    "KKKKKKKKKKKK",
    "KbbbbbbbbbbK",
    "KbbbbbbbyybK",
    "KbbbbbbbyybK",
    "KbbbbbbbbbbK",
    "KbbbKbbbbbbK",
    "KbbKsKbbbbbK",
    "KbKsssKbbKbK",
    "KKsssssKKsKK",
    "KssssssssssK",
    "KssssssssssK",
    "KKKKKKKKKKKK"],
  text: [
    "KKKKKKKKKKKK",
    "KwwwwwwwwwwK",
    "KwKKKKKKKKwK",
    "KwKKKKKKKKwK",
    "KwwwwKKwwwwK",
    "KwwwwKKwwwwK",
    "KwwwwKKwwwwK",
    "KwwwwKKwwwwK",
    "KwwwwKKwwwwK",
    "KwwwwKKwwwwK",
    "KwwwwwwwwwwK",
    "KKKKKKKKKKKK"],
  uhr: umriss(raster(11, 11, (x, y, i, j) => {
    if (d(x, y, 5.5, 5.5) > 4.6) return "";
    if (i === 5 && j === 5) return "t";
    if ((i === 5 && j >= 2 && j <= 5) || (j === 5 && i >= 5 && i <= 8)) return "K";
    return "w";
  })),
  kalender: [
    "KKKKKKKKKKKKK",
    "KtttttttttttK",
    "KtttttttttttK",
    "KKKKKKKKKKKKK",
    "KwwKwwKwwKwwK",
    "KwwKwwKwwKwwK",
    "KKKKKKKKKKKKK",
    "KwwKssKwwKwwK",
    "KwwKssKwwKwwK",
    "KKKKKKKKKKKKK",
    "KwwKwwKwwKwwK",
    "KwwKwwKwwKwwK",
    "KKKKKKKKKKKKK"],
  folien: [
    "KKKKKKKKKKKK",
    "KwwwwwwwwwwK",
    "KwKKKKwwwwwK",
    "KwwwwwwwwwwK",
    "KwwwwwwwowwK",
    "KwwwwowwowwK",
    "KwwowowwowwK",
    "KwwowowwowwK",
    "KKKKKKKKKKKK",
    ".....KK.....",
    "....K..K....",
    "...K....K..."],
  // Knöpfe und Werkzeugleiste
  muell: [
    "....KKKK....",
    "KKKKKKKKKKKK",
    "KccccccccccK",
    "KKKKKKKKKKKK",
    ".KwwKwwKwwK.",
    ".KwwKwwKwwK.",
    ".KwwKwwKwwK.",
    ".KwwKwwKwwK.",
    ".KwwKwwKwwK.",
    ".KwwKwwKwwK.",
    ".KwwwwwwwwK.",
    "..KKKKKKKK.."],
  stift: [
    "........KKK.",
    ".......KrrrK",
    "......KyKrrK",
    ".....KyyyKK.",
    "....KyyyyK..",
    "...KyyyyK...",
    "..KyyyyK....",
    ".KcyyyK.....",
    ".KccyK......",
    "KKKcK.......",
    "KKKK........"],
  start: [
    "KK........",
    "KgKK......",
    "KgggKK....",
    "KgggggKK..",
    "KgggggggKK",
    "KggggggggK",
    "KgggggggKK",
    "KgggggKK..",
    "KgggKK....",
    "KgKK......",
    "KK........"],
  pause: Array.from({ length: 10 }, (_, i) => i === 0 || i === 9 ? "KKKK..KKKK" : "KmmK..KmmK"),
  stopp: Array.from({ length: 10 }, (_, i) => i === 0 || i === 9 ? "KKKKKKKKKK" : "KttttttttK"),
  vollbild: [
    "KKKK....KKKK",
    "KKKK....KKKK",
    "KK........KK",
    "KK........KK",
    "............",
    "............",
    "............",
    "............",
    "KK........KK",
    "KK........KK",
    "KKKK....KKKK",
    "KKKK....KKKK"],
  "pfeil-rechts": pfeilRechts,
  "pfeil-links": pfeilRechts.map((s) => [...s].reverse().join("")),
  kreuz: umriss(raster(13, 13, (x, y, i, j) => i < 1 || j < 1 || i > 11 || j > 11 ? "" : (Math.abs(i - j) <= 1 || Math.abs(i + j - 12) <= 1) ? "t" : "")),
  speichern: [
    "KKKKKKKKKKK.",
    "KbKwwwwwKbKK",
    "KbKwwwwwKbbK",
    "KbKwwwKwKbbK",
    "KbKKKKKKKbbK",
    "KbbbbbbbbbbK",
    "KbKKKKKKKKbK",
    "KbKwwwwwwKbK",
    "KbKwwwwwwKbK",
    "KbKwwwwwwKbK",
    "KbKwwwwwwKbK",
    "KKKKKKKKKKKK"],
  laden: [
    "KKKKK.......",
    "KyyyyKKKKKK.",
    "KyyyyyyyyyyK",
    "KKKKKKKKKKKK",
    "KmmmmmmmmmmK",
    "KmmmmmmmmmmK",
    "KmmmmmmmmmmK",
    "KmmmmmmmmmmK",
    "KmmmmmmmmmmK",
    "KKKKKKKKKKKK"]
};

const DEKO = ["ausrufe", "frage", "herz"];
const ICONS = ["sonne-auf", "sonne", "mond", "wecker", "herz", "info", "verbot", "waage", "zahnrad", "teller",
  "wuerfel", "bild", "text", "uhr", "kalender", "folien", "muell", "stift", "start", "pause", "stopp", "vollbild", "pfeil-links", "pfeil-rechts", "kreuz", "speichern", "laden"];

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
