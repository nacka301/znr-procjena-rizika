import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { izracunajRazinu, razinaPosla } from "../types";
import RiskBadge from "../components/RiskBadge";
import { izveziDocx } from "../utils/docxExport";
import { ERGONOMIJA_KATEGORIJE } from "../data/ergonomijaKategorije";
import { jePosebniUvjeti, obrazlozenjePosebniUvjeti } from "../utils/posebniUvjeti";

export default function Step7Pregled() {
  const poslodavac = useStore((s) => s.poslodavac);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const poslovi = useStore((s) => s.poslovi);
  const radnaOprema = useStore((s) => s.radnaOprema);
  const mjerePlana = useStore((s) => s.mjerePlana);
  const ispitivanja = useStore((s) => s.ispitivanja);
  const [izvozUTijeku, setIzvozUTijeku] = useState(false);

  const ukupnoRadnika = radnaMjesta.reduce((zbroj, rm) => zbroj + rm.brojRadnika, 0);

  const rasporedPoslova = useMemo(() => {
    return radnaMjesta.flatMap((rm) =>
      poslovi
        .filter((p) => p.radnaMjestaIds.includes(rm.id))
        .map((p) => ({ radnoMjesto: rm, posao: p }))
    );
  }, [radnaMjesta, poslovi]);

  const popisOpreme = useMemo(() => {
    return radnaOprema
      .map((o) => ({ oprema: o, poslovi: poslovi.filter((p) => p.radnaOpremaIds.includes(o.id)) }))
      .filter((x) => x.poslovi.length > 0);
  }, [radnaOprema, poslovi]);

  const ozoPoPoslovima = useMemo(() => {
    return poslovi
      .map((p) => ({
        posao: p,
        stavke: p.rizici
          .map((r) => ({ r, razina: izracunajRazinu(r.vjerojatnost, r.posljedica) }))
          .filter((x) => (x.razina === "srednji" || x.razina === "veliki") && !x.r.ozoNijePotrebna),
      }))
      .filter((x) => x.stavke.length > 0);
  }, [poslovi]);

  const lijecnickiPregledi = useMemo(() => {
    return poslovi
      .map((p) => ({
        posao: p,
        stavke: p.rizici.filter(
          (r) =>
            izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki" &&
            (r.lijecnickiPregled ?? "").trim() !== ""
        ),
      }))
      .filter((x) => x.stavke.length > 0);
  }, [poslovi]);

  const kemijskeIFizikalne = useMemo(() => {
    return poslovi.flatMap((p) =>
      p.rizici
        .filter((r) => r.kategorija === "stetnost" && (r.path[0] === "1" || r.path[0] === "3"))
        .map((r) => ({ posao: p, r }))
    );
  }, [poslovi]);

  const posloviNaporVidGovor = useMemo(() => {
    return poslovi.map((p) => ({
      posao: p,
      vid: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "3"),
      govor: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "4"),
    }));
  }, [poslovi]);

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
    <div>
      <div className="page-header no-print">
        <div className="eyebrow">Pregled dokumenta</div>
        <h1>Procjena rizika – pregled</h1>
        <p className="hint">
          Pregled cijele procjene u strukturi 5 cjelina prema Pravilniku o izradi procjene rizika.
          Spremno za izvoz u Word ili ispis.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="btn btn-primary" onClick={handleIzvoz} disabled={izvozUTijeku}>
            {izvozUTijeku ? "Izvoz u tijeku…" : "⬇ Izvezi u Word (.docx)"}
          </button>
          <button className="btn" onClick={() => window.print()}>
            🖨 Ispis / Spremi kao PDF
          </button>
        </div>
      </div>

      <article className="card">
        <h1 style={{ textAlign: "center" }}>
          Procjena rizika – {poslodavac.naziv || "(bez naziva)"}
        </h1>
        {poslodavac.isPrimjer && (
          <p style={{ textAlign: "center", fontStyle: "italic" }}>
            PRIMJER – nije stručna procjena.
          </p>
        )}

        <h2>1. Opći podaci</h2>
        <p>
          <strong>Naziv poslodavca:</strong> {poslodavac.naziv || "-"}
          <br />
          <strong>Djelatnost:</strong> {poslodavac.djelatnost || "-"}
          <br />
          <strong>Ukupan broj radnika:</strong> {ukupnoRadnika}
          <br />
          <strong>Mjesta rada:</strong> {poslodavac.lokacije.join("; ") || "-"}
        </p>

        <h2>2. Analiza prikupljenih podataka</h2>
        <h3>Radna mjesta</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Radno mjesto</th>
              <th>Broj radnika</th>
              <th>Obavlja poslove</th>
            </tr>
          </thead>
          <tbody>
            {radnaMjesta.map((rm) => (
              <tr key={rm.id}>
                <td>{rm.naziv}</td>
                <td>{rm.brojRadnika}</td>
                <td>
                  {poslovi
                    .filter((p) => p.radnaMjestaIds.includes(rm.id))
                    .map((p) => p.naziv)
                    .join(", ") || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Poslovi</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Posao</th>
              <th>Radna mjesta</th>
              <th>Razina rizika</th>
            </tr>
          </thead>
          <tbody>
            {poslovi.map((p) => (
              <tr key={p.id}>
                <td>{p.naziv}</td>
                <td>
                  {radnaMjesta
                    .filter((rm) => p.radnaMjestaIds.includes(rm.id))
                    .map((rm) => rm.naziv)
                    .join(", ") || "-"}
                </td>
                <td>
                  <RiskBadge razina={razinaPosla(p.rizici)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>3. Analiza i procjena rizika po poslovima</h2>
        {poslovi.map((p) => (
          <div key={p.id} style={{ marginBottom: 16 }}>
            <h3>{p.naziv}</h3>
            <p className="hint">
              Radna oprema:{" "}
              {radnaOprema
                .filter((o) => p.radnaOpremaIds.includes(o.id))
                .map((o) => o.naziv)
                .join(", ") || "-"}
            </p>
            {p.rizici.length === 0 ? (
              <p className="hint">Nema evidentiranih rizika.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Opasnost / štetnost / napor</th>
                    <th>Mogući neželjeni događaj</th>
                    <th>V</th>
                    <th>P</th>
                    <th>Razina</th>
                    <th>OZO</th>
                    <th>Liječnički pregled</th>
                    <th>Točka Pravilnika</th>
                  </tr>
                </thead>
                <tbody>
                  {p.rizici.map((r) => (
                    <tr key={r.id}>
                      <td>{r.punaStaza}</td>
                      <td>{r.moguciDogadjaj || "-"}</td>
                      <td>{r.vjerojatnost ?? "-"}</td>
                      <td>{r.posljedica ?? "-"}</td>
                      <td>
                        <RiskBadge razina={izracunajRazinu(r.vjerojatnost, r.posljedica)} />
                      </td>
                      <td>{r.ozoNijePotrebna ? "OZO nije potrebna" : r.ozoPrijedlog || "-"}</td>
                      <td>{r.lijecnickiPregled || "-"}</td>
                      <td>{r.tockaPravilnika || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

        <h2>4. Plan mjera / preporuke za poboljšanja</h2>
        {mjerePlana.length === 0 ? (
          <p className="hint">Nema unesenih mjera.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Posao</th>
                <th>Mjera</th>
                <th>Rok</th>
                <th>Odgovorna osoba</th>
                <th>Kontrola</th>
                <th>Periodika</th>
              </tr>
            </thead>
            <tbody>
              {mjerePlana.map((m) => (
                <tr key={m.id}>
                  <td>{poslovi.find((p) => p.id === m.posaoId)?.naziv || "-"}</td>
                  <td>{m.mjera}</td>
                  <td>{m.rok}</td>
                  <td>{m.odgovornaOsoba}</td>
                  <td>{m.kontrola}</td>
                  <td>{m.periodika || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2>5. Prilozi</h2>

        <h3>5.1 Raspored poslova po radnim mjestima</h3>
        {rasporedPoslova.length === 0 ? (
          <p className="hint">Nema povezanih radnih mjesta i poslova.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Radno mjesto</th>
                <th>Posao</th>
              </tr>
            </thead>
            <tbody>
              {rasporedPoslova.map(({ radnoMjesto, posao }) => (
                <tr key={radnoMjesto.id + posao.id}>
                  <td>{radnoMjesto.naziv}</td>
                  <td>{posao.naziv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>5.2 Popis radne opreme</h3>
        {popisOpreme.length === 0 ? (
          <p className="hint">Nema unesene radne opreme.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Radna oprema</th>
                <th>Koristi se na poslovima</th>
                <th>Period pregleda (mjeseci)</th>
                <th>Datum posljednjeg pregleda</th>
              </tr>
            </thead>
            <tbody>
              {popisOpreme.map(({ oprema, poslovi: pz }) => (
                <tr key={oprema.id}>
                  <td>{oprema.naziv}</td>
                  <td>{pz.map((p) => p.naziv).join(", ")}</td>
                  <td>{oprema.periodPregledaMjeseci ?? "–"}</td>
                  <td>{oprema.datumPosljednjegPregleda || "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>5.3 Popis poslova za koje je određena OZO i popis OZO (provjeriti)</h3>
        {ozoPoPoslovima.length === 0 ? (
          <p className="hint">Nema poslova s određenom OZO.</p>
        ) : (
          ozoPoPoslovima.map(({ posao, stavke }) => (
            <div key={posao.id} style={{ marginBottom: 10 }}>
              <strong>{posao.naziv}</strong>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rizik</th>
                    <th>Razina</th>
                    <th>OZO</th>
                    <th>Norma</th>
                  </tr>
                </thead>
                <tbody>
                  {stavke.map(({ r, razina }) => (
                    <tr key={r.id}>
                      <td>{r.naziv}</td>
                      <td>
                        <RiskBadge razina={razina} />
                      </td>
                      <td>{r.ozoPrijedlog || "–"}</td>
                      <td>{r.ozoNorma || "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}

        <h3>5.4 Popis potrebnih liječničkih pregleda (provjeriti)</h3>
        {lijecnickiPregledi.length === 0 ? (
          <p className="hint">Nema poslova s upisanim liječničkim pregledom.</p>
        ) : (
          lijecnickiPregledi.map(({ posao, stavke }) => (
            <div key={posao.id} style={{ marginBottom: 10 }}>
              <strong>{posao.naziv}</strong>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rizik</th>
                    <th>Točke liječničkog pregleda</th>
                  </tr>
                </thead>
                <tbody>
                  {stavke.map((r) => (
                    <tr key={r.id}>
                      <td>{r.naziv}</td>
                      <td>{r.lijecnickiPregled || "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}

        <h3>5.5 Sigurnosni podaci izvora kemijskih i fizikalnih štetnosti</h3>
        {kemijskeIFizikalne.length === 0 ? (
          <p className="hint">Nema odabranih kemijskih ili fizikalnih štetnosti.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Štetnost</th>
                <th>Posao</th>
                <th>Vrsta</th>
              </tr>
            </thead>
            <tbody>
              {kemijskeIFizikalne.map(({ posao, r }) => (
                <tr key={r.id + posao.id}>
                  <td>{r.naziv}</td>
                  <td>{posao.naziv}</td>
                  <td>{r.path[0] === "1" ? "kemijska" : "fizikalna"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>5.6 Popis potrebnih ispitivanja (provjeriti)</h3>
        {ispitivanja.length === 0 ? (
          <p className="hint">Nema unesenih ispitivanja.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ispitivanje</th>
                <th>Napomena</th>
                <th>Period (mjeseci)</th>
                <th>Datum posljednjeg</th>
              </tr>
            </thead>
            <tbody>
              {ispitivanja.map((i) => (
                <tr key={i.id}>
                  <td>{i.naziv}</td>
                  <td>{i.napomena || "–"}</td>
                  <td>{i.periodMjeseci ?? "–"}</td>
                  <td>{i.datumPosljednjeg || "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>5.7 Popis poslova izloženih naporu vida i/ili govora</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Posao</th>
              <th>Izloženost naporu vida</th>
              <th>Izloženost naporu govora</th>
            </tr>
          </thead>
          <tbody>
            {posloviNaporVidGovor.map(({ posao, vid, govor }) => (
              <tr key={posao.id}>
                <td>{posao.naziv}</td>
                <td>{vid ? "Da" : "Ne"}</td>
                <td>{govor ? "Da" : "Ne"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>5.8 Ergonomija rada na računalu</h3>
        {posloviRacunalo.length === 0 ? (
          <p className="hint">Nema poslova označenih kao rad na računalu 4+ sati dnevno.</p>
        ) : (
          posloviRacunalo.map((posao) => (
            <div key={posao.id} style={{ marginBottom: 14 }}>
              <strong>{posao.naziv}</strong>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kategorija</th>
                    <th>Zadovoljava</th>
                    <th>Napomena</th>
                  </tr>
                </thead>
                <tbody>
                  {ERGONOMIJA_KATEGORIJE.map((kategorija) => {
                    const odgovor = posao.ergonomijaOdgovori[kategorija] ?? {
                      zadovoljava: null,
                      napomena: "",
                    };
                    return (
                      <tr key={kategorija}>
                        <td>{kategorija}</td>
                        <td>
                          {odgovor.zadovoljava === "da"
                            ? "Da"
                            : odgovor.zadovoljava === "ne"
                              ? "Ne"
                              : odgovor.zadovoljava === "np"
                                ? "Nije primjenjivo"
                                : "–"}
                        </td>
                        <td>{odgovor.napomena || "–"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}

        <h3>5.9 Popis poslova s posebnim uvjetima rada (provjeriti)</h3>
        {posloviPosebniUvjeti.length === 0 ? (
          <p className="hint">Nije označen nijedan posao.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Posao</th>
                <th>Napomena / obrazloženje</th>
              </tr>
            </thead>
            <tbody>
              {posloviPosebniUvjeti.map((p) => (
                <tr key={p.id}>
                  <td>{p.naziv}</td>
                  <td>{obrazlozenjePosebniUvjeti(p) || "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </div>
  );
}
