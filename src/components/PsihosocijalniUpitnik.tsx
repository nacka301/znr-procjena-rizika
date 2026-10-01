import { useMemo, useState } from "react";
import type { Vjerojatnost } from "../types";
import {
  PSIHOSOCIJALNI_UPITNIK,
  SKALA_ODGOVORA,
  prosjekUVjerojatnost,
} from "../data/psihosocijalniUpitnik";

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
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        background: "var(--color-surface-muted)",
      }}
    >
      <p className="hint" style={{ marginBottom: 10 }}>
        Kratki upitnik za procjenu vjerojatnosti psihosocijalnih/psihofizioloških rizika. Ocijenite
        koliko se svaka tvrdnja odnosi na ovaj posao. Rezultat je samo prijedlog vjerojatnosti —
        stručnjak ga može slobodno promijeniti.
      </p>
      {PSIHOSOCIJALNI_UPITNIK.map((pitanje) => (
        <div key={pitanje.id} className="field-row">
          <label>
            {pitanje.tekst} <span className="hint">({pitanje.podrucje})</span>
          </label>
          <select
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
          </select>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span className="hint">
          Prosjek: <strong>{prosjek.toFixed(2)}</strong> → prijedlog vjerojatnosti:{" "}
          <strong>{VJEROJATNOST_TEKST[predlozenaVjerojatnost]}</strong>
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-sm" onClick={onOdustani}>
            Odustani
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onPrimijeni(predlozenaVjerojatnost)}
          >
            Primijeni prijedlog
          </button>
        </div>
      </div>
    </div>
  );
}
