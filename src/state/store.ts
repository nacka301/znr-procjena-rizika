import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ErgonomijaOdgovor,
  Ispitivanje,
  KategorijaRizika,
  MjeraPlana,
  Poslodavac,
  Posao,
  RadnoMjesto,
  Rizik,
} from "../types";
import { noviId } from "../utils/id";
import { nadjiNaziv } from "../data/prilogIII";
import {
  DEMO_ISPITIVANJA,
  DEMO_MJERE_PLANA,
  DEMO_POSLODAVAC,
  DEMO_POSLOVI,
  DEMO_RADNA_MJESTA,
  DEMO_RADNA_OPREMA,
  PRIMJER_VERZIJA,
} from "../data/demoData";
import { BASE_RADNA_OPREMA } from "../data/baseRadnaOprema";
import type { RadnaOprema } from "../types";

export const STORE_NAME = "znr-procjena-rizika";
// Verzija OBLIKA spremljenog stanja. Migracija nikad ne odbacuje podatke - samo nedostajuća
// polja dobivaju zadane vrijednosti (normalizirajUcitanoStanje), pa staro stanje ne može srušiti
// nijedan korak.
const STORE_VERSION = 2;

const PRAZAN_POSLODAVAC: Poslodavac = {
  naziv: "",
  djelatnost: "",
  lokacije: [],
  oib: "",
  isPrimjer: false,
};

// Normalizacija podataka učitanih iz localStorage: stariji zapisi (prije nego su dodana nova
// polja u tipovima) ne smiju srušiti aplikaciju. Svako nedostajuće/pogrešno polje dobiva sigurnu
// zadanu vrijednost (prazan string, prazan niz, null) umjesto da ostane undefined.

function normalizaRizik(raw: unknown): Rizik {
  const r = (raw ?? {}) as Partial<Rizik>;
  return {
    id: r.id ?? noviId("r"),
    kategorija: r.kategorija ?? "opasnost",
    path: Array.isArray(r.path) ? r.path : [],
    naziv: r.naziv ?? "",
    punaStaza: r.punaStaza ?? "",
    vjerojatnost: r.vjerojatnost ?? null,
    posljedica: r.posljedica ?? null,
    moguciDogadjaj: r.moguciDogadjaj ?? "",
    tockaPravilnika: r.tockaPravilnika ?? "",
    ozoPrijedlog: r.ozoPrijedlog ?? "",
    ozoNijePotrebna: r.ozoNijePotrebna ?? false,
    ozoNorma: r.ozoNorma ?? "",
    lijecnickiPregled: r.lijecnickiPregled ?? "",
    napomena: r.napomena,
  };
}

function normalizaErgonomijaOdgovor(raw: unknown): ErgonomijaOdgovor {
  const o = (raw ?? {}) as Partial<ErgonomijaOdgovor>;
  return {
    zadovoljava: o.zadovoljava ?? null,
    napomena: o.napomena ?? "",
  };
}

function normalizaPosao(raw: unknown): Posao {
  const p = (raw ?? {}) as Partial<Posao>;
  const ergonomijaOdgovori: Record<string, ErgonomijaOdgovor> = {};
  if (p.ergonomijaOdgovori && typeof p.ergonomijaOdgovori === "object") {
    for (const [kljuc, vrijednost] of Object.entries(p.ergonomijaOdgovori)) {
      ergonomijaOdgovori[kljuc] = normalizaErgonomijaOdgovor(vrijednost);
    }
  }
  return {
    id: p.id ?? noviId("p"),
    naziv: p.naziv ?? "",
    radnaMjestaIds: Array.isArray(p.radnaMjestaIds) ? p.radnaMjestaIds : [],
    radnaOpremaIds: Array.isArray(p.radnaOpremaIds) ? p.radnaOpremaIds : [],
    rizici: Array.isArray(p.rizici) ? p.rizici.map(normalizaRizik) : [],
    posebniUvjeti: p.posebniUvjeti ?? false,
    posebniUvjetiNapomena: p.posebniUvjetiNapomena ?? "",
    koristiRacunalo4h: p.koristiRacunalo4h ?? false,
    ergonomijaOdgovori,
  };
}

