import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Zamjena za redak tablice na uskim ekranima (<768px): sve je vidljivo, ništa se ne reže. */
export function MobileCard({
  naslov,
  akcije,
  children,
  className,
}: {
  naslov?: ReactNode;
  akcije?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-slate-200 bg-white p-3", className)}>
      {naslov || akcije ? (
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 text-[13px] font-medium text-slate-800">{naslov}</div>
          {akcije ? <div className="flex shrink-0 items-center gap-1">{akcije}</div> : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function MobileField({ oznaka, children }: { oznaka: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {oznaka}
      </span>
      <div className="text-[13px] text-slate-800">{children}</div>
    </div>
  );
}
