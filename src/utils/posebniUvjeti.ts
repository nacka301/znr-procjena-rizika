import type { Posao, Rizik } from "../types";

// Posao se automatski smatra "poslom s posebnim uvjetima rada" samo ako ijedan njegov rizik ima
// upisanu KONKRETNU točku Pravilnika (NN 5/84, čl. 3) - broj točke, npr. "16 – teško fizičko
// naprezanje", "18/19" ili "1, 16, 18/19, 18/24". Neodređeni tekst ("18 ili sljedeće, PROVJERITI",
// "treba provjeriti") NE uključuje posao u Prilog 9, jer to nije utvrđena točka nego bilješka
// stručnjaka. Stručnjak i dalje može ručno uključiti posao kvačicom u Prilogu 9.

/** Neobvezni prefiks: "točka 16", "tč. 16", "t. 16". */
const PREFIKS_TOCKA = /^(?:to[čc]ka|t[čc]\.?|t\.)\s*/i;

/** Popis točaka i podtočaka: "16", "18/19", "1, 16, 18/19, 18/24". */
const POPIS_TOCAKA = /^\d+(?:\s*\/\s*\d+)*(?:\s*,\s*\d+(?:\s*\/\s*\d+)*)*/;

// Riječi koje znače da točka NIJE utvrđena, nego je bilješka stručnjaka. Zbog njih tekst nije
// konkretna točka ni kad počinje brojem ("18 ili sljedeće, PROVJERITI").
const NEODREDENO =
  /\b(?:ili|odnosno|eventualno|mo[žz]da|vjerojatno|provjeriti|provjera|nepoznato|otprilike|cca|pribli[žz]no|slijede[ćc]e|sljede[ćc]e)\b/i;

/**
 * Konkretna točka = (neobvezni prefiks "točka"/"t.") pa popis brojeva s mogućim podtočkama,
 * nakon čega slijedi kraj teksta, razdjelnik ili opisna oznaka točke.
 *
 * ✓ "16", "16 – teško fizičko naprezanje", "17.", "18/19", "18/24 buka", "18 (19)",
 *   "1, 16, 18/19, 18/24", "točka 18/19", "t. 16"
 * ✗ "18 ili sljedeće, PROVJERITI", "treba provjeriti", "", "?", "nepoznato"
 */
export function jeKonkretnaTocka(tockaPravilnika: string | undefined | null): boolean {
  const tekst = (tockaPravilnika ?? "").trim();
  if (!tekst) return false;
  if (NEODREDENO.test(tekst)) return false;

  const bezPrefiksa = tekst.replace(PREFIKS_TOCKA, "");
  const popis = POPIS_TOCAKA.exec(bezPrefiksa);
  if (!popis) return false;

  // Iza popisa točaka smije stajati samo kraj teksta, razdjelnik ili opis odvojen prazninom
  // ("16 – teško fizičko naprezanje", "18/24 buka"). Slovo odmah uz broj ("16a-ili-18") nije točka.
  const ostatak = bezPrefiksa.slice(popis[0].length);
  return ostatak === "" || /^[\s–—\-.,:;()]/.test(ostatak);
}

export function rizikSKonkretnomTockom(r: Rizik): boolean {
  return jeKonkretnaTocka(r.tockaPravilnika);
}

export function imaTockuPravilnika(p: Posao): boolean {
  return p.rizici.some(rizikSKonkretnomTockom);
}

export function opisTocke(p: Posao): string {
  return p.rizici
    .filter(rizikSKonkretnomTockom)
    .map((r) => `${r.naziv} – točka ${(r.tockaPravilnika ?? "").trim()}`)
    .join("; ");
}

export function jePosebniUvjeti(p: Posao): boolean {
  return p.posebniUvjeti || imaTockuPravilnika(p);
}

export function obrazlozenjePosebniUvjeti(p: Posao): string {
  const napomena = (p.posebniUvjetiNapomena ?? "").trim();
  if (napomena) return napomena;
  return opisTocke(p);
}
