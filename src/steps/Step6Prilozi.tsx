import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useStore } from "../state/store";
import { useNav } from "../state/navigacija";
import { izracunajRazinu } from "../types";
import type { ErgonomijaZadovoljava } from "../types";
import { ERGONOMIJA_KATEGORIJE } from "../data/ergonomijaKategorije";
import { ISPITIVANJA_KATALOG } from "../data/prijedloziKatalozi";
import { imaTockuPravilnika, jePosebniUvjeti, obrazlozenjePosebniUvjeti } from "../utils/posebniUvjeti";
import { ozoPlocice } from "../utils/ozo";
import PageHeader from "../components/PageHeader";
import RiskBadge from "../components/RiskBadge";
import { Card, CardBody, CardHeader, EmptyState } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AutoTextarea, Field, Input, Select } from "../components/ui/field";
import { Combobox } from "../components/ui/combobox";
import { ProvjeritiTag } from "../components/ui/badge";
import { Table, TableWrap, Td, Th } from "../components/ui/table";
import { MobileCard, MobileField } from "../components/ui/mobileCard";
import { useToast } from "../components/ui/toast";
import { cn } from "../lib/utils";

const PRILOZI = [
  { broj: 1, naziv: "Raspored poslova" },
  { broj: 2, naziv: "Radna oprema" },
  { broj: 3, naziv: "OZO po poslovima" },
  { broj: 4, naziv: "Liječnički pregledi" },
  { broj: 5, naziv: "Kemijske i fizikalne štetnosti" },
  { broj: 6, naziv: "Potrebna ispitivanja" },
  { broj: 7, naziv: "Napor vida i govora" },
  { broj: 8, naziv: "Ergonomija rada na računalu" },
  { broj: 9, naziv: "Poslovi s posebnim uvjetima" },
];

function NapomenaPolje({ naziv }: { naziv: string }) {
  const tekst = useStore((s) => s.napomenePriloga[naziv] ?? "");
  const setNapomena = useStore((s) => s.setNapomenaPriloga);
  return (
    <Field label="Dodatna napomena uz ovaj prilog" className="mt-4">
      <AutoTextarea
        minRows={2}
        value={tekst}
        onChange={(e) => setNapomena(naziv, e.target.value)}
        placeholder="Slobodan tekst — izmjene, iznimke, komentari stručnjaka…"
      />
    </Field>
  );
}

