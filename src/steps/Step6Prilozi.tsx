import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { izracunajRazinu } from "../types";
import type { ErgonomijaZadovoljava } from "../types";
import RiskBadge from "../components/RiskBadge";
import PrijedlogChips from "../components/PrijedlogChips";
import { ISPITIVANJA_KATALOG } from "../data/prijedloziKatalozi";
import { ERGONOMIJA_KATEGORIJE } from "../data/ergonomijaKategorije";
import { imaTockuPravilnika, jePosebniUvjeti, obrazlozenjePosebniUvjeti } from "../utils/posebniUvjeti";

function NapomenaPolje({ naziv }: { naziv: string }) {
  const tekst = useStore((s) => s.napomenePriloga[naziv] ?? "");
  const setNapomena = useStore((s) => s.setNapomenaPriloga);
  return (
    <div className="field-row" style={{ marginTop: 10 }}>
      <label>Dodatna napomena uz ovaj prilog (uredivo)</label>
      <textarea
        rows={2}
        value={tekst}
        onChange={(e) => setNapomena(naziv, e.target.value)}
        placeholder="Slobodan tekst — izmjene, iznimke, komentari stručnjaka…"
      />
    </div>
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
  const [novoIspitivanje, setNovoIspitivanje] = useState("");

  const rasporedPoslova = useMemo(() => {
    return radnaMjesta.flatMap((rm) =>
      poslovi
        .filter((p) => p.radnaMjestaIds.includes(rm.id))
        .map((p) => ({ radnoMjesto: rm, posao: p }))
    );
  }, [radnaMjesta, poslovi]);

  const posloviNaporVidGovor = useMemo(() => {
    return poslovi.map((p) => ({
      posao: p,
      vid: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "3"),
      govor: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "4"),
    }));
  }, [poslovi]);

  const posloviRacunalo = useMemo(
    () => poslovi.filter((p) => p.koristiRacunalo4h),
    [poslovi]
  );

  const popisOpreme = useMemo(() => {
    return radnaOprema
      .map((o) => ({
        oprema: o,
        poslovi: poslovi.filter((p) => p.radnaOpremaIds.includes(o.id)),
      }))
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

  function dodajIspitivanje() {
    if (!novoIspitivanje.trim()) return;
    addIspitivanje(novoIspitivanje.trim());
    setNovoIspitivanje("");
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">Cjelina 5 · Prilozi</div>
        <h1>Prilozi</h1>
        <p className="hint">
          Prilozi se automatski generiraju iz unesenih podataka (čl. 11 Pravilnika). Svaki prilog
          može se dodatno urediti prije izvoza.
        </p>
      </div>

      <div className="card">
        <h2>1. Raspored poslova po radnim mjestima</h2>
        <p className="hint">Izvedeno iz matrice radno mjesto × posao (korak "Poslovi").</p>
        {rasporedPoslova.length === 0 && (
          <div className="empty-state">Nema povezanih radnih mjesta i poslova.</div>
        )}
        {rasporedPoslova.length > 0 && (
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
      </div>

      <div className="card">
        <h2>2. Popis radne opreme</h2>
        {popisOpreme.length === 0 && <div className="empty-state">Nema unesene radne opreme.</div>}
        {popisOpreme.length > 0 && (
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
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={oprema.periodPregledaMjeseci ?? ""}
                      onChange={(e) =>
                        updateRadnaOprema(oprema.id, {
                          periodPregledaMjeseci: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      style={{ width: 70 }}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={oprema.datumPosljednjegPregleda}
                      onChange={(e) =>
                        updateRadnaOprema(oprema.id, {
                          datumPosljednjegPregleda: e.target.value,
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <NapomenaPolje naziv="popis-opreme" />
      </div>

      <div className="card">
        <h2>3. Popis poslova za koje je određena OZO i popis OZO</h2>
        {ozoPoPoslovima.length === 0 && (
          <div className="empty-state">Nema poslova s određenom OZO.</div>
        )}
        {ozoPoPoslovima.map(({ posao, stavke }) => (
          <div key={posao.id} style={{ marginBottom: 10 }}>
            <strong>{posao.naziv}</strong>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rizik</th>
                  <th>Razina</th>
                  <th>
                    OZO <span className="tag-prijedlog">provjeriti</span>
                  </th>
                  <th>
                    Norma <span className="tag-prijedlog">provjeriti</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stavke.map(({ r, razina }) => (
                  <tr key={r.id}>
                    <td>{r.naziv}</td>
                    <td>
                      <RiskBadge razina={razina} />
                    </td>
                    <td>{r.ozoPrijedlog || <span className="hint">–</span>}</td>
                    <td>{r.ozoNorma || <span className="hint">–</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <NapomenaPolje naziv="ozo-poslovi" />
      </div>

      <div className="card">
        <h2>4. Popis potrebnih liječničkih pregleda</h2>
        {lijecnickiPregledi.length === 0 && (
          <div className="empty-state">Nema poslova s upisanim liječničkim pregledom.</div>
        )}
        {lijecnickiPregledi.map(({ posao, stavke }) => (
          <div key={posao.id} style={{ marginBottom: 10 }}>
            <strong>{posao.naziv}</strong>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rizik</th>
                  <th>
                    Točke liječničkog pregleda{" "}
                    <span className="tag-provjeriti">provjeriti</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stavke.map((r) => (
                  <tr key={r.id}>
                    <td>{r.naziv}</td>
                    <td>{r.lijecnickiPregled || <span className="hint">–</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <NapomenaPolje naziv="lijecnicki-pregledi" />
      </div>

      <div className="card">
        <h2>5. Sigurnosni podaci izvora kemijskih i fizikalnih štetnosti</h2>
        <p className="hint">
          Popis izveden iz odabranih štetnosti u analizi poslova (kategorije "Kemijske štetnosti"
          i "Fizikalne štetnosti" iz Priloga III). Sigurnosno-tehničke listove i konkretne podatke
          treba priložiti zasebno.
        </p>
        {kemijskeIFizikalne.length === 0 && (
          <div className="empty-state">Nema odabranih kemijskih ili fizikalnih štetnosti.</div>
        )}
        {kemijskeIFizikalne.length > 0 && (
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
        <NapomenaPolje naziv="kemijske-fizikalne" />
      </div>

      <div className="card">
        <h2>6. Popis potrebnih ispitivanja</h2>
        <p className="hint">
          Rokovi i vrste ispitivanja radne opreme i radnog okoliša nisu pouzdano preuzeti iz
          propisa — unesite ručno i{" "}
          <span className="tag-provjeriti">provjerite prije korištenja</span>.
        </p>
        {ispitivanja.length === 0 && <div className="empty-state">Nema unesenih ispitivanja.</div>}
        {ispitivanja.map((isp) => (
          <div
            key={isp.id}
            style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}
          >
            <input
              type="text"
              value={isp.naziv}
              onChange={(e) => updateIspitivanje(isp.id, { naziv: e.target.value })}
              style={{ flex: 2, minWidth: 160 }}
            />
            <input
              type="text"
              value={isp.napomena}
              onChange={(e) => updateIspitivanje(isp.id, { napomena: e.target.value })}
              placeholder="napomena"
              style={{ flex: 1, minWidth: 120 }}
            />
            <input
              type="number"
              min={0}
              value={isp.periodMjeseci ?? ""}
              onChange={(e) =>
                updateIspitivanje(isp.id, {
                  periodMjeseci: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="period (mj.)"
              style={{ width: 90 }}
            />
            <input
              type="date"
              value={isp.datumPosljednjeg}
              onChange={(e) => updateIspitivanje(isp.id, { datumPosljednjeg: e.target.value })}
            />
            <button className="btn btn-sm btn-danger" onClick={() => removeIspitivanje(isp.id)}>
              Ukloni
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="text"
            value={novoIspitivanje}
            onChange={(e) => setNovoIspitivanje(e.target.value)}
            placeholder="npr. Ispitivanje električnih instalacija"
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === "Enter" && dodajIspitivanje()}
          />
          <button className="btn btn-sm" onClick={dodajIspitivanje}>
            + Dodaj
          </button>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          Brzi odabir iz uobičajenih ispitivanja (klik odmah dodaje na popis, zatim uredivo):
        </p>
        <PrijedlogChips
          katalog={ISPITIVANJA_KATALOG.filter(
            (stavka) => !ispitivanja.some((isp) => isp.naziv.toLowerCase() === stavka.toLowerCase())
          )}
          onOdaberi={(stavka) => addIspitivanje(stavka)}
        />
      </div>

      <div className="card">
        <h2>7. Popis poslova izloženih naporu vida i/ili govora</h2>
        <p className="hint">
          Automatski izvedeno iz odabranih napora "Napori vida" i "Napori govora" (Prilog III) u
          analizi poslova.
        </p>
        {posloviNaporVidGovor.length === 0 && (
          <div className="empty-state">Nema unesenih poslova.</div>
        )}
        {posloviNaporVidGovor.length > 0 && (
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
        )}
      </div>

      <div className="card">
        <h2>8. Ergonomija rada na računalu</h2>
        <p className="hint">
          Kratki checklist za poslove označene kao "rad na računalu 4 ili više sati dnevno" (korak
          "Analiza posla"). Status i napomena su uredivi; puni pravni tekst zahtjeva treba
          provjeriti u izvornom propisu.
        </p>
        {posloviRacunalo.length === 0 && (
          <div className="empty-state">
            Nema poslova označenih kao rad na računalu 4+ sati dnevno.
          </div>
        )}
        {posloviRacunalo.map((posao) => (
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
                        <select
                          value={odgovor.zadovoljava ?? ""}
                          onChange={(e) =>
                            setErgonomijaOdgovor(posao.id, kategorija, {
                              zadovoljava: (e.target.value || null) as ErgonomijaZadovoljava | null,
                            })
                          }
                        >
                          <option value="">— odaberi —</option>
                          <option value="da">Da</option>
                          <option value="ne">Ne</option>
                          <option value="np">Nije primjenjivo</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={odgovor.napomena}
                          onChange={(e) =>
                            setErgonomijaOdgovor(posao.id, kategorija, {
                              napomena: e.target.value,
                            })
                          }
                          style={{ width: "100%" }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>9. Popis poslova s posebnim uvjetima rada</h2>
        <p className="hint">
          Posao se automatski uključuje čim u analizi rizika ima upisanu "Točku Pravilnika"
          (redak je tada označen i kvačica se ne može ručno isključiti — uklonite točku u koraku
          "Analiza posla" ako posao ipak ne pripada ovdje). Stručnjak može ručno dodati i posao bez
          upisane točke. <span className="tag-provjeriti">provjeriti</span>
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Posao</th>
              <th>Napomena / obrazloženje</th>
            </tr>
          </thead>
          <tbody>
            {poslovi.map((p) => {
              const automatski = imaTockuPravilnika(p);
              const ukljucen = jePosebniUvjeti(p);
              return (
                <tr key={p.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={ukljucen}
                      disabled={automatski}
                      title={automatski ? "Automatski uključeno (upisana Točka Pravilnika)" : undefined}
                      onChange={() => togglePosebniUvjeti(p.id)}
                    />
                  </td>
                  <td>
                    {p.naziv}
                    {automatski && (
                      <>
                        {" "}
                        <span className="tag-prijedlog">automatski</span>
                      </>
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={ukljucen ? obrazlozenjePosebniUvjeti(p) : ""}
                      disabled={!ukljucen}
                      onChange={(e) => setPosebniUvjetiNapomena(p.id, e.target.value)}
                      style={{ width: "100%" }}
                      placeholder={ukljucen ? "obrazloženje" : ""}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
