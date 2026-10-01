// Katalog osobne zaštitne opreme. Svaka stavka NOSI SVOJU NORMU, pa stručnjak nikad ne bira
// normu odvojeno - odabirom stavke upisuju se i naziv i norma.
//
// Navedene HRN EN norme su opće poznate oznake za vrstu OZO. Primjenjivost na konkretan rizik
// uvijek je "PROVJERITI" - alat ne tvrdi da je navedena norma ispravna za pojedini slučaj.
// Vidi DOMAIN_NOTES.md.

export interface OzoStavkaKataloga {
  id: string;
  naziv: string;
  /** Prazno = stavka bez pripadne norme (norma se upisuje ručno). */
  norma: string;
}

export const OZO_KATALOG: OzoStavkaKataloga[] = [
  { id: "rukavice-meh", naziv: "Zaštitne rukavice – mehanički rizici", norma: "HRN EN 388" },
  { id: "rukavice-topl", naziv: "Zaštitne rukavice – toplinski rizici", norma: "HRN EN 407" },
  { id: "rukavice-kem", naziv: "Zaštitne rukavice – kemikalije", norma: "HRN EN ISO 374-1" },
  { id: "naocale", naziv: "Zaštitne naočale / vizir", norma: "HRN EN 166" },
  { id: "sluh", naziv: "Zaštita sluha", norma: "HRN EN 352" },
  { id: "obuca", naziv: "Zaštitna obuća", norma: "HRN EN ISO 20345" },
  { id: "odjeca-topl", naziv: "Zaštitna odjeća – toplina i plamen", norma: "HRN EN ISO 11612" },
  { id: "odjeca-vrijeme", naziv: "Odjeća za loše vrijeme", norma: "HRN EN 343" },
  { id: "odjeca-refl", naziv: "Reflektirajuća odjeća", norma: "HRN EN ISO 20471" },
  { id: "kaciga", naziv: "Zaštitna kaciga", norma: "HRN EN 397" },
  { id: "maska", naziv: "Zaštitna maska za disanje", norma: "HRN EN 149" },
  { id: "pojas", naziv: "Pojas/pribor za rad na visini", norma: "HRN EN 361" },
  { id: "pregaca", naziv: "Zaštitna pregača", norma: "" },
];

export const OZO_PO_ID: Record<string, OzoStavkaKataloga> = Object.fromEntries(
  OZO_KATALOG.map((s) => [s.id, s])
);