export default function Step6Prilozi() {
  const poslovi = useStore((s) => s.poslovi);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const updateRadnaOprema = useStore((s) => s.updateRadnaOprema);
  const togglePosebniUvjeti = useStore((s) => s.togglePosebniUvjeti);
  const setPosebniUvjetiNapomena = useStore((s) => s.setPosebniUvjetiNapomena);
  const setErgonomijaOdgovor = useStore((s) => s.setErgonomijaOdgovor);
  const ispitivanja = useStore((s) => s.ispitivanja);
  const addIspitivanje = useStore((s) => s.addIspitivanje);
  const updateIspitivanje = useStore((s) => s.updateIspitivanje);
  const removeIspitivanje = useStore((s) => s.removeIspitivanje);
  const { fokus } = useNav();
  const { prikazi } = useToast();
  const [aktivni, setAktivni] = useState(1);

  // Dolazak iz panela "Provjere" otvara točno onaj prilog.
  useEffect(() => {
    if (fokus?.korak === "prilozi" && fokus.prilog) setAktivni(fokus.prilog);
  }, [fokus]);

  const rasporedPoslova = useMemo(
    () =>
      radnaMjesta.flatMap((rm) =>
        poslovi
          .filter((p) => p.radnaMjestaIds.includes(rm.id))
          .map((p) => ({ radnoMjesto: rm, posao: p }))
      ),
    [radnaMjesta, poslovi]
  );

  const popisOpreme = useMemo(
    () =>
      radnaOprema
        .map((o) => ({ oprema: o, poslovi: poslovi.filter((p) => p.radnaOpremaIds.includes(o.id)) }))
        .filter((x) => x.poslovi.length > 0),
    [radnaOprema, poslovi]
  );

  const ozoPoPoslovima = useMemo(
    () =>
      poslovi
        .map((p) => ({
          posao: p,
          stavke: p.rizici
            .map((r) => ({ r, razina: izracunajRazinu(r.vjerojatnost, r.posljedica) }))
            .filter(
              (x) => (x.razina === "srednji" || x.razina === "veliki") && !x.r.ozoNijePotrebna
            ),
        }))
        .filter((x) => x.stavke.length > 0),
    [poslovi]
  );

  const lijecnickiPregledi = useMemo(
    () =>
      poslovi
        .map((p) => ({
          posao: p,
          stavke: p.rizici.filter(
            (r) =>
              izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki" &&
              (r.lijecnickiPregled ?? "").trim() !== ""
          ),
        }))
        .filter((x) => x.stavke.length > 0),
    [poslovi]
  );

  const kemijskeIFizikalne = useMemo(
    () =>
      poslovi.flatMap((p) =>
        p.rizici
          .filter((r) => r.kategorija === "stetnost" && (r.path[0] === "1" || r.path[0] === "3"))
          .map((r) => ({ posao: p, r }))
      ),
    [poslovi]
  );

  const posloviNaporVidGovor = useMemo(
    () =>
      poslovi.map((p) => ({
        posao: p,
        vid: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "3"),
        govor: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "4"),
      })),
    [poslovi]
  );

  const posloviRacunalo = useMemo(() => poslovi.filter((p) => p.koristiRacunalo4h), [poslovi]);

  /** Koliko stavki u prilogu još nedostaje; 0 = gotovo. */
  const statusi = useMemo<Record<number, number>>(() => {
    const bezOzo = poslovi.reduce(
      (z, p) =>
        z +
        p.rizici.filter((r) => {
          const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
          return (
            (razina === "srednji" || razina === "veliki") &&
            !r.ozoNijePotrebna &&
            ozoPlocice(r).length === 0
          );
        }).length,
      0
    );
    const bezPregleda = poslovi.reduce(
      (z, p) =>
        z +
        p.rizici.filter(
          (r) =>
            izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki" &&
            (r.lijecnickiPregled ?? "").trim() === ""
        ).length,
      0
    );
    const bezPerioda = popisOpreme.filter((x) => x.oprema.periodPregledaMjeseci === null).length;
    const ergonomijaNepopunjeno = posloviRacunalo.reduce(
      (z, p) =>
        z +
        ERGONOMIJA_KATEGORIJE.filter(
          (k) => (p.ergonomijaOdgovori[k]?.zadovoljava ?? null) === null
        ).length,
      0
    );
    return {
      1: rasporedPoslova.length === 0 ? 1 : 0,
      2: bezPerioda,
      3: bezOzo,
      4: bezPregleda,
      5: 0,
      6: ispitivanja.length === 0 ? 1 : 0,
      7: 0,
      8: ergonomijaNepopunjeno,
      9: 0,
    };
  }, [poslovi, popisOpreme, posloviRacunalo, rasporedPoslova, ispitivanja]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Korak 6 · Prilozi"
        naslov="Prilozi"
        opis="Prilozi se izvode iz unesenih podataka (čl. 11 Pravilnika). Uređuju se samo polja koja alat ne može izvesti — rokovi pregleda, ispitivanja, ergonomija i obrazloženja."
      />

      <div className="grid gap-4 lg:grid-cols-[232px_minmax(0,1fr)]">
        {/* Lijevi pod-izbornik 1-9 sa statusom */}
        <Card className="h-fit">
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100" role="tablist">
              {PRILOZI.map((p) => {
                const nedostaje = statusi[p.broj] ?? 0;
                const odabrano = aktivni === p.broj;
                return (
                  <li key={p.broj}>
                    <button
                      role="tab"
                      aria-selected={odabrano}
                      onClick={() => setAktivni(p.broj)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                        odabrano ? "bg-[var(--color-accent-soft)]" : "hover:bg-slate-50"
                      )}
                    >
                      <span className="tabular w-4 shrink-0 text-[12px] font-semibold text-slate-400">
                        {p.broj}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 text-[13px] leading-snug",
                          odabrano
                            ? "font-medium text-[var(--color-accent)]"
                            : "text-slate-700"
                        )}
                      >
                        {p.naziv}
                      </span>
                      {nedostaje === 0 ? (
                        <Check className="size-4 shrink-0 text-[var(--color-risk-mali)]" />
                      ) : (
                        <span className="tabular shrink-0 text-[12px] font-semibold text-[var(--color-risk-srednji)]">
                          {nedostaje}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <div className="min-w-0">
          {aktivni === 1 ? (
            <Card>
              <CardHeader
                title="1. Raspored poslova po radnim mjestima"
                description="Izvedeno iz matrice radno mjesto × posao (korak 3)."
              />
              <CardBody className="p-0">
                {rasporedPoslova.length === 0 ? (
                  <div className="p-4">
                    <EmptyState>Nema povezanih radnih mjesta i poslova.</EmptyState>
                  </div>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Radno mjesto</Th>
                          <Th>Posao</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {rasporedPoslova.map(({ radnoMjesto, posao }) => (
                          <tr key={radnoMjesto.id + posao.id}>
                            <Td>{radnoMjesto.naziv}</Td>
                            <Td>{posao.naziv}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 2 ? (
            <Card>
              <CardHeader
                title="2. Popis radne opreme"
                description="Oprema je dodijeljena poslovima u koraku 4; ovdje se upisuju rokovi pregleda."
              />
              <CardBody className="p-0">
                {popisOpreme.length === 0 ? (
                  <div className="p-4">
                    <EmptyState>Nema radne opreme dodijeljene poslovima.</EmptyState>
                  </div>
                ) : (
                  <>
                    <TableWrap className="hidden md:block">
                      <Table>
                        <thead>
                          <tr>
                            <Th>Radna oprema</Th>
                            <Th>Koristi se na poslovima</Th>
                            <Th className="w-[120px]">Period (mj.)</Th>
                            <Th className="w-[160px]">Posljednji pregled</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {popisOpreme.map(({ oprema, poslovi: pz }) => (
                            <tr key={oprema.id}>
                              <Td>{oprema.naziv}</Td>
                              <Td className="text-slate-600">
                                {pz.map((p) => p.naziv).join(", ")}
                              </Td>
                              <Td>
                                <Input
                                  type="number"
                                  min={0}
                                  className="tabular w-[80px]"
                                  value={oprema.periodPregledaMjeseci ?? ""}
                                  aria-label="Period pregleda u mjesecima"
                                  onChange={(e) =>
                                    updateRadnaOprema(oprema.id, {
                                      periodPregledaMjeseci: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    })
                                  }
                                />
                              </Td>
                              <Td>
                                <Input
                                  type="date"
                                  className="tabular"
                                  value={oprema.datumPosljednjegPregleda}
                                  aria-label="Datum posljednjeg pregleda"
                                  onChange={(e) =>
                                    updateRadnaOprema(oprema.id, {
                                      datumPosljednjegPregleda: e.target.value,
                                    })
                                  }
                                />
                              </Td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrap>
                    <div className="flex flex-col gap-2 p-3 md:hidden">
                      {popisOpreme.map(({ oprema, poslovi: pz }) => (
                        <MobileCard key={oprema.id} naslov={oprema.naziv}>
                          <MobileField oznaka="Koristi se na poslovima">
                            <span className="text-slate-600">
                              {pz.map((p) => p.naziv).join(", ")}
                            </span>
                          </MobileField>
                          <MobileField oznaka="Period pregleda (mj.)">
                            <Input
                              type="number"
                              min={0}
                              className="tabular max-w-[110px]"
                              value={oprema.periodPregledaMjeseci ?? ""}
                              onChange={(e) =>
                                updateRadnaOprema(oprema.id, {
                                  periodPregledaMjeseci: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                            />
                          </MobileField>
                          <MobileField oznaka="Posljednji pregled">
                            <Input
                              type="date"
                              className="tabular"
                              value={oprema.datumPosljednjegPregleda}
                              onChange={(e) =>
                                updateRadnaOprema(oprema.id, {
                                  datumPosljednjegPregleda: e.target.value,
                                })
                              }
                            />
                          </MobileField>
                        </MobileCard>
                      ))}
                    </div>
                  </>
                )}
                <div className="px-4 pb-4">
                  <NapomenaPolje naziv="popis-opreme" />
                </div>
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 3 ? (
            <Card>
              <CardHeader
                title="3. Popis poslova za koje je određena OZO i popis OZO"
                description="Izvedeno iz koraka 5. OZO i norme su prijedlog — provjeriti."
                actions={<ProvjeritiTag />}
              />
              <CardBody className="flex flex-col gap-4">
                {ozoPoPoslovima.length === 0 ? (
                  <EmptyState>Nema poslova s određenom OZO.</EmptyState>
                ) : (
                  ozoPoPoslovima.map(({ posao, stavke }) => (
                    <div key={posao.id}>
                      <h3 className="mb-1.5">{posao.naziv}</h3>
                      <TableWrap>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Rizik</Th>
                              <Th className="w-[92px]">Razina</Th>
                              <Th>OZO</Th>
                              <Th className="w-[200px]">Norma</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {stavke.map(({ r, razina }) => (
                              <tr key={r.id}>
                                <Td>{r.naziv}</Td>
                                <Td>
                                  <RiskBadge razina={razina} />
                                </Td>
                                <Td>{r.ozoPrijedlog || <span className="text-slate-400">–</span>}</Td>
                                <Td className="text-slate-600">
                                  {r.ozoNorma || <span className="text-slate-400">–</span>}
                                </Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableWrap>
                    </div>
                  ))
                )}
                <NapomenaPolje naziv="ozo-poslovi" />
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 4 ? (
            <Card>
              <CardHeader
                title="4. Popis potrebnih liječničkih pregleda"
                description="Rizici razine „veliki” s upisanim pregledom (korak 5)."
                actions={<ProvjeritiTag />}
              />
              <CardBody className="flex flex-col gap-4">
                {lijecnickiPregledi.length === 0 ? (
                  <EmptyState>Nema poslova s upisanim liječničkim pregledom.</EmptyState>
                ) : (
                  lijecnickiPregledi.map(({ posao, stavke }) => (
                    <div key={posao.id}>
                      <h3 className="mb-1.5">{posao.naziv}</h3>
                      <TableWrap>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Rizik</Th>
                              <Th>Točke liječničkog pregleda</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {stavke.map((r) => (
                              <tr key={r.id}>
                                <Td>{r.naziv}</Td>
                                <Td>{r.lijecnickiPregled}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableWrap>
                    </div>
                  ))
                )}
                <NapomenaPolje naziv="lijecnicki-pregledi" />
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 5 ? (
            <Card>
              <CardHeader
                title="5. Sigurnosni podaci izvora kemijskih i fizikalnih štetnosti"
                description="Izvedeno iz odabranih štetnosti u koraku 4. Sigurnosno-tehničke listove treba priložiti zasebno."
              />
              <CardBody className="p-0">
                {kemijskeIFizikalne.length === 0 ? (
                  <div className="p-4">
                    <EmptyState>Nema odabranih kemijskih ili fizikalnih štetnosti.</EmptyState>
                  </div>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Štetnost</Th>
                          <Th>Posao</Th>
                          <Th className="w-[120px]">Vrsta</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {kemijskeIFizikalne.map(({ posao, r }) => (
                          <tr key={r.id + posao.id}>
                            <Td>{r.naziv}</Td>
                            <Td className="text-slate-600">{posao.naziv}</Td>
                            <Td>{r.path[0] === "1" ? "kemijska" : "fizikalna"}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
                <div className="px-4 pb-4">
                  <NapomenaPolje naziv="kemijske-fizikalne" />
                </div>
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 6 ? (
            <Card>
              <CardHeader
                title="6. Popis potrebnih ispitivanja"
                description="Rokovi i vrste ispitivanja nisu pouzdano preuzeti iz propisa — unesite ručno i provjerite."
                actions={
                  <Combobox
                    opcije={ISPITIVANJA_KATALOG.filter(
                      (x) => !ispitivanja.some((i) => i.naziv.toLowerCase() === x.toLowerCase())
                    ).map((x) => ({ vrijednost: x }))}
                    dopustiSlobodanUnos
                    slobodanUnosLabel="Dodaj"
                    placeholder="Dodaj ispitivanje…"
                    prazno="Sva uobičajena ispitivanja su već na popisu."
                    onOdaberi={(v) => addIspitivanje(v)}
                    trigger={
                      <Button variant="primary" size="sm">
                        <Plus />
                        Dodaj ispitivanje
                      </Button>
                    }
                  />
                }
              />
              <CardBody className="p-0">
                {ispitivanja.length === 0 ? (
                  <div className="p-4">
                    <EmptyState>Nema unesenih ispitivanja.</EmptyState>
                  </div>
                ) : (
                  <>
                    <TableWrap className="hidden md:block">
                      <Table>
                        <thead>
                          <tr>
                            <Th>Ispitivanje</Th>
                            <Th>Napomena</Th>
                            <Th className="w-[110px]">Period (mj.)</Th>
                            <Th className="w-[160px]">Posljednje</Th>
                            <Th className="w-[52px]" />
                          </tr>
                        </thead>
                        <tbody>
                          {ispitivanja.map((isp) => (
                            <tr key={isp.id} className="group">
                              <Td>
                                <Input
                                  value={isp.naziv}
                                  aria-label="Naziv ispitivanja"
                                  onChange={(e) =>
                                    updateIspitivanje(isp.id, { naziv: e.target.value })
                                  }
                                />
                              </Td>
                              <Td>
                                <AutoTextarea
                                  value={isp.napomena}
                                  placeholder="napomena"
                                  aria-label="Napomena"
                                  onChange={(e) =>
                                    updateIspitivanje(isp.id, { napomena: e.target.value })
                                  }
                                />
                              </Td>
                              <Td>
                                <Input
                                  type="number"
                                  min={0}
                                  className="tabular w-[72px]"
                                  value={isp.periodMjeseci ?? ""}
                                  aria-label="Period u mjesecima"
                                  onChange={(e) =>
                                    updateIspitivanje(isp.id, {
                                      periodMjeseci: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    })
                                  }
                                />
                              </Td>
                              <Td>
                                <Input
                                  type="date"
                                  className="tabular"
                                  value={isp.datumPosljednjeg}
                                  aria-label="Datum posljednjeg ispitivanja"
                                  onChange={(e) =>
                                    updateIspitivanje(isp.id, { datumPosljednjeg: e.target.value })
                                  }
                                />
                              </Td>
                              <Td>
                                <Button
                                  variant="danger"
                                  size="icon"
                                  aria-label="Ukloni ispitivanje"
                                  className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                                  onClick={() => {
                                    removeIspitivanje(isp.id);
                                    prikazi(`Uklonjeno ispitivanje: ${isp.naziv}`, {
                                      oznaka: "Poništi",
                                      onClick: () => addIspitivanje(isp.naziv),
                                    });
                                  }}
                                >
                                  <Trash2 />
                                </Button>
                              </Td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrap>
                    <div className="flex flex-col gap-2 p-3 md:hidden">
                      {ispitivanja.map((isp) => (
                        <MobileCard
                          key={isp.id}
                          akcije={
                            <Button
                              variant="danger"
                              size="icon"
                              aria-label="Ukloni ispitivanje"
                              onClick={() => removeIspitivanje(isp.id)}
                            >
                              <Trash2 />
                            </Button>
                          }
                        >
                          <MobileField oznaka="Ispitivanje">
                            <Input
                              value={isp.naziv}
                              onChange={(e) => updateIspitivanje(isp.id, { naziv: e.target.value })}
                            />
                          </MobileField>
                          <MobileField oznaka="Napomena">
                            <AutoTextarea
                              value={isp.napomena}
                              onChange={(e) =>
                                updateIspitivanje(isp.id, { napomena: e.target.value })
                              }
                            />
                          </MobileField>
                          <MobileField oznaka="Period (mj.)">
                            <Input
                              type="number"
                              min={0}
                              className="tabular max-w-[110px]"
                              value={isp.periodMjeseci ?? ""}
                              onChange={(e) =>
                                updateIspitivanje(isp.id, {
                                  periodMjeseci: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                            />
                          </MobileField>
                        </MobileCard>
                      ))}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 7 ? (
            <Card>
              <CardHeader
                title="7. Popis poslova izloženih naporu vida i/ili govora"
                description="Izvedeno iz napora „Napori vida” i „Napori govora” (Prilog III) u koraku 4."
              />
              <CardBody className="p-0">
                {posloviNaporVidGovor.length === 0 ? (
                  <div className="p-4">
                    <EmptyState>Nema unesenih poslova.</EmptyState>
                  </div>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Posao</Th>
                          <Th className="w-[120px]">Napor vida</Th>
                          <Th className="w-[130px]">Napor govora</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {posloviNaporVidGovor.map(({ posao, vid, govor }) => (
                          <tr key={posao.id}>
                            <Td>{posao.naziv}</Td>
                            <Td>{vid ? "Da" : "Ne"}</Td>
                            <Td>{govor ? "Da" : "Ne"}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 8 ? (
            <Card>
              <CardHeader
                title="8. Ergonomija rada na računalu"
                description="Za poslove označene kao rad na računalu 4+ sati dnevno (korak 4). Puni pravni tekst zahtjeva treba provjeriti u izvornom propisu."
              />
              <CardBody className="flex flex-col gap-4">
                {posloviRacunalo.length === 0 ? (
                  <EmptyState>Nema poslova označenih kao rad na računalu 4+ sati dnevno.</EmptyState>
                ) : (
                  posloviRacunalo.map((posao) => (
                    <div key={posao.id}>
                      <h3 className="mb-1.5">{posao.naziv}</h3>
                      <TableWrap>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Kategorija</Th>
                              <Th className="w-[160px]">Zadovoljava</Th>
                              <Th>Napomena</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {ERGONOMIJA_KATEGORIJE.map((kategorija) => {
                              const odgovor =
                                posao.ergonomijaOdgovori[kategorija] ?? {
                                  zadovoljava: null,
                                  napomena: "",
                                };
                              return (
                                <tr key={kategorija}>
                                  <Td>{kategorija}</Td>
                                  <Td>
                                    <Select
                                      value={odgovor.zadovoljava ?? ""}
                                      aria-label={`Zadovoljava – ${kategorija}`}
                                      onChange={(e) =>
                                        setErgonomijaOdgovor(posao.id, kategorija, {
                                          zadovoljava: (e.target.value ||
                                            null) as ErgonomijaZadovoljava | null,
                                        })
                                      }
                                    >
                                      <option value="">— odaberi —</option>
                                      <option value="da">Da</option>
                                      <option value="ne">Ne</option>
                                      <option value="np">Nije primjenjivo</option>
                                    </Select>
                                  </Td>
                                  <Td>
                                    <AutoTextarea
                                      value={odgovor.napomena}
                                      aria-label={`Napomena – ${kategorija}`}
                                      onChange={(e) =>
                                        setErgonomijaOdgovor(posao.id, kategorija, {
                                          napomena: e.target.value,
                                        })
                                      }
                                    />
                                  </Td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </TableWrap>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          ) : null}

          {aktivni === 9 ? (
            <Card>
              <CardHeader
                title="9. Popis poslova s posebnim uvjetima rada"
                description="Posao se uključuje automatski čim neki njegov rizik ima upisanu točku Pravilnika (korak 5). Stručnjak može ručno dodati i posao bez upisane točke."
                actions={<ProvjeritiTag />}
              />
              <CardBody className="p-0">
                {poslovi.length === 0 ? (
                  <div className="p-4">
                    <EmptyState>Nema unesenih poslova.</EmptyState>
                  </div>
                ) : (
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <Th className="w-[52px]" />
                          <Th>Posao</Th>
                          <Th>Napomena / obrazloženje</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {poslovi.map((p) => {
                          const automatski = imaTockuPravilnika(p);
                          const ukljucen = jePosebniUvjeti(p);
                          return (
                            <tr key={p.id}>
                              <Td className="text-center">
                                <input
                                  type="checkbox"
                                  className="size-4"
                                  checked={ukljucen}
                                  disabled={automatski}
                                  title={
                                    automatski
                                      ? "Automatski uključeno (upisana točka Pravilnika)"
                                      : undefined
                                  }
                                  aria-label={`Posebni uvjeti – ${p.naziv}`}
                                  onChange={() => togglePosebniUvjeti(p.id)}
                                />
                              </Td>
                              <Td>
                                {p.naziv}
                                {automatski ? (
                                  <span className="ml-1.5 text-[11px] text-slate-500">
                                    automatski
                                  </span>
                                ) : null}
                              </Td>
                              <Td>
                                <AutoTextarea
                                  value={ukljucen ? obrazlozenjePosebniUvjeti(p) : ""}
                                  disabled={!ukljucen}
                                  aria-label={`Obrazloženje – ${p.naziv}`}
                                  placeholder={ukljucen ? "obrazloženje" : ""}
                                  onChange={(e) => setPosebniUvjetiNapomena(p.id, e.target.value)}
                                />
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableWrap>
                )}
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
