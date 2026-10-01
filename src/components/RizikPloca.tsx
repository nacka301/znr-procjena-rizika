import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Sparkles, X } from "lucide-react";
import { useStore } from "../state/store";
import { izracunajRazinu } from "../types";
import type { Posao, Rizik } from "../types";
import { OZO_KATALOG, OZO_PO_ID } from "../data/ozoKatalog";
import { preporuceneOzoStavke } from "../data/ozoPreporuke";
import { LIJECNICKI_PREGLED_KATALOG, TOCKA_PRAVILNIKA_PRIJEDLOZI } from "../data/prijedloziKatalozi";
import {
  dodajSlobodnuStavku,
  prebaciStavku,
  stanjeOzo,
  ukloniSlobodnuNormu,
  ukloniSlobodnuStavku,
} from "../utils/ozo";
import RiskBadge from "./RiskBadge";
import { Badge, ProvjeritiTag } from "./ui/badge";
import { Button } from "./ui/button";
import { Combobox } from "./ui/combobox";
import { AutoTextarea, Field, Input } from "./ui/field";
import { Sheet } from "./ui/sheet";
import { Switch } from "./ui/switch";
import { Tooltip } from "./ui/tooltip";
import { useToast } from "./ui/toast";
import { cn } from "../lib/utils";

export interface StavkaRizika {
  posao: Posao;
  r: Rizik;
}

