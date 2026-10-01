// Domensi tipovi za prototip alata za procjenu rizika (ZNR)

export type Vjerojatnost = 1 | 2 | 3; // 1 malo vjerojatno, 2 vjerojatno, 3 vrlo vjerojatno
export type Posljedica = 1 | 2 | 3; // 1 malo štetno, 2 srednje štetno, 3 izrazito štetno
export type RazinaRizika = "mali" | "srednji" | "veliki";

export type KategorijaRizika = "opasnost" | "stetnost" | "napor";

export interface Poslodavac {
  naziv: string;
  djelatnost: string;
  lokacije: string[];
  oib?: string;
  isPrimjer: boolean;
}

export interface RadnoMjesto {
  id: string;
  naziv: string;
  brojRadnika: number;
}

export interface Posao {
  id: string;
  naziv: string;
  radnaMjestaIds: string[]; // više-na-više veza s radnim mjestima
  radnaOpremaIds: string[];
  rizici: Rizik[];
  posebniUvjeti: boolean; // posao s posebnim uvjetima rada - stručnjak označava ručno, provjeriti
  posebniUvjetiNapomena: string;
  koristiRacunalo4h: boolean; // rad na računalu 4 ili više sati dnevno - uključuje ergonomski checklist
  ergonomijaOdgovori: Record<string, ErgonomijaOdgovor>;
}

export type ErgonomijaZadovoljava = "da" | "ne" | "np";

export interface ErgonomijaOdgovor {
  zadovoljava: ErgonomijaZadovoljava | null;
  napomena: string;
}

export interface Rizik {
  id: string;
  kategorija: KategorijaRizika;
  path: string[]; // niz kodova čvorova u Prilogu III, npr. ["1","1.1","1.1.1"]
  naziv: string; // puni naziv zadnjeg odabranog čvora (label)
  punaStaza: string; // "1. Mehaničke opasnosti > 1.1 Alati > 1.1.1 Ručni"
  vjerojatnost: Vjerojatnost | null;
  posljedica: Posljedica | null;
  moguciDogadjaj: string;
  tockaPravilnika: string; // točka čl. 3 Pravilnika o poslovima s posebnim uvjetima rada (NN 5/84), ako primjenjivo
  ozoPrijedlog: string;
  ozoNijePotrebna: boolean;
  ozoNorma: string; // npr. "HRN EN 388" - prijedlog, provjeriti primjenjivost
  lijecnickiPregled: string;
  napomena?: string;
}


export interface RadnaOprema {
  id: string;
  naziv: string;
  prilagodeno: boolean; // true ako ju je dodao korisnik, ne iz unaprijed zadanog popisa
  periodPregledaMjeseci: number | null;
  datumPosljednjegPregleda: string;
}

export interface MjeraPlana {
  id: string;
  posaoId: string | null;
  mjera: string;
  rok: string;
  odgovornaOsoba: string;
  kontrola: string;
  periodika: string;
}

export interface Ispitivanje {
  id: string;
  naziv: string;
  napomena: string;
  periodMjeseci: number | null;
  datumPosljednjeg: string;
}

export interface ProcjenaState {
  poslodavac: Poslodavac;
  radnaMjesta: RadnoMjesto[];
  poslovi: Posao[];
  radnaOprema: RadnaOprema[];
  mjerePlana: MjeraPlana[];
  verzija: number;
}

export function izracunajRazinu(
  v: Vjerojatnost | null,
  p: Posljedica | null
): RazinaRizika | null {
  if (v === null || p === null) return null;
  // Prilog I, Pravilnik o izradi procjene rizika (NN 112/14) - potvrđeno izvorom, vidi DOMAIN_NOTES.md
  const matrica: Record<Vjerojatnost, Record<Posljedica, RazinaRizika>> = {
    1: { 1: "mali", 2: "mali", 3: "srednji" },
    2: { 1: "mali", 2: "srednji", 3: "veliki" },
    3: { 1: "srednji", 2: "veliki", 3: "veliki" },
  };
  return matrica[v][p];
}

export function razinaPosla(rizici: Rizik[]): RazinaRizika | null {
  const razine = rizici
    .map((r) => izracunajRazinu(r.vjerojatnost, r.posljedica))
    .filter((r): r is RazinaRizika => r !== null);
  if (razine.length === 0) return null;
  if (razine.includes("veliki")) return "veliki";
  if (razine.includes("srednji")) return "srednji";
  return "mali";
}
