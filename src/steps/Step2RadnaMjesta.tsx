import { useState } from "react";
import { useStore } from "../state/store";

export default function Step2RadnaMjesta({ onNastavi }: { onNastavi: () => void }) {
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const addRadnoMjesto = useStore((s) => s.addRadnoMjesto);
  const updateRadnoMjesto = useStore((s) => s.updateRadnoMjesto);
  const removeRadnoMjesto = useStore((s) => s.removeRadnoMjesto);
  const [novoIme, setNovoIme] = useState("");
  const [noviBroj, setNoviBroj] = useState(1);

  function dodaj() {
    if (!novoIme.trim()) return;
    addRadnoMjesto(novoIme.trim(), noviBroj);
    setNovoIme("");
    setNoviBroj(1);
  }

  const ukupno = radnaMjesta.reduce((zbroj, rm) => zbroj + rm.brojRadnika, 0);

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Cjelina 2 · Prikupljanje podataka</div>
        <h1>Radna mjesta</h1>
        <p className="hint">
          Radno mjesto je organizacijska jedinica (npr. "prodavač", "pekar"). Poslove koje se na
          njemu obavljaju povezat ćete u sljedećem koraku — jedno radno mjesto može obuhvaćati
          više poslova, a isti posao mogu obavljati radnici na različitim radnim mjestima.
        </p>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h2>Popis radnih mjesta</h2>
          <span className="hint">Ukupno radnika na popisu: {ukupno}</span>
        </div>
        {radnaMjesta.length === 0 && (
          <div className="empty-state">Nema unesenih radnih mjesta.</div>
        )}
        {radnaMjesta.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Naziv radnog mjesta</th>
                <th style={{ width: 160 }}>Broj radnika</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {radnaMjesta.map((rm) => (
                <tr key={rm.id}>
                  <td>
                    <input
                      type="text"
                      value={rm.naziv}
                      onChange={(e) =>
                        updateRadnoMjesto(rm.id, { naziv: e.target.value })
                      }
                      style={{ width: "100%", border: "none", background: "transparent" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={rm.brojRadnika}
                      onChange={(e) =>
                        updateRadnoMjesto(rm.id, {
                          brojRadnika: Number(e.target.value) || 0,
                        })
                      }
                      style={{ width: 80 }}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeRadnoMjesto(rm.id)}
                    >
                      Ukloni
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "flex-end" }}>
          <div className="field-row" style={{ flex: 1, marginBottom: 0 }}>
            <label>Novo radno mjesto</label>
            <input
              type="text"
              value={novoIme}
              onChange={(e) => setNovoIme(e.target.value)}
              placeholder="npr. Voditelj smjene"
              onKeyDown={(e) => e.key === "Enter" && dodaj()}
            />
          </div>
          <div className="field-row" style={{ width: 120, marginBottom: 0 }}>
            <label>Broj radnika</label>
            <input
              type="number"
              min={0}
              value={noviBroj}
              onChange={(e) => setNoviBroj(Number(e.target.value) || 0)}
            />
          </div>
          <button className="btn btn-primary" onClick={dodaj}>
            + Dodaj
          </button>
        </div>
      </div>

      <div className="step-footer-nav">
        <span />
        <button className="btn btn-primary" onClick={onNastavi}>
          Dalje: povezivanje s poslovima →
        </button>
      </div>
    </div>
  );
}
