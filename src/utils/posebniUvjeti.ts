import type { Posao, Rizik } from "../types";

// Posao se automatski smatra "poslom s posebnim uvjetima rada" samo ako ijedan njegov rizik ima
// upisanu KONKRETNU točku Pravilnika (NN 5/84, čl. 3) - broj točke, npr. "16 – teško fizičko
// naprezanje" ili "17". Neodređeni tekst ("18 ili sljedeće, PROVJERITI", "treba provjeriti")
// NE uključuje posao u Prilog 9, jer to nije utvrđena točka nego bilješka stručnjaka.
// Stručnjak i dalje može ručno uključiti posao kvačicom u Prilogu 9.

/**
 * Konkretna točka = vodeći broj iza kojeg slijedi kraj teksta ili razdjelnik (–, -, ., :, ), ,).
 * "16 – teško fizičko naprezanje" ✓   "17" ✓   "16." ✓
 * "18 ili sljedeće, PROVJERITI" ✗ (broj je praćen riječju, nije utvrđena točka)
 */
export function jeKonkretnaTocka(tockaPravilnika: string | undefined | null): boolean {
  return /^\s*\d+\s*([–—\-.,:)]|$)/.test(tockaPravilnika ?? "");
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
