import type { RadnaOprema } from "../types";

// Osnovni (generički) katalog radne opreme ponuđen pri izboru; stručnjak može dodati vlastitu.
export const BASE_RADNA_OPREMA: RadnaOprema[] = [
  { id: "ro-racunalo", naziv: "Računalo / radna stanica", prilagodeno: false },
  { id: "ro-printer", naziv: "Pisač / višefunkcijski uređaj", prilagodeno: false },
  { id: "ro-rucni-alat", naziv: "Ručni alat (univerzalno)", prilagodeno: false },
  { id: "ro-mehanizirani-alat", naziv: "Mehanizirani (električni) alat", prilagodeno: false },
  { id: "ro-viljuskar", naziv: "Viličar", prilagodeno: false },
  { id: "ro-paletni-viljuskar", naziv: "Viličar ručni (paletni)", prilagodeno: false },
  { id: "ro-regal", naziv: "Skladišni regal", prilagodeno: false },
  { id: "ro-dostavno-vozilo", naziv: "Dostavno vozilo (kombi)", prilagodeno: false },
  { id: "ro-osobno-vozilo", naziv: "Osobno / službeno vozilo", prilagodeno: false },
  { id: "ro-hladnjaca", naziv: "Hladnjača / rashladna komora", prilagodeno: false },
  { id: "ro-blagajna", naziv: "Blagajna (POS uređaj)", prilagodeno: false },
  { id: "ro-usisavac", naziv: "Stroj za čišćenje / usisavač", prilagodeno: false },
  { id: "ro-pekarska-pec", naziv: "Pekarska peć (konvekcijska)", prilagodeno: false },
  { id: "ro-mikser", naziv: "Miješalica za tijesto (mikser)", prilagodeno: false },
  { id: "ro-razvlakacica", naziv: "Razvlakačica za tijesto", prilagodeno: false },
  { id: "ro-ljestve", naziv: "Ljestve / penjača stepenica", prilagodeno: false },
];
