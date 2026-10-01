import { useMemo } from "react";
import { ArrowRight, ListChecks } from "lucide-react";
import { useStore } from "../state/store";
import { STEPS, useNav } from "../state/navigacija";
import { izracunajRazinu, type RazinaRizika } from "../types";
import { izracunajProvjere } from "../utils/provjere";
import { Card, CardBody } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const RAZINE: { kljuc: RazinaRizika; naziv: string; boja: string }[] = [
  { kljuc: "veliki", naziv: "Veliki", boja: "var(--color-risk-veliki)" },
  { kljuc: "srednji", naziv: "Srednji", boja: "var(--color-risk-srednji)" },
  { kljuc: "mali", naziv: "Mali", boja: "var(--color-risk-mali)" },
];

function Brojka({
  oznaka,
  vrijednost,
  podnaslov,
}: {
  oznaka: string;
  vrijednost: number | string;
  podnaslov?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{oznaka}</p>
      <p className="tabular mt-1 text-[28px] font-semibold leading-none text-slate-900">
        {vrijednost}
      </p>
      {podnaslov ? <p className="mt-1 text-[12px] text-slate-500">{podnaslov}</p> : null}
    </div>
  );
}

export default function Step0Nadzor() {
  const poslodavac = useStore((s) => s.poslodavac);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const mjerePlana = useStore((s) => s.mjerePlana);
  const ispitivanja = useStore((s) => s.ispitivanja);
  const zadnjiKorak = useStore((s) => s.zadnjiKorak);
  const { postaviKorak, idi } = useNav();

  const provjere = useMemo(
    () => izracunajProvjere({ poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja }),
    [poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja]
  );

  const brojRizika = useMemo(() => {
    const broj: Record<RazinaRizika, number> = { mali: 0, srednji: 0, veliki: 0 };
    let neocijenjeno = 0;
    for (const p of poslovi)
      for (const r of p.rizici) {
        const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
        if (razina) broj[razina] += 1;
        else neocijenjeno += 1;
      }
    return { broj, neocijenjeno, ukupno: poslovi.reduce((z, p) => z + p.rizici.length, 0) };
  }, [poslovi]);

  const maks = Math.max(1, ...RAZINE.map((r) => brojRizika.broj[r.kljuc]));
  const ukupnoRadnika = radnaMjesta.reduce((z, rm) => z + rm.brojRadnika, 0);
  const nastavak = STEPS.find((s) => s.key === zadnjiKorak) ?? STEPS[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-500">
            Stanje procjene
          </p>
          <h1 className="mt-0.5">{poslodavac.naziv || "Nova procjena"}</h1>
        </div>
        <Button variant="primary" onClick={() => postaviKorak(nastavak.key)}>
          Nastavi gdje si stao
          <ArrowRight />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <Brojka
              oznaka="Poslovi"
              vrijednost={poslovi.length}
              podnaslov={`${radnaMjesta.length} radnih mjesta · ${ukupnoRadnika} radnika`}
            />
          </CardBody>
        </Card>

        <Card className="sm:col-span-2">
          <CardBody>
            <div className="flex items-start justify-between gap-4">
              <Brojka
                oznaka="Rizici po razinama"
                vrijednost={brojRizika.ukupno}
                podnaslov={
                  brojRizika.neocijenjeno > 0
                    ? `${brojRizika.neocijenjeno} nije ocijenjeno`
                    : "svi ocijenjeni"
                }
              />
              <div className="flex items-end gap-3 pt-2">
                {RAZINE.map((r) => {
                  const n = brojRizika.broj[r.kljuc];
                  return (
                    <div key={r.kljuc} className="flex w-12 flex-col items-center gap-1">
                      <span className="tabular text-[12px] font-semibold text-slate-700">{n}</span>
                      <span
                        className="w-full rounded-sm"
                        style={{
                          height: `${8 + (n / maks) * 40}px`,
                          background: r.boja,
                          opacity: n === 0 ? 0.2 : 1,
                        }}
                        aria-hidden
                      />
                      <span className="text-[11px] text-slate-500">{r.naziv}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-start justify-between gap-2">
              <Brojka
                oznaka="Provjere"
                vrijednost={provjere.length}
                podnaslov={provjere.length === 0 ? "nema otvorenih stavki" : "stavki za dovršetak"}
              />
              <ListChecks
                className={cn(
                  "size-5 shrink-0",
                  provjere.length === 0
                    ? "text-[var(--color-risk-mali)]"
                    : "text-[var(--color-risk-srednji)]"
                )}
              />
            </div>
            {provjere.length > 0 ? (
              <Button
                variant="link"
                className="mt-3"
                onClick={() => idi(provjere[0].cilj)}
              >
                {provjere[0].tekst}
              </Button>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-slate-100">
            {STEPS.map((s) => {
              const stavke = provjere.filter((x) => x.cilj.korak === s.key);
              return (
                <li key={s.key}>
                  <button
                    onClick={() => postaviKorak(s.key)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                  >
                    <span className="tabular flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[11px] font-semibold text-slate-500">
                      {s.broj}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-slate-800">
                        {s.naslov}
                      </span>
                      <span className="block text-[12px] text-slate-500">{s.podnaslov}</span>
                    </span>
                    <span
                      className={cn(
                        "tabular shrink-0 text-[12px] font-medium",
                        stavke.length === 0
                          ? "text-[var(--color-risk-mali)]"
                          : "text-[var(--color-risk-srednji)]"
                      )}
                    >
                      {stavke.length === 0 ? "gotovo" : `${stavke.length} nedostaje`}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-slate-300" />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
