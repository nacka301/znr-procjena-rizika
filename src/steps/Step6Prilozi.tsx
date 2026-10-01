import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { izracunajRazinu } from "../types";
import RiskBadge from "../components/RiskBadge";

function NapomenaPolje({ naziv }: { naziv: string }) {
  const tekst = useStore((s) => s.napomenePriloga[naziv] ?? "");
  const setNapomena = useStore((s) => s.setNapomenaPriloga);
  return (
    <div className="field-row" style={{ marginTop: 10 }}>
      <label>Dodatna napomena uz ovaj prilog (uredivo)</label>
      <textarea
        rows={2}
        value={tekst}
        onChange={(e) => setNapomena(naziv, e.target.value)}
        placeholder="Slobodan tekst — izmjene, iznimke, komentari stručnjaka…"
      />
    </div>
  );
}

export default function Step6Prilozi() {
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const togglePosebniUvjeti = useStore((s) => s.togglePosebniUvjeti);
  const setPosebniUvjetiNapomena = useStore((s) => s.setPosebniUvjetiNapomena);
  const ispitivanja = useStore((s) => s.ispitivanja);
  const addIspitivanje = useStore((s) => s.addIspitivanje);
  const updateIspitivanje = useStore((s) => s.updateIspitivanje);
  const removeIspitivanje = useStore((s) => s.removeIspitivanje);
  const [novoIspitivanje, setNovoIspitivanje] = useState("");

  const popisOpreme = useMemo(() => {
    return radnaOprema
      .map((o) => ({
        oprema: o,
        poslovi: poslovi.filter((p) => p.radnaOpremaIds.includes(o.id)),
      }))
      .filter((x) => x.poslovi.length > 0);
  }, [radnaOprema, poslovi]);

  const ozoPoPoslovima = useMemo(() => {
    return poslovi
      .map((p) => ({
        posao: p,
        stavke: p.rizici
          .map((r) => ({ r, razina: izracunajRazinu(r.vjerojatnost, r.posljedica) }))
          .filter((x) => x.razina === "srednji" || x.razina === "veliki"),
      }))
      .filter((x) => x.stavke.length > 0);
  }, [poslovi]);

  const lijecnickiPregledi = useMemo(() => {
    return poslovi
      .map((p) => ({
        posao: p,
        stavke: p.rizici.filter(
          (r) => izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki"
        ),
      }))
      .filter((x) => x.stavke.length > 0);
  }, [poslovi]);

  const kemijskeIFizikalne = useMemo(() => {
    return poslovi.flatMap((p) =>
      p.rizici
        .filter((r) => r.kategorija === "stetnost" && (r.path[0] === "1" || r.path[0] === "3"))
        .map((r) => ({ posao: p, r }))
    );
  }, [poslovi]);

  function dodajIspitivanje() {
    if (!novoIspitivanje.trim()) return;
    addIspitivanje(novoIspitivanje.trim());
    setNovoIspitivanje("");
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Cjelina 5 · Prilozi</div>
        <h1>Prilozi</h1>
        <p className="hint">
          Prilozi se automatski generiraju iz unesenih podataka (čl. 11 Pravilnika). Svaki prilog
          može se dodatno urediti prije izvoza.
        </p>
      </div>

      <div className="card">
        <h2>1. Popis radne opreme</h2>
        {popisOpreme.length === 0 && <div className="empty-state">Nema unesene radne opreme.</div>}
        {popisOpreme.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Radna oprema</th>
                <th>Koristi se na poslovima</th>
              </tr>
            </thead>
            <tbody>
              {popisOpreme.map(({ oprema, poslovi: pz }) => (
                <tr key={oprema.id}>
                  <td>{oprema.naziv}</td>
                  <td>{pz.map((p) => p.naziv).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <NapomenaPolje naziv="popis-opreme" />
      </div>

      <div className="card">
        <h2>2. Popis poslova za koje je određena OZO i popis OZO</h2>
        {ozoPoPoslovima.length === 0 && (
          <div className="empty-state">Nema poslova sa srednjim ili velikim rizikom.</div>
        )}
        {ozoPoPoslovima.map(({ posao, stavke }) => (
          <div key={posao.id} style={{ marginBottom: 10 }}>
            <strong>{posao.naziv}</strong>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rizik</th>
                  <th>Razina</th>
                  <th>
                    OZO <span className="tag-prijedlog">provjeriti</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stavke.map(({ r, razina }) => (
                  <tr key={r.id}>
                    <td>{r.naziv}</td>
                    <td>
                      <RiskBadge razina={razina} />
                    </td>
                    <td>{r.ozoPrijedlog || <span className="hint">(nije uneseno)</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <NapomenaPolje naziv="ozo-poslovi" />
      </div>

      <div className="card">
        <h2>3. Popis potrebnih liječničkih pregleda</h2>
        {lijecnickiPregledi.length === 0 && (
          <div className="empty-state">Nema poslova s velikim rizikom.</div>
        )}
        {lijecnickiPregledi.map(({ posao, stavke }) => (
          <div key={posao.id} style={{ marginBottom: 10 }}>
            <strong>{posao.naziv}</strong>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rizik</th>
                  <th>
                    Točke liječničkog pregleda{" "}
                    <span className="tag-provjeriti">provjeriti</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stavke.map((r) => (
                  <tr key={r.id}>
                    <td>{r.naziv}</td>
                    <td>{r.lijecnickiPregled || <span className="hint">(nije uneseno)</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <NapomenaPolje naziv="lijecnicki-pregledi" />
      </div>

      <div className="card">
        <h2>4. Sigurnosni podaci izvora kemijskih i fizikalnih štetnosti</h2>
        <p className="hint">
          Popis izveden iz odabranih štetnosti u analizi poslova (kategorije "Kemijske štetnosti"
          i "Fizikalne štetnosti" iz Priloga III). Sigurnosno-tehničke listove i konkretne podatke
          treba priložiti zasebno.
        </p>
        {kemijskeIFizikalne.length === 0 && (
          <div className="empty-state">Nema odabranih kemijskih ili fizikalnih štetnosti.</div>
        )}
        {kemijskeIFizikalne.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Štetnost</th>
                <th>Posao</th>
                <th>Vrsta</th>
              </tr>
            </thead>
            <tbody>
              {kemijskeIFizikalne.map(({ posao, r }) => (
                <tr key={r.id + posao.id}>
                  <td>{r.naziv}</td>
                  <td>{posao.naziv}</td>
                  <td>{r.path[0] === "1" ? "kemijska" : "fizikalna"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <NapomenaPolje naziv="kemijske-fizikalne" />
      </div>

      <div className="card">
        <h2>5. Popis potrebnih ispitivanja</h2>
        <p className="hint">
          Rokovi i vrste ispitivanja radne opreme i radnog okoliša nisu pouzdano preuzeti iz
          propisa — unesite ručno i{" "}
          <span className="tag-provjeriti">provjerite prije korištenja</span>.
        </p>
        {ispitivanja.length === 0 && <div className="empty-state">Nema unesenih ispitivanja.</div>}
        {ispitivanja.map((isp) => (
          <div
            key={isp.id}
            style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}
          >
            <input
              type="text"
              value={isp.naziv}
              onChange={(e) => updateIspitivanje(isp.id, { naziv: e.target.value })}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              value={isp.napomena}
              onChange={(e) => updateIspitivanje(isp.id, { napomena: e.target.value })}
              placeholder="napomena / rok"
              style={{ flex: 1 }}
            />
            <button className="btn btn-sm btn-danger" onClick={() => removeIspitivanje(isp.id)}>
              Ukloni
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="text"
            value={novoIspitivanje}
            onChange={(e) => setNovoIspitivanje(e.target.value)}
            placeholder="npr. Ispitivanje električnih instalacija"
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === "Enter" && dodajIspitivanje()}
          />
          <button className="btn btn-sm" onClick={dodajIspitivanje}>
            + Dodaj
          </button>
        </div>
      </div>

      <div className="card">
        <h2>6. Popis poslova s posebnim uvjetima rada</h2>
        <p className="hint">
          Odluku o tome koji su poslovi s posebnim uvjetima rada donosi stručnjak.{" "}
          <span className="tag-provjeriti">provjeriti</span>
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Posao</th>
              <th>Napomena / obrazloženje</th>
            </tr>
          </thead>
          <tbody>
            {poslovi.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={p.posebniUvjeti}
                    onChange={() => togglePosebniUvjeti(p.id)}
                  />
                </td>
                <td>{p.naziv}</td>
                <td>
                  <input
                    type="text"
                    value={p.posebniUvjetiNapomena}
                    disabled={!p.posebniUvjeti}
                    onChange={(e) => setPosebniUvjetiNapomena(p.id, e.target.value)}
                    style={{ width: "100%" }}
                    placeholder={p.posebniUvjeti ? "obrazloženje" : ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
