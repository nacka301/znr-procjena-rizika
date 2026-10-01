import { useState } from "react";
import { useStore } from "../state/store";
import { izracunajRazinu, razinaPosla, type Posljedica, type Vjerojatnost } from "../types";
import RiskBadge from "../components/RiskBadge";
import PrilogIIIPicker from "../components/PrilogIIIPicker";

const VJEROJATNOST_LABEL: Record<Vjerojatnost, string> = {
  1: "1 – Malo vjerojatno",
  2: "2 – Vjerojatno",
  3: "3 – Vrlo vjerojatno",
};
const POSLJEDICA_LABEL: Record<Posljedica, string> = {
  1: "1 – Malo štetno",
  2: "2 – Srednje štetno",
  3: "3 – Izrazito štetno",
};

export default function Step4Analiza() {
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const aktivniPosaoId = useStore((s) => s.aktivniPosaoId);
  const setAktivniPosaoId = useStore((s) => s.setAktivniPosaoId);
  const addRizik = useStore((s) => s.addRizik);
  const updateRizik = useStore((s) => s.updateRizik);
  const removeRizik = useStore((s) => s.removeRizik);
  const toggleOpremaNaPoslu = useStore((s) => s.toggleOpremaNaPoslu);
  const addRadnaOpremaOpcija = useStore((s) => s.addRadnaOpremaOpcija);
  const [novaOprema, setNovaOprema] = useState("");
  const [prikaziPicker, setPrikaziPicker] = useState(false);

  const posao = poslovi.find((p) => p.id === aktivniPosaoId) ?? poslovi[0] ?? null;

  if (!posao) {
    return (
      <div>
        <div className="page-header">
          <div className="eyebrow">Cjelina 3 · Analiza i procjena rizika po poslovima</div>
          <h1>Analiza posla</h1>
        </div>
        <div className="empty-state">
          Najprije dodajte barem jedan posao u koraku "Poslovi".
        </div>
      </div>
    );
  }

  function dodajOpremu() {
    if (!novaOprema.trim() || !posao) return;
    const id = addRadnaOpremaOpcija(novaOprema.trim());
    toggleOpremaNaPoslu(posao.id, id);
    setNovaOprema("");
  }

  const razina = razinaPosla(posao.rizici);

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Cjelina 3 · Analiza i procjena rizika po poslovima</div>
        <h1>Analiza posla</h1>
        <p className="hint">
          Za odabrani posao birate opasnosti, štetnosti i napore iz Priloga III te sami ocjenjujete
          vjerojatnost i posljedicu za svaki rizik. Alat samo izračunava razinu rizika po matrici —
          vjerojatnost i posljedicu uvijek određuje stručnjak.
        </p>
      </div>

      <div className="card">
        <div className="field-row">
          <label>Odabrani posao</label>
          <select
            value={posao.id}
            onChange={(e) => setAktivniPosaoId(e.target.value)}
            style={{ maxWidth: 420 }}
          >
            {poslovi.map((p) => (
              <option key={p.id} value={p.id}>
                {p.naziv}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span className="hint">Ukupna razina rizika posla:</span>
          <RiskBadge razina={razina} />
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h2>Rizici posla ({posao.rizici.length})</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setPrikaziPicker((v) => !v)}>
            {prikaziPicker ? "Zatvori popis Priloga III" : "+ Dodaj rizik iz Priloga III"}
          </button>
        </div>

        {prikaziPicker && (
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: 12,
              marginBottom: 14,
              background: "var(--color-surface-muted)",
            }}
          >
            <PrilogIIIPicker
              onOdaberi={(kategorija, path) => {
                addRizik(posao.id, kategorija, path);
              }}
            />
          </div>
        )}

        {posao.rizici.length === 0 && (
          <div className="empty-state">
            Nema dodanih rizika. Koristite gumb iznad za odabir iz Priloga III.
          </div>
        )}

        {posao.rizici.map((r) => {
          const razinaRizika = izracunajRazinu(r.vjerojatnost, r.posljedica);
          return (
            <div
              key={r.id}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{r.naziv}</div>
                  <div className="hint">{r.punaStaza}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <RiskBadge razina={razinaRizika} />
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeRizik(posao.id, r.id)}
                  >
                    Ukloni
                  </button>
                </div>
              </div>

              <div className="field-grid" style={{ marginTop: 10 }}>
                <div className="field-row">
                  <label>Vjerojatnost</label>
                  <select
                    value={r.vjerojatnost ?? ""}
                    onChange={(e) =>
                      updateRizik(posao.id, r.id, {
                        vjerojatnost: e.target.value
                          ? (Number(e.target.value) as Vjerojatnost)
                          : null,
                      })
                    }
                  >
                    <option value="">— odaberi —</option>
                    {([1, 2, 3] as Vjerojatnost[]).map((v) => (
                      <option key={v} value={v}>
                        {VJEROJATNOST_LABEL[v]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-row">
                  <label>Posljedica</label>
                  <select
                    value={r.posljedica ?? ""}
                    onChange={(e) =>
                      updateRizik(posao.id, r.id, {
                        posljedica: e.target.value
                          ? (Number(e.target.value) as Posljedica)
                          : null,
                      })
                    }
                  >
                    <option value="">— odaberi —</option>
                    {([1, 2, 3] as Posljedica[]).map((p) => (
                      <option key={p} value={p}>
                        {POSLJEDICA_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(razinaRizika === "srednji" || razinaRizika === "veliki") && (
                <p className="hint" style={{ marginTop: 8 }}>
                  OZO i liječnički pregled za ovaj rizik uređuju se u koraku "Mjere i OZO".
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2>Radna oprema koju posao koristi</h2>
        <div className="chip-row" style={{ marginBottom: 12 }}>
          {radnaOprema
            .filter((o) => posao.radnaOpremaIds.includes(o.id))
            .map((o) => (
              <span key={o.id} className="chip">
                {o.naziv}
                <button onClick={() => toggleOpremaNaPoslu(posao.id, o.id)} aria-label="Ukloni">
                  ×
                </button>
              </span>
            ))}
          {posao.radnaOpremaIds.length === 0 && (
            <span className="hint">Nije odabrana radna oprema.</span>
          )}
        </div>

        <details>
          <summary className="hint" style={{ cursor: "pointer", marginBottom: 8 }}>
            Odaberi iz popisa opreme
          </summary>
          <div className="chip-row" style={{ marginTop: 8 }}>
            {radnaOprema
              .filter((o) => !posao.radnaOpremaIds.includes(o.id))
              .map((o) => (
                <button
                  key={o.id}
                  className="btn btn-sm"
                  onClick={() => toggleOpremaNaPoslu(posao.id, o.id)}
                >
                  + {o.naziv}
                </button>
              ))}
          </div>
        </details>

        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-end" }}>
          <div className="field-row" style={{ flex: 1, marginBottom: 0 }}>
            <label>Dodaj vlastitu opremu</label>
            <input
              type="text"
              value={novaOprema}
              onChange={(e) => setNovaOprema(e.target.value)}
              placeholder="npr. Nazivna oprema koje nema na popisu"
              onKeyDown={(e) => e.key === "Enter" && dodajOpremu()}
            />
          </div>
          <button className="btn btn-sm" onClick={dodajOpremu}>
            + Dodaj
          </button>
        </div>
      </div>
    </div>
  );
}
