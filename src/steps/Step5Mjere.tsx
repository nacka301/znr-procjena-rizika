import { useState } from "react";
import { useStore } from "../state/store";
import { izracunajRazinu } from "../types";
import RiskBadge from "../components/RiskBadge";
import PrijedlogChips, { dodajUTekst } from "../components/PrijedlogChips";
import { LIJECNICKI_PREGLED_KATALOG, OZO_KATALOG } from "../data/prijedloziKatalozi";

export default function Step5Mjere() {
  const poslovi = useStore((s) => s.poslovi);
  const updateRizik = useStore((s) => s.updateRizik);
  const mjerePlana = useStore((s) => s.mjerePlana);
  const addMjera = useStore((s) => s.addMjera);
  const updateMjera = useStore((s) => s.updateMjera);
  const removeMjera = useStore((s) => s.removeMjera);

  const [novaMjera, setNovaMjera] = useState({
    posaoId: "",
    mjera: "",
    rok: "",
    odgovornaOsoba: "",
    kontrola: "",
  });

  const rizikiZaOzo = poslovi.flatMap((posao) =>
    posao.rizici
      .map((r) => ({ posao, r, razina: izracunajRazinu(r.vjerojatnost, r.posljedica) }))
      .filter((x) => x.razina === "srednji" || x.razina === "veliki")
  );

  function dodajMjeru() {
    if (!novaMjera.mjera.trim()) return;
    addMjera({
      posaoId: novaMjera.posaoId || null,
      mjera: novaMjera.mjera.trim(),
      rok: novaMjera.rok.trim(),
      odgovornaOsoba: novaMjera.odgovornaOsoba.trim(),
      kontrola: novaMjera.kontrola.trim(),
    });
    setNovaMjera({ posaoId: "", mjera: "", rok: "", odgovornaOsoba: "", kontrola: "" });
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Cjelina 3-4 · Mjere i osobna zaštitna oprema</div>
        <h1>Mjere i OZO</h1>
        <p className="hint">
          Za svaki povećani rizik (srednji ili veliki) potrebna je osobna zaštitna oprema; za
          veliki rizik dodatno se određuju točke liječničkog pregleda. Ovo su uredivi prijedlozi
          koje stručnjak mora provjeriti prije korištenja — alat ih ne generira automatski.
        </p>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h2>OZO i liječnički pregledi po riziku ({rizikiZaOzo.length})</h2>
        </div>
        {rizikiZaOzo.length === 0 && (
          <div className="empty-state">
            Nema rizika razine "srednji" ili "veliki" u trenutnoj procjeni.
          </div>
        )}
        {rizikiZaOzo.map(({ posao, r, razina }) => (
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
                <div className="hint">
                  Posao: {posao.naziv} · {r.punaStaza}
                </div>
              </div>
              <RiskBadge razina={razina} />
            </div>

            <div className="field-row" style={{ marginTop: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
                <input
                  type="checkbox"
                  checked={r.ozoNijePotrebna}
                  onChange={(e) =>
                    updateRizik(posao.id, r.id, {
                      ozoNijePotrebna: e.target.checked,
                      ozoPrijedlog: e.target.checked ? "" : r.ozoPrijedlog,
                    })
                  }
                />
                OZO nije potrebna za ovaj rizik
              </label>
            </div>

            {!r.ozoNijePotrebna && (
              <div className="field-row">
                <label>
                  Prijedlog OZO <span className="tag-prijedlog">prijedlog, provjeriti</span>
                </label>
                <input
                  type="text"
                  value={r.ozoPrijedlog}
                  onChange={(e) =>
                    updateRizik(posao.id, r.id, { ozoPrijedlog: e.target.value })
                  }
                  placeholder="npr. zaštitne rukavice, zaštitne naočale — unesite i provjerite prije korištenja"
                />
                <PrijedlogChips
                  katalog={OZO_KATALOG}
                  onOdaberi={(stavka) =>
                    updateRizik(posao.id, r.id, {
                      ozoPrijedlog: dodajUTekst(r.ozoPrijedlog, stavka),
                    })
                  }
                />
              </div>
            )}

            {razina === "veliki" && (
              <div className="field-row">
                <label>
                  Točke liječničkog pregleda{" "}
                  <span className="tag-provjeriti">provjeriti prije korištenja</span>
                </label>
                <input
                  type="text"
                  value={r.lijecnickiPregled}
                  onChange={(e) =>
                    updateRizik(posao.id, r.id, { lijecnickiPregled: e.target.value })
                  }
                  placeholder="unesite prema primjenjivom propisu i vrsti rizika"
                />
                <PrijedlogChips
                  katalog={LIJECNICKI_PREGLED_KATALOG}
                  onOdaberi={(stavka) =>
                    updateRizik(posao.id, r.id, {
                      lijecnickiPregled: dodajUTekst(r.lijecnickiPregled, stavka),
                    })
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Plan mjera</h2>
        <p className="hint">Mjera, rok, odgovorna osoba i kontrola provedbe.</p>

        {mjerePlana.length === 0 && (
          <div className="empty-state">Nema unesenih mjera u planu.</div>
        )}
        {mjerePlana.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Posao</th>
                <th>Mjera</th>
                <th>Rok</th>
                <th>Odgovorna osoba</th>
                <th>Kontrola</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mjerePlana.map((m) => (
                <tr key={m.id}>
                  <td>
                    <select
                      value={m.posaoId ?? ""}
                      onChange={(e) =>
                        updateMjera(m.id, { posaoId: e.target.value || null })
                      }
                    >
                      <option value="">—</option>
                      {poslovi.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.naziv}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={m.mjera}
                      onChange={(e) => updateMjera(m.id, { mjera: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={m.rok}
                      onChange={(e) => updateMjera(m.id, { rok: e.target.value })}
                      style={{ width: 120 }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={m.odgovornaOsoba}
                      onChange={(e) =>
                        updateMjera(m.id, { odgovornaOsoba: e.target.value })
                      }
                      style={{ width: 140 }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={m.kontrola}
                      onChange={(e) => updateMjera(m.id, { kontrola: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => removeMjera(m.id)}>
                      Ukloni
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr auto",
            gap: 8,
            marginTop: 14,
            alignItems: "flex-end",
          }}
        >
          <div className="field-row" style={{ marginBottom: 0 }}>
            <label>Posao</label>
            <select
              value={novaMjera.posaoId}
              onChange={(e) => setNovaMjera((n) => ({ ...n, posaoId: e.target.value }))}
            >
              <option value="">—</option>
              {poslovi.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.naziv}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row" style={{ marginBottom: 0 }}>
            <label>Mjera</label>
            <input
              type="text"
              value={novaMjera.mjera}
              onChange={(e) => setNovaMjera((n) => ({ ...n, mjera: e.target.value }))}
            />
          </div>
          <div className="field-row" style={{ marginBottom: 0 }}>
            <label>Rok</label>
            <input
              type="text"
              value={novaMjera.rok}
              onChange={(e) => setNovaMjera((n) => ({ ...n, rok: e.target.value }))}
            />
          </div>
          <div className="field-row" style={{ marginBottom: 0 }}>
            <label>Odgovorna osoba</label>
            <input
              type="text"
              value={novaMjera.odgovornaOsoba}
              onChange={(e) =>
                setNovaMjera((n) => ({ ...n, odgovornaOsoba: e.target.value }))
              }
            />
          </div>
          <div className="field-row" style={{ marginBottom: 0 }}>
            <label>Kontrola</label>
            <input
              type="text"
              value={novaMjera.kontrola}
              onChange={(e) => setNovaMjera((n) => ({ ...n, kontrola: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={dodajMjeru}>
            + Dodaj
          </button>
        </div>
      </div>
    </div>
  );
}
