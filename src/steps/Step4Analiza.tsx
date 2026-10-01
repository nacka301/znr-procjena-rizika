import { useMemo, useState } from "react";
import { Monitor, Plus, Trash2, Wrench } from "lucide-react";
import { useStore } from "../state/store";
import { useNav } from "../state/navigacija";
import { izracunajRazinu, razinaPosla, type Vjerojatnost } from "../types";
import type { Rizik } from "../types";
import { PRILOG_III_OPCIJE } from "../data/prilogIII";
import PageHeader from "../components/PageHeader";
import RiskBadge from "../components/RiskBadge";
import MatricaVP from "../components/MatricaVP";
import PsihosocijalniUpitnik from "../components/PsihosocijalniUpitnik";
import { Card, CardBody, CardHeader, EmptyState } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AutoTextarea } from "../components/ui/field";
import { Combobox, type ComboOpcija } from "../components/ui/combobox";
import { Switch } from "../components/ui/switch";
import { Tooltip } from "../components/ui/tooltip";
import { useToast } from "../components/ui/toast";
import { KLASA_FOKUSA, useFokusRef } from "../lib/fokus";
import { cn } from "../lib/utils";

const NASLOV_KATEGORIJE: Record<string, string> = {
  opasnost: "I. Opasnosti",
  stetnost: "II. Štetnosti",
  napor: "III. Napori",
};

