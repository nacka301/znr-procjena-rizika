import type { MjeraPlana, Poslodavac, Posao, RadnoMjesto, Rizik } from "../types";
import { nadjiNaziv } from "./prilogIII";
import { BASE_RADNA_OPREMA } from "./baseRadnaOprema";

// PRIMJER, nije stručna procjena. Svi podaci su izmišljeni radi prikaza mogućnosti alata
// (naročito zaslona "Poslovi" - M:N veza radno mjesto <-> posao).

export const DEMO_POSLODAVAC: Poslodavac = {
  naziv: "Primjer d.o.o.",
  djelatnost: "Proizvodnja i prodaja pekarskih proizvoda (pekara s trgovinom i dostavom)",
  lokacije: ["Pekara i prodavaonica, Zagreb", "Skladište sirovina, Zagreb"],
  ukupnoRadnika: 12,
  oib: "",
  isPrimjer: true,
};

export const DEMO_RADNA_MJESTA: RadnoMjesto[] = [
  { id: "rm-direktor", naziv: "Direktor", brojRadnika: 1 },
  { id: "rm-prodavac", naziv: "Prodavač", brojRadnika: 3 },
  { id: "rm-pekar", naziv: "Pekar", brojRadnika: 3 },
  { id: "rm-skladistar", naziv: "Skladištar", brojRadnika: 1 },
  { id: "rm-vozac", naziv: "Vozač dostavnog vozila", brojRadnika: 2 },
  { id: "rm-cistac", naziv: "Čistač", brojRadnika: 1 },
  { id: "rm-administrator", naziv: "Administrator", brojRadnika: 1 },
];

function rizik(
  kategorija: Rizik["kategorija"],
  path: string[],
  vjerojatnost: Rizik["vjerojatnost"],
  posljedica: Rizik["posljedica"],
  id: string
): Rizik {
  const { naziv, punaStaza } = nadjiNaziv(kategorija, path);
  return {
    id,
    kategorija,
    path,
    naziv,
    punaStaza,
    vjerojatnost,
    posljedica,
    ozoPrijedlog: "",
    lijecnickiPregled: "",
  };
}

function posao(p: Omit<Posao, "posebniUvjeti" | "posebniUvjetiNapomena">): Posao {
  return { ...p, posebniUvjeti: false, posebniUvjetiNapomena: "" };
}

export const DEMO_POSLOVI: Posao[] = [
  posao({
    id: "p-upravljanje",
    naziv: "Upravljanje i organizacija rada",
    radnaMjestaIds: ["rm-direktor"],
    radnaOpremaIds: ["ro-racunalo"],
    rizici: [
      rizik("napor", ["2", "2.4", "2.4.1"], 2, 2, "r1"),
      rizik("napor", ["2", "2.7", "2.7.1"], 2, 1, "r2"),
    ],
  }),
  posao({
    id: "p-administracija",
    naziv: "Administrativno-uredski poslovi",
    radnaMjestaIds: ["rm-administrator", "rm-direktor"],
    radnaOpremaIds: ["ro-racunalo", "ro-printer"],
    rizici: [rizik("napor", ["3"], 2, 1, "r3")],
  }),
  posao({
    id: "p-prodaja",
    naziv: "Prodaja na malo",
    radnaMjestaIds: ["rm-prodavac"],
    radnaOpremaIds: ["ro-blagajna"],
    rizici: [
      rizik("napor", ["1", "1.1", "1.1.2"], 2, 1, "r4"),
      rizik("napor", ["2", "2.7", "2.7.6"], 2, 1, "r5"),
    ],
  }),
  posao({
    id: "p-pecenje",
    naziv: "Rad na pekarskoj peći (pečenje)",
    radnaMjestaIds: ["rm-pekar"],
    radnaOpremaIds: ["ro-pekarska-pec"],
    rizici: [
      rizik("opasnost", ["5", "5.1"], 2, 2, "r6"),
      rizik("stetnost", ["3", "3.4", "3.4.2"], 2, 2, "r7"),
      rizik("napor", ["1", "1.2", "1.2.3"], 2, 1, "r8"),
    ],
  }),
  posao({
    id: "p-tijesto",
    naziv: "Priprema i miješenje tijesta",
    radnaMjestaIds: ["rm-pekar"],
    radnaOpremaIds: ["ro-mikser", "ro-razvlakacica"],
    rizici: [
      rizik("opasnost", ["1", "1.2"], 2, 2, "r9"),
      rizik("napor", ["1", "1.1", "1.1.2"], 3, 1, "r10"),
    ],
  }),
  posao({
    id: "p-skladistenje",
    naziv: "Skladištenje i zaprimanje robe",
    radnaMjestaIds: ["rm-skladistar", "rm-vozac"],
    radnaOpremaIds: ["ro-paletni-viljuskar", "ro-hladnjaca"],
    rizici: [
      rizik("opasnost", ["2", "2.2"], 2, 2, "r11"),
      rizik("napor", ["1", "1.2", "1.2.3"], 3, 2, "r12"),
    ],
  }),
  posao({
    id: "p-dostava",
    naziv: "Dostava robe vozilom",
    radnaMjestaIds: ["rm-vozac"],
    radnaOpremaIds: ["ro-dostavno-vozilo"],
    rizici: [
      rizik("opasnost", ["1", "1.3", "1.3.1"], 2, 3, "r13"),
      rizik("napor", ["2", "2.4", "2.4.2"], 2, 2, "r14"),
    ],
  }),
  posao({
    id: "p-ciscenje",
    naziv: "Čišćenje i održavanje prostora",
    radnaMjestaIds: ["rm-cistac", "rm-pekar"],
    radnaOpremaIds: ["ro-usisavac"],
    rizici: [
      rizik("stetnost", ["1", "1.3"], 2, 2, "r15"),
      rizik("opasnost", ["2", "2.1", "2.1.1"], 2, 1, "r16"),
    ],
  }),
];

export const DEMO_RADNA_OPREMA = BASE_RADNA_OPREMA;

export const DEMO_MJERE_PLANA: MjeraPlana[] = [
  {
    id: "m1",
    posaoId: "p-pecenje",
    mjera: "Nabava toplinski otpornih rukavica i provjera ispravnosti termoizolacije peći",
    rok: "u roku 30 dana",
    odgovornaOsoba: "Direktor",
    kontrola: "Vizualna kontrola pri svakoj smjeni, evidencija u knjizi održavanja",
  },
  {
    id: "m2",
    posaoId: "p-dostava",
    mjera: "Dodatna edukacija defenzivne vožnje za vozače dostavnih vozila",
    rok: "u roku 60 dana",
    odgovornaOsoba: "Direktor",
    kontrola: "Potvrda o završenoj edukaciji, godišnja provjera",
  },
];
