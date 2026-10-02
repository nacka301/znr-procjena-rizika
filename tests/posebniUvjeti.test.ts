// Pokreće se s "npm test" (node --test, ugrađeno uklanjanje tipova - bez dodatnih ovisnosti).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  jeKonkretnaTocka,
  imaTockuPravilnika,
  opisTocke,
  jePosebniUvjeti,
} from "../src/utils/posebniUvjeti.ts";
import type { Posao, Rizik } from "../src/types.ts";

const KONKRETNE = [
  "16",
  "16 – teško fizičko naprezanje",
  "17.",
  "18/19",
  "18/24 buka",
  "1, 16, 18/19, 18/24",
  "točka 18/19",
  "t. 16",
  "18 (19)",
];

const NIJE_KONKRETNA = ["18 ili sljedeće, PROVJERITI", "treba provjeriti", "", "?", "nepoznato"];

test("jeKonkretnaTocka prepoznaje utvrđene točke Pravilnika", () => {
  for (const tekst of KONKRETNE) {
    assert.equal(jeKonkretnaTocka(tekst), true, `očekivano konkretna: ${JSON.stringify(tekst)}`);
  }
});

test("jeKonkretnaTocka odbija bilješke bez utvrđene točke", () => {
  for (const tekst of NIJE_KONKRETNA) {
    assert.equal(
      jeKonkretnaTocka(tekst),
      false,
      `očekivano NIJE konkretna: ${JSON.stringify(tekst)}`
    );
  }
});

test("jeKonkretnaTocka ne pada na praznim vrijednostima", () => {
  assert.equal(jeKonkretnaTocka(undefined), false);
  assert.equal(jeKonkretnaTocka(null), false);
  assert.equal(jeKonkretnaTocka("   "), false);
});

function rizik(naziv: string, tockaPravilnika: string): Rizik {
  return {
    id: `r-${naziv}`,
    kategorija: "napor",
    path: [],
    naziv,
    punaStaza: naziv,
    vjerojatnost: 3,
    posljedica: 3,
    moguciDogadjaj: "",
    tockaPravilnika,
    ozoPrijedlog: "",
    ozoNijePotrebna: false,
    ozoNorma: "",
    lijecnickiPregled: "",
  };
}

function posao(naziv: string, rizici: Rizik[]): Posao {
  return {
    id: `p-${naziv}`,
    naziv,
    radnaMjestaIds: [],
    radnaOpremaIds: [],
    rizici,
    posebniUvjeti: false,
    posebniUvjetiNapomena: "",
    koristiRacunalo4h: false,
    ergonomijaOdgovori: {},
  };
}

test("opisTocke ispisuje popis točaka s podtočkama", () => {
  const vrtlar = posao("Vrtlar", [rizik("Dizanje i nošenje tereta", "1, 16, 18/19, 18/24")]);
  assert.equal(imaTockuPravilnika(vrtlar), true);
  assert.equal(jePosebniUvjeti(vrtlar), true);
  assert.equal(opisTocke(vrtlar), "Dizanje i nošenje tereta – točka 1, 16, 18/19, 18/24");
});

test("rizik s neodređenom bilješkom ne uvodi posao u Prilog 9", () => {
  const pekar = posao("Pekar", [rizik("Vrući okoliš", "18 ili sljedeće, PROVJERITI")]);
  assert.equal(imaTockuPravilnika(pekar), false);
  assert.equal(jePosebniUvjeti(pekar), false);
  assert.equal(opisTocke(pekar), "");
});

test("ručna kvačica stručnjaka uključuje posao i bez točke", () => {
  const rucno = { ...posao("Čistač", [rizik("Nadražljivci", "")]), posebniUvjeti: true };
  assert.equal(jePosebniUvjeti(rucno), true);
});

test("opisTocke uzima samo rizike s konkretnom točkom", () => {
  const mijesano = posao("Skladištar", [
    rizik("Dizanje i nošenje tereta", "16 – teško fizičko naprezanje"),
    rizik("Nadražljivci", "treba provjeriti"),
  ]);
  assert.equal(opisTocke(mijesano), "Dizanje i nošenje tereta – točka 16 – teško fizičko naprezanje");
});
