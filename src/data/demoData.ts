import type {
  ErgonomijaOdgovor,
  Ispitivanje,
  MjeraPlana,
  Poslodavac,
  Posao,
  RadnoMjesto,
  Rizik,
} from "../types";
import { nadjiNaziv } from "./prilogIII";
import { BASE_RADNA_OPREMA } from "./baseRadnaOprema";
import { ERGONOMIJA_KATEGORIJE } from "./ergonomijaKategorije";

const ERGONOMIJA_SVE_DA: Record<string, ErgonomijaOdgovor> = Object.fromEntries(
  ERGONOMIJA_KATEGORIJE.map((kategorija) => [kategorija, { zadovoljava: "da", napomena: "" }])
);

// PRIMJER, nije stručna procjena. Svi podaci su izmišljeni radi prikaza mogućnosti alata
// (naročito zaslona "Poslovi" - M:N veza radno mjesto <-> posao). Ocjene vjerojatnosti/posljedice
// i predložena OZO/norme/točke Pravilnika su ilustrativne i označene za provjeru - vidi banner u
// aplikaciji i DOMAIN_NOTES.md.

// Verzija primjera. Kad se primjer promijeni, podigni ovaj broj: korisnici koji nisu ništa
// mijenjali automatski dobivaju novi primjer pri sljedećem otvaranju (vidi src/state/store.ts).
export const PRIMJER_VERZIJA = 3;

export const DEMO_POSLODAVAC: Poslodavac = {
  naziv: "Primjer d.o.o.",
  djelatnost: "Proizvodnja i prodaja pekarskih proizvoda (pekara s trgovinom i dostavom)",
  lokacije: ["Pekara i prodavaonica, Zagreb", "Skladište sirovina, Zagreb"],
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

type RizikDopuna = Partial<
  Pick<
    Rizik,
    | "moguciDogadjaj"
    | "tockaPravilnika"
    | "ozoPrijedlog"
    | "ozoNijePotrebna"
    | "ozoNorma"
    | "lijecnickiPregled"
  >
>;

function rizik(
  kategorija: Rizik["kategorija"],
  path: string[],
  vjerojatnost: Rizik["vjerojatnost"],
  posljedica: Rizik["posljedica"],
  id: string,
  dopuna: RizikDopuna = {}
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
    moguciDogadjaj: "",
    tockaPravilnika: "",
    ozoPrijedlog: "",
    ozoNijePotrebna: false,
    ozoNorma: "",
    lijecnickiPregled: "",
    ...dopuna,
  };
}

function posao(
  p: Omit<
    Posao,
    "posebniUvjeti" | "posebniUvjetiNapomena" | "koristiRacunalo4h" | "ergonomijaOdgovori"
  > & {
    koristiRacunalo4h?: boolean;
    posebniUvjeti?: boolean;
    posebniUvjetiNapomena?: string;
    ergonomijaOdgovori?: Record<string, ErgonomijaOdgovor>;
  }
): Posao {
  return {
    ...p,
    posebniUvjeti: p.posebniUvjeti ?? false,
    posebniUvjetiNapomena: p.posebniUvjetiNapomena ?? "",
    koristiRacunalo4h: p.koristiRacunalo4h ?? false,
    ergonomijaOdgovori: p.ergonomijaOdgovori ?? {},
  };
}

