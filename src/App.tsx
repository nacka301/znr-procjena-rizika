import { useMemo, useState } from "react";
import { useStore } from "./state/store";
import Step1Poslodavac from "./steps/Step1Poslodavac";
import Step2RadnaMjesta from "./steps/Step2RadnaMjesta";
import Step3Poslovi from "./steps/Step3Poslovi";
import Step4Analiza from "./steps/Step4Analiza";
import Step5Mjere from "./steps/Step5Mjere";
import Step6Prilozi from "./steps/Step6Prilozi";
import Step7Pregled from "./steps/Step7Pregled";

export interface StepDef {
  key: string;
  broj: number;
  naslov: string;
  podnaslov: string;
}

export const STEPS: StepDef[] = [
  { key: "poslodavac", broj: 1, naslov: "Poslodavac", podnaslov: "Opći podaci" },
  { key: "radna-mjesta", broj: 2, naslov: "Radna mjesta", podnaslov: "Popis i broj radnika" },
  { key: "poslovi", broj: 3, naslov: "Poslovi", podnaslov: "Tko što radi" },
  { key: "analiza", broj: 4, naslov: "Analiza posla", podnaslov: "Opasnosti, štetnosti, napori" },
  { key: "mjere", broj: 5, naslov: "Mjere i OZO", podnaslov: "Plan mjera" },
  { key: "prilozi", broj: 6, naslov: "Prilozi", podnaslov: "Automatski popisi" },
  { key: "pregled", broj: 7, naslov: "Pregled dokumenta", podnaslov: "5 cjelina, izvoz" },
];

function App() {
  const [aktivniKorak, setAktivniKorak] = useState<string>(STEPS[0].key);
  const poslodavac = useStore((s) => s.poslodavac);
  const ucitajPrimjer = useStore((s) => s.ucitajPrimjer);
  const ocistiSve = useStore((s) => s.ocistiSve);

  const sadrzaj = useMemo(() => {
    switch (aktivniKorak) {
      case "poslodavac":
        return <Step1Poslodavac />;
      case "radna-mjesta":
        return <Step2RadnaMjesta onNastavi={() => setAktivniKorak("poslovi")} />;
      case "poslovi":
        return <Step3Poslovi onOtvoriAnalizu={() => setAktivniKorak("analiza")} />;
      case "analiza":
        return <Step4Analiza />;
      case "mjere":
        return <Step5Mjere />;
      case "prilozi":
        return <Step6Prilozi />;
      case "pregled":
        return <Step7Pregled />;
      default:
        return null;
    }
  }, [aktivniKorak]);

  function handlePocistiNovu() {
    if (
      window.confirm(
        "Ovo će obrisati sve trenutne podatke (uključujući primjer) i započeti praznu procjenu. Nastaviti?"
      )
    ) {
      ocistiSve();
      setAktivniKorak("poslodavac");
    }
  }

  function handleUcitajPrimjer() {
    ucitajPrimjer();
    setAktivniKorak("poslodavac");
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <strong>Procjena rizika</strong>
          <span>Prototip alata za ZNR stručnjake</span>
        </div>
        <nav className="step-nav">
          {STEPS.map((s) => (
            <button
              key={s.key}
              className={"step-nav-item" + (aktivniKorak === s.key ? " active" : "")}
              onClick={() => setAktivniKorak(s.key)}
            >
              <span className="step-nav-number">{s.broj}</span>
              <span className="step-nav-label">
                {s.naslov}
                <span className="step-nav-sub">{s.podnaslov}</span>
              </span>
            </button>
          ))}
        </nav>
        <div className="app-sidebar-footer">
          {poslodavac.isPrimjer && (
            <button className="btn btn-sm" onClick={handlePocistiNovu}>
              Počisti i počni novu
            </button>
          )}
          {!poslodavac.isPrimjer && (
            <button className="btn btn-sm" onClick={handleUcitajPrimjer}>
              Učitaj primjer podataka
            </button>
          )}
        </div>
      </aside>
      <main className="app-main">
        {poslodavac.isPrimjer && (
          <div className="demo-banner">
            PRIMJER – nije stručna procjena. Svi podaci o poslodavcu "Primjer d.o.o." su izmišljeni
            radi prikaza alata, uključujući ocjene vjerojatnosti i posljedice za svaki rizik — one
            su ilustrativne (odabrane radi prikaza izračuna matrice), a ne stvarna stručna
            procjena.
          </div>
        )}
        {sadrzaj}
      </main>
    </div>
  );
}

export default App;
