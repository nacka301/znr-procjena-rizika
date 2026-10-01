import type { Vjerojatnost } from "../types";

// Kratki, samostalno sročen upitnik (7 pitanja, jedno po tematskom području) namijenjen procjeni
// vjerojatnosti psihosocijalnih/psihofizioloških rizika. Organiziran po istom principu kao
// službeni, opsežniji upitnik (zahtjevi rada, kontrola, podrška, odnosi, uloga, sigurnost posla),
// ali pitanja NISU preuzeta iz izvora - vidi DOMAIN_NOTES.md. Rezultat je uvijek samo prijedlog;
// stručnjak ga može slobodno promijeniti.

export interface PitanjeUpitnika {
  id: string;
  podrucje: string;
  tekst: string;
}

export const PSIHOSOCIJALNI_UPITNIK: PitanjeUpitnika[] = [
  { id: "q1", podrucje: "Zahtjevi rada", tekst: "Radno opterećenje i rokovi teško su ostvarivi u raspoloživom vremenu." },
  { id: "q2", podrucje: "Kontrola u radu", tekst: "Imam malo utjecaja na to kako i kojim redoslijedom obavljam svoj posao." },
  { id: "q3", podrucje: "Podrška nadređenog", tekst: "Ne mogu računati na podršku nadređenog kada naiđem na poteškoću." },
  { id: "q4", podrucje: "Podrška kolega", tekst: "Ne mogu računati na podršku kolega kada naiđem na poteškoću." },
  { id: "q5", podrucje: "Međuljudski odnosi", tekst: "Na poslu postoje napetosti ili sukobi među ljudima." },
  { id: "q6", podrucje: "Jasnoća radne uloge", tekst: "Nije mi jasno što se od mene točno očekuje na poslu." },
  { id: "q7", podrucje: "Sigurnost radnog mjesta", tekst: "Brinem se za sigurnost svog radnog mjesta u budućnosti." },
];

export const SKALA_ODGOVORA = [
  { vrijednost: 1, oznaka: "1 – nikad" },
  { vrijednost: 2, oznaka: "2 – rijetko" },
  { vrijednost: 3, oznaka: "3 – ponekad" },
  { vrijednost: 4, oznaka: "4 – često" },
  { vrijednost: 5, oznaka: "5 – uvijek" },
];

// Prag potvrđen iz službenog izvora (Risko, F.5) - vidi DOMAIN_NOTES.md: prosjek < 3 malo
// vjerojatno, 3-4 vjerojatno, >= 4 vrlo vjerojatno.
export function prosjekUVjerojatnost(prosjek: number): Vjerojatnost {
  if (prosjek < 3) return 1;
  if (prosjek < 4) return 2;
  return 3;
}
