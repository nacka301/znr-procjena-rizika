import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { izracunajRazinu, razinaPosla } from "../types";
import type { Ispitivanje, MjeraPlana, Poslodavac, Posao, RadnaOprema, RadnoMjesto } from "../types";

const RAZINA_TEKST: Record<string, string> = {
  mali: "Mali rizik",
  srednji: "Srednji rizik",
  veliki: "Veliki rizik",
};

function ozoTekst(r: { ozoNijePotrebna: boolean; ozoPrijedlog: string }, prazno: string): string {
  if (r.ozoNijePotrebna) return "OZO nije potrebna";
  return r.ozoPrijedlog || prazno;
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

export async function izveziDocx(data: PodaciZaIzvoz) {
  const { poslodavac, radnaMjesta, poslovi, radnaOprema, mjerePlana, ispitivanja } = data;

  const naslov = new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun(`Procjena rizika – ${poslodavac.naziv || "(bez naziva)"}`)],
  });

  const podnaslov = new Paragraph({
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

  const cjelina1 = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "1. Opći podaci" }),
    new Paragraph({ text: `Naziv poslodavca: ${poslodavac.naziv}` }),
    new Paragraph({ text: `Djelatnost: ${poslodavac.djelatnost}` }),
    new Paragraph({ text: `Ukupan broj radnika: ${poslodavac.ukupnoRadnika}` }),
    new Paragraph({ text: `Mjesta rada: ${poslodavac.lokacije.join("; ") || "-"}` }),
  ];

  const cjelina2 = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "2. Analiza prikupljenih podataka" }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Radna mjesta" }),
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
    new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Poslovi" }),
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
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      text: "3. Analiza i procjena rizika po poslovima",
    }),
  ];
  for (const p of poslovi) {
    cjelina3.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: p.naziv }),
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
            "Vjerojatnost",
            "Posljedica",
            "Razina",
            "OZO",
            "Liječnički pregled",
          ]),
          ...p.rizici.map((r) => {
            const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
            return redak([
              celija(r.punaStaza),
              celija(r.vjerojatnost ? String(r.vjerojatnost) : "-"),
              celija(r.posljedica ? String(r.posljedica) : "-"),
              celija(razina ? RAZINA_TEKST[razina] : "-"),
              celija(ozoTekst(r, "-")),
              celija(r.lijecnickiPregled || "-"),
            ]);
          }),
        ],
      }),
      new Paragraph({ text: "" })
    );
  }

  const cjelina4 = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "4. Plan mjera / preporuke za poboljšanja" }),
    mjerePlana.length === 0
      ? new Paragraph({ text: "Nema unesenih mjera." })
      : new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            naslovTablice(["Posao", "Mjera", "Rok", "Odgovorna osoba", "Kontrola"]),
            ...mjerePlana.map((m) =>
              redak([
                celija(poslovi.find((p) => p.id === m.posaoId)?.naziv || "-"),
                celija(m.mjera),
                celija(m.rok),
                celija(m.odgovornaOsoba),
                celija(m.kontrola),
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
  const posloviPosebniUvjeti = poslovi.filter((p) => p.posebniUvjeti);

  const cjelina5: (Paragraph | Table)[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, text: "5. Prilozi" }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, text: "5.1 Popis radne opreme" }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Radna oprema", "Koristi se na poslovima"]),
        ...popisOpreme.map((o) =>
          redak([
            celija(o.naziv),
            celija(
              poslovi
                .filter((p) => p.radnaOpremaIds.includes(o.id))
                .map((p) => p.naziv)
                .join(", ")
            ),
          ])
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      text: "5.2 Popis poslova za koje je određena OZO i popis OZO (provjeriti)",
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Posao", "Rizik", "Razina", "OZO"]),
        ...posloviSaOzo.flatMap((p) =>
          p.rizici
            .filter((r) => {
              const razina = izracunajRazinu(r.vjerojatnost, r.posljedica);
              return razina === "srednji" || razina === "veliki";
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
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      text: "5.3 Popis potrebnih liječničkih pregleda (provjeriti)",
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        naslovTablice(["Posao", "Rizik", "Točke liječničkog pregleda"]),
        ...posloviVelikiRizik.flatMap((p) =>
          p.rizici
            .filter((r) => izracunajRazinu(r.vjerojatnost, r.posljedica) === "veliki")
            .map((r) =>
              redak([celija(p.naziv), celija(r.naziv), celija(r.lijecnickiPregled || "(provjeriti)")])
            )
        ),
      ],
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      text: "5.4 Sigurnosni podaci izvora kemijskih i fizikalnih štetnosti",
    }),
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
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      text: "5.5 Popis potrebnih ispitivanja (provjeriti)",
    }),
    ispitivanja.length === 0
      ? new Paragraph({ text: "Nema unesenih ispitivanja." })
      : new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            naslovTablice(["Ispitivanje", "Napomena"]),
            ...ispitivanja.map((i) => redak([celija(i.naziv), celija(i.napomena || "-")])),
          ],
        }),
    new Paragraph({ text: "" }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      text: "5.6 Popis poslova s posebnim uvjetima rada (provjeriti)",
    }),
    posloviPosebniUvjeti.length === 0
      ? new Paragraph({ text: "Nije označen nijedan posao." })
      : new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            naslovTablice(["Posao", "Napomena"]),
            ...posloviPosebniUvjeti.map((p) =>
              redak([celija(p.naziv), celija(p.posebniUvjetiNapomena || "-")])
            ),
          ],
        }),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          naslov,
          podnaslov,
          new Paragraph({ text: "" }),
          ...cjelina1,
          new Paragraph({ text: "" }),
          ...cjelina2,
          new Paragraph({ text: "" }),
          ...cjelina3,
          ...cjelina4,
          new Paragraph({ text: "" }),
          ...cjelina5,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const nazivDatoteke = `Procjena_rizika_${(poslodavac.naziv || "bez_naziva").replace(/[^a-zA-Z0-9_-]+/g, "_")}.docx`;
  saveAs(blob, nazivDatoteke);
}
