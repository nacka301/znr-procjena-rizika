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
} from "../data/demoData";
import { BASE_RADNA_OPREMA } from "../data/baseRadnaOprema";
import type { RadnaOprema } from "../types";

const PRAZAN_POSLODAVAC: Poslodavac = {
  naziv: "",
  djelatnost: "",
  lokacije: [],
  oib: "",
  isPrimjer: false,
};

interface StoreState {
  poslodavac: Poslodavac;
  radnaMjesta: RadnoMjesto[];
  poslovi: Posao[];
  radnaOprema: RadnaOprema[];
  mjerePlana: MjeraPlana[];
  ispitivanja: Ispitivanje[];
  napomenePriloga: Record<string, string>;
  aktivniPosaoId: string | null;
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
    (set) => ({
      poslodavac: DEMO_POSLODAVAC,
      radnaMjesta: DEMO_RADNA_MJESTA,
      poslovi: DEMO_POSLOVI,
      radnaOprema: DEMO_RADNA_OPREMA,
      mjerePlana: DEMO_MJERE_PLANA,
      ispitivanja: DEMO_ISPITIVANJA,
      napomenePriloga: {},
      aktivniPosaoId: DEMO_POSLOVI[0]?.id ?? null,
      setAktivniPosaoId: (id) => set({ aktivniPosaoId: id }),
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
        set({
          poslodavac: DEMO_POSLODAVAC,
          radnaMjesta: DEMO_RADNA_MJESTA,
          poslovi: DEMO_POSLOVI,
          radnaOprema: DEMO_RADNA_OPREMA,
          mjerePlana: DEMO_MJERE_PLANA,
          ispitivanja: DEMO_ISPITIVANJA,
          napomenePriloga: {},
          aktivniPosaoId: DEMO_POSLOVI[0]?.id ?? null,
        }),
      ocistiSve: () =>
        set({
          poslodavac: PRAZAN_POSLODAVAC,
          radnaMjesta: [],
          poslovi: [],
          radnaOprema: BASE_RADNA_OPREMA,
          mjerePlana: [],
          ispitivanja: [],
          napomenePriloga: {},
          aktivniPosaoId: null,
        }),
    }),
    { name: "znr-procjena-rizika" }
  )
);
