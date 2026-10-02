import { STORE_VERSION } from "../state/store";
import type { PodaciStanja } from "../state/store";

// Spremanje procjene u datoteku na računalu. Čišćenje preglednika briše localStorage, pa je
// datoteka jedini način da rad preživi. Format je namjerno običan JSON s poljem version, da ga
// kasnije verzije alata mogu prepoznati i normalizirati.

const OZNAKA_ALATA = "znr-procjena-rizika";

export interface ZapisProcjene {
  app: string;
  version: number;
  spremljeno: string;
  podaci: PodaciStanja;
}

function datumDanas(): string {
  const d = new Date();
  const dvije = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dvije(d.getMonth() + 1)}-${dvije(d.getDate())}`;
}

/** "Primjer d.o.o." -> "primjer-d-o-o"; bez naziva -> "nacrt". */
function slug(naziv: string): string {
  const osnova = (naziv ?? "")
    .trim()
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/đ/g, "d")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return osnova || "nacrt";
}

export function nazivDatotekeStanja(nazivPoslodavca: string): string {
  return `procjena-rizika-${slug(nazivPoslodavca)}-${datumDanas()}.json`;
}

export function zapisProcjene(podaci: PodaciStanja): ZapisProcjene {
  return {
    app: OZNAKA_ALATA,
    version: STORE_VERSION,
    spremljeno: new Date().toISOString(),
    podaci,
  };
}

export async function spremiStanjeUDatoteku(podaci: PodaciStanja) {
  const tekst = JSON.stringify(zapisProcjene(podaci), null, 2);
  const blob = new Blob([tekst], { type: "application/json;charset=utf-8" });
  const { saveAs } = await import("file-saver");
  saveAs(blob, nazivDatotekeStanja(podaci.poslodavac?.naziv ?? ""));
}

/** Neispravna datoteka javlja razumljivu poruku; aplikacija se ne smije srušiti. */
export class NeispravnaDatoteka extends Error {}

export function procitajZapis(tekst: string): PodaciStanja {
  let raw: unknown;
  try {
    raw = JSON.parse(tekst);
  } catch {
    throw new NeispravnaDatoteka("Datoteka nije ispravan JSON.");
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new NeispravnaDatoteka("Datoteka ne sadrži zapis procjene.");
  }

  const zapis = raw as Partial<ZapisProcjene>;
  if (typeof zapis.version !== "number") {
    throw new NeispravnaDatoteka("Datoteka nema oznaku verzije (version) - nije iz ovog alata.");
  }
  if (zapis.version > STORE_VERSION) {
    throw new NeispravnaDatoteka(
      `Datoteka je iz novije verzije alata (verzija ${zapis.version}, ovdje ${STORE_VERSION}).`
    );
  }

  const podaci = zapis.podaci as Partial<PodaciStanja> | undefined;
  if (!podaci || typeof podaci !== "object" || Array.isArray(podaci)) {
    throw new NeispravnaDatoteka("Datoteka ne sadrži podatke procjene.");
  }
  // Minimalna struktura: poslodavac kao objekt i poslovi kao niz. Sve ostalo nedostajuće
  // nadoknađuje normalizacija u trgovini stanja.
  if (!podaci.poslodavac || typeof podaci.poslodavac !== "object") {
    throw new NeispravnaDatoteka("U datoteci nema podataka o poslodavcu.");
  }
  if (!Array.isArray(podaci.poslovi)) {
    throw new NeispravnaDatoteka("U datoteci nema popisa poslova.");
  }

  return podaci as PodaciStanja;
}

export async function ucitajStanjeIzDatoteke(datoteka: File): Promise<PodaciStanja> {
  let tekst: string;
  try {
    tekst = await datoteka.text();
  } catch {
    throw new NeispravnaDatoteka("Datoteku nije bilo moguće pročitati.");
  }
  return procitajZapis(tekst);
}
