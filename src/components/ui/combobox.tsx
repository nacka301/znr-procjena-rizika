import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn, normaliziraj } from "../../lib/utils";
import { Button } from "./button";

export interface ComboOpcija {
  /** Vrijednost koja se upisuje u polje. */
  vrijednost: string;
  /** Prikazani naziv; ako nije zadan, koristi se vrijednost. */
  naziv?: string;
  /** Sivi dodatak desno (npr. puna staza Priloga III). */
  opis?: string;
  /** Skupina u popisu. */
  grupa?: string;
}

/**
 * Jedan combobox s pretragom i slobodnim unosom - zamjenjuje višerazinske padajuće izbornike.
 * Tipkovnica: strelice kreću kroz rezultate, Enter potvrđuje, Esc zatvara.
 */
export function Combobox({
  vrijednost,
  onOdaberi,
  opcije,
  placeholder = "Pretraži…",
  prazno = "Nema rezultata.",
  dopustiSlobodanUnos = false,
  slobodanUnosLabel = "Upiši",
  className,
  triggerClassName,
  trigger,
  align = "start",
}: {
  vrijednost?: string;
  onOdaberi: (vrijednost: string, opcija?: ComboOpcija) => void;
  opcije: ComboOpcija[];
  placeholder?: string;
  prazno?: string;
  dopustiSlobodanUnos?: boolean;
  slobodanUnosLabel?: string;
  className?: string;
  triggerClassName?: string;
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [upit, setUpit] = useState("");
  const [indeks, setIndeks] = useState(0);
  const listaRef = useRef<HTMLDivElement>(null);

  const filtrirano = useMemo(() => {
    const u = normaliziraj(upit);
    if (!u) return opcije.slice(0, 80);
    const rijeci = u.split(" ").filter(Boolean);
    return opcije
      .filter((o) => {
        const tekst = normaliziraj(`${o.naziv ?? o.vrijednost} ${o.opis ?? ""} ${o.grupa ?? ""}`);
        return rijeci.every((r) => tekst.includes(r));
      })
      .slice(0, 80);
  }, [opcije, upit]);

  const slobodanUnosVidljiv = dopustiSlobodanUnos && upit.trim().length > 0;
  const ukupno = filtrirano.length + (slobodanUnosVidljiv ? 1 : 0);

  function potvrdi(i: number) {
    if (slobodanUnosVidljiv && i === filtrirano.length) {
      onOdaberi(upit.trim());
    } else {
      const o = filtrirano[i];
      if (!o) return;
      onOdaberi(o.vrijednost, o);
    }
    setOpen(false);
    setUpit("");
    setIndeks(0);
  }

  function pomakni(delta: number) {
    setIndeks((i) => {
      const next = Math.max(0, Math.min(ukupno - 1, i + delta));
      listaRef.current
        ?.querySelector(`[data-i="${next}"]`)
        ?.scrollIntoView({ block: "nearest" });
      return next;
    });
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setUpit("");
          setIndeks(0);
        }
      }}
    >
      <Popover.Trigger asChild>
        {trigger ?? (
          <Button
            variant="secondary"
            className={cn("w-full justify-between font-normal", triggerClassName)}
          >
            <span className={cn("truncate", !vrijednost && "text-slate-400")}>
              {vrijednost || placeholder}
            </span>
            <ChevronDown className="text-slate-400" />
          </Button>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={4}
          collisionPadding={12}
          className={cn(
            "z-[60] w-[var(--radix-popover-trigger-width)] min-w-[18rem] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg",
            className
          )}
        >
          <div className="flex items-center gap-2 border-b border-slate-200 px-2.5">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={upit}
              onChange={(e) => {
                setUpit(e.target.value);
                setIndeks(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  pomakni(1);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  pomakni(-1);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  potvrdi(indeks);
                }
              }}
              placeholder={placeholder}
              className="h-9 w-full bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <div ref={listaRef} className="max-h-72 overflow-y-auto py-1" role="listbox">
            {filtrirano.length === 0 && !slobodanUnosVidljiv ? (
              <p className="px-3 py-4 text-center text-[12px] text-slate-500">{prazno}</p>
            ) : null}
            {filtrirano.map((o, i) => {
              const odabrano = vrijednost === o.vrijednost;
              return (
                <button
                  key={`${o.vrijednost}-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={odabrano}
                  onMouseEnter={() => setIndeks(i)}
                  onClick={() => potvrdi(i)}
                  className={cn(
                    "flex w-full items-start gap-2 px-2.5 py-1.5 text-left text-[13px]",
                    i === indeks ? "bg-slate-100" : "bg-transparent"
                  )}
                >
                  <Check
                    className={cn(
                      "mt-0.5 size-3.5 shrink-0 text-[var(--color-accent)]",
                      odabrano ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-slate-800">{o.naziv ?? o.vrijednost}</span>
                    {o.opis ? (
                      <span className="block text-[11px] leading-snug text-slate-500">
                        {o.opis}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
            {slobodanUnosVidljiv ? (
              <button
                data-i={filtrirano.length}
                onMouseEnter={() => setIndeks(filtrirano.length)}
                onClick={() => potvrdi(filtrirano.length)}
                className={cn(
                  "flex w-full items-center gap-2 border-t border-slate-200 px-2.5 py-1.5 text-left text-[13px]",
                  indeks === filtrirano.length ? "bg-slate-100" : "bg-transparent"
                )}
              >
                <span className="text-slate-500">{slobodanUnosLabel}:</span>
                <span className="truncate font-medium text-slate-800">{upit.trim()}</span>
              </button>
            ) : null}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
