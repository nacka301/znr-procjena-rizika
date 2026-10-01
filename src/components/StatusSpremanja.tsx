import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useStore } from "../state/store";

/**
 * Indikator spremanja. Stanje se trajno drži u localStorage pri svakoj promjeni, pa je
 * "Spremljeno" zadano; kratki prijelaz postoji samo da je korisniku vidljivo da je izmjena zapisana.
 */
export default function StatusSpremanja() {
  const [sprema, setSprema] = useState(false);

  useEffect(() => {
    let timeout: number | undefined;
    const odjava = useStore.subscribe(() => {
      setSprema(true);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setSprema(false), 700);
    });
    return () => {
      odjava();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <span
      className="flex items-center gap-1.5 text-[12px] text-slate-500"
      aria-live="polite"
      title="Procjena se sprema u ovaj preglednik (localStorage)"
    >
      {sprema ? (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          Spremanje…
        </>
      ) : (
        <>
          <Check className="size-3.5 text-[var(--color-risk-mali)]" />
          Spremljeno
        </>
      )}
    </span>
  );
}
