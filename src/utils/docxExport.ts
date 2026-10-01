import {
  AlignmentType,
  Document,
  Header,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { izracunajRazinu, razinaPosla } from "../types";
import type { Ispitivanje, MjeraPlana, Poslodavac, Posao, RadnaOprema, RadnoMjesto } from "../types";
import { ERGONOMIJA_KATEGORIJE } from "../data/ergonomijaKategorije";
import { jePosebniUvjeti, obrazlozenjePosebniUvjeti } from "./posebniUvjeti";
import { ozoTekstSNormama } from "./ozo";

const RAZINA_TEKST: Record<string, string> = {
  mali: "Mali rizik",
  srednji: "Srednji rizik",
  veliki: "Veliki rizik",
};

// OZO se uvijek ispisuje kao parovi "naziv (norma)" - popis opreme nikad nije odvojen od
// popisa normi, pa se ne može izgubiti koja norma pripada kojoj stavci.
function ozoTekst(
  r: { ozoNijePotrebna: boolean; ozoPrijedlog: string; ozoNorma: string },
  prazno: string
): string {
  return ozoTekstSNormama(r, prazno);
}

/**
 * Naslov poglavlja/priloga uz "keep with next" - naslov nikad ne ostaje sam na dnu stranice,
 * nego prelazi na sljedeću zajedno sa svojim sadržajem.
 */
function naslovParagraf(level: (typeof HeadingLevel)[keyof typeof HeadingLevel], text: string) {
  return new Paragraph({ heading: level, text, keepNext: true, keepLines: true });
}

function celija(tekst: string, opcije: { bold?: boolean; width?: number } = {}): TableCell {
  return new TableCell({
    width: opcije.width ? { size: opcije.width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text: tekst, bold: opcije.bold })],
      }),
    ],
  });
}

function redak(celije: TableCell[]): TableRow {
  return new TableRow({ children: celije });
}

function naslovTablice(nazivi: string[]): TableRow {
  return redak(nazivi.map((n) => celija(n, { bold: true })));
}

export interface PodaciZaIzvoz {
  poslodavac: Poslodavac;
  radnaMjesta: RadnoMjesto[];
  poslovi: Posao[];
  radnaOprema: RadnaOprema[];
  mjerePlana: MjeraPlana[];
  ispitivanja: Ispitivanje[];
}

