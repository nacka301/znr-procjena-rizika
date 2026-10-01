import { izracunajRazinu } from "../types";
import type {
  Ispitivanje,
  MjeraPlana,
  Poslodavac,
  Posao,
  RadnaOprema,
  RadnoMjesto,
} from "../types";
import { ERGONOMIJA_KATEGORIJE } from "../data/ergonomijaKategorije";
import { razdvoji } from "./ozo";

export type KorakKljuc =
  | "nadzor"
  | "poslodavac"
  | "radna-mjesta"
  | "poslovi"
  | "analiza"
  | "mjere"
  | "prilozi"
  | "pregled";

/** Mjesto u aplikaciji na koje vodi klik na stavku u panelu "Provjere". */
export interface Cilj {
  korak: KorakKljuc;
  posaoId?: string;
  rizikId?: string;
  mjeraId?: string;
  radnoMjestoId?: string;
  prilog?: number;
}

export interface Provjera {
  id: string;
  /** Što nedostaje ili je nedosljedno - kratko i konkretno. */
  tekst: string;
  /** Gdje se to nalazi (npr. naziv posla). */
  kontekst?: string;
  cilj: Cilj;
}

export interface UlazProvjere {
  poslodavac: Poslodavac;
  radnaMjesta: RadnoMjesto[];
  poslovi: Posao[];
  radnaOprema: RadnaOprema[];
  mjerePlana: MjeraPlana[];
  ispitivanja: Ispitivanje[];
}

const prazno = (s: string | undefined | null) => (s ?? "").trim() === "";

