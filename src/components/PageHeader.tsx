import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  naslov,
  opis,
  akcije,
}: {
  eyebrow?: string;
  naslov: string;
  opis?: ReactNode;
  akcije?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-0.5">{naslov}</h1>
        {opis ? (
          <p className="mt-1.5 max-w-[80ch] text-[13px] leading-relaxed text-slate-600">{opis}</p>
        ) : null}
      </div>
      {akcije ? <div className="flex shrink-0 items-center gap-2">{akcije}</div> : null}
    </div>
  );
}
