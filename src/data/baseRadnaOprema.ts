import type { RadnaOprema } from "../types";

// Osnovni (generički) katalog radne opreme ponuđen pri izboru; stručnjak može dodati vlastitu.
const NAZIVI: { id: string; naziv: string }[] = [
  { id: "ro-racunalo", naziv: "Računalo / radna stanica" },
  { id: "ro-printer", naziv: "Pisač / višefunkcijski uređaj" },
  { id: "ro-rucni-alat", naziv: "Ručni alat (univerzalno)" },
  { id: "ro-mehanizirani-alat", naziv: "Mehanizirani (električni) alat" },
  { id: "ro-viljuskar", naziv: "Viličar" },
  { id: "ro-paletni-viljuskar", naziv: "Viličar ručni (paletni)" },
  { id: "ro-regal", naziv: "Skladišni regal" },
  { id: "ro-dostavno-vozilo", naziv: "Dostavno vozilo (kombi)" },
  { id: "ro-osobno-vozilo", naziv: "Osobno / službeno vozilo" },
  { id: "ro-hladnjaca", naziv: "Hladnjača / rashladna komora" },
  { id: "ro-blagajna", naziv: "Blagajna (POS uređaj)" },
  { id: "ro-usisavac", naziv: "Stroj za čišćenje / usisavač" },
  { id: "ro-pekarska-pec", naziv: "Pekarska peć (konvekcijska)" },
  { id: "ro-mikser", naziv: "Miješalica za tijesto (mikser)" },
  { id: "ro-razvlakacica", naziv: "Razvlakačica za tijesto" },
  { id: "ro-ljestve", naziv: "Ljestve / penjača stepenica" },
];

export const BASE_RADNA_OPREMA: RadnaOprema[] = NAZIVI.map((n) => ({
  ...n,
  prilagodeno: false,
  periodPregledaMjeseci: null,
  datumPosljednjegPregleda: "",
}));