function normalizaRadnoMjesto(raw: unknown): RadnoMjesto {
  const rm = (raw ?? {}) as Partial<RadnoMjesto>;
  return {
    id: rm.id ?? noviId("rm"),
    naziv: rm.naziv ?? "",
    brojRadnika: typeof rm.brojRadnika === "number" ? rm.brojRadnika : 0,
  };
}

function normalizaRadnaOprema(raw: unknown): RadnaOprema {
  const o = (raw ?? {}) as Partial<RadnaOprema>;
  return {
    id: o.id ?? noviId("ro"),
    naziv: o.naziv ?? "",
    prilagodeno: o.prilagodeno ?? false,
    periodPregledaMjeseci: o.periodPregledaMjeseci ?? null,
    datumPosljednjegPregleda: o.datumPosljednjegPregleda ?? "",
  };
}

function normalizaMjeraPlana(raw: unknown): MjeraPlana {
  const m = (raw ?? {}) as Partial<MjeraPlana>;
  return {
    id: m.id ?? noviId("m"),
    posaoId: m.posaoId ?? null,
    mjera: m.mjera ?? "",
    rok: m.rok ?? "",
    odgovornaOsoba: m.odgovornaOsoba ?? "",
    kontrola: m.kontrola ?? "",
    periodika: m.periodika ?? "",
  };
}

function normalizaIspitivanje(raw: unknown): Ispitivanje {
  const i = (raw ?? {}) as Partial<Ispitivanje>;
  return {
    id: i.id ?? noviId("isp"),
    naziv: i.naziv ?? "",
    napomena: i.napomena ?? "",
    periodMjeseci: i.periodMjeseci ?? null,
    datumPosljednjeg: i.datumPosljednjeg ?? "",
  };
}

function normalizaPoslodavac(raw: unknown): Poslodavac {
  const p = (raw ?? {}) as Partial<Poslodavac>;
  return {
    naziv: p.naziv ?? "",
    djelatnost: p.djelatnost ?? "",
    lokacije: Array.isArray(p.lokacije) ? p.lokacije : [],
    oib: p.oib ?? "",
    isPrimjer: p.isPrimjer ?? false,
  };
}

function normalizirajUcitanoStanje(raw: unknown): Partial<StoreState> {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Partial<StoreState>;
  return {
    poslodavac: s.poslodavac ? normalizaPoslodavac(s.poslodavac) : PRAZAN_POSLODAVAC,
    radnaMjesta: Array.isArray(s.radnaMjesta) ? s.radnaMjesta.map(normalizaRadnoMjesto) : [],
    poslovi: Array.isArray(s.poslovi) ? s.poslovi.map(normalizaPosao) : [],
    radnaOprema: Array.isArray(s.radnaOprema) ? s.radnaOprema.map(normalizaRadnaOprema) : [],
    mjerePlana: Array.isArray(s.mjerePlana) ? s.mjerePlana.map(normalizaMjeraPlana) : [],
    ispitivanja: Array.isArray(s.ispitivanja) ? s.ispitivanja.map(normalizaIspitivanje) : [],
    napomenePriloga:
      s.napomenePriloga && typeof s.napomenePriloga === "object" ? s.napomenePriloga : {},
    aktivniPosaoId: typeof s.aktivniPosaoId === "string" ? s.aktivniPosaoId : null,
    zadnjiKorak: typeof s.zadnjiKorak === "string" ? s.zadnjiKorak : "poslodavac",
    korisnikMijenjao: s.korisnikMijenjao === true,
    primjerVerzija: typeof s.primjerVerzija === "number" ? s.primjerVerzija : 0,
  };
}

interface StoreState {
  poslodavac: Poslodavac;
  radnaMjesta: RadnoMjesto[];
  poslovi: Posao[];
  radnaOprema: RadnaOprema[];
  mjerePlana: MjeraPlana[];
  ispitivanja: Ispitivanje[];
  napomenePriloga: Record<string, string>;
  aktivniPosaoId: string | null;
  /** Korak na koji se vraća "Nastavi gdje si stao" s nadzorne ploče. */
  zadnjiKorak: string;
  /** Postaje true na prvu korisnikovu izmjenu - tada se primjer više ne osvježava sam. */
  korisnikMijenjao: boolean;
  /** Verzija primjera iz koje je stanje učitano. */
  primjerVerzija: number;
  setZadnjiKorak: (korak: string) => void;
  setAktivniPosaoId: (id: string | null) => void;
  setNapomenaPriloga: (kljuc: string, tekst: string) => void;
  togglePosebniUvjeti: (posaoId: string) => void;
  setPosebniUvjetiNapomena: (posaoId: string, napomena: string) => void;
  addIspitivanje: (naziv: string) => void;
  updateIspitivanje: (id: string, patch: Partial<Ispitivanje>) => void;
  removeIspitivanje: (id: string) => void;