export function izracunajProvjere(u: UlazProvjere): Provjera[] {
  const p: Provjera[] = [];
  const { poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja } = u;

  // ── 1. Poslodavac ────────────────────────────────────────────────────────
  if (prazno(poslodavac.naziv))
    p.push({ id: "pd-naziv", tekst: "Poslodavac nema upisan naziv", cilj: { korak: "poslodavac" } });
  if (prazno(poslodavac.djelatnost))
    p.push({
      id: "pd-djelatnost",
      tekst: "Nije upisana pretežita djelatnost",
      cilj: { korak: "poslodavac" },
    });
  if (poslodavac.lokacije.filter((l) => !prazno(l)).length === 0)
    p.push({
      id: "pd-lokacije",
      tekst: "Nije upisano nijedno mjesto rada",
      cilj: { korak: "poslodavac" },
    });

  // ── 2. Radna mjesta ──────────────────────────────────────────────────────
  if (radnaMjesta.length === 0) {
    p.push({
      id: "rm-nema",
      tekst: "Nije uneseno nijedno radno mjesto",
      cilj: { korak: "radna-mjesta" },
    });
  }
  for (const rm of radnaMjesta) {
    if (prazno(rm.naziv))
      p.push({
        id: `rm-naziv-${rm.id}`,
        tekst: "Radno mjesto bez naziva",
        cilj: { korak: "radna-mjesta", radnoMjestoId: rm.id },
      });
    if (rm.brojRadnika <= 0)
      p.push({
        id: `rm-radnici-${rm.id}`,
        tekst: `${rm.naziv || "Radno mjesto"} ima 0 radnika`,
        cilj: { korak: "radna-mjesta", radnoMjestoId: rm.id },
      });
  }

  // ── 3. Poslovi ───────────────────────────────────────────────────────────
  if (poslovi.length === 0) {
    p.push({ id: "po-nema", tekst: "Nije unesen nijedan posao", cilj: { korak: "poslovi" } });
  }
  for (const posao of poslovi) {
    if (posao.radnaMjestaIds.length === 0)
      p.push({
        id: `po-bez-rm-${posao.id}`,
        tekst: `${posao.naziv || "Posao"} nije dodijeljen nijednom radnom mjestu`,
        cilj: { korak: "poslovi", posaoId: posao.id },
      });
  }
  for (const rm of radnaMjesta) {
    if (!poslovi.some((x) => x.radnaMjestaIds.includes(rm.id)))
      p.push({
        id: `rm-bez-po-${rm.id}`,
        tekst: `${rm.naziv || "Radno mjesto"} ne obavlja nijedan posao`,
        cilj: { korak: "poslovi", radnoMjestoId: rm.id },
      });
  }

  // ── 4. Analiza posla ─────────────────────────────────────────────────────
  for (const posao of poslovi) {
    if (posao.rizici.length === 0)
      p.push({
        id: `an-bez-rizika-${posao.id}`,
        tekst: "Posao nema evidentiranih opasnosti, štetnosti ni napora",
        kontekst: posao.naziv,
        cilj: { korak: "analiza", posaoId: posao.id },
      });
    for (const r of posao.rizici) {
      if (r.vjerojatnost === null || r.posljedica === null)
        p.push({
          id: `an-neocijenjen-${r.id}`,
          tekst: `${r.naziv || "Rizik"} – nije ocijenjena vjerojatnost i/ili posljedica`,
          kontekst: posao.naziv,
          cilj: { korak: "analiza", posaoId: posao.id, rizikId: r.id },
        });
    }
  }

  // ── 5. Mjere i OZO ───────────────────────────────────────────────────────
  for (const posao of poslovi) {
    for (const r of posao.rizici) {
      const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
      if (razina !== "srednji" && razina !== "veliki") continue;

      if (!r.ozoNijePotrebna && razdvoji(r.ozoPrijedlog).length === 0)
        p.push({
          id: `mj-ozo-${r.id}`,
          tekst: `${r.naziv || "Rizik"} – ${razina} rizik bez određene OZO`,
          kontekst: posao.naziv,
          cilj: { korak: "mjere", posaoId: posao.id, rizikId: r.id },
        });

      // Točka Pravilnika namjerno NIJE uvjet potpunosti: ona vrijedi samo za poslove s posebnim
      // uvjetima rada (NN 5/84), a ne za svaki veliki rizik.
      if (razina === "veliki" && prazno(r.lijecnickiPregled))
        p.push({
          id: `mj-lijecnicki-${r.id}`,
          tekst: `${r.naziv || "Rizik"} – veliki rizik bez liječničkog pregleda`,
          kontekst: posao.naziv,
          cilj: { korak: "mjere", posaoId: posao.id, rizikId: r.id },
        });
    }
  }
  for (const posao of posloviSVelikimRizikomBezMjere(poslovi, mjerePlana)) {
    p.push({
      id: `mj-bez-mjere-${posao.id}`,
      tekst: `${posao.naziv || "Posao"} ima veliki rizik bez mjere u planu`,
      cilj: { korak: "mjere", posaoId: posao.id },
    });
  }
  for (const m of mjerePlana) {
    if (prazno(m.mjera))
      p.push({
        id: `mj-tekst-${m.id}`,
        tekst: "Redak plana mjera je bez opisa mjere",
        cilj: { korak: "mjere", mjeraId: m.id },
      });
    else if (prazno(m.rok) || prazno(m.odgovornaOsoba))
      p.push({
        id: `mj-rok-${m.id}`,
        tekst: prazno(m.rok) ? "Mjera bez roka" : "Mjera bez odgovorne osobe",
        kontekst: m.mjera,
        cilj: { korak: "mjere", mjeraId: m.id },
      });
  }

  // ── 6. Prilozi ───────────────────────────────────────────────────────────
  for (const posao of poslovi.filter((x) => x.koristiRacunalo4h)) {
    const nepopunjeno = ERGONOMIJA_KATEGORIJE.filter(
      (k) => (posao.ergonomijaOdgovori[k]?.zadovoljava ?? null) === null
    ).length;
    if (nepopunjeno > 0)
      p.push({
        id: `pr-ergonomija-${posao.id}`,
        tekst: `Checklist ergonomije nije popunjen (${nepopunjeno} od ${ERGONOMIJA_KATEGORIJE.length})`,
        kontekst: posao.naziv,
        cilj: { korak: "prilozi", posaoId: posao.id, prilog: 8 },
      });
  }
  for (const oprema of radnaOprema) {
    const koristise = poslovi.some((p) => p.radnaOpremaIds.includes(oprema.id));
    if (koristise && oprema.periodPregledaMjeseci === null)
      p.push({
        id: `pr-period-${oprema.id}`,
        tekst: `${oprema.naziv || "Radna oprema"} – nije upisan period pregleda`,
        cilj: { korak: "prilozi", prilog: 2 },
      });
  }
  if (ispitivanja.length === 0 && poslovi.length > 0)
    p.push({
      id: "pr-ispitivanja",
      tekst: "Nije upisano nijedno potrebno ispitivanje",
      cilj: { korak: "prilozi", prilog: 6 },
    });

  return p;
}

export function posloviSVelikimRizikomBezMjere(
  poslovi: Posao[],
  mjerePlana: MjeraPlana[]
): Posao[] {
  return poslovi.filter((posao) => {
    const imaVeliki = posao.rizici.some(
      (r) => izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki"
    );
    if (!imaVeliki) return false;
    return !mjerePlana.some((m) => m.posaoId === posao.id && !prazno(m.mjera));
  });
}

/** Broj stavki po koraku - koristi se za status u stepperu. */
export function provjerePoKoraku(provjere: Provjera[]): Record<string, number> {
  const broj: Record<string, number> = {};
  for (const p of provjere) broj[p.cilj.korak] = (broj[p.cilj.korak] ?? 0) + 1;
  return broj;
}
