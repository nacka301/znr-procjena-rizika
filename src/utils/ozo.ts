import { OZO_KATALOG, type OzoStavkaKataloga } from "../data/ozoKatalog";
import { normaliziraj } from "../lib/utils";
import type { Rizik } from "../types";

// Tipovi podataka ostaju nepromijenjeni: OZO i norme i dalje žive u poljima `ozoPrijedlog` i
// `ozoNorma` kao tekst razdvojen znakom ";". Katalog s kvačicama je prikazni sloj nad tim
// tekstom - što izvoz u Word i Prilozi čitaju bez ikakve promjene.

const RAZDJELNIK = "; ";

export function razdvoji(tekst: string | undefined | null): string[] {
  return (tekst ?? "")
    .split(/[;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function spoji(stavke: string[]): string {
  const vidjeno = new Set<string>();
  return stavke
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      const k = normaliziraj(s);
      if (vidjeno.has(k)) return false;
      vidjeno.add(k);
      return true;
    })
    .join(RAZDJELNIK);
}

export interface StanjeOzo {
  /** Id-ovi stavki kataloga prepoznatih u tekstu. */
  odabrani: string[];
  /** Stavke upisane slobodno (nisu iz kataloga). */
  slobodne: string[];
  /** Norme upisane slobodno (ne pripadaju nijednoj odabranoj stavci kataloga). */
  slobodneNorme: string[];
}

function nadjiStavkuKataloga(tekst: string): OzoStavkaKataloga | undefined {
  const n = normaliziraj(tekst);
  return OZO_KATALOG.find((s) => normaliziraj(s.naziv) === n);
}

export function stanjeOzo(r: Pick<Rizik, "ozoPrijedlog" | "ozoNorma">): StanjeOzo {
  const odabrani: string[] = [];
  const slobodne: string[] = [];
  for (const stavka of razdvoji(r.ozoPrijedlog)) {
    const kat = nadjiStavkuKataloga(stavka);
    if (kat) odabrani.push(kat.id);
    else slobodne.push(stavka);
  }
  const normeOdabranih = new Set(
    odabrani
      .map((id) => OZO_KATALOG.find((s) => s.id === id)?.norma)
      .filter((n): n is string => !!n)
      .map(normaliziraj)
  );
  const slobodneNorme = razdvoji(r.ozoNorma).filter((n) => !normeOdabranih.has(normaliziraj(n)));
  return { odabrani, slobodne, slobodneNorme };
}

/** Uključi/isključi stavku kataloga; naziv i norma se mijenjaju zajedno. */
export function prebaciStavku(
  r: Pick<Rizik, "ozoPrijedlog" | "ozoNorma">,
  id: string
): Pick<Rizik, "ozoPrijedlog" | "ozoNorma"> {
  const kat = OZO_KATALOG.find((s) => s.id === id);
  if (!kat) return { ozoPrijedlog: r.ozoPrijedlog, ozoNorma: r.ozoNorma };
  const stanje = stanjeOzo(r);
  const ukljucen = stanje.odabrani.includes(id);
  const noviOdabrani = ukljucen
    ? stanje.odabrani.filter((x) => x !== id)
    : [...stanje.odabrani, id];
  return sastavi(noviOdabrani, stanje.slobodne, stanje.slobodneNorme);
}

/** Dodaj stavku upisanu slobodno (naziv + neobavezna norma). */
export function dodajSlobodnuStavku(
  r: Pick<Rizik, "ozoPrijedlog" | "ozoNorma">,
  naziv: string,
  norma: string
): Pick<Rizik, "ozoPrijedlog" | "ozoNorma"> {
  const stanje = stanjeOzo(r);
  const kat = nadjiStavkuKataloga(naziv);
  if (kat) {
    return sastavi([...stanje.odabrani, kat.id], stanje.slobodne, stanje.slobodneNorme);
  }
  return sastavi(
    stanje.odabrani,
    [...stanje.slobodne, naziv.trim()],
    norma.trim() ? [...stanje.slobodneNorme, norma.trim()] : stanje.slobodneNorme
  );
}

export function ukloniSlobodnuStavku(
  r: Pick<Rizik, "ozoPrijedlog" | "ozoNorma">,
  naziv: string
): Pick<Rizik, "ozoPrijedlog" | "ozoNorma"> {
  const stanje = stanjeOzo(r);
  return sastavi(
    stanje.odabrani,
    stanje.slobodne.filter((s) => normaliziraj(s) !== normaliziraj(naziv)),
    stanje.slobodneNorme
  );
}

export function ukloniSlobodnuNormu(
  r: Pick<Rizik, "ozoPrijedlog" | "ozoNorma">,
  norma: string
): Pick<Rizik, "ozoPrijedlog" | "ozoNorma"> {
  const stanje = stanjeOzo(r);
  return sastavi(
    stanje.odabrani,
    stanje.slobodne,
    stanje.slobodneNorme.filter((n) => normaliziraj(n) !== normaliziraj(norma))
  );
}

function sastavi(
  odabrani: string[],
  slobodne: string[],
  slobodneNorme: string[]
): Pick<Rizik, "ozoPrijedlog" | "ozoNorma"> {
  const stavke = OZO_KATALOG.filter((s) => odabrani.includes(s.id));
  return {
    ozoPrijedlog: spoji([...stavke.map((s) => s.naziv), ...slobodne]),
    ozoNorma: spoji([...stavke.map((s) => s.norma).filter(Boolean), ...slobodneNorme]),
  };
}

/** Kratki prikaz za tablicu: pločice s nazivima OZO. */
export function ozoPlocice(r: Pick<Rizik, "ozoPrijedlog">): string[] {
  return razdvoji(r.ozoPrijedlog);
}

/**
 * OZO kao parovi "naziv (norma)" - popis opreme i popis normi nikad se ne razdvajaju.
 * npr. ["Zaštitne rukavice – toplinski rizici (HRN EN 407)",
 *       "Zaštitna odjeća – toplina i plamen (HRN EN ISO 11612)"]
 */
export function ozoParovi(r: Pick<Rizik, "ozoPrijedlog" | "ozoNorma">): string[] {
  const stanje = stanjeOzo(r);
  const izKataloga = OZO_KATALOG.filter((s) => stanje.odabrani.includes(s.id)).map((s) =>
    s.norma ? `${s.naziv} (${s.norma})` : s.naziv
  );
  // Slobodno upisane norme koje ne pripadaju nijednoj odabranoj stavci ne smiju se izgubiti.
  const preostaleNorme = stanje.slobodneNorme.map((n) => `norma: ${n}`);
  return [...izKataloga, ...stanje.slobodne, ...preostaleNorme];
}

/** Isto, kao jedan redak teksta za tablice dokumenta i Word izvoz. */
export function ozoTekstSNormama(
  r: Pick<Rizik, "ozoPrijedlog" | "ozoNorma" | "ozoNijePotrebna">,
  prazno = "–"
): string {
  if (r.ozoNijePotrebna) return "OZO nije potrebna";
  const parovi = ozoParovi(r);
  return parovi.length > 0 ? parovi.join("; ") : prazno;
}
