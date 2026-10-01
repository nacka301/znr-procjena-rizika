import { Check, LayoutDashboard } from "lucide-react";
import { cn } from "../lib/utils";
import { STEPS, useNav } from "../state/navigacija";
import type { Provjera } from "../utils/provjere";

/**
 * Stepper 1-7 sa statusom svakog koraka: kvačica = nema otvorenih stavki,
 * jantarni broj = koliko stavki nedostaje. Klik na status vodi na prvu nedostajuću stavku.
 */
export default function Stepper({ provjere }: { provjere: Provjera[] }) {
  const { korak, postaviKorak, idi } = useNav();

  return (
    <nav className="no-print flex flex-col gap-1" aria-label="Koraci procjene">
      <button
        onClick={() => postaviKorak("nadzor")}
        className={cn(
          "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
          korak === "nadzor"
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <LayoutDashboard className="size-4 shrink-0" />
        Nadzorna ploča
      </button>

      <div className="my-1 h-px bg-slate-200" />

      {STEPS.map((s) => {
        const stavke = provjere.filter((p) => p.cilj.korak === s.key);
        const aktivno = korak === s.key;
        return (
          <div
            key={s.key}
            className={cn(
              "group flex items-stretch gap-1 rounded-md transition-colors",
              aktivno ? "bg-[var(--color-accent-soft)]" : "hover:bg-slate-100"
            )}
          >
            <button
              onClick={() => postaviKorak(s.key)}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left"
            >
              <span
                className={cn(
                  "tabular flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  aktivno
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-slate-300 bg-white text-slate-500"
                )}
              >
                {s.broj}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-[13px] font-medium",
                    aktivno ? "text-[var(--color-accent)]" : "text-slate-700"
                  )}
                >
                  {s.naslov}
                </span>
                <span className="block truncate text-[11px] text-slate-500">{s.podnaslov}</span>
              </span>
            </button>

            {stavke.length === 0 ? (
              <span
                className="flex w-8 items-center justify-center"
                title="Nema otvorenih stavki u ovom koraku"
              >
                <Check className="size-4 text-[var(--color-risk-mali)]" />
              </span>
            ) : (
              <button
                onClick={() => idi(stavke[0].cilj)}
                title={`${stavke.length} ${stavke.length === 1 ? "stavka nedostaje" : "stavki nedostaje"} – otvori prvu`}
                className="tabular flex w-8 items-center justify-center text-[12px] font-semibold text-[var(--color-risk-srednji)] hover:underline"
              >
                {stavke.length}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
