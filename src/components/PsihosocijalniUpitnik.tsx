import { useMemo, useState } from "react";
import type { Vjerojatnost } from "../types";
import {
  PSIHOSOCIJALNI_UPITNIK,
  SKALA_ODGOVORA,
  prosjekUVjerojatnost,
} from "../data/psihosocijalniUpitnik";
import { Button } from "./ui/button";
import { Select } from "./ui/field";

const VJEROJATNOST_TEKST: Record<Vjerojatnost, string> = {
  1: "malo vjerojatno",
  2: "vjerojatno",
  3: "vrlo vjerojatno",
};

export default function PsihosocijalniUpitnik({
  onPrimijeni,
  onOdustani,
}: {
  onPrimijeni: (vjerojatnost: Vjerojatnost) => void;
  onOdustani: () => void;
}) {
  const [odgovori, setOdgovori] = useState<Record<string, number>>(() =>
    Object.fromEntries(PSIHOSOCIJALNI_UPITNIK.map((p) => [p.id, 3]))
  );

  const prosjek = useMemo(() => {
    const vrijednosti = Object.values(odgovori);
    return vrijednosti.reduce((zbroj, v) => zbroj + v, 0) / vrijednosti.length;
  }, [odgovori]);

  const predlozenaVjerojatnost = prosjekUVjerojatnost(prosjek);

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="mb-3 text-[12px] leading-snug text-slate-600">
        Kratki upitnik za procjenu vjerojatnosti psihosocijalnih/psihofizioloških rizika. Rezultat je
        samo prijedlog vjerojatnosti — stručnjak ga može slobodno promijeniti.
      </p>
      <div className="flex flex-col gap-2">
        {PSIHOSOCIJALNI_UPITNIK.map((pitanje) => (
          <div
            key={pitanje.id}
            className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="min-w-0 flex-1 text-[13px] leading-snug text-slate-700">
              {pitanje.tekst}
              <span className="ml-1 text-slate-400">({pitanje.podrucje})</span>
            </span>
            <Select
              className="h-8 w-full sm:w-[150px]"
              aria-label={pitanje.tekst}
              value={odgovori[pitanje.id]}
              onChange={(e) =>
                setOdgovori((o) => ({ ...o, [pitanje.id]: Number(e.target.value) }))
              }
            >
              {SKALA_ODGOVORA.map((s) => (
                <option key={s.vrijednost} value={s.vrijednost}>
                  {s.oznaka}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
        <span className="text-[12px] text-slate-600">
          Prosjek <span className="tabular font-semibold">{prosjek.toFixed(2)}</span> → prijedlog:{" "}
          <span className="font-semibold">{VJEROJATNOST_TEKST[predlozenaVjerojatnost]}</span>
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onOdustani}>
            Odustani
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onPrimijeni(predlozenaVjerojatnost)}
          >
            Primijeni prijedlog
          </Button>
        </div>
      </div>
    </div>
  );
}
