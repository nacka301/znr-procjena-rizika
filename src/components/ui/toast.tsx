import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "./button";

interface ToastPoruka {
  id: number;
  tekst: string;
  akcija?: { oznaka: string; onClick: () => void };
}

interface ToastApi {
  /** Prikaži obavijest 5 s; akcija je npr. "Poništi" nakon brisanja retka. */
  prikazi: (tekst: string, akcija?: { oznaka: string; onClick: () => void }) => void;
}

const ToastCtx = createContext<ToastApi>({ prikazi: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [poruke, setPoruke] = useState<ToastPoruka[]>([]);
  const brojac = useRef(0);

  const prikazi = useCallback<ToastApi["prikazi"]>((tekst, akcija) => {
    const id = ++brojac.current;
    setPoruke((p) => [...p, { id, tekst, akcija }]);
    window.setTimeout(() => setPoruke((p) => p.filter((x) => x.id !== id)), 5000);
  }, []);

  return (
    <ToastCtx.Provider value={{ prikazi }}>
      {children}
      <div className="no-print pointer-events-none fixed bottom-7 left-1/2 z-[70] flex w-full max-w-[26rem] -translate-x-1/2 flex-col gap-2 px-4">
        {poruke.map((p) => (
          <ToastRedak key={p.id} poruka={p} onZatvori={() => setPoruke((x) => x.filter((y) => y.id !== p.id))} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastRedak({ poruka, onZatvori }: { poruka: ToastPoruka; onZatvori: () => void }) {
  const [vidljivo, setVidljivo] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setVidljivo(true), 10);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div
      className={
        "pointer-events-auto flex items-center justify-between gap-3 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-[13px] text-white shadow-lg transition-all duration-150 " +
        (vidljivo ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")
      }
      role="status"
    >
      <span className="min-w-0 flex-1">{poruka.tekst}</span>
      {poruka.akcija ? (
        <Button
          variant="link"
          className="shrink-0 font-medium text-white underline"
          onClick={() => {
            poruka.akcija?.onClick();
            onZatvori();
          }}
        >
          {poruka.akcija.oznaka}
        </Button>
      ) : null}
    </div>
  );
}
