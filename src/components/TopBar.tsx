import { useState } from "react";
import { Download, Info, ListChecks, Menu } from "lucide-react";
import { useStore } from "../state/store";
import { STEPS, useNav } from "../state/navigacija";
import type { KorakKljuc, Provjera } from "../utils/provjere";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select } from "./ui/field";
import { Tooltip } from "./ui/tooltip";
import StatusSpremanja from "./StatusSpremanja";

export const DISCLAIMER =
  "Prototip. Alat ne donosi stručne odluke: vjerojatnost, posljedicu, OZO, norme i točke Pravilnika određuje i provjerava stručnjak zaštite na radu. Sve što je u alatu označeno s PROVJERITI samo je prijedlog, ne pravna tvrdnja.";

export default function TopBar({
  provjere,
  onOtvoriProvjere,
  onIzvoz,
  izvozUTijeku,
}: {
  provjere: Provjera[];
  onOtvoriProvjere: () => void;
  onIzvoz: () => void;
  izvozUTijeku: boolean;
}) {
  const poslodavac = useStore((s) => s.poslodavac);
  const { korak, postaviKorak } = useNav();
  const [mobilniIzbornik, setMobilniIzbornik] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        {/* Mobilni prekidač stepper-izbornika (<768px) */}
        <Button
          variant="ghost"
          size="iconSm"
          className="md:hidden"
          aria-label="Koraci"
          onClick={() => setMobilniIzbornik((v) => !v)}
        >
          <Menu />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <h1 className="truncate text-[14px] font-semibold sm:text-[15px]">
            Procjena rizika
            {/* Naziv poslodavca se na uskom ekranu izostavlja da naslov ne ostane odrezan. */}
            <span className="hidden sm:inline">
              <span className="text-slate-400"> – </span>
              <span className="font-normal text-slate-600">
                {poslodavac.naziv || "bez naziva"}
              </span>
            </span>
          </h1>
          {poslodavac.isPrimjer ? (
            <Badge tone="neutral" className="shrink-0 uppercase tracking-wide">
              Primjer
            </Badge>
          ) : null}
          <Tooltip content={DISCLAIMER}>
            <button
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Napomena o odgovornosti"
            >
              <Info className="size-4" />
            </button>
          </Tooltip>
        </div>

        <div className="hidden sm:block">
          <StatusSpremanja />
        </div>

        {/* Ispod 1440px panel Provjere nije na ekranu - dostupan je ovim gumbom. */}
        <Button
          variant="secondary"
          size="sm"
          className="min-[1440px]:hidden"
          onClick={onOtvoriProvjere}
        >
          <ListChecks />
          <span className="hidden sm:inline">Provjere</span>
          <span className="tabular">({provjere.length})</span>
        </Button>

        <Button variant="primary" size="sm" onClick={onIzvoz} disabled={izvozUTijeku}>
          <Download />
          <span className="hidden sm:inline">
            {izvozUTijeku ? "Izvoz…" : "Izvezi u Word"}
          </span>
        </Button>
      </div>

      {/* <768px: stepper je padajući izbornik na vrhu */}
      {mobilniIzbornik ? (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <Select
            value={korak}
            onChange={(e) => {
              postaviKorak(e.target.value as KorakKljuc);
              setMobilniIzbornik(false);
            }}
            aria-label="Odaberi korak"
          >
            <option value="nadzor">Nadzorna ploča</option>
            {STEPS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.broj}. {s.naslov}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
    </header>
  );
}
