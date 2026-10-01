import { Plus, Trash2 } from "lucide-react";
import { useStore } from "../state/store";
import PageHeader from "../components/PageHeader";
import { Card, CardBody, CardHeader, EmptyState } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Field, Input } from "../components/ui/field";

export default function Step1Poslodavac() {
  const poslodavac = useStore((s) => s.poslodavac);
  const setPoslodavac = useStore((s) => s.setPoslodavac);
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const ukupnoRadnika = radnaMjesta.reduce((zbroj, rm) => zbroj + rm.brojRadnika, 0);

  function updateLokacija(index: number, value: string) {
    const nove = [...poslodavac.lokacije];
    nove[index] = value;
    setPoslodavac({ lokacije: nove });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Korak 1 · Opći podaci"
        naslov="Poslodavac"
        opis="Osnovni podaci o poslodavcu za kojeg se izrađuje procjena. Ulaze u uvodni dio dokumenta (cjelina 1. Opći podaci)."
      />

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Naziv poslodavca" htmlFor="naziv">
            <Input
              id="naziv"
              value={poslodavac.naziv}
              onChange={(e) => setPoslodavac({ naziv: e.target.value })}
              placeholder="npr. Primjer d.o.o."
            />
          </Field>
          <Field label="OIB" htmlFor="oib" hint="Neobavezno u prototipu.">
            <Input
              id="oib"
              value={poslodavac.oib ?? ""}
              onChange={(e) => setPoslodavac({ oib: e.target.value })}
              placeholder="11 znamenki"
            />
          </Field>
          <Field label="Pretežita djelatnost" htmlFor="djelatnost" className="sm:col-span-2">
            <Input
              id="djelatnost"
              value={poslodavac.djelatnost}
              onChange={(e) => setPoslodavac({ djelatnost: e.target.value })}
              placeholder="npr. Proizvodnja i prodaja pekarskih proizvoda"
            />
          </Field>
          <Field
            label="Ukupan broj radnika"
            htmlFor="broj-radnika"
            hint="Zbroj broja radnika po radnim mjestima — uređuje se u koraku 2."
          >
            <Input
              id="broj-radnika"
              className="tabular max-w-[140px]"
              value={ukupnoRadnika}
              disabled
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Mjesta rada / lokacije"
          description="Lokacije na kojima radnici obavljaju poslove."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPoslodavac({ lokacije: [...poslodavac.lokacije, ""] })}
            >
              <Plus />
              Dodaj lokaciju
            </Button>
          }
        />
        <CardBody className="flex flex-col gap-2">
          {poslodavac.lokacije.length === 0 ? (
            <EmptyState>Nema unesenih lokacija.</EmptyState>
          ) : (
            poslodavac.lokacije.map((lok, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={lok}
                  onChange={(e) => updateLokacija(i, e.target.value)}
                  placeholder={`Lokacija ${i + 1}`}
                  aria-label={`Lokacija ${i + 1}`}
                />
                <Button
                  variant="danger"
                  size="icon"
                  aria-label={`Ukloni lokaciju ${i + 1}`}
                  onClick={() =>
                    setPoslodavac({ lokacije: poslodavac.lokacije.filter((_, x) => x !== i) })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
