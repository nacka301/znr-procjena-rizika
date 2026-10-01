import { useMemo, useState } from "react";
import { FileStack, RotateCcw } from "lucide-react";
import { useStore } from "./state/store";
import { NavProvider, useNav } from "./state/navigacija";
import { izracunajProvjere } from "./utils/provjere";
import { izveziDocx } from "./utils/docxExport";
import TopBar from "./components/TopBar";
import Stepper from "./components/Stepper";
import ProvjerePanel from "./components/ProvjerePanel";
import { Button } from "./components/ui/button";
import { Sheet } from "./components/ui/sheet";
import { ToastProvider } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import Step0Nadzor from "./steps/Step0Nadzor";
import Step1Poslodavac from "./steps/Step1Poslodavac";
import Step2RadnaMjesta from "./steps/Step2RadnaMjesta";
import Step3Poslovi from "./steps/Step3Poslovi";
import Step4Analiza from "./steps/Step4Analiza";
import Step5Mjere from "./steps/Step5Mjere";
import Step6Prilozi from "./steps/Step6Prilozi";
import Step7Pregled from "./steps/Step7Pregled";

function Sadrzaj() {
  const { korak } = useNav();
  switch (korak) {
    case "nadzor":
      return <Step0Nadzor />;
    case "poslodavac":
      return <Step1Poslodavac />;
    case "radna-mjesta":
      return <Step2RadnaMjesta />;
    case "poslovi":
      return <Step3Poslovi />;
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
}

function Shell() {
  const poslodavac = useStore((s) => s.poslodavac);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const mjerePlana = useStore((s) => s.mjerePlana);
  const ispitivanja = useStore((s) => s.ispitivanja);
  const ucitajPrimjer = useStore((s) => s.ucitajPrimjer);
  const ocistiSve = useStore((s) => s.ocistiSve);
  const { postaviKorak } = useNav();

  const [provjereOtvorene, setProvjereOtvorene] = useState(false);
  const [izvozUTijeku, setIzvozUTijeku] = useState(false);

  const provjere = useMemo(
    () => izracunajProvjere({ poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja }),
    [poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja]
  );

  async function handleIzvoz() {
    setIzvozUTijeku(true);
    try {
      await izveziDocx({ poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja });
    } finally {
      setIzvozUTijeku(false);
    }
  }

  function handleNovaProcjena() {
    if (
      window.confirm(
        "Ovo će obrisati sve trenutne podatke (uključujući primjer) i započeti praznu procjenu. Nastaviti?"
      )
    ) {
      ocistiSve();
      postaviKorak("poslodavac");
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar
        provjere={provjere}
        onOtvoriProvjere={() => setProvjereOtvorene(true)}
        onIzvoz={handleIzvoz}
        izvozUTijeku={izvozUTijeku}
      />

      <div className="flex items-start">
        {/* Lijevo: stepper 1-7 sa statusima */}
        <aside className="no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[236px] shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white p-3 md:flex">
          <Stepper provjere={provjere} />
          <div className="pt-4">
            {poslodavac.isPrimjer ? (
              <Button variant="secondary" size="sm" className="w-full" onClick={handleNovaProcjena}>
                <FileStack />
                Nova prazna procjena
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  ucitajPrimjer();
                  postaviKorak("nadzor");
                }}
              >
                <RotateCcw />
                Učitaj primjer
              </Button>
            )}
          </div>
        </aside>

        {/* Sredina: sadržaj, max 1120px */}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-[1120px]">
            <Sadrzaj />
          </div>
        </main>

        {/* Desno od 1440px: panel Provjere uz sadržaj */}
        <aside className="no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[304px] shrink-0 border-l border-slate-200 bg-white min-[1440px]:block">
          <ProvjerePanel provjere={provjere} className="h-full" />
        </aside>
      </div>

      {/* Ispod 1440px isti panel kao bočna ploča */}
      <Sheet
        open={provjereOtvorene}
        onOpenChange={setProvjereOtvorene}
        title="Provjere"
        subtitle="Što nedostaje ili je nedosljedno. Klik vodi na mjesto u procjeni."
        className="max-w-[420px]"
      >
        <div className="-mx-4 -my-4">
          <ProvjerePanel
            provjere={provjere}
            onNakonKlika={() => setProvjereOtvorene(false)}
            className="[&>div:first-child]:hidden"
          />
        </div>
      </Sheet>
    </div>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <ToastProvider>
        <NavProvider>
          <Shell />
        </NavProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}
