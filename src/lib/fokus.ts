import { useEffect, useRef } from "react";

/** Prsten kojim se označava stavka na koju je korisnik doveden iz panela "Provjere". */
export const KLASA_FOKUSA =
  "outline outline-2 outline-offset-[-2px] outline-[var(--color-accent-ring)]";

/** Dovodi element u vidno polje kad postane cilj navigacije. */
export function useFokusRef<T extends HTMLElement>(aktivno: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (aktivno) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [aktivno]);
  return ref;
}
