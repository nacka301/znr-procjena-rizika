import type { Posao } from "../types";

// Posao se automatski smatra "poslom s posebnim uvjetima rada" čim ijedan njegov rizik ima
// upisanu Točku Pravilnika (NN 5/84, čl. 3) u analizi rizika - stručnjak i dalje može ručno
// dodati i posao bez upisane točke preko kvačice u Prilogu 9.

export function imaTockuPravilnika(p: Posao): boolean {
  return p.rizici.some((r) => (r.tockaPravilnika ?? "").trim() !== "");
}

export function jePosebniUvjeti(p: Posao): boolean {
  return p.posebniUvjeti || imaTockuPravilnika(p);
}

export function opisTocke(p: Posao): string {
  return p.rizici
    .filter((r) => (r.tockaPravilnika ?? "").trim() !== "")
    .map((r) => `${r.naziv} – točka ${r.tockaPravilnika}`)
    .join("; ");
}

export function obrazlozenjePosebniUvjeti(p: Posao): string {
  const napomena = (p.posebniUvjetiNapomena ?? "").trim();
  if (napomena) return napomena;
  return opisTocke(p);
}
