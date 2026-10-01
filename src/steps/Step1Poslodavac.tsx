import { useStore } from "../state/store";

export default function Step1Poslodavac() {
  const poslodavac = useStore((s) => s.poslodavac);
  const setPoslodavac = useStore((s) => s.setPoslodavac);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const ukupnoRadnika = radnaMjesta.reduce((zbroj, rm) => zbroj + rm.brojRadnika, 0);

  function updateLokacija(index: number, value: string) {
    const nove = [...poslodavac.lokacije];
    nove[index] = value;
    setPoslodavac({ lokacije: nove });
  }

  function dodajLokaciju() {
    setPoslodavac({ lokacije: [...poslodavac.lokacije, ""] });
  }

  function ukloniLokaciju(index: number) {
    setPoslodavac({ lokacije: poslodavac.lokacije.filter((_, i) => i !== index) });
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Cjelina 1 · Opći podaci</div>
        <h1>Poslodavac</h1>
        <p className="hint">
          Osnovni podaci o poslodavcu za kojeg se izrađuje procjena rizika. Ovi podaci ulaze u
          uvodni dio dokumenta (cjelina 1. opći podaci).
        </p>
      </div>

      <div className="card">
        <div className="field-grid">
          <div className="field-row">
            <label htmlFor="naziv">Naziv poslodavca</label>
            <input
              id="naziv"
              type="text"
              value={poslodavac.naziv}
              onChange={(e) => setPoslodavac({ naziv: e.target.value })}
              placeholder="npr. Primjer d.o.o."
            />
          </div>
          <div className="field-row">
            <label htmlFor="oib">OIB (neobavezno za prototip)</label>
            <input
              id="oib"
              type="text"
              value={poslodavac.oib ?? ""}
              onChange={(e) => setPoslodavac({ oib: e.target.value })}
              placeholder="11 znamenki"
            />
          </div>
        </div>

        <div className="field-row">
          <label htmlFor="djelatnost">Pretežita djelatnost</label>
          <input
            id="djelatnost"
            type="text"
            value={poslodavac.djelatnost}
            onChange={(e) => setPoslodavac({ djelatnost: e.target.value })}
            placeholder="npr. Proizvodnja i prodaja pekarskih proizvoda"
          />
        </div>

        <div className="field-row">
          <label htmlFor="broj-radnika">Ukupan broj radnika</label>
          <input
            id="broj-radnika"
            type="number"
            value={ukupnoRadnika}
            disabled
            style={{ maxWidth: 160, background: "var(--color-surface-muted)" }}
          />
          <span className="hint">
            Izračunato automatski kao zbroj broja radnika po radnim mjestima (korak 2) — uređuje
            se ondje.
          </span>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h2>Mjesta rada / lokacije</h2>
          <button className="btn btn-sm" onClick={dodajLokaciju}>
            + Dodaj lokaciju
          </button>
        </div>
        {poslodavac.lokacije.length === 0 && (
          <div className="empty-state">Nema unesenih lokacija.</div>
        )}
        {poslodavac.lokacije.map((lok, i) => (
          <div key={i} className="field-row" style={{ flexDirection: "row", alignItems: "center" }}>
            <input
              type="text"
              value={lok}
              onChange={(e) => updateLokacija(i, e.target.value)}
              placeholder={`Lokacija ${i + 1}`}
              style={{ flex: 1 }}
            />
            <button className="btn btn-sm btn-danger" onClick={() => ukloniLokaciju(i)}>
              Ukloni
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
