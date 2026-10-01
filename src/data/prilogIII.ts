// Prilog III. Pravilnika o izradi procjene rizika (NN 112/14, izmjene NN 129/19 ne mijenjaju ovaj
// popis - vidi DOMAIN_NOTES.md). Potvrđeno izvorom (narodne-novine.nn.hr).
// Stablo se koristi za odabir opasnosti/štetnosti/napora pri analizi posla.

import type { KategorijaRizika } from "../types";

export interface PrilogIIINode {
  code: string;
  label: string;
  children?: PrilogIIINode[];
}

export interface PrilogIIIGrana {
  kategorija: KategorijaRizika;
  naslov: string; // "I. OPASNOSTI" itd.
  djeca: PrilogIIINode[];
}

const opasnosti: PrilogIIINode[] = [
  {
    code: "1",
    label: "Mehaničke opasnosti",
    children: [
      {
        code: "1.1",
        label: "Alati",
        children: [
          { code: "1.1.1", label: "Ručni" },
          { code: "1.1.2", label: "Mehanizirani" },
        ],
      },
      { code: "1.2", label: "Strojevi i oprema" },
      {
        code: "1.3",
        label: "Sredstva za horizontalni prijenos",
        children: [
          { code: "1.3.1", label: "Prijevozna vozila" },
          { code: "1.3.2", label: "Prijenosna sredstva" },
          { code: "1.3.3", label: "Samohodni strojevi" },
        ],
      },
      {
        code: "1.4",
        label: "Sredstva za vertikalni prijenos",
        children: [
          { code: "1.4.1", label: "Dizalice" },
          { code: "1.4.2", label: "Transporteri" },
        ],
      },
      { code: "1.5", label: "Rukovanje predmetima" },
      { code: "1.6", label: "Ostale mehaničke opasnosti" },
    ],
  },
  {
    code: "2",
    label: "Opasnosti od padova",
    children: [
      {
        code: "2.1",
        label: "Pad radnika i drugih osoba",
        children: [
          { code: "2.1.1", label: "Na istoj razini" },
          { code: "2.1.2", label: "U dubinu" },
          { code: "2.1.3", label: "S visine" },
          { code: "2.1.4", label: "S visine iznad 3 metra" },
        ],
      },
      { code: "2.2", label: "Pad predmeta" },
    ],
  },
  {
    code: "3",
    label: "Električna struja",
    children: [
      { code: "3.1", label: "Otvoreni električni krug" },
      { code: "3.2", label: "Ostale električne opasnosti" },
    ],
  },
  {
    code: "4",
    label: "Požar i eksplozija",
    children: [
      { code: "4.1", label: "Eksplozivne tvari" },
      { code: "4.2", label: "Zapaljive tvari" },
    ],
  },
  {
    code: "5",
    label: "Termičke opasnosti",
    children: [
      { code: "5.1", label: "Vruće tvari" },
      { code: "5.2", label: "Hladne tvari" },
    ],
  },
];