  setPoslodavac: (patch: Partial<Poslodavac>) => void;

  addRadnoMjesto: (naziv: string, brojRadnika: number) => void;
  updateRadnoMjesto: (id: string, patch: Partial<RadnoMjesto>) => void;
  removeRadnoMjesto: (id: string) => void;

  addPosao: (naziv: string) => string;
  updatePosaoNaziv: (id: string, naziv: string) => void;
  removePosao: (id: string) => void;
  duplicirajPosao: (id: string) => void;
  toggleVeza: (posaoId: string, radnoMjestoId: string) => void;

  addRadnaOpremaOpcija: (naziv: string) => string;
  updateRadnaOprema: (id: string, patch: Partial<RadnaOprema>) => void;
  toggleOpremaNaPoslu: (posaoId: string, opremaId: string) => void;

  toggleKoristiRacunalo4h: (posaoId: string) => void;
  setErgonomijaOdgovor: (
    posaoId: string,
    kategorija: string,
    patch: Partial<ErgonomijaOdgovor>
  ) => void;

  addRizik: (posaoId: string, kategorija: KategorijaRizika, path: string[]) => void;
  updateRizik: (posaoId: string, rizikId: string, patch: Partial<Rizik>) => void;
  removeRizik: (posaoId: string, rizikId: string) => void;

  addMjera: (mjera: Omit<MjeraPlana, "id">) => void;
  updateMjera: (id: string, patch: Partial<MjeraPlana>) => void;
  removeMjera: (id: string) => void;