export const DEMO_POSLOVI: Posao[] = [
  posao({
    id: "p-upravljanje",
    naziv: "Upravljanje i organizacija rada",
    radnaMjestaIds: ["rm-direktor"],
    radnaOpremaIds: ["ro-racunalo"],
    koristiRacunalo4h: true,
    ergonomijaOdgovori: ERGONOMIJA_SVE_DA,
    rizici: [
      rizik("napor", ["2", "2.4", "2.4.1"], 2, 2, "r1", {
        moguciDogadjaj: "psihički pritisak i stres zbog odgovornosti za poslovne rezultate i zaposlenike",
        ozoNijePotrebna: true,
      }),
      rizik("napor", ["2", "2.7", "2.7.1"], 2, 1, "r2", {
        moguciDogadjaj: "umor i pad koncentracije zbog opsega poslovnih obaveza",
        ozoNijePotrebna: true,
      }),
    ],
  }),
  posao({
    id: "p-administracija",
    naziv: "Administrativno-uredski poslovi",
    radnaMjestaIds: ["rm-administrator", "rm-direktor"],
    radnaOpremaIds: ["ro-racunalo", "ro-printer"],
    koristiRacunalo4h: true,
    ergonomijaOdgovori: ERGONOMIJA_SVE_DA,
    rizici: [
      rizik("napor", ["3"], 2, 1, "r3", {
        moguciDogadjaj: "zamor očiju i glavobolja pri dužem radu na računalu",
        ozoNijePotrebna: true,
      }),
    ],
  }),
  posao({
    id: "p-prodaja",
    naziv: "Prodaja na malo",
    radnaMjestaIds: ["rm-prodavac"],
    radnaOpremaIds: ["ro-blagajna"],
    rizici: [
      rizik("napor", ["1", "1.1", "1.1.2"], 2, 1, "r4", {
        moguciDogadjaj: "bol u leđima i nogama zbog dugotrajnog stajanja na prodajnom mjestu",
        ozoNijePotrebna: true,
      }),
      rizik("napor", ["2", "2.7", "2.7.6"], 2, 1, "r5", {
        moguciDogadjaj: "psihičko opterećenje pri komunikaciji sa zahtjevnim strankama",
        ozoNijePotrebna: true,
      }),
    ],
  }),
  posao({
    id: "p-pecenje",
    naziv: "Rad na pekarskoj peći (pečenje)",
    radnaMjestaIds: ["rm-pekar"],
    radnaOpremaIds: ["ro-pekarska-pec"],
    rizici: [
      rizik("opasnost", ["5", "5.1"], 2, 2, "r6", {
        moguciDogadjaj: "opekline ruku i podlaktica pri vađenju lima iz peći",
        ozoPrijedlog:
          "Zaštitne rukavice – toplinski rizici; Zaštitna odjeća – toplina i plamen",
        ozoNorma: "HRN EN 407; HRN EN ISO 11612",
      }),
      rizik("stetnost", ["3", "3.4", "3.4.2"], 2, 2, "r7", {
        moguciDogadjaj: "toplinski udar ili dehidracija zbog rada u vrućem okruženju pored peći",
        ozoNijePotrebna: true,
        tockaPravilnika: "18 ili sljedeće, PROVJERITI",
      }),
      rizik("napor", ["1", "1.2", "1.2.3"], 2, 1, "r8", {
        moguciDogadjaj: "ozljeda leđa pri podizanju vreća brašna i kalupa s pecivom",
        ozoNijePotrebna: true,
      }),
    ],
  }),
  posao({
    id: "p-tijesto",
    naziv: "Priprema i miješenje tijesta",
    radnaMjestaIds: ["rm-pekar"],
    radnaOpremaIds: ["ro-mikser", "ro-razvlakacica"],
    rizici: [
      rizik("opasnost", ["1", "1.2"], 2, 2, "r9", {
        moguciDogadjaj: "nagnječenje ili zahvat prstiju pokretnim dijelovima miješalice",
        ozoPrijedlog: "Zaštitna obuća; Odjeća bez slobodnih dijelova",
        ozoNorma: "HRN EN ISO 20345",
      }),
      rizik("napor", ["1", "1.1", "1.1.2"], 3, 1, "r10", {
        moguciDogadjaj: "bol u leđima i nogama zbog dugotrajnog stajanja pri miješenju tijesta",
        ozoPrijedlog: "Zaštitna obuća",
        ozoNorma: "HRN EN ISO 20345",
      }),
    ],
  }),
  posao({
    id: "p-skladistenje",
    naziv: "Skladištenje i zaprimanje robe",
    radnaMjestaIds: ["rm-skladistar", "rm-vozac"],
    radnaOpremaIds: ["ro-paletni-viljuskar", "ro-hladnjaca"],
    rizici: [
      rizik("opasnost", ["2", "2.2"], 2, 2, "r11", {
        moguciDogadjaj: "udarac robom koja padne s regala pri skladištenju",
        ozoPrijedlog: "Zaštitne rukavice – mehanički rizici; Zaštitna obuća",
        ozoNorma: "HRN EN 388; HRN EN ISO 20345",
      }),
      rizik("napor", ["1", "1.2", "1.2.3"], 3, 2, "r12", {
        moguciDogadjaj: "ozljeda leđa pri ručnom podizanju i prenošenju tereta u skladištu",
        ozoPrijedlog: "Zaštitne rukavice – mehanički rizici; Zaštitna obuća",
        ozoNorma: "HRN EN 388; HRN EN ISO 20345",
        tockaPravilnika: "16 – teško fizičko naprezanje",
        lijecnickiPregled: "Pregled kralježnice / lokomotornog sustava",
      }),
    ],
  }),
  posao({
    id: "p-dostava",
    naziv: "Dostava robe vozilom",
    radnaMjestaIds: ["rm-vozac"],
    radnaOpremaIds: ["ro-dostavno-vozilo"],
    rizici: [
      rizik("opasnost", ["1", "1.3", "1.3.1"], 2, 3, "r13", {
        moguciDogadjaj: "prometna nesreća pri dostavi robe vozilom",
        ozoNijePotrebna: true,
        lijecnickiPregled: "vozački pregled (propis o sigurnosti prometa), PROVJERITI",
      }),
      rizik("napor", ["2", "2.4", "2.4.2"], 2, 2, "r14", {
        moguciDogadjaj:
          "stres i umor zbog odgovornosti za sigurnu vožnju i poštivanje rokova dostave",
        ozoNijePotrebna: true,
      }),
    ],
  }),
  posao({
    id: "p-ciscenje",
    naziv: "Čišćenje i održavanje prostora",
    radnaMjestaIds: ["rm-cistac", "rm-pekar"],
    radnaOpremaIds: ["ro-usisavac"],
    rizici: [
      rizik("stetnost", ["1", "1.3"], 2, 2, "r15", {
        moguciDogadjaj: "iritacija kože i dišnih putova pri radu sa sredstvima za čišćenje",
        ozoPrijedlog: "Zaštitne rukavice – kemikalije; Zaštitne naočale / vizir",
        ozoNorma: "HRN EN ISO 374-1; HRN EN 166",
        tockaPravilnika: "18 ili sljedeće, PROVJERITI",
      }),
      rizik("opasnost", ["2", "2.1", "2.1.1"], 2, 1, "r16", {
        moguciDogadjaj: "pad na mokroj ili skliskoj podlozi tijekom čišćenja",
        ozoNijePotrebna: true,
      }),
    ],
  }),
];

