import { useState } from "react";
import { useStore } from "../state/store";
import { izracunajRazinu, razinaPosla } from "../types";
import RiskBadge from "../components/RiskBadge";
import { izveziDocx } from "../utils/docxExport";

export default function Step7Pregled() {
  const poslodavac = useStore((s) => s.poslodavac);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const mjerePlana = useStore((s) => s.mjerePlana);
  const ispitivanja = useStore((s) => s.ispitivanja);
  const [izvozUTijeku, setIzvozUTijeku] = useState(false);

  async function handleIzvoz() {
    setIzvozUTijeku(true);
    try {
      await izveziDocx({ poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja });
    } finally {
      setIzvozUTijeku(false);
    }
  }

  return (
    <div>
      <div className="page-header no-print">
        <div className="eyebrow">Pregled dokumenta</div>
        <h1>Procjena rizika – pregled</h1>
        <p className="hint">
          Pregled cijele procjene u strukturi 5 cjelina prema Pravilniku o izradi procjene rizika.
          Spremno za izvoz u Word ili ispis.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="btn btn-primary" onClick={handleIzvoz} disabled={izvozUTijeku}>
            {izvozUTijeku ? "Izvoz u tijeku…" : "⬇ Izvezi u Word (.docx)"}
          </button>
          <button className="btn" onClick={() => window.print()}>
            🖨 Ispis / Spremi kao PDF
          </button>
        </div>
      </div>

      <article className="card">
        <h1 style={{ textAlign: "center" }}>
          Procjena rizika – {poslodavac.naziv || "(bez naziva)"}
        </h1>
        {poslodavac.isPrimjer && (
          <p style={{ textAlign: "center", fontStyle: "italic" }}>
            PRIMJER – nije stručna procjena.
          </p>
        )}

        <h2>1. Opći podaci</h2>
        <p>
          <strong>Naziv poslodavca:</strong> {poslodavac.naziv || "-"}
          <br />
          <strong>Djelatnost:</strong> {poslodavac.djelatnost || "-"}
          <br />
          <strong>Ukupan broj radnika:</strong> {poslodavac.ukupnoRadnika}
          <br />
          <strong>Mjesta rada:</strong> {poslodavac.lokacije.join("; ") || "-"}
        </p>

        <h2>2. Analiza prikupljenih podataka</h2>
        <h3>Radna mjesta</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Radno mjesto</th>
              <th>Broj radnika</th>
              <th>Obavlja poslove</th>
            </tr>
          </thead>
          <tbody>
            {radnaMjesta.map((rm) => (
              <tr key={rm.id}>
                <td>{rm.naziv}</td>
                <td>{rm.brojRadnika}</td>
                <td>
                  {poslovi
                    .filter((p) => p.radnaMjestaIds.includes(rm.id))
                    .map((p) => p.naziv)
                    .join(", ") || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Poslovi</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Posao</th>
              <th>Radna mjesta</th>
              <th>Razina rizika</th>
            </tr>
          </thead>
          <tbody>
            {poslovi.map((p) => (
              <tr key={p.id}>
                <td>{p.naziv}</td>
                <td>
                  {radnaMjesta
                    .filter((rm) => p.radnaMjestaIds.includes(rm.id))
                    .map((rm) => rm.naziv)
                    .join(", ") || "-"}
                </td>
                <td>
                  <RiskBadge razina={razinaPosla(p.rizici)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>3. Analiza i procjena rizika po poslovima</h2>
        {poslovi.map((p) => (
          <div key={p.id} style={{ marginBottom: 16 }}>
            <h3>{p.naziv}</h3>
            <p className="hint">
              Radna oprema:{" "}
              {radnaOprema
                .filter((o) => p.radnaOpremaIds.includes(o.id))
                .map((o) => o.naziv)
                .join(", ") || "-"}
            </p>
            {p.rizici.length === 0 ? (
              <p className="hint">Nema evidentiranih rizika.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Opasnost / štetnost / napor</th>
                    <th>V</th>
                    <th>P</th>
                    <th>Razina</th>
                    <th>OZO</th>
                    <th>Liječnički pregled</th>
                  </tr>
                </thead>
                <tbody>
                  {p.rizici.map((r) => (
                    <tr key={r.id}>
                      <td>{r.punaStaza}</td>
                      <td>{r.vjerojatnost ?? "-"}</td>
                      <td>{r.posljedica ?? "-"}</td>
                      <td>
                        <RiskBadge razina={izracunajRazinu(r.vjerojatnost, r.posljedica)} />
                      </td>
                      <td>{r.ozoPrijedlog || "-"}</td>
                      <td>{r.lijecnickiPregled || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

        <h2>4. Plan mjera / preporuke za poboljšanja</h2>
        {mjerePlana.length === 0 ? (
          <p className="hint">Nema unesenih mjera.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Posao</th>
                <th>Mjera</th>
                <th>Rok</th>
                <th>Odgovorna osoba</th>
                <th>Kontrola</th>
              </tr>
            </thead>
            <tbody>
              {mjerePlana.map((m) => (
                <tr key={m.id}>
                  <td>{poslovi.find((p) => p.id === m.posaoId)?.naziv || "-"}</td>
                  <td>{m.mjera}</td>
                  <td>{m.rok}</td>
                  <td>{m.odgovornaOsoba}</td>
                  <td>{m.kontrola}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2>5. Prilozi</h2>
        <p className="hint">
          Puni prilozi (popis opreme, OZO, liječnički pregledi, kemijske/fizikalne štetnosti,
          ispitivanja, poslovi s posebnim uvjetima rada) nalaze se u koraku "Prilozi" i u izvezenom
          Word dokumentu.
        </p>
      </article>
    </div>
  );
}