const stetnosti: PrilogIIINode[] = [
  {
    code: "1",
    label: "Kemijske štetnosti",
    children: [
      {
        code: "1.1",
        label: "Otrovi",
        children: [
          { code: "1.1.1", label: "Metali" },
          { code: "1.1.2", label: "Nemetali" },
          { code: "1.1.3", label: "Organski spojevi" },
        ],
      },
      {
        code: "1.2",
        label: "Korozivi",
        children: [
          { code: "1.2.1", label: "Kiseline" },
          { code: "1.2.2", label: "Lužine" },
          { code: "1.2.3", label: "Drugi korozivi" },
        ],
      },
      {
        code: "1.3",
        label: "Nadražljivci",
        children: [
          { code: "1.3.1", label: "Lako topivi u vodi" },
          { code: "1.3.2", label: "Slabo topivi u vodi" },
          { code: "1.3.3", label: "Odmašćivači" },
          { code: "1.3.4", label: "Drugi nadražljivci" },
        ],
      },
      {
        code: "1.4",
        label: "Zagušljivci",
        children: [
          { code: "1.4.1", label: "Inertni" },
          { code: "1.4.2", label: "Kemijski" },
        ],
      },
      {
        code: "1.5",
        label: "Senzibilizatori",
        children: [
          { code: "1.5.1", label: "Organske prašine biljnog porijekla" },
          { code: "1.5.2", label: "Organske prašine životinjskog porijekla" },
          { code: "1.5.3", label: "Kemijski spojevi alergogenog potencijala" },
          { code: "1.5.4", label: "Termofilne aktinomicete" },
          { code: "1.5.5", label: "Ostali senzibilizatori" },
        ],
      },
      {
        code: "1.6",
        label: "Fibrogeni",
        children: [
          { code: "1.6.1", label: "Azbest" },
          { code: "1.6.2", label: "Silicijev dioksid" },
          { code: "1.6.3", label: "Ostali fibrogeni" },
        ],
      },
      { code: "1.7", label: "Mutageni" },
      { code: "1.8", label: "Karcinogeni" },
      { code: "1.9", label: "Teratogeni" },
    ],
  },
  {
    code: "2",
    label: "Biološke štetnosti",
    children: [
      { code: "2.1", label: "Zarazni materijal" },
      { code: "2.2", label: "Zaraženi ljudi" },
      { code: "2.3", label: "Zaražene životinje" },
      { code: "2.4", label: "Opasne biljke" },
      { code: "2.5", label: "Opasne životinje" },
    ],
  },
  {
    code: "3",
    label: "Fizikalne štetnosti",
    children: [
      {
        code: "3.1",
        label: "Buka",
        children: [
          { code: "3.1.1", label: "Kontinuirana buka" },
          { code: "3.1.2", label: "Diskontinuirana buka" },
          { code: "3.1.3", label: "Impulsna buka" },
          { code: "3.1.4", label: "Ometajuća buka" },
        ],
      },
      {
        code: "3.2",
        label: "Vibracije",
        children: [
          { code: "3.2.1", label: "Vibracije na ruke" },
          { code: "3.2.2", label: "Vibracije na cijelo tijelo" },
          { code: "3.2.3", label: "Potresanja" },
        ],
      },
      {
        code: "3.3",
        label: "Promijenjeni tlak",
        children: [
          { code: "3.3.1", label: "Povišeni tlak" },
          { code: "3.3.2", label: "Sniženi tlak" },
          { code: "3.3.3", label: "Promjene tlaka" },
        ],
      },
      {
        code: "3.4",
        label: "Nepovoljni klimatski i mikroklimatski uvjeti",
        children: [
          { code: "3.4.1", label: "Rad na otvorenom" },
          { code: "3.4.2", label: "Vrući okoliš" },
          { code: "3.4.3", label: "Visoka vlažnost" },
          { code: "3.4.4", label: "Pojačano strujanje zraka" },
          { code: "3.4.5", label: "Hladan okoliš" },
          { code: "3.4.6", label: "Česte promjene temperature" },
          { code: "3.4.7", label: "Nepovoljni učinci umjetne ventilacije" },
        ],
      },
      {
        code: "3.5",
        label: "Ionizirajuće zračenje",
        children: [
          { code: "3.5.1", label: "Rendgensko zračenje" },
          { code: "3.5.2", label: "Otvoreni radioaktivni elementi" },
          { code: "3.5.3", label: "Zatvoreni radioaktivni elementi" },
        ],
      },
      {
        code: "3.6",
        label: "Neionizirajuće zračenje",
        children: [
          { code: "3.6.1", label: "UV zračenje" },
          { code: "3.6.2", label: "Toplinsko zračenje" },
          { code: "3.6.3", label: "Mikrovalno zračenje" },
          { code: "3.6.4", label: "Lasersko zračenje" },
          { code: "3.6.5", label: "Elektromagnetsko polje vrlo niskih frekvencija" },
        ],
      },
      {
        code: "3.7",
        label: "Osvijetljenost",
        children: [
          { code: "3.7.1", label: "Nedovoljna osvijetljenost" },
          { code: "3.7.2", label: "Blještanje" },
        ],
      },
      { code: "3.8", label: "Ostale fizikalne štetnosti" },
    ],
  },
];