const DEMO_PERIODIKA: Record<string, { periodPregledaMjeseci: number; datumPosljednjegPregleda: string }> = {
  "ro-racunalo": { periodPregledaMjeseci: 24, datumPosljednjegPregleda: "2025-04-10" },
  "ro-printer": { periodPregledaMjeseci: 24, datumPosljednjegPregleda: "2025-04-10" },
  "ro-blagajna": { periodPregledaMjeseci: 12, datumPosljednjegPregleda: "2025-08-01" },
  "ro-pekarska-pec": { periodPregledaMjeseci: 12, datumPosljednjegPregleda: "2025-11-15" },
  "ro-mikser": { periodPregledaMjeseci: 12, datumPosljednjegPregleda: "2025-09-10" },
  "ro-razvlakacica": { periodPregledaMjeseci: 12, datumPosljednjegPregleda: "2025-09-10" },
  "ro-paletni-viljuskar": { periodPregledaMjeseci: 6, datumPosljednjegPregleda: "2026-03-01" },
  "ro-hladnjaca": { periodPregledaMjeseci: 24, datumPosljednjegPregleda: "2025-06-15" },
  "ro-dostavno-vozilo": { periodPregledaMjeseci: 12, datumPosljednjegPregleda: "2026-01-20" },
  "ro-usisavac": { periodPregledaMjeseci: 12, datumPosljednjegPregleda: "2025-05-20" },
};

export const DEMO_RADNA_OPREMA = BASE_RADNA_OPREMA.map((o) =>
  DEMO_PERIODIKA[o.id] ? { ...o, ...DEMO_PERIODIKA[o.id] } : o
);

export const DEMO_ISPITIVANJA: Ispitivanje[] = [
  {
    id: "isp-el",
    naziv: "Ispitivanje električnih instalacija",
    napomena: "cjelokupna instalacija pekare i skladišta — rok nije pouzdano preuzet iz propisa, PROVJERITI",
    periodMjeseci: null,
    datumPosljednjeg: "",
  },
  {
    id: "isp-oprema",
    naziv: "Ispitivanje radne opreme",
    napomena:
      "pekarska peć, miješalica za tijesto, viličar ručni (paletni) — rok nije pouzdano preuzet iz propisa, PROVJERITI",
    periodMjeseci: null,
    datumPosljednjeg: "",
  },
  {
    id: "isp-mikroklima",
    naziv: "Ispitivanje mikroklime",
    napomena: "prostor pekarnice uz peć — rok nije pouzdano preuzet iz propisa, PROVJERITI",
    periodMjeseci: null,
    datumPosljednjeg: "",
  },
];

export const DEMO_MJERE_PLANA: MjeraPlana[] = [
  {
    id: "m1",
    posaoId: "p-pecenje",
    mjera:
      "Nabava toplinski otpornih rukavica i zaštitne pregače te provjera ispravnosti termoizolacije peći",
    rok: "30 dana",
    odgovornaOsoba: "Direktor",
    kontrola: "Vizualna kontrola pri svakoj smjeni, evidencija u knjizi održavanja",
    periodika: "mjesečno",
  },
  {
    id: "m2",
    posaoId: "p-dostava",
    mjera: "Dodatna edukacija defenzivne vožnje za vozače dostavnih vozila",
    rok: "60 dana",
    odgovornaOsoba: "Direktor",
    kontrola: "Potvrda o završenoj edukaciji, godišnja provjera",
    periodika: "godišnje",
  },
  {
    id: "m3",
    posaoId: "p-skladistenje",
    mjera:
      "Obuka o pravilnom ručnom podizanju tereta, nabava pomagala za podizanje (kolica, dizalice) i ograničenje maksimalne težine tereta koji se ručno nosi",
    rok: "30 dana",
    odgovornaOsoba: "Voditelj skladišta",
    kontrola: "Provjera primjene pri redovnom obilasku skladišta, evidencija provedene obuke",
    periodika: "godišnje",
  },
];