/** Sastavlja .docx u memoriji. Odvojeno od spremanja, da se izvoz može provjeriti bez preglednika. */
export async function izradiDocxBlob(data: PodaciZaIzvoz): Promise<Blob> {
  const { poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja } = data;

  const naslov = new Paragraph({
    heading: HeadingLevel.TITLE,
    keepNext: true,
    alignment: AlignmentType.CENTER,
    children: [new TextRun(`Procjena rizika – ${poslodavac.naziv || "(bez naziva)"}`)],
  });

  const podnaslov = new Paragraph({
    keepNext: true,
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: poslodavac.isPrimjer
          ? "PRIMJER – nije stručna procjena. Generirano prototipom alata."
          : "Nacrt izrađen prototipom alata – prije uporabe provjeriti sve označene stavke.",
        italics: true,
      }),
    ],
  });

  const ukupnoRadnika = radnaMjesta.reduce((zbroj, rm) => zbroj + rm.brojRadnika, 0);

  const cjelina1 = [
    naslovParagraf(HeadingLevel.HEADING_1, "1. Opći podaci"),
    new Paragraph({ text: `Naziv poslodavca: ${poslodavac.naziv}` }),
    new Paragraph({ text: `Djelatnost: ${poslodavac.djelatnost}` }),
    new Paragraph({ text: `Ukupan broj radnika: ${ukupnoRadnika}` }),
    new Paragraph({ text: `Mjesta rada: ${poslodavac.lokacije.join("; ") || "-"}` }),
  ];

  const cjelina2 = [
    naslovParagraf(HeadingLevel.HEADING_1, "2. Analiza prikupljenih podataka"),
    naslovParagraf(HeadingLevel.HEADING_2, "Radna mjesta"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Radno mjesto", "Broj radnika", "Obavlja poslove"]),
        ...radnaMjesta.map((rm) =>
          redak([
            celija(rm.naziv),
            celija(String(rm.brojRadnika)),
            celija(
              poslovi
                .filter((p) => p.radnaMjestaIds.includes(rm.id))
                .map((p) => p.naziv)
                .join(", ") || "-"
            ),
          ])
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "Poslovi"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Posao", "Radna mjesta koja ga obavljaju", "Razina rizika"]),
        ...poslovi.map((p) =>
          redak([
            celija(p.naziv),
            celija(
              radnaMjesta
                .filter((rm) => p.radnaMjestaIds.includes(rm.id))
                .map((rm) => rm.naziv)
                .join(", ") || "-"
            ),
            celija(
              (razinaPosla(p.rizici) && RAZINA_TEKST[razinaPosla(p.rizici)!]) ||
                "Nije ocijenjeno"
            ),
          ])
        ),
      ],
    }),
  ];

  const cjelina3: (Paragraph | Table)[] = [
    naslovParagraf(HeadingLevel.HEADING_1, "3. Analiza i procjena rizika po poslovima"),
  ];
  for (const p of poslovi) {
    cjelina3.push(
      naslovParagraf(HeadingLevel.HEADING_2, p.naziv),
      new Paragraph({
        text: `Radna oprema: ${
          radnaOprema
            .filter((o) => p.radnaOpremaIds.includes(o.id))
            .map((o) => o.naziv)
            .join(", ") || "-"
        }`,
      })
    );
    if (p.rizici.length === 0) {
      cjelina3.push(new Paragraph({ text: "Nema evidentiranih rizika." }));
      continue;
    }
    cjelina3.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          naslovTablice([
            "Opasnost / štetnost / napor",
            "Mogući neželjeni događaj",
            "Vjerojatnost",
            "Posljedica",
            "Razina",
            "OZO",
            "Liječnički pregled",
            "Točka Pravilnika",
          ]),
          ...p.rizici.map((r) => {
            const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
            return redak([
              celija(r.punaStaza),
              celija(r.moguciDogadjaj || "-"),
              celija(r.vjerojatnost ? String(r.vjerojatnost) : "-"),
              celija(r.posljedica ? String(r.posljedica) : "-"),
              celija(razina ? RAZINA_TEKST[razina] : "-"),
              celija(ozoTekst(r, "-")),
              celija(r.lijecnickiPregled || "-"),
              celija(r.tockaPravilnika || "-"),
            ]);
          }),
        ],
      }),
      new Paragraph({ text: "" })
    );
  }

  const cjelina4 = [
    naslovParagraf(HeadingLevel.HEADING_1, "4. Plan mjera / preporuke za poboljšanja"),
    mjerePlana.length === 0
      ? new Paragraph({ text: "Nema unesenih mjera." })
      : new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            naslovTablice(["Posao", "Mjera", "Rok", "Odgovorna osoba", "Kontrola", "Periodika"]),
            ...mjerePlana.map((m) =>
              redak([
                celija(poslovi.find((p) => p.id === m.posaoId)?.naziv || "-"),
                celija(m.mjera),
                celija(m.rok),
                celija(m.odgovornaOsoba),
                celija(m.kontrola),
                celija(m.periodika || "-"),
              ])
            ),
          ],
        }),
  ];

  const popisOpreme = radnaOprema.filter((o) =>
    poslovi.some((p) => p.radnaOpremaIds.includes(o.id))
  );
  const posloviSaOzo = poslovi.filter((p) =>
    p.rizici.some((r) => {
      const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
      return razina === "srednji" || razina === "veliki";
    })
  );
  const posloviVelikiRizik = poslovi.filter((p) =>
    p.rizici.some((r) => izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki")
  );
  const kemFiz = poslovi.flatMap((p) =>
    p.rizici
      .filter((r) => r.kategorija === "stetnost" && (r.path[0] === "1" || r.path[0] === "3"))
      .map((r) => ({ posao: p, r }))
  );
  const posloviPosebniUvjeti = poslovi.filter(jePosebniUvjeti);
  const rasporedPoslova = radnaMjesta.flatMap((rm) =>
    poslovi
      .filter((p) => p.radnaMjestaIds.includes(rm.id))
      .map((p) => ({ radnoMjesto: rm, posao: p }))
  );
  const posloviNaporVidGovor = poslovi.map((p) => ({
    posao: p,
    vid: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "3"),
    govor: p.rizici.some((r) => r.kategorija === "napor" && r.path[0] === "4"),
  }));
  const posloviRacunalo = poslovi.filter((p) => p.koristiRacunalo4h);

  const cjelina5: (Paragraph | Table)[] = [
    naslovParagraf(HeadingLevel.HEADING_1, "5. Prilozi"),
    naslovParagraf(HeadingLevel.HEADING_2, "5.1 Raspored poslova po radnim mjestima"),
    rasporedPoslova.length === 0
      ? new Paragraph({ text: "Nema povezanih radnih mjesta i poslova." })
      : new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            naslovTablice(["Radno mjesto", "Posao"]),
            ...rasporedPoslova.map(({ radnoMjesto, posao }) =>
              redak([celija(radnoMjesto.naziv), celija(posao.naziv)])
            ),
          ],
        }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "5.2 Popis radne opreme"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice([
          "Radna oprema",
          "Koristi se na poslovima",
          "Period pregleda (mjeseci)",
          "Datum posljednjeg pregleda",
        ]),
        ...popisOpreme.map((o) =>
          redak([
            celija(o.naziv),
            celija(
              poslovi
                .filter((p) => p.radnaOpremaIds.includes(o.id))
                .map((p) => p.naziv)
                .join(", ")
            ),
            celija(o.periodPregledaMjeseci != null ? String(o.periodPregledaMjeseci) : "-"),
            celija(o.datumPosljednjegPregleda || "-"),
          ])
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "5.3 Popis poslova za koje je određena OZO i popis OZO (provjeriti)"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Posao", "Rizik", "Razina", "OZO (norma)"]),
        ...posloviSaOzo.flatMap((p) =>
          p.rizici
            .filter((r) => {
              const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
              return (razina === "srednji" || razina === "veliki") && !r.ozoNijePotrebna;
            })
            .map((r) =>
              redak([
                celija(p.naziv),
                celija(r.naziv),
                celija(RAZINA_TEKST[izracunajRazinu(r.vjerojatnost, r.posljedica)!]),
                celija(ozoTekst(r, "(provjeriti)")),
              ])
            )
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "5.4 Popis potrebnih liječničkih pregleda (provjeriti)"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Posao", "Rizik", "Točke liječničkog pregleda"]),
        ...posloviVelikiRizik.flatMap((p) =>
          p.rizici
            .filter(
              (r) =>
                izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki" &&
                (r.lijecnickiPregled ?? "").trim() !== ""
            )
            .map((r) => redak([celija(p.naziv), celija(r.naziv), celija(r.lijecnickiPregled)]))
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "5.5 Sigurnosni podaci izvora kemijskih i fizikalnih štetnosti"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Štetnost", "Posao", "Vrsta"]),
        ...kemFiz.map(({ posao, r }) =>
          redak([celija(r.naziv), celija(posao.naziv), celija(r.path[0] === "1" ? "kemijska" : "fizikalna")])
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "5.6 Popis potrebnih ispitivanja (provjeriti)"),
    ispitivanja.length === 0
      ? new Paragraph({ text: "Nema unesenih ispitivanja." })
      : new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            naslovTablice(["Ispitivanje", "Napomena", "Period (mjeseci)", "Datum posljednjeg"]),
            ...ispitivanja.map((i) =>
              redak([
                celija(i.naziv),
                celija(i.napomena || "-"),
                celija(i.periodMjeseci != null ? String(i.periodMjeseci) : "-"),
                celija(i.datumPosljednjeg || "-"),
              ])
            ),
          ],
        }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "5.7 Popis poslova izloženih naporu vida i/ili govora"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Posao", "Izloženost naporu vida", "Izloženost naporu govora"]),
        ...posloviNaporVidGovor.map(({ posao, vid, govor }) =>
          redak([celija(posao.naziv), celija(vid ? "Da" : "Ne"), celija(govor ? "Da" : "Ne")])
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    naslovParagraf(HeadingLevel.HEADING_2, "5.8 Ergonomija rada na računalu"),
    ...(posloviRacunalo.length === 0
      ? [new Paragraph({ text: "Nema poslova označenih kao rad na računalu 4+ sati dnevno." })]
      : posloviRacunalo.flatMap((p) => [
          naslovParagraf(HeadingLevel.HEADING_3, p.naziv),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              naslovTablice(["Kategorija", "Zadovoljava", "Napomena"]),
              ...ERGONOMIJA_KATEGORIJE.map((kategorija) => {
                const odgovor = p.ergonomijaOdgovori[kategorija] ?? {
                  zadovoljava: null,
                  napomena: "",
                };
                return redak([
                  celija(kategorija),
                  celija(
                    odgovor.zadovoljava === "da"
                      ? "Da"
                      : odgovor.zadovoljava === "ne"
                        ? "Ne"
                        : odgovor.zadovoljava === "np"
                          ? "Nije primjenjivo"
                          : "-"
                  ),
                  celija(odgovor.napomena || "-"),
                ]);
              }),
            ],
          }),
          new Paragraph({ text: "" }),
        ])),
    naslovParagraf(HeadingLevel.HEADING_2, "5.9 Popis poslova s posebnim uvjetima rada (provjeriti)"),
    posloviPosebniUvjeti.length === 0
      ? new Paragraph({ text: "Nije označen nijedan posao." })
      : new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            naslovTablice(["Posao", "Napomena"]),
            ...posloviPosebniUvjeti.map((p) =>
              redak([celija(p.naziv), celija(obrazlozenjePosebniUvjeti(p) || "-")])
            ),
          ],
        }),
  ];

  const zaglavlje = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `Procjena rizika – ${poslodavac.naziv || "(bez naziva)"}`, bold: true }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: { default: zaglavlje },
        children: [
          naslov,
          podnaslov,
          new Paragraph({ text: "" }),
          ...cjelina1,
          new Paragraph({ text: "" }),
          ...cjelina2,
        ],
      },
      {
        properties: {
          page: { size: { orientation: PageOrientation.LANDSCAPE } },
        },
        headers: { default: zaglavlje },
        children: [...cjelina3, ...cjelina4, new Paragraph({ text: "" }), ...cjelina5],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function nazivDatotekeIzvoza(poslodavac: Poslodavac): string {
  return `Procjena_rizika_${(poslodavac.naziv || "bez_naziva").replace(/[^a-zA-Z0-9_-]+/g, "_")}.docx`;
}

export async function izveziDocx(data: PodaciZaIzvoz) {
  const blob = await izradiDocxBlob(data);
  // file-saver se učitava tek pri spremanju: izradiDocxBlob tako ostaje bez ovisnosti o
  // pregledniku i može se pokrenuti i izvan njega.
  const { saveAs } = await import("file-saver");
  saveAs(blob, nazivDatotekeIzvoza(data.poslodavac));
}
