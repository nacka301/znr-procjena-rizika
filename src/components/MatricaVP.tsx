import { izracunajRazinu, type Posljedica, type RazinaRizika, type Vjerojatnost } from "../types";
import { Select } from "./ui/field";
import { Tooltip } from "./ui/tooltip";
import { cn } from "../lib/utils";

export const VJEROJATNOST_LABEL: Record<Vjerojatnost, string> = {
  1: "Malo vjerojatno",
  2: "Vjerojatno",
  3: "Vrlo vjerojatno",
};

export const POSLJEDICA_LABEL: Record<Posljedica, string> = {
  1: "Malo štetno",
  2: "Srednje štetno",
  3: "Izrazito štetno",
};

const BOJA: Record<RazinaRizika, string> = {
  mali: "bg-[var(--color-risk-mali-bg)] text-[var(--color-risk-mali)] border-[var(--color-risk-mali-border)]",
  srednji:
    "bg-[var(--color-risk-srednji-bg)] text-[var(--color-risk-srednji)] border-[var(--color-risk-srednji-border)]",
  veliki:
    "bg-[var(--color-risk-veliki-bg)] text-[var(--color-risk-veliki)] border-[var(--color-risk-veliki-border)]",
};

const KRATICA: Record<RazinaRizika, string> = { mali: "M", srednji: "S", veliki: "V" };

/**
 * Matrica 3×3 (Prilog I, NN 112/14): klik na ćeliju postavlja i vjerojatnost i posljedicu.
 * Uz matricu stoje i dva mala selecta, radi rada isključivo tipkovnicom.
 */
export default function MatricaVP({
  vjerojatnost,
  posljedica,
  onPromjena,
  kompaktno = false,
}: {
  vjerojatnost: Vjerojatnost | null;
  posljedica: Posljedica | null;
  onPromjena: (v: Vjerojatnost | null, p: Posljedica | null) => void;
  kompaktno?: boolean;
}) {
  const razina = izracunajRazinu(vjerojatnost, posljedica);

  return (
    <div className={cn("flex flex-wrap items-start gap-4", kompaktno && "gap-3")}>
      <div>
        <table className="border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th />
              {([1, 2, 3] as Posljedica[]).map((p) => (
                <th
                  key={p}
                  className="tabular w-7 pb-0.5 text-center text-[10px] font-medium text-slate-400"
                >
                  <Tooltip content={`Posljedica ${p} – ${POSLJEDICA_LABEL[p]}`}>
                    <span>P{p}</span>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([3, 2, 1] as Vjerojatnost[]).map((v) => (
              <tr key={v}>
                <th className="tabular pr-1 text-right text-[10px] font-medium text-slate-400">
                  <Tooltip content={`Vjerojatnost ${v} – ${VJEROJATNOST_LABEL[v]}`} side="left">
                    <span>V{v}</span>
                  </Tooltip>
                </th>
                {([1, 2, 3] as Posljedica[]).map((p) => {
                  const celijaRazina = izracunajRazinu(v, p)!;
                  const odabrano = vjerojatnost === v && posljedica === p;
                  return (
                    <td key={p}>
                      <Tooltip
                        content={`V${v} ${VJEROJATNOST_LABEL[v]} × P${p} ${POSLJEDICA_LABEL[p]} → ${celijaRazina} rizik`}
                      >
                        <button
                          onClick={() => onPromjena(odabrano ? null : v, odabrano ? null : p)}
                          aria-pressed={odabrano}
                          aria-label={`Vjerojatnost ${v}, posljedica ${p} (${celijaRazina} rizik)`}
                          className={cn(
                            "flex size-7 items-center justify-center rounded border text-[11px] font-semibold transition-all",
                            BOJA[celijaRazina],
                            odabrano
                              ? "ring-2 ring-[var(--color-accent)] ring-offset-1"
                              : "opacity-55 hover:opacity-100"
                          )}
                        >
                          {KRATICA[celijaRazina]}
                        </button>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex min-w-[170px] flex-1 flex-col gap-1.5">
        <Select
          className="h-8"
          aria-label="Vjerojatnost"
          value={vjerojatnost ?? ""}
          onChange={(e) =>
            onPromjena(
              e.target.value ? (Number(e.target.value) as Vjerojatnost) : null,
              posljedica
            )
          }
        >
          <option value="">Vjerojatnost — odaberi</option>
          {([1, 2, 3] as Vjerojatnost[]).map((v) => (
            <option key={v} value={v}>
              V{v} – {VJEROJATNOST_LABEL[v]}
            </option>
          ))}
        </Select>
        <Select
          className="h-8"
          aria-label="Posljedica"
          value={posljedica ?? ""}
          onChange={(e) =>
            onPromjena(
              vjerojatnost,
              e.target.value ? (Number(e.target.value) as Posljedica) : null
            )
          }
        >
          <option value="">Posljedica — odaberi</option>
          {([1, 2, 3] as Posljedica[]).map((p) => (
            <option key={p} value={p}>
              P{p} – {POSLJEDICA_LABEL[p]}
            </option>
          ))}
        </Select>
        <p className="text-[11px] text-slate-500">
          {razina ? (
            <>
              Razina: <span className="font-semibold text-slate-700">{razina} rizik</span>
            </>
          ) : (
            "Odaberite ćeliju matrice ili vrijednosti u popisima."
          )}
        </p>
      </div>
    </div>
  );
}
