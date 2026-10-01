// Klik na stavku dodaje je u postojeći tekst polja (bez duplikata); ništa se ne upisuje samo
// od sebe. Rezultat ostaje slobodno uredivo polje.

export function dodajUTekst(trenutno: string, stavka: string): string {
  const postojece = trenutno
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (postojece.includes(stavka.toLowerCase())) return trenutno;
  return trenutno.trim() ? `${trenutno.trim()}, ${stavka}` : stavka;
}

export default function PrijedlogChips({
  katalog,
  onOdaberi,
}: {
  katalog: string[];
  onOdaberi: (stavka: string) => void;
}) {
  return (
    <div className="chip-row" style={{ marginTop: 6 }}>
      {katalog.map((stavka) => (
        <button
          key={stavka}
          type="button"
          className="btn btn-sm"
          onClick={() => onOdaberi(stavka)}
        >
          + {stavka}
        </button>
      ))}
    </div>
  );
}
