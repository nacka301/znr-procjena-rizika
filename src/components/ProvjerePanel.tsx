import { Check, ChevronRight } from "lucide-react";
import { STEPS, useNav } from "../state/navigacija";
import type { Provjera } from "../utils/provjere";
import { cn } from "../lib/utils";

function nazivKoraka(kljuc: string): string {
  const s = STEPS.find((x) => x.key === kljuc);
  return s ? `${s.broj}. ${s.naslov}` : kljuc;
}

/**
 * Živi popis onoga što nedostaje ili je nedosljedno. Svaka stavka je link na točno mjesto
 * u aplikaciji.
 */
export default function ProvjerePanel({
  provjere,
  onNakonKlika,
  className,
}: {
  provjere: Provjera[];
  onNakonKlika?: () => void;
  className?: string;
}) {
  const { idi } = useNav();

  const grupe = STEPS.map((s) => ({
    korak: s.key,
    stavke: provjere.filter((p) => p.cilj.korak === s.key),
  })).filter((g) => g.stavke.length > 0);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2>Provjere</h2>
        <span
          className={cn(
            "tabular rounded-md border px-1.5 py-0.5 text-[11px] font-semibold",
            provjere.length === 0
              ? "border-[var(--color-risk-mali-border)] bg-[var(--color-risk-mali-bg)] text-[var(--color-risk-mali)]"
              : "border-[var(--color-risk-srednji-border)] bg-[var(--color-risk-srednji-bg)] text-[var(--color-risk-srednji)]"
          )}
        >
          {provjere.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {provjere.length === 0 ? (
          <p className="flex items-start gap-2 px-4 py-4 text-[13px] text-slate-500">
            <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-risk-mali)]" />
            Nema otvorenih stavki. Sadržajnu ispravnost procjene potvrđuje stručnjak.
          </p>
        ) : (
          grupe.map((g) => (
            <div key={g.korak}>
              <p className="sticky top-0 border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {nazivKoraka(g.korak)}
              </p>
              <ul>
                {g.stavke.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        idi(p.cilj);
                        onNakonKlika?.();
                      }}
                      className="group flex w-full items-start gap-2 border-b border-slate-100 px-4 py-2.5 text-left hover:bg-slate-50"
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--color-risk-srednji)]"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] leading-snug text-slate-800">
                          {p.tekst}
                        </span>
                        {p.kontekst ? (
                          <span className="block truncate text-[11px] text-slate-500">
                            {p.kontekst}
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-300 group-hover:text-slate-500" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
