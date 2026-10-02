import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useStore } from "../state/store";
import { izracunajRazinu, razinaPosla } from "../types";
import type { ReactNode } from "react";
import { izveziDocx, ODGOVORNOST_STRUCNJAKA } from "../utils/docxExport";
import { ERGONOMIJA_KATEGORIJE } from "../data/ergonomijaKategorije";
import { jePosebniUvjeti, obrazlozenjePosebniUvjeti } from "../utils/posebniUvjeti";
import { ozoTekstSNormama } from "../utils/ozo";
import { DISCLAIMER } from "../components/TopBar";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui/button";

/** Tablica u dokumentu: serifna tipografija, obrubi, tekst se prelama. */
function DokTablica({ zaglavlje, children }: { zaglavlje: string[]; children: ReactNode }) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-[9.5pt]">
        <thead>
          <tr>
            {zaglavlje.map((z) => (
              <th
                key={z}
                className="border border-slate-300 bg-slate-100 px-2 py-1 text-left align-bottom font-semibold"
              >
                {z}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={`cell-wrap border border-slate-300 px-2 py-1 align-top ${className ?? ""}`}>
      {children}
    </td>
  );
}

/** Uređivačka napomena uz prilog ulazi u dokument samo ako je upisana. */
function Napomena({ tekst }: { tekst: string }) {
  const ociscen = (tekst ?? "").trim();
  if (!ociscen) return null;
  return <p className="mt-1.5 text-[9.5pt] italic text-slate-700">Napomena: {ociscen}</p>;
}

function H2({ broj, children }: { broj: string; children: ReactNode }) {
  return (
    <h2 className="mt-7 mb-2 font-serif text-[14pt] font-semibold text-slate-900">
      {broj}. {children}
    </h2>
  );
}

function H3({ broj, children }: { broj: string; children: ReactNode }) {
  return (
    <h3 className="mt-4 mb-1.5 font-serif text-[11.5pt] font-semibold text-slate-900">
      {broj} {children}
    </h3>
  );
}

export default function Step7Pregled() {
  const poslodavac = useStore((s) => s.poslodavac);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const mjerePlana = useStore((s) => s.mjerePlana);
  const ispitivanja = useStore((s) => s.ispitivanja);
  const napomenePriloga = useStore((s) => s.napomenePriloga);
  const [izvozUTijeku, setIzvozUTijeku] = useState(false);

  const ukupnoRadnika = radnaMjesta.reduce((zbroj, rm) => zbroj + rm.brojRadnika, 0);

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
  const posloviPosebniUvjeti = useMemo(() => poslovi.filter(jePosebniUvjeti), [poslovi]);

  async function handleIzvoz() {
    setIzvozUTijeku(true);
    try {
      await izveziDocx({ poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja });
    } finally {
      setIzvozUTijeku(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print">
        <PageHeader
          eyebrow="Korak 7 · Pregled dokumenta"
          naslov="Pregled dokumenta"
          opis="Cijela procjena u strukturi pet cjelina prema Pravilniku o izradi procjene rizika, s prilozima 1–9."
          akcije={
            <>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer />
                Ispis / PDF
              </Button>
              <Button variant="primary" onClick={handleIzvoz} disabled={izvozUTijeku}>
                <Download />
                {izvozUTijeku ? "Izvoz…" : "Izvezi u Word"}
              </Button>
            </>
          }
        />
      </div>

      {/* A4 list na sivoj pozadini */}
      <article className="print-sheet mx-auto w-full max-w-[210mm] rounded-[10px] border border-slate-200 bg-white px-[16mm] py-[18mm] font-serif text-[10.5pt] leading-relaxed text-slate-900 shadow-sm">
        <header className="mb-8 border-b border-slate-300 pb-4 text-center">
          <p className="font-sans text-[9pt] uppercase tracking-[0.12em] text-slate-500">
            Procjena rizika
          </p>
          <h1 className="mt-1.5 font-serif text-[18pt] font-semibold leading-tight">
            {poslodavac.naziv || "(bez naziva)"}
          </h1>
          <p className="mt-1 text-[10pt] text-slate-600">{poslodavac.djelatnost || ""}</p>
          {poslodavac.isPrimjer ? (
            <p className="mt-3 font-sans text-[8.5pt] leading-snug text-slate-600">
              PRIMJER — nije stručna procjena. Podaci su izmišljeni radi prikaza alata.
            </p>
          ) : null}
          <p className="mt-2 font-sans text-[8pt] leading-snug text-slate-500">{DISCLAIMER}</p>
        </header>

        {/* Odgovornost stručnjaka - jedna linija pri vrhu dokumenta, ista kao na kraju Word izvoza. */}
        <p className="mb-6 border-y border-slate-200 py-2 text-[9pt] italic leading-snug text-slate-700">
          {ODGOVORNOST_STRUCNJAKA}
        </p>

        {/* Sadržaj */}
        <nav className="mb-8">
          <h2 className="mb-2 font-serif text-[12pt] font-semibold">Sadržaj</h2>
          <ol className="list-none text-[10pt]">
            {[
              "1. Opći podaci",
              "2. Analiza prikupljenih podataka",
              "3. Analiza i procjena rizika po poslovima",
              "4. Plan mjera / preporuke za poboljšanja",
              "5. Prilozi (5.1 – 5.9)",
            ].map((x) => (
              <li key={x} className="border-b border-dotted border-slate-300 py-0.5">
                {x}
              </li>
            ))}
          </ol>
        </nav>

        <H2 broj="1">Opći podaci</H2>
        <DokTablica zaglavlje={["Podatak", "Vrijednost"]}>
          <tr>
            <Td className="w-[40%] font-semibold">Naziv poslodavca</Td>
            <Td>{poslodavac.naziv || "–"}</Td>
          </tr>
          <tr>
            <Td className="font-semibold">OIB</Td>
            <Td>{poslodavac.oib || "–"}</Td>
          </tr>
          <tr>
            <Td className="font-semibold">Pretežita djelatnost</Td>
            <Td>{poslodavac.djelatnost || "–"}</Td>
          </tr>
          <tr>
            <Td className="font-semibold">Ukupan broj radnika</Td>
            <Td className="tabular">{ukupnoRadnika}</Td>
          </tr>
          <tr>
            <Td className="font-semibold">Mjesta rada</Td>
            <Td>{poslodavac.lokacije.filter(Boolean).join("; ") || "–"}</Td>
          </tr>
        </DokTablica>

        <H2 broj="2">Analiza prikupljenih podataka</H2>
        <H3 broj="2.1">Radna mjesta</H3>
        <DokTablica zaglavlje={["Radno mjesto", "Broj radnika", "Obavlja poslove"]}>
          {radnaMjesta.map((rm) => (
            <tr key={rm.id}>
              <Td>{rm.naziv}</Td>
              <Td className="tabular w-[14%]">{rm.brojRadnika}</Td>
              <Td>
                {poslovi
                  .filter((p) => p.radnaMjestaIds.includes(rm.id))
                  .map((p) => p.naziv)
                  .join(", ") || "–"}
              </Td>
            </tr>
          ))}
        </DokTablica>

        <H3 broj="2.2">Poslovi</H3>
        <DokTablica zaglavlje={["Posao", "Radna mjesta", "Razina rizika"]}>
          {poslovi.map((p) => (
            <tr key={p.id}>
              <Td>{p.naziv}</Td>
              <Td>
                {radnaMjesta
                  .filter((rm) => p.radnaMjestaIds.includes(rm.id))
                  .map((rm) => rm.naziv)
                  .join(", ") || "–"}
              </Td>
              <Td className="w-[18%]">{razinaPosla(p.rizici) ?? "nije ocijenjeno"}</Td>
            </tr>
          ))}
        </DokTablica>

        <H2 broj="3">Analiza i procjena rizika po poslovima</H2>
        {poslovi.map((p, i) => (
          <section key={p.id}>
            <H3 broj={`3.${i + 1}`}>{p.naziv}</H3>
            <p className="text-[9.5pt] text-slate-600">
              Radna oprema:{" "}
              {radnaOprema
                .filter((o) => p.radnaOpremaIds.includes(o.id))
                .map((o) => o.naziv)
                .join(", ") || "–"}
            </p>
            {p.rizici.length === 0 ? (
              <p className="text-[9.5pt] italic text-slate-600">Nema evidentiranih rizika.</p>
            ) : (
              <DokTablica
                zaglavlje={[
                  "Opasnost / štetnost / napor",
                  "Mogući neželjeni događaj",
                  "V",
                  "P",
                  "Razina",
                  "OZO",
                  "Liječnički pregled",
                  "Točka Pravilnika",
                ]}
              >
                {p.rizici.map((r) => (
                  <tr key={r.id}>
                    <Td>{r.punaStaza}</Td>
                    <Td>{r.moguciDogadjaj || "–"}</Td>
                    <Td className="tabular text-center">{r.vjerojatnost ?? "–"}</Td>
                    <Td className="tabular text-center">{r.posljedica ?? "–"}</Td>
                    <Td>{izracunajRazinu(r.vjerojatnost, r.posljedica) ?? "–"}</Td>
                    <Td>{ozoTekstSNormama(r)}</Td>
                    <Td>{r.lijecnickiPregled || "–"}</Td>
                    <Td>{r.tockaPravilnika || "–"}</Td>
                  </tr>
                ))}
              </DokTablica>
            )}
          </section>
        ))}

        <H2 broj="4">Plan mjera / preporuke za poboljšanja</H2>
        {mjerePlana.length === 0 ? (
          <p className="text-[9.5pt] italic text-slate-600">Nema unesenih mjera.</p>
        ) : (
          <DokTablica
            zaglavlje={["Posao", "Mjera", "Rok", "Odgovorna osoba", "Kontrola", "Periodika"]}
          >
            {mjerePlana.map((m) => (
              <tr key={m.id}>
                <Td>{poslovi.find((p) => p.id === m.posaoId)?.naziv || "–"}</Td>
                <Td>{m.mjera || "–"}</Td>
                <Td>{m.rok || "–"}</Td>
                <Td>{m.odgovornaOsoba || "–"}</Td>
                <Td>{m.kontrola || "–"}</Td>
                <Td>{m.periodika || "–"}</Td>
              </tr>
            ))}
          </DokTablica>
        )}

        <div className="print-break-before">
          <H2 broj="5">Prilozi</H2>

          <H3 broj="5.1">Raspored poslova po radnim mjestima</H3>
          {rasporedPoslova.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">
              Nema povezanih radnih mjesta i poslova.
            </p>
          ) : (
            <DokTablica zaglavlje={["Radno mjesto", "Posao"]}>
              {rasporedPoslova.map(({ radnoMjesto, posao }) => (
                <tr key={radnoMjesto.id + posao.id}>
                  <Td>{radnoMjesto.naziv}</Td>
                  <Td>{posao.naziv}</Td>
                </tr>
              ))}
            </DokTablica>
          )}

          <H3 broj="5.2">Popis radne opreme</H3>
          {popisOpreme.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">Nema unesene radne opreme.</p>
          ) : (
            <DokTablica
              zaglavlje={[
                "Radna oprema",
                "Koristi se na poslovima",
                "Period pregleda (mj.)",
                "Datum posljednjeg pregleda",
              ]}
            >
              {popisOpreme.map(({ oprema, poslovi: pz }) => (
                <tr key={oprema.id}>
                  <Td>{oprema.naziv}</Td>
                  <Td>{pz.map((p) => p.naziv).join(", ")}</Td>
                  <Td className="tabular">{oprema.periodPregledaMjeseci ?? "–"}</Td>
                  <Td className="tabular">{oprema.datumPosljednjegPregleda || "–"}</Td>
                </tr>
              ))}
            </DokTablica>
          )}
          <Napomena tekst={napomenePriloga["popis-opreme"] ?? ""} />

          <H3 broj="5.3">Popis poslova za koje je određena OZO i popis OZO (provjeriti)</H3>
          {ozoPoPoslovima.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">Nema poslova s određenom OZO.</p>
          ) : (
            ozoPoPoslovima.map(({ posao, stavke }) => (
              <div key={posao.id}>
                <p className="mt-2 font-semibold">{posao.naziv}</p>
                <DokTablica zaglavlje={["Rizik", "Razina", "OZO (norma)"]}>
                  {stavke.map(({ r, razina }) => (
                    <tr key={r.id}>
                      <Td>{r.naziv}</Td>
                      <Td className="w-[14%]">{razina ?? "–"}</Td>
                      <Td>{ozoTekstSNormama(r)}</Td>
                    </tr>
                  ))}
                </DokTablica>
              </div>
            ))
          )}
          <Napomena tekst={napomenePriloga["ozo-poslovi"] ?? ""} />

          <H3 broj="5.4">Popis potrebnih liječničkih pregleda (provjeriti)</H3>
          {lijecnickiPregledi.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">
              Nema poslova s upisanim liječničkim pregledom.
            </p>
          ) : (
            lijecnickiPregledi.map(({ posao, stavke }) => (
              <div key={posao.id}>
                <p className="mt-2 font-semibold">{posao.naziv}</p>
                <DokTablica zaglavlje={["Rizik", "Točke liječničkog pregleda"]}>
                  {stavke.map((r) => (
                    <tr key={r.id}>
                      <Td>{r.naziv}</Td>
                      <Td>{r.lijecnickiPregled}</Td>
                    </tr>
                  ))}
                </DokTablica>
              </div>
            ))
          )}
          <Napomena tekst={napomenePriloga["lijecnicki-pregledi"] ?? ""} />

          <H3 broj="5.5">Sigurnosni podaci izvora kemijskih i fizikalnih štetnosti</H3>
          {kemijskeIFizikalne.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">
              Nema odabranih kemijskih ili fizikalnih štetnosti.
            </p>
          ) : (
            <DokTablica zaglavlje={["Štetnost", "Posao", "Vrsta"]}>
              {kemijskeIFizikalne.map(({ posao, r }) => (
                <tr key={r.id + posao.id}>
                  <Td>{r.naziv}</Td>
                  <Td>{posao.naziv}</Td>
                  <Td className="w-[16%]">{r.path[0] === "1" ? "kemijska" : "fizikalna"}</Td>
                </tr>
              ))}
            </DokTablica>
          )}
          <Napomena tekst={napomenePriloga["kemijske-fizikalne"] ?? ""} />

          <H3 broj="5.6">Popis potrebnih ispitivanja (provjeriti)</H3>
          {ispitivanja.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">Nema unesenih ispitivanja.</p>
          ) : (
            <DokTablica
              zaglavlje={["Ispitivanje", "Napomena", "Period (mj.)", "Datum posljednjeg"]}
            >
              {ispitivanja.map((i) => (
                <tr key={i.id}>
                  <Td>{i.naziv}</Td>
                  <Td>{i.napomena || "–"}</Td>
                  <Td className="tabular">{i.periodMjeseci ?? "–"}</Td>
                  <Td className="tabular">{i.datumPosljednjeg || "–"}</Td>
                </tr>
              ))}
            </DokTablica>
          )}

          <H3 broj="5.7">Popis poslova izloženih naporu vida i/ili govora</H3>
          <DokTablica zaglavlje={["Posao", "Napor vida", "Napor govora"]}>
            {posloviNaporVidGovor.map(({ posao, vid, govor }) => (
              <tr key={posao.id}>
                <Td>{posao.naziv}</Td>
                <Td className="w-[18%]">{vid ? "Da" : "Ne"}</Td>
                <Td className="w-[18%]">{govor ? "Da" : "Ne"}</Td>
              </tr>
            ))}
          </DokTablica>

          <H3 broj="5.8">Ergonomija rada na računalu</H3>
          {posloviRacunalo.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">
              Nema poslova označenih kao rad na računalu 4+ sati dnevno.
            </p>
          ) : (
            posloviRacunalo.map((posao) => (
              <div key={posao.id}>
                <p className="mt-2 font-semibold">{posao.naziv}</p>
                <DokTablica zaglavlje={["Kategorija", "Zadovoljava", "Napomena"]}>
                  {ERGONOMIJA_KATEGORIJE.map((kategorija) => {
                    const odgovor = posao.ergonomijaOdgovori[kategorija] ?? {
                      zadovoljava: null,
                      napomena: "",
                    };
                    return (
                      <tr key={kategorija}>
                        <Td>{kategorija}</Td>
                        <Td className="w-[20%]">
                          {odgovor.zadovoljava === "da"
                            ? "Da"
                            : odgovor.zadovoljava === "ne"
                              ? "Ne"
                              : odgovor.zadovoljava === "np"
                                ? "Nije primjenjivo"
                                : "–"}
                        </Td>
                        <Td>{odgovor.napomena || "–"}</Td>
                      </tr>
                    );
                  })}
                </DokTablica>
              </div>
            ))
          )}

          <H3 broj="5.9">Popis poslova s posebnim uvjetima rada (provjeriti)</H3>
          {posloviPosebniUvjeti.length === 0 ? (
            <p className="text-[9.5pt] italic text-slate-600">Nije označen nijedan posao.</p>
          ) : (
            <DokTablica zaglavlje={["Posao", "Napomena / obrazloženje"]}>
              {posloviPosebniUvjeti.map((p) => (
                <tr key={p.id}>
                  <Td>{p.naziv}</Td>
                  <Td>{obrazlozenjePosebniUvjeti(p) || "–"}</Td>
                </tr>
              ))}
            </DokTablica>
          )}
        </div>
      </article>
    </div>
  );
}