export default function Step4Analiza() {
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const aktivniPosaoId = useStore((s) => s.aktivniPosaoId);
  const setAktivniPosaoId = useStore((s) => s.setAktivniPosaoId);
  const addRizik = useStore((s) => s.addRizik);
  const updateRizik = useStore((s) => s.updateRizik);
  const removeRizik = useStore((s) => s.removeRizik);
  const toggleOpremaNaPoslu = useStore((s) => s.toggleOpremaNaPoslu);
  const addRadnaOpremaOpcija = useStore((s) => s.addRadnaOpremaOpcija);
  const toggleKoristiRacunalo4h = useStore((s) => s.toggleKoristiRacunalo4h);
  const { fokus } = useNav();
  const { prikazi } = useToast();

  const posao = poslovi.find((p) => p.id === aktivniPosaoId) ?? poslovi[0] ?? null;

  const opcijePriloga = useMemo<ComboOpcija[]>(
    () =>
      PRILOG_III_OPCIJE.map((o) => ({
        vrijednost: `${o.kategorija}|${o.path.join(".")}`,
        naziv: o.naziv,
        opis: o.punaStaza,
        grupa: NASLOV_KATEGORIJE[o.kategorija],
      })),
    []
  );

  if (!posao) {
    return (
      <div>
        <PageHeader eyebrow="Korak 4 · Analiza i procjena rizika" naslov="Analiza posla" />
        <EmptyState>Najprije dodajte barem jedan posao u koraku 3.</EmptyState>
      </div>
    );
  }

  function dodajRizik(vrijednost: string) {
    const [kategorija, kodovi] = vrijednost.split("|");
    if (!kategorija || !kodovi) return;
    addRizik(posao!.id, kategorija as Rizik["kategorija"], kodovi.split("."));
  }

  function ukloni(r: Rizik) {
    removeRizik(posao!.id, r.id);
    prikazi(`Uklonjen rizik: ${r.naziv}`, {
      oznaka: "Poništi",
      onClick: () => {
        addRizik(posao!.id, r.kategorija, r.path);
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Korak 4 · Analiza i procjena rizika po poslovima"
        naslov="Analiza posla"
        opis="Za odabrani posao birate opasnosti, štetnosti i napore iz Priloga III te ocjenjujete vjerojatnost i posljedicu. Alat samo izračunava razinu po matrici — ocjenu uvijek daje stručnjak."
      />

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Lijevo: popis poslova - nema skakanja između stranica */}
        <Card className="h-fit">
          <CardHeader title="Poslovi" />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {poslovi.map((p) => {
                const aktivno = p.id === posao.id;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setAktivniPosaoId(p.id)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                        aktivno ? "bg-[var(--color-accent-soft)]" : "hover:bg-slate-50"
                      )}
                    >
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[13px]",
                          aktivno
                            ? "font-medium text-[var(--color-accent)]"
                            : "text-slate-700"
                        )}
                      >
                        {p.naziv || "Bez naziva"}
                      </span>
                      <RiskBadge razina={razinaPosla(p.rizici)} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        {/* Desno: analiza odabranog posla */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader
              title={posao.naziv || "Bez naziva"}
              description={`${posao.rizici.length} ${posao.rizici.length === 1 ? "rizik" : "rizika"} · ukupna razina posla`}
              actions={<RiskBadge razina={razinaPosla(posao.rizici)} />}
            />
            <CardBody className="flex flex-col gap-3">
              <Combobox
                opcije={opcijePriloga}
                onOdaberi={dodajRizik}
                placeholder="Dodaj opasnost, štetnost ili napor — npr. buka, pad, dizanje tereta…"
                prazno="Nema pogodaka u Prilogu III."
                triggerClassName="text-slate-500"
                trigger={
                  <Button variant="secondary" className="w-full justify-start font-normal">
                    <Plus />
                    <span className="text-slate-500">
                      Dodaj iz Priloga III — upišite npr. „buka”
                    </span>
                  </Button>
                }
              />

              {posao.rizici.length === 0 ? (
                <EmptyState>
                  Nema evidentiranih opasnosti, štetnosti ni napora za ovaj posao.
                </EmptyState>
              ) : (
                <ul className="flex flex-col gap-2">
                  {posao.rizici.map((r) => (
                    <RizikRedak
                      key={r.id}
                      r={r}
                      fokusirano={fokus?.korak === "analiza" && fokus.rizikId === r.id}
                      onUpdate={(patch) => updateRizik(posao.id, r.id, patch)}
                      onUkloni={() => ukloni(r)}
                    />
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Radna oprema koju posao koristi"
              description="Ulazi u Prilog 2 (popis radne opreme)."
            />
            <CardBody className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {radnaOprema
                  .filter((o) => posao.radnaOpremaIds.includes(o.id))
                  .map((o) => (
                    <span
                      key={o.id}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 py-0.5 pl-2 pr-0.5 text-[12px] text-slate-700"
                    >
                      {o.naziv}
                      <Button
                        variant="ghost"
                        size="none"
                        className="size-5 rounded text-slate-400 hover:text-slate-700"
                        aria-label={`Ukloni ${o.naziv}`}
                        onClick={() => toggleOpremaNaPoslu(posao.id, o.id)}
                      >
                        ×
                      </Button>
                    </span>
                  ))}
                {posao.radnaOpremaIds.length === 0 ? (
                  <span className="text-[13px] text-slate-500">Nije odabrana radna oprema.</span>
                ) : null}
              </div>
              <Combobox
                opcije={radnaOprema
                  .filter((o) => !posao.radnaOpremaIds.includes(o.id))
                  .map((o) => ({ vrijednost: o.id, naziv: o.naziv }))}
                dopustiSlobodanUnos
                slobodanUnosLabel="Dodaj vlastitu opremu"
                placeholder="Dodaj opremu — pretraži ili upiši novu…"
                prazno="Nema opreme na popisu."
                onOdaberi={(vrijednost, opcija) => {
                  if (opcija) toggleOpremaNaPoslu(posao.id, vrijednost);
                  else toggleOpremaNaPoslu(posao.id, addRadnaOpremaOpcija(vrijednost));
                }}
                trigger={
                  <Button variant="secondary" size="sm" className="w-fit font-normal">
                    <Wrench />
                    Dodaj radnu opremu
                  </Button>
                }
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Switch
                id="racunalo-4h"
                checked={posao.koristiRacunalo4h}
                onCheckedChange={() => toggleKoristiRacunalo4h(posao.id)}
                label={
                  <span className="flex items-center gap-1.5">
                    <Monitor className="size-4 text-slate-400" />
                    Rad na računalu 4 ili više sati dnevno
                  </span>
                }
                hint="Otvara checklist ergonomije za ovaj posao u Prilogu 8."
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RizikRedak({
  r,
  fokusirano,
  onUpdate,
  onUkloni,
}: {
  r: Rizik;
  fokusirano: boolean;
  onUpdate: (patch: Partial<Rizik>) => void;
  onUkloni: () => void;
}) {
  const ref = useFokusRef<HTMLLIElement>(fokusirano);
  const [upitnikOtvoren, setUpitnikOtvoren] = useState(false);
  const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);

  return (
    <li
      ref={ref}
      className={cn(
        "group rounded-md border border-slate-200 p-3",
        fokusirano && KLASA_FOKUSA
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Tooltip content={r.punaStaza}>
            <span className="cell-wrap text-[13px] font-medium text-slate-900">{r.naziv}</span>
          </Tooltip>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <RiskBadge razina={razina} />
          <Button
            variant="danger"
            size="iconSm"
            aria-label="Ukloni rizik"
            className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            onClick={onUkloni}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="mt-2.5 flex flex-col gap-2.5">
        <AutoTextarea
          value={r.moguciDogadjaj}
          onChange={(e) => onUpdate({ moguciDogadjaj: e.target.value })}
          placeholder="Mogući neželjeni događaj — npr. nagnječenje prsta, posjekotina, pad s visine…"
          aria-label="Mogući neželjeni događaj"
        />

        <MatricaVP
          vjerojatnost={r.vjerojatnost}
          posljedica={r.posljedica}
          onPromjena={(v, p) => onUpdate({ vjerojatnost: v, posljedica: p })}
        />

        {r.kategorija === "napor" ? (
          <div>
            <Button variant="link" onClick={() => setUpitnikOtvoren((v) => !v)}>
              {upitnikOtvoren
                ? "Zatvori upitnik"
                : "Procijeni vjerojatnost iz upitnika (psihosocijalni rizici)"}
            </Button>
            {upitnikOtvoren ? (
              <PsihosocijalniUpitnik
                onOdustani={() => setUpitnikOtvoren(false)}
                onPrimijeni={(vjerojatnost: Vjerojatnost) => {
                  onUpdate({ vjerojatnost });
                  setUpitnikOtvoren(false);
                }}
              />
            ) : null}
          </div>
        ) : null}

        {razina === "srednji" || razina === "veliki" ? (
          <p className="text-[12px] text-slate-500">
            OZO, liječnički pregled i točka Pravilnika uređuju se u koraku 5 (Mjere i OZO).
          </p>
        ) : null}
      </div>
    </li>
  );
}
