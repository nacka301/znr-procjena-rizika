// ─────────────────────────────────────────────────────────────────────────────
// PREPORUKE OZO PO VRSTI OPASNOSTI / ŠTETNOSTI / NAPORA (Prilog III)
//
// Ova datoteka postoji da je stručnjak zaštite na radu može mijenjati bez diranja
// ostatka koda. Ključ je "kategorija:kod" iz Priloga III, vrijednost je niz id-ova
// stavki iz src/data/ozoKatalog.ts.
//
// Traži se NAJTOČNIJI (najdulji) pogodak: za rizik na stazi 3 > 3.4 > 3.4.2 prvo se
// gleda "stetnost:3.4.2", pa "stetnost:3.4", pa "stetnost:3".
//
// Preporuke se NIKAD ne označavaju automatski - prikazuju se u ploči pod "Često za ovu
// opasnost" i stručnjak ih klikom odabire. Sve je prijedlog, oznaka PROVJERITI.
//
// Napomena: neke uobičajene mjere nisu OZO s normom (npr. "odjeća bez slobodnih
// dijelova" pri radu na strojevima ili ograničenje mase ručno nošenog tereta) - one
// pripadaju u Plan mjera, a ne u katalog OZO.
// ─────────────────────────────────────────────────────────────────────────────

export const OZO_PREPORUKE: Record<string, string[]> = {
  // ── I. OPASNOSTI ───────────────────────────────────────────────────────────
  "opasnost:1.1": ["rukavice-meh", "naocale"], // Alati (ručni, mehanizirani)
  "opasnost:1.2": ["obuca", "rukavice-meh", "naocale"], // Strojevi i oprema
  "opasnost:1.3": ["odjeca-refl", "obuca"], // Sredstva za horizontalni prijenos
  "opasnost:1.4": ["kaciga", "obuca", "odjeca-refl"], // Sredstva za vertikalni prijenos
  "opasnost:1.5": ["rukavice-meh", "obuca"], // Rukovanje predmetima
  "opasnost:1.6": ["rukavice-meh", "obuca"],
  "opasnost:2.1": ["obuca"], // Pad radnika - na istoj razini i u dubinu
  "opasnost:2.1.3": ["pojas", "kaciga", "obuca"], // Pad s visine
  "opasnost:2.1.4": ["pojas", "kaciga", "obuca"], // Pad s visine iznad 3 m
  "opasnost:2.2": ["obuca", "kaciga"], // Pad predmeta
  "opasnost:4.1": ["odjeca-topl", "naocale"], // Eksplozivne tvari
  "opasnost:4.2": ["odjeca-topl", "rukavice-topl"], // Zapaljive tvari
  "opasnost:5.1": ["rukavice-topl", "odjeca-topl", "pregaca"], // Vruće tvari
  "opasnost:5.2": ["rukavice-topl", "odjeca-vrijeme"], // Hladne tvari

  // ── II. ŠTETNOSTI ──────────────────────────────────────────────────────────
  "stetnost:1.1": ["rukavice-kem", "naocale", "maska"], // Otrovne tvari
  "stetnost:1.2": ["rukavice-kem", "naocale", "pregaca"], // Korozivi
  "stetnost:1.3": ["rukavice-kem", "naocale"], // Nadražljivci
  "stetnost:1.4": ["maska"], // Zagušljivci
  "stetnost:1.5": ["maska", "rukavice-kem"], // Senzibilizatori
  "stetnost:1.6": ["maska", "naocale"], // Fibrogeni
  "stetnost:1.7": ["maska", "rukavice-kem"], // Mutageni
  "stetnost:1.8": ["maska", "rukavice-kem"], // Karcinogeni
  "stetnost:1.9": ["maska", "rukavice-kem"], // Teratogeni
  "stetnost:2": ["rukavice-kem", "maska"], // Biološke štetnosti
  "stetnost:3.1": ["sluh"], // Buka
  "stetnost:3.2": ["rukavice-meh"], // Vibracije
  "stetnost:3.4.1": ["odjeca-vrijeme"], // Rad na otvorenom
  "stetnost:3.4.2": ["odjeca-topl", "rukavice-topl"], // Vrući okoliš
  "stetnost:3.4.5": ["odjeca-vrijeme", "rukavice-topl"], // Hladan okoliš
  "stetnost:3.5": ["pregaca"], // Ionizirajuće zračenje
  "stetnost:3.6.1": ["naocale", "odjeca-vrijeme"], // UV zračenje
  "stetnost:3.6.2": ["naocale", "odjeca-topl"], // Toplinsko zračenje
  "stetnost:3.6.4": ["naocale"], // Lasersko zračenje

  // ── III. NAPORI ────────────────────────────────────────────────────────────
  "napor:1.1.2": ["obuca"], // Stalno stajanje
  "napor:1.1.4": ["obuca"], // Čučanje, klečanje
  "napor:1.2.3": ["rukavice-meh", "obuca"], // Dizanje i nošenje tereta
  "napor:1.2.4": ["rukavice-meh", "obuca"], // Guranje i vučenje tereta
  "napor:1.2.5": ["rukavice-meh", "obuca"], // Težak fizički rad
  "napor:2.3.1": ["odjeca-vrijeme", "obuca"], // Terenski rad
  "napor:2.6.3": ["sluh"], // Buka kao napor
};

/**
 * Preporuke za rizik: traži se najdulji (najtočniji) pogodak po stazi Priloga III,
 * najviše 3 stavke. Nikad se ne označavaju automatski.
 */
export function preporuceneOzoStavke(kategorija: string, path: string[]): string[] {
  // Kodovi u stazi su već puni ("3", "3.4", "3.4.2"), pa idemo od zadnjeg prema prvom.
  for (let i = path.length - 1; i >= 0; i--) {
    const nadjeno = OZO_PREPORUKE[`${kategorija}:${path[i]}`];
    if (nadjeno) return nadjeno.slice(0, 3);
  }
  return [];
}
