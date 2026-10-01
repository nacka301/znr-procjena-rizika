import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "./store";
import type { Cilj, KorakKljuc } from "../utils/provjere";

export interface StepDef {
  key: KorakKljuc;
  broj: number;
  naslov: string;
  podnaslov: string;
}

export const STEPS: StepDef[] = [
  { key: "poslodavac", broj: 1, naslov: "Poslodavac", podnaslov: "Opći podaci" },
  { key: "radna-mjesta", broj: 2, naslov: "Radna mjesta", podnaslov: "Popis i broj radnika" },
  { key: "poslovi", broj: 3, naslov: "Poslovi", podnaslov: "Tko što radi" },
  { key: "analiza", broj: 4, naslov: "Analiza posla", podnaslov: "Opasnosti, štetnosti, napori" },
  { key: "mjere", broj: 5, naslov: "Mjere i OZO", podnaslov: "OZO, pregledi, plan mjera" },
  { key: "prilozi", broj: 6, naslov: "Prilozi", podnaslov: "Devet automatskih popisa" },
  { key: "pregled", broj: 7, naslov: "Pregled dokumenta", podnaslov: "Izvoz i ispis" },
];

interface NavApi {
  korak: KorakKljuc;
  /** Cilj zadnje navigacije - korak ga koristi da otvori i označi točnu stavku. */
  fokus: Cilj | null;
  postaviKorak: (korak: KorakKljuc) => void;
  idi: (cilj: Cilj) => void;
  ocistiFokus: () => void;
}

const NavCtx = createContext<NavApi | null>(null);

export function useNav(): NavApi {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error("useNav se koristi izvan NavProvider");
  return ctx;
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [korak, setKorak] = useState<KorakKljuc>("nadzor");
  const [fokus, setFokus] = useState<Cilj | null>(null);
  const setZadnjiKorak = useStore((s) => s.setZadnjiKorak);
  const setAktivniPosaoId = useStore((s) => s.setAktivniPosaoId);

  const postaviKorak = useCallback(
    (k: KorakKljuc) => {
      setKorak(k);
      setFokus(null);
      if (k !== "nadzor") setZadnjiKorak(k);
      window.scrollTo({ top: 0 });
    },
    [setZadnjiKorak]
  );

  const idi = useCallback(
    (cilj: Cilj) => {
      if (cilj.posaoId) setAktivniPosaoId(cilj.posaoId);
      setKorak(cilj.korak);
      setFokus(cilj);
      if (cilj.korak !== "nadzor") setZadnjiKorak(cilj.korak);
    },
    [setAktivniPosaoId, setZadnjiKorak]
  );

  const vrijednost = useMemo<NavApi>(
    () => ({ korak, fokus, postaviKorak, idi, ocistiFokus: () => setFokus(null) }),
    [korak, fokus, postaviKorak, idi]
  );

  return <NavCtx.Provider value={vrijednost}>{children}</NavCtx.Provider>;
}
