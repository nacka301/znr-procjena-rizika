import { useState } from "react";
import { Copy, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useStore } from "../state/store";
import { useNav } from "../state/navigacija";
import { razinaPosla } from "../types";
import PageHeader from "../components/PageHeader";
import RiskBadge from "../components/RiskBadge";
import { Card, CardBody, CardHeader, EmptyState } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/field";
import { MobileCard } from "../components/ui/mobileCard";
import { Tooltip } from "../components/ui/tooltip";
import { useToast } from "../components/ui/toast";
import { KLASA_FOKUSA, useFokusRef } from "../lib/fokus";
import { cn } from "../lib/utils";
import type { Posao } from "../types";

export default function Step3Poslovi() {
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const poslovi = useStore((s) => s.poslovi);
  const addPosao = useStore((s) => s.addPosao);
  const updatePosaoNaziv = useStore((s) => s.updatePosaoNaziv);
  const removePosao = useStore((s) => s.removePosao);
  const duplicirajPosao = useStore((s) => s.duplicirajPosao);
  const toggleVeza = useStore((s) => s.toggleVeza);
  const { fokus, idi } = useNav();
  const { prikazi } = useToast();
  const [stupacPodKursorom, setStupacPodKursorom] = useState<string | null>(null);

  function ukloni(posao: Posao) {
    removePosao(posao.id);
    prikazi(`Uklonjen posao: ${posao.naziv || "bez naziva"}`, {
      oznaka: "Poništi",
      onClick: () => {
        const id = addPosao(posao.naziv);
        for (const rmId of posao.radnaMjestaIds) toggleVeza(id, rmId);
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Korak 3 · Prikupljanje podataka"
        naslov="Poslovi"
        opis="Procjena se radi po poslovima, ne po radnim mjestima. Kvačicama označite tko što radi: jedno radno mjesto može obavljati više poslova, a isti posao mogu obavljati radnici na različitim radnim mjestima."
      />

      <Card>
        <CardHeader
          title="Matrica: radno mjesto × posao"
          description={`${poslovi.length} poslova · ${radnaMjesta.length} radnih mjesta`}
          actions={
            <Button variant="primary" size="sm" onClick={() => addPosao("")}>
              <Plus />
              Dodaj posao
            </Button>
          }
        />
        <CardBody className="p-0">
          {radnaMjesta.length === 0 ? (
            <div className="p-4">
              <EmptyState>Najprije unesite radna mjesta u koraku 2.</EmptyState>
            </div>
          ) : poslovi.length === 0 ? (
            <div className="p-4">
              <EmptyState>Nema unesenih poslova.</EmptyState>
            </div>
          ) : (
            <>
              {/* ≥768px: matrica s ljepljivim prvim stupcem i zaglavljem */}
              <div className="hidden max-h-[70vh] overflow-auto md:block">
                <table className="w-full border-collapse text-[13px]">
                  <thead className="sticky top-0 z-20">
                    <tr>
                      <th className="sticky left-0 z-30 min-w-[260px] border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Posao
                      </th>
                      <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Razina
                      </th>
                      {radnaMjesta.map((rm) => (
                        <th
                          key={rm.id}
                          onMouseEnter={() => setStupacPodKursorom(rm.id)}
                          onMouseLeave={() => setStupacPodKursorom(null)}
                          className={cn(
                            "w-[88px] border-b border-slate-200 px-1.5 py-2 align-bottom text-[11px] font-semibold text-slate-600 transition-colors",
                            stupacPodKursorom === rm.id ? "bg-slate-100" : "bg-slate-50"
                          )}
                        >
                          <span className="block text-center leading-tight">{rm.naziv || "—"}</span>
                          <span className="tabular mt-0.5 block text-center text-[10px] font-normal text-slate-400">
                            {rm.brojRadnika} {rm.brojRadnika === 1 ? "radnik" : "radnika"}
                          </span>
                        </th>
                      ))}
                      <th className="w-[108px] border-b border-slate-200 bg-slate-50" />
                    </tr>
                  </thead>
                  <tbody>
                    {poslovi.map((posao) => (
                      <RedakMatrice
                        key={posao.id}
                        posao={posao}
                        radnaMjesta={radnaMjesta}
                        fokusirano={fokus?.korak === "poslovi" && fokus.posaoId === posao.id}
                        stupacPodKursorom={stupacPodKursorom}
                        onStupac={setStupacPodKursorom}
                        onNaziv={(naziv) => updatePosaoNaziv(posao.id, naziv)}
                        onToggle={(rmId) => toggleVeza(posao.id, rmId)}
                        onAnaliza={() => idi({ korak: "analiza", posaoId: posao.id })}
                        onKopiraj={() => duplicirajPosao(posao.id)}
                        onUkloni={() => ukloni(posao)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* <768px: kartica po poslu */}
              <div className="flex flex-col gap-2 p-3 md:hidden">
                {poslovi.map((posao) => (
                  <MobileCard
                    key={posao.id}
                    akcije={
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label="Ukloni posao"
                        onClick={() => ukloni(posao)}
                      >
                        <Trash2 />
                      </Button>
                    }
                  >
                    <Input
                      value={posao.naziv}
                      placeholder="Naziv posla"
                      aria-label="Naziv posla"
                      onChange={(e) => updatePosaoNaziv(posao.id, e.target.value)}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <RiskBadge razina={razinaPosla(posao.rizici)} />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-h-10"
                        onClick={() => idi({ korak: "analiza", posaoId: posao.id })}
                      >
                        <SlidersHorizontal />
                        Analiza
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Radna mjesta
                      </span>
                      {radnaMjesta.map((rm) => (
                        <label
                          key={rm.id}
                          className="flex min-h-10 items-center gap-2.5 rounded-md px-1 text-[13px] text-slate-700"
                        >
                          <input
                            type="checkbox"
                            className="size-4"
                            checked={posao.radnaMjestaIds.includes(rm.id)}
                            onChange={() => toggleVeza(posao.id, rm.id)}
                          />
                          {rm.naziv || "—"}
                          <span className="tabular text-slate-400">({rm.brojRadnika})</span>
                        </label>
                      ))}
                    </div>
                  </MobileCard>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function RedakMatrice({
  posao,
  radnaMjesta,
  fokusirano,
  stupacPodKursorom,
  onStupac,
  onNaziv,
  onToggle,
  onAnaliza,
  onKopiraj,
  onUkloni,
}: {
  posao: Posao;
  radnaMjesta: { id: string; naziv: string; brojRadnika: number }[];
  fokusirano: boolean;
  stupacPodKursorom: string | null;
  onStupac: (id: string | null) => void;
  onNaziv: (naziv: string) => void;
  onToggle: (rmId: string) => void;
  onAnaliza: () => void;
  onKopiraj: () => void;
  onUkloni: () => void;
}) {
  const ref = useFokusRef<HTMLTableRowElement>(fokusirano);
  const bezRadnogMjesta = posao.radnaMjestaIds.length === 0;

  return (
    <tr ref={ref} className={cn("group hover:bg-slate-50", fokusirano && KLASA_FOKUSA)}>
      <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2 group-hover:bg-slate-50">
        <Input
          value={posao.naziv}
          placeholder="Naziv posla"
          aria-label="Naziv posla"
          onChange={(e) => onNaziv(e.target.value)}
        />
        {bezRadnogMjesta ? (
          <span className="mt-1 block text-[11px] text-[var(--color-risk-srednji)]">
            bez radnog mjesta
          </span>
        ) : null}
      </td>
      <td className="border-b border-slate-100 px-3 py-2 align-middle">
        <RiskBadge razina={razinaPosla(posao.rizici)} />
      </td>
      {radnaMjesta.map((rm) => (
        <td
          key={rm.id}
          onMouseEnter={() => onStupac(rm.id)}
          onMouseLeave={() => onStupac(null)}
          className={cn(
            "border-b border-slate-100 px-1.5 py-2 text-center align-middle transition-colors",
            stupacPodKursorom === rm.id && "bg-slate-100/70"
          )}
        >
          <input
            type="checkbox"
            className="size-4 cursor-pointer align-middle"
            checked={posao.radnaMjestaIds.includes(rm.id)}
            onChange={() => onToggle(rm.id)}
            aria-label={`${posao.naziv || "Posao"} – ${rm.naziv}`}
          />
        </td>
      ))}
      <td className="border-b border-slate-100 px-2 py-2 align-middle">
        <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Tooltip content="Analiza rizika ovog posla">
            <Button variant="ghost" size="iconSm" aria-label="Analiza" onClick={onAnaliza}>
              <SlidersHorizontal />
            </Button>
          </Tooltip>
          <Tooltip content="Dupliciraj posao sa svim rizicima">
            <Button variant="ghost" size="iconSm" aria-label="Kopiraj" onClick={onKopiraj}>
              <Copy />
            </Button>
          </Tooltip>
          <Tooltip content="Ukloni posao">
            <Button variant="danger" size="iconSm" aria-label="Ukloni" onClick={onUkloni}>
              <Trash2 />
            </Button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}
