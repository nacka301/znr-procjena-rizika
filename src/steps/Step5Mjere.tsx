import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Plus, Trash2 } from "lucide-react";
import { useStore } from "../state/store";
import { useNav } from "../state/navigacija";
import { izracunajRazinu } from "../types";
import type { MjeraPlana, Posao, Rizik } from "../types";
import { PERIODIKA_PRIJEDLOZI, ROK_PRIJEDLOZI } from "../data/prijedloziKatalozi";
import { ozoPlocice } from "../utils/ozo";
import { posloviSVelikimRizikomBezMjere } from "../utils/provjere";
import PageHeader from "../components/PageHeader";
import RiskBadge from "../components/RiskBadge";
import RizikPloca, { type StavkaRizika } from "../components/RizikPloca";
import { Card, CardBody, CardHeader, EmptyState } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AutoTextarea, Input, Select } from "../components/ui/field";
import { Combobox } from "../components/ui/combobox";
import { GroupRow, Table, TableWrap, Td, Th } from "../components/ui/table";
import { MobileCard, MobileField } from "../components/ui/mobileCard";
import { Tooltip } from "../components/ui/tooltip";
import { useToast } from "../components/ui/toast";
import { KLASA_FOKUSA, useFokusRef } from "../lib/fokus";
import { cn } from "../lib/utils";

type Filter = "svi" | "povecani" | "bez-ozo";

const FILTERI: { kljuc: Filter; oznaka: string }[] = [
  { kljuc: "svi", oznaka: "Svi" },
  { kljuc: "povecani", oznaka: "Srednji i veliki" },
  { kljuc: "bez-ozo", oznaka: "Nedostaje OZO" },
];

function trebaOzo(r: Rizik): boolean {
  const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
  if (razina !== "srednji" && razina !== "veliki") return false;
  return !r.ozoNijePotrebna && ozoPlocice(r).length === 0;
}