export default function RizikPloca({
  stavka,
  onZatvori,
  onPomak,
  imaPrethodni,
  imaSljedeci,
}: {
  stavka: StavkaRizika | null;
  onZatvori: () => void;
  onPomak: (delta: number) => void;
  imaPrethodni: boolean;
  imaSljedeci: boolean;
}) {
  const updateRizik = useStore((s) => s.updateRizik);
  const poslovi = useStore((s) => s.poslovi);
  const { prikazi } = useToast();
  const [prikaziVise, setPrikaziVise] = useState(false);
  const [novaOprema, setNovaOprema] = useState({ naziv: "", norma: "" });
  const [unosOtvoren, setUnosOtvoren] = useState(false);

  const r = stavka?.r;
  const posao = stavka?.posao;
  const razina = r ? izracunajRazinu(r.vjerojatnost, r.posljedica) : null;
  const stanje = useMemo(() => (r ? stanjeOzo(r) : null), [r]);
  const preporuke = useMemo(
    () => (r ? preporuceneOzoStavke(r.kategorija, r.path) : []),
    [r]
  );

  function patch(p: Partial<Rizik>) {
    if (!posao || !r) return;
    updateRizik(posao.id, r.id, p);
  }

  /** Prenese OZO i normu na isti rizik (ista kategorija i staza) u svim ostalim poslovima. */
  function kopirajNaOstalePoslove() {
    if (!posao || !r) return;
    const kljuc = `${r.kategorija}|${r.path.join(".")}`;
    let broj = 0;
    for (const p of poslovi) {
      if (p.id === posao.id) continue;
      for (const drugi of p.rizici) {
        if (`${drugi.kategorija}|${drugi.path.join(".")}` !== kljuc) continue;
        updateRizik(p.id, drugi.id, {
          ozoPrijedlog: r.ozoPrijedlog,
          ozoNorma: r.ozoNorma,
          ozoNijePotrebna: r.ozoNijePotrebna,
        });
        broj += 1;
      }
    }
    prikazi(
      broj === 0
        ? "Isti rizik ne postoji u drugim poslovima."
        : `OZO prenesena na ${broj} ${broj === 1 ? "rizik" : "rizika"} u drugim poslovima.`
    );
  }

  const prikaziDodatno = razina === "veliki" || prikaziVise;

  return (
    <Sheet
      open={!!stavka}
      onOpenChange={(o) => {
        if (!o) onZatvori();
      }}
      title={r?.naziv ?? ""}
      subtitle={posao?.naziv}
      header={
        <>
          <Tooltip content="Prethodni rizik">
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="Prethodni rizik"
              disabled={!imaPrethodni}
              onClick={() => onPomak(-1)}
            >
              <ChevronUp />
            </Button>
          </Tooltip>
          <Tooltip content="Sljedeći rizik">
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="Sljedeći rizik"
              disabled={!imaSljedeci}
              onClick={() => onPomak(1)}
            >
              <ChevronDown />
            </Button>
          </Tooltip>
        </>
      }
      footer={
        <Button variant="secondary" size="sm" className="w-full" onClick={kopirajNaOstalePoslove}>
          <Copy />
          Kopiraj OZO na isti rizik u drugim poslovima
        </Button>
      }
    >
      {!r || !stanje ? null : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge razina={razina} />
            <Tooltip content={r.punaStaza}>
              <Badge tone="neutral" className="cursor-help">
                Prilog III
              </Badge>
            </Tooltip>
          </div>

          {r.moguciDogadjaj ? (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-[12px] leading-snug text-slate-600">
              {r.moguciDogadjaj}
            </p>
          ) : null}

          <Switch
            id="ozo-nije-potrebna"
            checked={r.ozoNijePotrebna}
            onCheckedChange={(v) =>
              patch({ ozoNijePotrebna: v, ...(v ? { ozoPrijedlog: "", ozoNorma: "" } : {}) })
            }
            label="OZO nije potrebna za ovaj rizik"
            hint="Uključeno sakriva katalog OZO."
          />

          {!r.ozoNijePotrebna ? (
            <div className="flex flex-col gap-3">
              {/* Preporuke se ne označavaju automatski - korisnik ih klikne. */}
              {preporuke.length > 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <Sparkles className="size-3.5" />
                    Često za ovu opasnost
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preporuke
                      .filter((id) => !stanje.odabrani.includes(id))
                      .map((id) => (
                        <Button
                          key={id}
                          variant="secondary"
                          size="sm"
                          className="h-7 font-normal"
                          onClick={() => patch(prebaciStavku(r, id))}
                        >
                          <Plus />
                          {OZO_PO_ID[id]?.naziv}
                        </Button>
                      ))}
                    {preporuke.every((id) => stanje.odabrani.includes(id)) ? (
                      <span className="text-[12px] text-slate-500">
                        Sve preporuke za ovu opasnost su već odabrane.
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[12px] font-medium text-slate-600">
                    Osobna zaštitna oprema
                  </span>
                  <ProvjeritiTag />
                </div>
                <p className="mb-2 text-[12px] leading-snug text-slate-500">
                  Norme uz stavke su prijedlog uobičajene oznake za tu vrstu OZO; primjenjivost na
                  ovaj rizik provjerite u izvornoj normi.
                </p>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200">
                  {OZO_KATALOG.map((s) => {
                    const odabrano = stanje.odabrani.includes(s.id);
                    return (
                      <li key={s.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-start gap-2.5 px-2.5 py-2 transition-colors",
                            odabrano ? "bg-[var(--color-accent-soft)]" : "hover:bg-slate-50"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0"
                            checked={odabrano}
                            onChange={() => patch(prebaciStavku(r, s.id))}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] leading-snug text-slate-800">
                              {s.naziv}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {s.norma || "bez norme — upisati ručno"}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Slobodno upisane stavke i norme koje nisu iz kataloga */}
              {stanje.slobodne.length > 0 || stanje.slobodneNorme.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-slate-600">
                    Upisano izvan kataloga
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stanje.slobodne.map((naziv) => (
                      <span
                        key={naziv}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white py-0.5 pl-2 pr-0.5 text-[12px] text-slate-700"
                      >
                        {naziv}
                        <Button
                          variant="ghost"
                          size="none"
                          className="size-5 rounded text-slate-400"
                          aria-label={`Ukloni ${naziv}`}
                          onClick={() => patch(ukloniSlobodnuStavku(r, naziv))}
                        >
                          <X className="size-3" />
                        </Button>
                      </span>
                    ))}
                    {stanje.slobodneNorme.map((norma) => (
                      <span
                        key={norma}
                        className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 bg-white py-0.5 pl-2 pr-0.5 text-[12px] text-slate-500"
                      >
                        {norma}
                        <Button
                          variant="ghost"
                          size="none"
                          className="size-5 rounded text-slate-400"
                          aria-label={`Ukloni normu ${norma}`}
                          onClick={() => patch(ukloniSlobodnuNormu(r, norma))}
                        >
                          <X className="size-3" />
                        </Button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {unosOtvoren ? (
                <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-2.5">
                  <Field label="Naziv opreme">
                    <Input
                      autoFocus
                      value={novaOprema.naziv}
                      placeholder="npr. Zaštitni ovratnik"
                      onChange={(e) => setNovaOprema((n) => ({ ...n, naziv: e.target.value }))}
                    />
                  </Field>
                  <Field label="Norma (neobavezno)">
                    <Input
                      value={novaOprema.norma}
                      placeholder="npr. HRN EN 1234"
                      onChange={(e) => setNovaOprema((n) => ({ ...n, norma: e.target.value }))}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!novaOprema.naziv.trim()}
                      onClick={() => {
                        patch(dodajSlobodnuStavku(r, novaOprema.naziv, novaOprema.norma));
                        setNovaOprema({ naziv: "", norma: "" });
                        setUnosOtvoren(false);
                      }}
                    >
                      Dodaj
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setUnosOtvoren(false)}>
                      Odustani
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-fit font-normal"
                  onClick={() => setUnosOtvoren(true)}
                >
                  <Plus />
                  Druga oprema
                </Button>
              )}
            </div>
          ) : null}

          {/* Liječnički pregled i točka Pravilnika: uvijek za veliki rizik, inače pod "Prikaži više" */}
          {!prikaziDodatno ? (
            <Button variant="link" onClick={() => setPrikaziVise(true)}>
              Prikaži više — liječnički pregled i točka Pravilnika
            </Button>
          ) : (
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-3">
              <Field
                label={
                  <>
                    Točke liječničkog pregleda <ProvjeritiTag />
                  </>
                }
              >
                <AutoTextarea
                  value={r.lijecnickiPregled}
                  onChange={(e) => patch({ lijecnickiPregled: e.target.value })}
                  placeholder="Upišite prema primjenjivom propisu i vrsti rizika"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {LIJECNICKI_PREGLED_KATALOG.filter(
                    (x) => !(r.lijecnickiPregled ?? "").includes(x)
                  ).map((x) => (
                    <Button
                      key={x}
                      variant="secondary"
                      size="sm"
                      className="h-7 font-normal"
                      onClick={() =>
                        patch({
                          lijecnickiPregled: (r.lijecnickiPregled ?? "").trim()
                            ? `${(r.lijecnickiPregled ?? "").trim()}; ${x}`
                            : x,
                        })
                      }
                    >
                      <Plus />
                      {x}
                    </Button>
                  ))}
                </div>
              </Field>

              <Field
                label={
                  <>
                    Točka Pravilnika (čl. 3, NN 5/84) <ProvjeritiTag />
                  </>
                }
                hint="Ako je upisana, posao automatski ulazi u Prilog 9 (poslovi s posebnim uvjetima rada)."
              >
                <Combobox
                  vrijednost={r.tockaPravilnika}
                  opcije={TOCKA_PRAVILNIKA_PRIJEDLOZI.map((t) => ({ vrijednost: t }))}
                  dopustiSlobodanUnos
                  slobodanUnosLabel="Upiši točku"
                  placeholder="Odaberi ili upiši točku…"
                  prazno="Nema prijedloga — upišite točku."
                  onOdaberi={(v) => patch({ tockaPravilnika: v })}
                />
                {r.tockaPravilnika ? (
                  <Button
                    variant="link"
                    className="mt-1 text-slate-500"
                    onClick={() => patch({ tockaPravilnika: "" })}
                  >
                    Očisti točku
                  </Button>
                ) : null}
              </Field>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
