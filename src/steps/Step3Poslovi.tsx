import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { razinaPosla } from "../types";
import RiskBadge from "../components/RiskBadge";

export default function Step3Poslovi({
  onOtvoriAnalizu,
}: {
  onOtvoriAnalizu: () => void;
}) {
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const poslovi = useStore((s) => s.poslovi);
  const addPosao = useStore((s) => s.addPosao);
  const updatePosaoNaziv = useStore((s) => s.updatePosaoNaziv);
  const removePosao = useStore((s) => s.removePosao);
  const duplicirajPosao = useStore((s) => s.duplicirajPosao);
  const toggleVeza = useStore((s) => s.toggleVeza);
  const aktivniPosaoId = useStore((s) => s.aktivniPosaoId);
  const setAktivniPosaoId = useStore((s) => s.setAktivniPosaoId);
  const [noviNaziv, setNoviNaziv] = useState("");

  function dodajPosao() {
    if (!noviNaziv.trim()) return;
    addPosao(noviNaziv.trim());
    setNoviNaziv("");
  }

  const radnaMjestaBezPosla = useMemo(
    () =>
      radnaMjesta.filter(
        (rm) => !poslovi.some((p) => p.radnaMjestaIds.includes(rm.id))
      ),
    [radnaMjesta, poslovi]
  );
  const posloviBezRadnogMjesta = useMemo(
    () => poslovi.filter((p) => p.radnaMjestaIds.length === 0),
    [poslovi]
  );

  const aktivniPosao = poslovi.find((p) => p.id === aktivniPosaoId) ?? null;

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Cjelina 2-3 · Prikupljanje podataka</div>
        <h1>Poslovi i povezivanje s radnim mjestima</h1>
        <p className="hint">
          Procjena rizika radi se <strong>po poslovima</strong>, ne po radnim mjestima. Jedno
          radno mjesto može obavljati više poslova, a isti posao mogu obavljati radnici na
          različitim radnim mjestima. Kvačicama u tablici označite tko što radi.
        </p>
      </div>

      {(radnaMjestaBezPosla.length > 0 || posloviBezRadnogMjesta.length > 0) && (
        <div className="warning-box">
          {radnaMjestaBezPosla.length > 0 && (
            <div>
              ⚠ Radno mjesto bez dodijeljenog posla:{" "}
              {radnaMjestaBezPosla.map((rm) => rm.naziv).join(", ")}
            </div>
          )}
          {posloviBezRadnogMjesta.length > 0 && (
            <div>
              ⚠ Posao bez dodijeljenog radnog mjesta:{" "}
              {posloviBezRadnogMjesta.map((p) => p.naziv).join(", ")}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-title-row">
          <h2>Matrica: radno mjesto × posao</h2>
        </div>

        {radnaMjesta.length === 0 && (
          <div className="empty-state">
            Najprije unesite radna mjesta u koraku 2.
          </div>
        )}

        {radnaMjesta.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Posao</th>
                  <th style={{ minWidth: 90 }}>Razina</th>
                  {radnaMjesta.map((rm) => (
                    <th key={rm.id} style={{ textAlign: "center", minWidth: 90 }}>
                      {rm.naziv}
                    </th>
                  ))}
                  <th style={{ width: 150 }}></th>
                </tr>
              </thead>
              <tbody>
                {poslovi.map((posao) => (
                  <tr key={posao.id}>
                    <td>
                      <input
                        type="text"
                        value={posao.naziv}
                        onChange={(e) => updatePosaoNaziv(posao.id, e.target.value)}
                        style={{ width: "100%", border: "none", background: "transparent" }}
                      />
                      {posao.radnaMjestaIds.length === 0 && (
                        <div className="hint" style={{ color: "var(--risk-srednji)" }}>
                          bez radnog mjesta
                        </div>
                      )}
                    </td>
                    <td>
                      <RiskBadge razina={razinaPosla(posao.rizici)} />
                    </td>
                    {radnaMjesta.map((rm) => {
                      const oznaceno = posao.radnaMjestaIds.includes(rm.id);
                      return (
                        <td key={rm.id} style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={oznaceno}
                            onChange={() => toggleVeza(posao.id, rm.id)}
                            aria-label={`${posao.naziv} - ${rm.naziv}`}
                            style={{ width: 16, height: 16 }}
                          />
                        </td>
                      );
                    })}
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            setAktivniPosaoId(posao.id);
                            onOtvoriAnalizu();
                          }}
                        >
                          Analiza →
                        </button>
                        <button
                          className="btn btn-sm"
                          title="Dupliciraj posao"
                          onClick={() => duplicirajPosao(posao.id)}
                        >
                          Kopiraj
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removePosao(posao.id)}
                        >
                          Ukloni
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "flex-end" }}>
          <div className="field-row" style={{ flex: 1, marginBottom: 0 }}>
            <label>Novi posao</label>
            <input
              type="text"
              value={noviNaziv}
              onChange={(e) => setNoviNaziv(e.target.value)}
              placeholder="npr. Rad na pekarskoj peći (pečenje)"
              onKeyDown={(e) => e.key === "Enter" && dodajPosao()}
            />
          </div>
          <button className="btn btn-primary" onClick={dodajPosao}>
            + Dodaj posao
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Pregled: tko što radi</h2>
        {radnaMjesta.length === 0 && <div className="empty-state">Nema podataka.</div>}
        {radnaMjesta.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Radno mjesto</th>
                <th>Broj radnika</th>
                <th>Obavlja poslove</th>
              </tr>
            </thead>
            <tbody>
              {radnaMjesta.map((rm) => {
                const posloviRm = poslovi.filter((p) => p.radnaMjestaIds.includes(rm.id));
                return (
                  <tr key={rm.id}>
                    <td>{rm.naziv}</td>
                    <td>{rm.brojRadnika}</td>
                    <td>
                      {posloviRm.length === 0 ? (
                        <span className="hint" style={{ color: "var(--risk-srednji)" }}>
                          nema dodijeljenih poslova
                        </span>
                      ) : (
                        posloviRm.map((p) => p.naziv).join(", ")
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {aktivniPosao && (
        <p className="hint">Odabran posao za analizu: <strong>{aktivniPosao.naziv}</strong></p>
      )}
    </div>
  );
}
