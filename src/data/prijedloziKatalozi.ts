// Uredive liste uobičajenih stavki za brzi odabir. Sve su samo prijedlozi - stručnjak klikom
// bira, ništa se ne upisuje automatski, a odabrano ostaje slobodno uredivo nakon odabira.
// OZO i pripadne norme nisu više ovdje: žive u src/data/ozoKatalog.ts, gdje svaka stavka nosi
// svoju normu.

export const LIJECNICKI_PREGLED_KATALOG: string[] = [
  "Opći liječnički pregled",
  "Pregled sluha (audiometrija)",
  "Pregled vida",
  "Pregled kralježnice / lokomotornog sustava",
  "Spirometrija (pluća)",
  "Neurološki pregled",
  "Dermatološki pregled",
  "Pregled kardiovaskularnog sustava",
  "Toksikološka obrada prema izloženosti",
];

export const ISPITIVANJA_KATALOG: string[] = [
  "Ispitivanje električnih instalacija",
  "Ispitivanje radne opreme",
  "Ispitivanje mikroklime",
  "Ispitivanje osvijetljenosti",
  "Ispitivanje buke",
  "Ispitivanje vibracija",
  "Ispitivanje kemijskih štetnosti u zraku",
  "Ispitivanje ventilacije / klimatizacije",
  "Ispitivanje gromobranske instalacije",
];

// Česte točke čl. 3 Pravilnika o poslovima s posebnim uvjetima rada (NN 5/84). Popis je kratak
// izbor za brzi unos, nije potpun prijepis propisa - primjenjivost na konkretan posao uvijek je
// PROVJERITI. Slobodan unos je dopušten.
export const TOCKA_PRAVILNIKA_PRIJEDLOZI: string[] = [
  "16 – teško fizičko naprezanje",
  "17 – rad na visini iznad 3 m",
];

// Rokovi u planu mjera - brzi odabir, uz mogućnost konkretnog datuma.
export const ROK_PRIJEDLOZI: string[] = ["odmah", "30 dana", "60 dana", "90 dana"];

export const PERIODIKA_PRIJEDLOZI: string[] = [
  "jednokratno",
  "mjesečno",
  "tromjesečno",
  "polugodišnje",
  "godišnje",
  "svake 2 godine",
];