export default function Step5Mjere() {
  const poslovi = useStore((s) => s.poslovi);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const mjerePlana = useStore((s) => s.mjerePlana);
  const addMjera = useStore((s) => s.addMjera);
  const updateMjera = useStore((s) => s.updateMjera);
  const removeMjera = useStore((s) => s.removeMjera);
  const { fokus } = useNav();
  const { prikazi } = useToast();

  // Zadano se prikazuju samo srednji i veliki rizici: mali ne traže OZO ni pregled.
  const [filter, setFilter] = useState<Filter>("povecani");
  const [odabraniRizikId, setOdabraniRizikId] = useState<string | null>(null);

  const sveStavke = useMemo<StavkaRizika[]>(
    () => poslovi.flatMap((posao) => posao.rizici.map((r) => ({ posao, r }))),
    [poslovi]
  );

  const vidljiveStavke = useMemo(() => {
    return sveStavke.filter(({ r }) => {
      const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
      if (filter === "povecani") return razina === "srednji" || razina === "veliki";
      if (filter === "bez-ozo") return trebaOzo(r);
      return true;
    });
  }, [sveStavke, filter]);

  // Dolazak iz panela "Provjere": otvori točno taj rizik i pokaži ga bez obzira na filtar.
  useEffect(() => {
    if (fokus?.korak !== "mjere" || !fokus.rizikId) return;
    const stavka = sveStavke.find((s) => s.r.id === fokus.rizikId);
    if (!stavka) return;
    const razina = izracunajRazinu(stavka.r.vjerojatnost, stavka.r.posljedica);
    if (filter === "povecani" && razina !== "srednji" && razina !== "veliki") setFilter("svi");
    if (filter === "bez-ozo" && !trebaOzo(stavka.r)) setFilter("svi");
    setOdabraniRizikId(fokus.rizikId);
  }, [fokus, sveStavke, filter]);

  const grupe = useMemo(() => {
    const po = new Map<string, { posao: Posao; stavke: StavkaRizika[] }>();
    for (const s of vidljiveStavke) {
      const g = po.get(s.posao.id) ?? { posao: s.posao, stavke: [] };
      g.stavke.push(s);
      po.set(s.posao.id, g);
    }
    return [...po.values()];
  }, [vidljiveStavke]);

  const redoslijed = vidljiveStavke.map((s) => s.r.id);
  const indeksOdabranog = odabraniRizikId ? redoslijed.indexOf(odabraniRizikId) : -1;
  const odabrano = sveStavke.find((s) => s.r.id === odabraniRizikId) ?? null;

  const bezMjere = useMemo(
    () => posloviSVelikimRizikomBezMjere(poslovi, mjerePlana),
    [poslovi, mjerePlana]
  );

  const odgovorneOsobe = useMemo(() => {
    const iz = new Set<string>(radnaMjesta.map((rm) => rm.naziv).filter(Boolean));
    for (const m of mjerePlana) {
      const osoba = (m.odgovornaOsoba ?? "").trim();
      if (osoba) iz.add(osoba);
    }
    return [...iz];
  }, [radnaMjesta, mjerePlana]);

  function ukloniMjeru(m: MjeraPlana) {
    removeMjera(m.id);
    prikazi(`Uklonjen redak plana mjera.`, {
      oznaka: "Poništi",
      onClick: () => addMjera({ ...m }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Korak 5 · Mjere i osobna zaštitna oprema"
        naslov="Mjere i OZO"
        opis="Za svaki povećani rizik (srednji ili veliki) određuje se OZO; za veliki rizik dodatno liječnički pregled i, ako je primjenjivo, točka Pravilnika. Klik na redak otvara ploču za uređivanje."
      />

      <Card>
        <CardHeader
          title="Rizici po poslovima"
          description={`${vidljiveStavke.length} od ${sveStavke.length} rizika prikazano`}
          actions={
            <div
              className="flex rounded-md border border-slate-300 p-0.5"
              role="group"
              aria-label="Filtar rizika"
            >
              {FILTERI.map((f) => (
                <button
                  key={f.kljuc}
                  onClick={() => setFilter(f.kljuc)}
                  aria-pressed={filter === f.kljuc}
                  className={cn(
                    "rounded px-2 py-1 text-[12px] font-medium transition-colors",
                    filter === f.kljuc
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {f.oznaka}
                </button>
              ))}
            </div>
          }
        />
        <CardBody className="p-0">
          {vidljiveStavke.length === 0 ? (
            <div className="p-4">
              <EmptyState>
                {filter === "bez-ozo"
                  ? "Svi povećani rizici imaju određenu OZO ili je označeno da nije potrebna."
                  : "Nema rizika koji odgovaraju filtru."}
              </EmptyState>
            </div>
          ) : (
            <>
              <TableWrap className="hidden md:block">
                <Table className="min-w-[800px]">
                  <thead>
                    <tr>
                      <Th className="min-w-[180px]">Opasnost / štetnost / napor</Th>
                      <Th className="w-[92px]">Razina</Th>
                      <Th>OZO</Th>
                      <Th className="w-[170px]">Liječnički pregled</Th>
                      <Th className="w-[104px]">Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupe.map((g) => (
                      <RedakGrupe key={g.posao.id} posao={g.posao} broj={g.stavke.length}>
                        {g.stavke.map(({ r }) => (
                          <RedakRizika
                            key={r.id}
                            r={r}
                            odabrano={r.id === odabraniRizikId}
                            fokusirano={fokus?.korak === "mjere" && fokus.rizikId === r.id}
                            onKlik={() => setOdabraniRizikId(r.id)}
                          />
                        ))}
                      </RedakGrupe>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>

              <div className="flex flex-col gap-3 p-3 md:hidden">
                {grupe.map((g) => (
                  <div key={g.posao.id} className="flex flex-col gap-2">
                    <p className="text-[12px] font-semibold text-slate-700">
                      {g.posao.naziv || "Bez naziva"}{" "}
                      <span className="tabular font-normal text-slate-400">
                        ({g.stavke.length})
                      </span>
                    </p>
                    {g.stavke.map(({ r }) => {
                      const nedostaje = trebaOzo(r);
                      return (
                        <MobileCard key={r.id} naslov={r.naziv}>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <RiskBadge razina={izracunajRazinu(r.vjerojatnost, r.posljedica)} />
                            {nedostaje ? (
                              <span className="text-[12px] text-[var(--color-risk-srednji)]">
                                nedostaje OZO
                              </span>
                            ) : null}
                          </div>
                          <MobileField oznaka="OZO">
                            {r.ozoNijePotrebna ? (
                              <span className="text-slate-500">OZO nije potrebna</span>
                            ) : (
                              <Plocice stavke={ozoPlocice(r)} />
                            )}
                          </MobileField>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="min-h-10 w-full"
                            onClick={() => setOdabraniRizikId(r.id)}
                          >
                            Uredi rizik
                          </Button>
                        </MobileCard>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* ── Plan mjera ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Plan mjera"
          description="Mjera, rok, odgovorna osoba, kontrola provedbe i periodika ponavljanja."
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                addMjera({
                  posaoId: null,
                  mjera: "",
                  rok: "",
                  odgovornaOsoba: "",
                  kontrola: "",
                  periodika: "",
                })
              }
            >
              <Plus />
              Dodaj mjeru
            </Button>
          }
        />

        {bezMjere.length > 0 ? (
          <div className="border-b border-[var(--color-risk-srednji-border)] bg-[var(--color-risk-srednji-bg)] px-4 py-3">
            <ul className="flex flex-col gap-1.5">
              {bezMjere.map((posao) => (
                <li key={posao.id} className="flex flex-wrap items-center gap-2 text-[13px]">
                  <AlertTriangle className="size-4 shrink-0 text-[var(--color-risk-srednji)]" />
                  <span className="text-slate-800">
                    {posao.naziv || "Posao"} ima veliki rizik bez mjere
                  </span>
                  <Button
                    variant="link"
                    onClick={() =>
                      addMjera({
                        posaoId: posao.id,
                        mjera: "",
                        rok: "",
                        odgovornaOsoba: "",
                        kontrola: "",
                        periodika: "",
                      })
                    }
                  >
                    Dodaj mjeru
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <CardBody className="p-0">
          {mjerePlana.length === 0 ? (
            <div className="p-4">
              <EmptyState>Nema unesenih mjera u planu.</EmptyState>
            </div>
          ) : (
            <>
              <TableWrap className="hidden md:block">
                {/* Minimalna širina drži stupce čitkima; uži prozor dobiva vodoravni pomak. */}
                <Table className="min-w-[1120px]">
                  <thead>
                    <tr>
                      <Th className="w-[148px]">Posao</Th>
                      <Th className="w-[240px]">Mjera</Th>
                      <Th className="w-[150px]">Rok</Th>
                      <Th className="w-[164px]">Odgovorna osoba</Th>
                      <Th className="w-[190px]">Kontrola</Th>
                      <Th className="w-[142px]">Periodika</Th>
                      <Th className="w-[48px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {mjerePlana.map((m) => (
                      <RedakMjere
                        key={m.id}
                        m={m}
                        poslovi={poslovi}
                        odgovorneOsobe={odgovorneOsobe}
                        fokusirano={fokus?.korak === "mjere" && fokus.mjeraId === m.id}
                        onUpdate={(patch) => updateMjera(m.id, patch)}
                        onUkloni={() => ukloniMjeru(m)}
                      />
                    ))}
                  </tbody>
                </Table>
              </TableWrap>

              <div className="flex flex-col gap-2 p-3 md:hidden">
                {mjerePlana.map((m) => (
                  <MobileCard
                    key={m.id}
                    akcije={
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label="Ukloni mjeru"
                        onClick={() => ukloniMjeru(m)}
                      >
                        <Trash2 />
                      </Button>
                    }
                  >
                    <MobileField oznaka="Posao">
                      <Select
                        value={m.posaoId ?? ""}
                        onChange={(e) => updateMjera(m.id, { posaoId: e.target.value || null })}
                      >
                        <option value="">—</option>
                        {poslovi.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.naziv}
                          </option>
                        ))}
                      </Select>
                    </MobileField>
                    <MobileField oznaka="Mjera">
                      <AutoTextarea
                        value={m.mjera}
                        onChange={(e) => updateMjera(m.id, { mjera: e.target.value })}
                      />
                    </MobileField>
                    <MobileField oznaka="Rok">
                      <PoljeRok vrijednost={m.rok} onPromjena={(rok) => updateMjera(m.id, { rok })} />
                    </MobileField>
                    <MobileField oznaka="Odgovorna osoba">
                      <Combobox
                        vrijednost={m.odgovornaOsoba}
                        opcije={odgovorneOsobe.map((o) => ({ vrijednost: o }))}
                        dopustiSlobodanUnos
                        placeholder="Odaberi ili upiši…"
                        onOdaberi={(v) => updateMjera(m.id, { odgovornaOsoba: v })}
                      />
                    </MobileField>
                    <MobileField oznaka="Kontrola">
                      <AutoTextarea
                        value={m.kontrola}
                        onChange={(e) => updateMjera(m.id, { kontrola: e.target.value })}
                      />
                    </MobileField>
                    <MobileField oznaka="Periodika">
                      <Select
                        value={PERIODIKA_PRIJEDLOZI.includes(m.periodika) ? m.periodika : ""}
                        onChange={(e) => updateMjera(m.id, { periodika: e.target.value })}
                      >
                        <option value="">—</option>
                        {PERIODIKA_PRIJEDLOZI.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </Select>
                    </MobileField>
                  </MobileCard>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <RizikPloca
        stavka={odabrano}
        onZatvori={() => setOdabraniRizikId(null)}
        onPomak={(delta) => {
          const next = redoslijed[indeksOdabranog + delta];
          if (next) setOdabraniRizikId(next);
        }}
        imaPrethodni={indeksOdabranog > 0}
        imaSljedeci={indeksOdabranog >= 0 && indeksOdabranog < redoslijed.length - 1}
      />
    </div>
  );
}

function RedakGrupe({
  posao,
  broj,
  children,
}: {
  posao: Posao;
  broj: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <GroupRow colSpan={5}>
        {posao.naziv || "Bez naziva"}{" "}
        <span className="tabular font-normal text-slate-500">
          · {broj} {broj === 1 ? "rizik" : "rizika"}
        </span>
      </GroupRow>
      {children}
    </>
  );
}

function Plocice({ stavke }: { stavke: string[] }) {
  if (stavke.length === 0) return <span className="text-slate-400">–</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {stavke.map((s) => (
        <span
          key={s}
          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] leading-4 text-slate-700"
        >
          {s}
        </span>
      ))}
    </span>
  );
}

function RedakRizika({
  r,
  odabrano,
  fokusirano,
  onKlik,
}: {
  r: Rizik;
  odabrano: boolean;
  fokusirano: boolean;
  onKlik: () => void;
}) {
  const ref = useFokusRef<HTMLTableRowElement>(fokusirano);
  const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
  const nedostaje = trebaOzo(r);
  const nedostajeTocka = razina === "veliki" && !(r.tockaPravilnika ?? "").trim();
  const nedostajePregled = razina === "veliki" && !(r.lijecnickiPregled ?? "").trim();
  const sveGotovo = !nedostaje && !nedostajeTocka && !nedostajePregled;

  return (
    <tr
      ref={ref}
      tabIndex={0}
      role="button"
      onClick={onKlik}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onKlik();
        }
      }}
      className={cn(
        "cursor-pointer transition-colors hover:bg-slate-50",
        odabrano && "bg-[var(--color-accent-soft)]",
        fokusirano && KLASA_FOKUSA
      )}
    >
      <Td>
        {/* Puna staza Priloga III je u sivom tooltipu, ne u retku. */}
        <Tooltip content={r.punaStaza}>
          <span className="text-slate-900">{r.naziv}</span>
        </Tooltip>
      </Td>
      <Td>
        <RiskBadge razina={razina} />
      </Td>
      <Td>
        {r.ozoNijePotrebna ? (
          <span className="text-[12px] text-slate-500">OZO nije potrebna</span>
        ) : (
          <Plocice stavke={ozoPlocice(r)} />
        )}
      </Td>
      <Td className="text-[12px] text-slate-600">
        {r.lijecnickiPregled || <span className="text-slate-400">–</span>}
      </Td>
      <Td>
        {sveGotovo ? (
          <span className="flex items-center gap-1 text-[12px] text-[var(--color-risk-mali)]">
            <Check className="size-3.5" />
            Gotovo
          </span>
        ) : (
          <span className="text-[12px] text-[var(--color-risk-srednji)]">
            {nedostaje
              ? "Nedostaje OZO"
              : nedostajeTocka
                ? "Nedostaje točka"
                : "Nedostaje pregled"}
          </span>
        )}
      </Td>
    </tr>
  );
}

function PoljeRok({
  vrijednost,
  onPromjena,
}: {
  vrijednost: string;
  onPromjena: (v: string) => void;
}) {
  const jeDatum = /^\d{4}-\d{2}-\d{2}$/.test(vrijednost);
  const [datumski, setDatumski] = useState(jeDatum);

  if (datumski) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="date"
          className="tabular"
          value={jeDatum ? vrijednost : ""}
          onChange={(e) => onPromjena(e.target.value)}
          aria-label="Rok (datum)"
        />
        <Button
          variant="ghost"
          size="iconSm"
          aria-label="Natrag na popis rokova"
          onClick={() => {
            setDatumski(false);
            onPromjena("");
          }}
        >
          ×
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={ROK_PRIJEDLOZI.includes(vrijednost) ? vrijednost : vrijednost ? "__slobodno" : ""}
      onChange={(e) => {
        if (e.target.value === "__datum") {
          setDatumski(true);
          onPromjena("");
        } else if (e.target.value !== "__slobodno") {
          onPromjena(e.target.value);
        }
      }}
      aria-label="Rok"
    >
      <option value="">—</option>
      {ROK_PRIJEDLOZI.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
      {vrijednost && !ROK_PRIJEDLOZI.includes(vrijednost) ? (
        <option value="__slobodno">{vrijednost}</option>
      ) : null}
      <option value="__datum">datum…</option>
    </Select>
  );
}

function RedakMjere({
  m,
  poslovi,
  odgovorneOsobe,
  fokusirano,
  onUpdate,
  onUkloni,
}: {
  m: MjeraPlana;
  poslovi: Posao[];
  odgovorneOsobe: string[];
  fokusirano: boolean;
  onUpdate: (patch: Partial<MjeraPlana>) => void;
  onUkloni: () => void;
}) {
  const ref = useFokusRef<HTMLTableRowElement>(fokusirano);
  return (
    <tr ref={ref} className={cn("group", fokusirano && KLASA_FOKUSA)}>
      <Td>
        <Select
          value={m.posaoId ?? ""}
          onChange={(e) => onUpdate({ posaoId: e.target.value || null })}
          aria-label="Posao"
        >
          <option value="">—</option>
          {poslovi.map((p) => (
            <option key={p.id} value={p.id}>
              {p.naziv}
            </option>
          ))}
        </Select>
      </Td>
      <Td>
        <AutoTextarea
          value={m.mjera}
          onChange={(e) => onUpdate({ mjera: e.target.value })}
          placeholder="Opis mjere"
          aria-label="Mjera"
        />
      </Td>
      <Td>
        <PoljeRok vrijednost={m.rok} onPromjena={(rok) => onUpdate({ rok })} />
      </Td>
      <Td>
        <Combobox
          vrijednost={m.odgovornaOsoba}
          opcije={odgovorneOsobe.map((o) => ({ vrijednost: o }))}
          dopustiSlobodanUnos
          placeholder="Odaberi ili upiši…"
          prazno="Nema radnih mjesta — upišite osobu."
          onOdaberi={(v) => onUpdate({ odgovornaOsoba: v })}
        />
      </Td>
      <Td>
        <AutoTextarea
          value={m.kontrola}
          onChange={(e) => onUpdate({ kontrola: e.target.value })}
          placeholder="Kako se provjerava"
          aria-label="Kontrola"
        />
      </Td>
      <Td>
        <Select
          value={PERIODIKA_PRIJEDLOZI.includes(m.periodika) ? m.periodika : m.periodika ? "__slobodno" : ""}
          onChange={(e) => {
            if (e.target.value !== "__slobodno") onUpdate({ periodika: e.target.value });
          }}
          aria-label="Periodika"
        >
          <option value="">—</option>
          {PERIODIKA_PRIJEDLOZI.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          {m.periodika && !PERIODIKA_PRIJEDLOZI.includes(m.periodika) ? (
            <option value="__slobodno">{m.periodika}</option>
          ) : null}
        </Select>
      </Td>
      <Td>
        <Button
          variant="danger"
          size="icon"
          aria-label="Ukloni mjeru"
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          onClick={onUkloni}
        >
          <Trash2 />
        </Button>
      </Td>
    </tr>
  );
}