const napori: PrilogIIINode[] = [
  {
    code: "1",
    label: "Statodinamički napori",
    children: [
      {
        code: "1.1",
        label: "Statički",
        children: [
          { code: "1.1.1", label: "Stalno sjedenje" },
          { code: "1.1.2", label: "Stalno stajanje" },
          { code: "1.1.3", label: "Pognut položaj tijela" },
          { code: "1.1.4", label: "Čučanje, klečanje" },
          { code: "1.1.5", label: "Rad u skučenom prostoru" },
          { code: "1.1.6", label: "Ruke iznad glave" },
          { code: "1.1.7", label: "Ostali statički napori" },
        ],
      },
      {
        code: "1.2",
        label: "Dinamički",
        children: [
          { code: "1.2.1", label: "Ponavljajući pokreti" },
          { code: "1.2.2", label: "Brzi rad" },
          { code: "1.2.3", label: "Dizanje i nošenje tereta" },
          { code: "1.2.4", label: "Guranje i vučenje tereta" },
          { code: "1.2.5", label: "Težak fizički rad" },
          { code: "1.2.6", label: "Ostali dinamički napori" },
        ],
      },
    ],
  },
  {
    code: "2",
    label: "Psihofiziološki napori",
    children: [
      {
        code: "2.1",
        label: "Nepovoljan ritam rada",
        children: [
          { code: "2.1.1", label: "Rad na normu" },
          { code: "2.1.2", label: "Ritam uvjetovan radnim procesom" },
          { code: "2.1.3", label: "Neujednačen ritam" },
        ],
      },
      {
        code: "2.2",
        label: "Poremećen bioritam",
        children: [
          { code: "2.2.2", label: "Noćni rad" },
          { code: "2.2.3", label: "Produljeni rad" },
        ],
      },
      {
        code: "2.3",
        label: "Remećenje socijalnih potreba",
        children: [
          { code: "2.3.1", label: "Terenski rad" },
          { code: "2.3.2", label: "Rad na daljinu" },
        ],
      },
      {
        code: "2.4",
        label: "Odgovornost za živote i materijalna dobra",
        children: [
          { code: "2.4.1", label: "Rukovođenje" },
          { code: "2.4.2", label: "Upravljanje prijevoznim sredstvima" },
        ],
      },
      { code: "2.5", label: "Visoka vjerojatnost izvanrednih događaja" },
      {
        code: "2.6",
        label: "Otežan prijam informacija",
        children: [
          { code: "2.6.1", label: "Zvučni signali i znakovi" },
          { code: "2.6.2", label: "Svjetlosni signali i znakovi" },
          { code: "2.6.3", label: "Buka" },
          { code: "2.6.4", label: "Nedovoljna osvijetljenost" },
        ],
      },
      {
        code: "2.7",
        label: "Radni zahtjevi",
        children: [
          { code: "2.7.1", label: "Neodgovarajući kvantitativni zahtjevi" },
          { code: "2.7.2", label: "Premali utjecaj na rad" },
          { code: "2.7.3", label: "Zahtjev za visokom kvalitetom rada" },
          { code: "2.7.4", label: "Izolirani rad" },
          { code: "2.7.5", label: "Monotoni rad" },
          { code: "2.7.6", label: "Komunikacija s osobama" },
        ],
      },
      {
        code: "2.8",
        label: "Maltretiranje",
        children: [
          { code: "2.8.1", label: "Mobing" },
          { code: "2.8.2", label: "Buling" },
        ],
      },
      { code: "2.9", label: "Burnout" },
      { code: "2.10", label: "Ostali psihofiziološki napori" },
    ],
  },
  { code: "3", label: "Napori vida" },
  { code: "4", label: "Napori govora" },
];

export const PRILOG_III: PrilogIIIGrana[] = [
  { kategorija: "opasnost", naslov: "I. OPASNOSTI", djeca: opasnosti },
  { kategorija: "stetnost", naslov: "II. ŠTETNOSTI", djeca: stetnosti },
  { kategorija: "napor", naslov: "III. NAPORI", djeca: napori },
];

export function nadjiNaziv(kategorija: KategorijaRizika, path: string[]): {
  naziv: string;
  punaStaza: string;
} {
  const grana = PRILOG_III.find((g) => g.kategorija === kategorija);
  if (!grana) return { naziv: "", punaStaza: "" };
  let nodes = grana.djeca;
  const dijelovi: string[] = [grana.naslov];
  let zadnjiLabel = "";
  for (const code of path) {
    const node = nodes.find((n) => n.code === code);
    if (!node) break;
    zadnjiLabel = node.label;
    dijelovi.push(`${node.code} ${node.label}`);
    nodes = node.children ?? [];
  }
  return { naziv: zadnjiLabel, punaStaza: dijelovi.join(" > ") };
}