  ucitajPrimjer: () => void;
  ocistiSve: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (rawSet) => {
      // Svaka izmjena PODATAKA procjene postavlja korisnikMijenjao = true. Time primjer prestaje
      // biti "neduznut" i više se ne osvježava sam pri podizanju verzije primjera. Radnje koje
      // mijenjaju samo prikaz (odabrani korak, odabrani posao) koriste rawSet i ne diraju zastavicu.
      type Partial_ = Partial<StoreState> | ((s: StoreState) => Partial<StoreState>);
      const set = (partial: Partial_) =>
        rawSet((s) => ({
          ...(typeof partial === "function" ? partial(s) : partial),
          korisnikMijenjao: true,
        }));

      return {
      poslodavac: DEMO_POSLODAVAC,
      radnaMjesta: DEMO_RADNA_MJESTA,
      poslovi: DEMO_POSLOVI,
      radnaOprema: DEMO_RADNA_OPREMA,
      mjerePlana: DEMO_MJERE_PLANA,
      ispitivanja: DEMO_ISPITIVANJA,
      napomenePriloga: {},
      aktivniPosaoId: DEMO_POSLOVI[0]?.id ?? null,
      zadnjiKorak: "poslodavac",
      korisnikMijenjao: false,
      primjerVerzija: PRIMJER_VERZIJA,
      setZadnjiKorak: (korak) => rawSet({ zadnjiKorak: korak }),
      setAktivniPosaoId: (id) => rawSet({ aktivniPosaoId: id }),
      setNapomenaPriloga: (kljuc, tekst) =>
        set((s) => ({ napomenePriloga: { ...s.napomenePriloga, [kljuc]: tekst } })),
      togglePosebniUvjeti: (posaoId) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) =>
            p.id === posaoId ? { ...p, posebniUvjeti: !p.posebniUvjeti } : p
          ),
        })),
      setPosebniUvjetiNapomena: (posaoId, napomena) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) =>
            p.id === posaoId ? { ...p, posebniUvjetiNapomena: napomena } : p
          ),
        })),
      toggleKoristiRacunalo4h: (posaoId) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) =>
            p.id === posaoId ? { ...p, koristiRacunalo4h: !p.koristiRacunalo4h } : p
          ),
        })),
      setErgonomijaOdgovor: (posaoId, kategorija, patch) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) => {
            if (p.id !== posaoId) return p;
            const postojeci: ErgonomijaOdgovor = p.ergonomijaOdgovori[kategorija] ?? {
              zadovoljava: null,
              napomena: "",
            };
            return {
              ...p,
              ergonomijaOdgovori: {
                ...p.ergonomijaOdgovori,
                [kategorija]: { ...postojeci, ...patch },
              },
            };
          }),
        })),
      addIspitivanje: (naziv) =>
        set((s) => ({
          ispitivanja: [
            ...s.ispitivanja,
            {
              id: noviId("isp"),
              naziv,
              napomena: "",
              periodMjeseci: null,
              datumPosljednjeg: "",
            },
          ],
        })),
      updateIspitivanje: (id, patch) =>
        set((s) => ({
          ispitivanja: s.ispitivanja.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      removeIspitivanje: (id) =>
        set((s) => ({ ispitivanja: s.ispitivanja.filter((i) => i.id !== id) })),

      setPoslodavac: (patch) =>
        set((s) => ({ poslodavac: { ...s.poslodavac, ...patch } })),

      addRadnoMjesto: (naziv, brojRadnika) =>
        set((s) => ({
          radnaMjesta: [
            ...s.radnaMjesta,
            { id: noviId("rm"), naziv, brojRadnika },
          ],
        })),
      updateRadnoMjesto: (id, patch) =>
        set((s) => ({
          radnaMjesta: s.radnaMjesta.map((rm) =>
            rm.id === id ? { ...rm, ...patch } : rm
          ),
        })),
      removeRadnoMjesto: (id) =>
        set((s) => ({
          radnaMjesta: s.radnaMjesta.filter((rm) => rm.id !== id),
          poslovi: s.poslovi.map((p) => ({
            ...p,
            radnaMjestaIds: p.radnaMjestaIds.filter((rmId) => rmId !== id),
          })),
        })),

      addPosao: (naziv) => {
        const id = noviId("p");
        set((s) => ({
          poslovi: [
            ...s.poslovi,
            {
              id,
              naziv,
              radnaMjestaIds: [],
              radnaOpremaIds: [],
              rizici: [],
              posebniUvjeti: false,
              posebniUvjetiNapomena: "",
              koristiRacunalo4h: false,
              ergonomijaOdgovori: {},
            },
          ],
        }));
        return id;
      },
      updatePosaoNaziv: (id, naziv) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) => (p.id === id ? { ...p, naziv } : p)),
        })),
      removePosao: (id) =>
        set((s) => ({ poslovi: s.poslovi.filter((p) => p.id !== id) })),
      duplicirajPosao: (id) =>
        set((s) => {
          const izvor = s.poslovi.find((p) => p.id === id);
          if (!izvor) return s;
          const kopija: Posao = {
            ...izvor,
            id: noviId("p"),
            naziv: `${izvor.naziv} (kopija)`,
            rizici: izvor.rizici.map((r) => ({ ...r, id: noviId("r") })),
          };
          const indeks = s.poslovi.findIndex((p) => p.id === id);
          const poslovi = [...s.poslovi];
          poslovi.splice(indeks + 1, 0, kopija);
          return { poslovi };
        }),
      toggleVeza: (posaoId, radnoMjestoId) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) => {
            if (p.id !== posaoId) return p;
            const ima = p.radnaMjestaIds.includes(radnoMjestoId);
            return {
              ...p,
              radnaMjestaIds: ima
                ? p.radnaMjestaIds.filter((id) => id !== radnoMjestoId)
                : [...p.radnaMjestaIds, radnoMjestoId],
            };
          }),
        })),

      addRadnaOpremaOpcija: (naziv) => {
        const id = noviId("ro");
        set((s) => ({
          radnaOprema: [
            ...s.radnaOprema,
            {
              id,
              naziv,
              prilagodeno: true,
              periodPregledaMjeseci: null,
              datumPosljednjegPregleda: "",
            },
          ],
        }));
        return id;
      },
      updateRadnaOprema: (id, patch) =>
        set((s) => ({
          radnaOprema: s.radnaOprema.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      toggleOpremaNaPoslu: (posaoId, opremaId) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) => {
            if (p.id !== posaoId) return p;
            const ima = p.radnaOpremaIds.includes(opremaId);
            return {
              ...p,
              radnaOpremaIds: ima
                ? p.radnaOpremaIds.filter((id) => id !== opremaId)
                : [...p.radnaOpremaIds, opremaId],
            };
          }),
        })),

      addRizik: (posaoId, kategorija, path) => {
        const { naziv, punaStaza } = nadjiNaziv(kategorija, path);
        const novi: Rizik = {
          id: noviId("r"),
          kategorija,
          path,
          naziv,
          punaStaza,
          vjerojatnost: null,
          posljedica: null,
          moguciDogadjaj: "",
          tockaPravilnika: "",
          ozoPrijedlog: "",
          ozoNijePotrebna: false,
          ozoNorma: "",
          lijecnickiPregled: "",
        };
        set((s) => ({
          poslovi: s.poslovi.map((p) =>
            p.id === posaoId ? { ...p, rizici: [...p.rizici, novi] } : p
          ),
        }));
      },
      updateRizik: (posaoId, rizikId, patch) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) =>
            p.id === posaoId
              ? {
                  ...p,
                  rizici: p.rizici.map((r) =>
                    r.id === rizikId ? { ...r, ...patch } : r
                  ),
                }
              : p
          ),
        })),
      removeRizik: (posaoId, rizikId) =>
        set((s) => ({
          poslovi: s.poslovi.map((p) =>
            p.id === posaoId
              ? { ...p, rizici: p.rizici.filter((r) => r.id !== rizikId) }
              : p
          ),
        })),

      addMjera: (mjera) =>
        set((s) => ({
          mjerePlana: [...s.mjerePlana, { ...mjera, id: noviId("m") }],
        })),
      updateMjera: (id, patch) =>
        set((s) => ({
          mjerePlana: s.mjerePlana.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        })),
      removeMjera: (id) =>
        set((s) => ({ mjerePlana: s.mjerePlana.filter((m) => m.id !== id) })),

      ucitajPrimjer: () =>
        rawSet({
          poslodavac: DEMO_POSLODAVAC,
          radnaMjesta: DEMO_RADNA_MJESTA,
          poslovi: DEMO_POSLOVI,
          radnaOprema: DEMO_RADNA_OPREMA,
          mjerePlana: DEMO_MJERE_PLANA,
          ispitivanja: DEMO_ISPITIVANJA,
          napomenePriloga: {},
          aktivniPosaoId: DEMO_POSLOVI[0]?.id ?? null,
          korisnikMijenjao: false,
          primjerVerzija: PRIMJER_VERZIJA,
        }),
      ocistiSve: () =>
        rawSet({
          poslodavac: PRAZAN_POSLODAVAC,
          radnaMjesta: [],
          poslovi: [],
          radnaOprema: BASE_RADNA_OPREMA,
          mjerePlana: [],
          ispitivanja: [],
          napomenePriloga: {},
          aktivniPosaoId: null,
          zadnjiKorak: "poslodavac",
          // Prazna procjena je korisnikova, ne primjer - primjer se ne vraća sam.
          korisnikMijenjao: true,
          primjerVerzija: PRIMJER_VERZIJA,
        }),
      };
    },
    {
      name: STORE_NAME,
      version: STORE_VERSION,
      migrate: (persistedState) => normalizirajUcitanoStanje(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizirajUcitanoStanje(persistedState),
      }),
      // Kad se promijeni verzija primjera, a korisnik nije ništa mijenjao, automatski učitaj
      // novi primjer - inače bi netaknuti primjer zauvijek ostao na staroj verziji.
      // Uvjet isPrimjer je ključan: podaci koje je korisnik unio za SVOG poslodavca nikad se ne
      // prepisuju primjerom, čak ni ako zastavica korisnikMijenjao nekako izostane.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const jePrimjer = state.poslodavac?.isPrimjer === true;
        if (jePrimjer && !state.korisnikMijenjao && state.primjerVerzija !== PRIMJER_VERZIJA) {
          state.ucitajPrimjer();
        }
      },
    }
  )
);
