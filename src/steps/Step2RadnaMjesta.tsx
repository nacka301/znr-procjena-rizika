import { Plus, Trash2 } from "lucide-react";
import { useStore } from "../state/store";
import { useNav } from "../state/navigacija";
import PageHeader from "../components/PageHeader";
import { Card, CardBody, CardHeader, EmptyState } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/field";
import { Table, Td, Th, TableWrap } from "../components/ui/table";
import { MobileCard, MobileField } from "../components/ui/mobileCard";
import { useToast } from "../components/ui/toast";
import { KLASA_FOKUSA, useFokusRef } from "../lib/fokus";
import { cn } from "../lib/utils";
import type { RadnoMjesto } from "../types";

export default function Step2RadnaMjesta() {
  const radnaMjesta = useStore((s) => s.radnaMjesta);
  const addRadnoMjesto = useStore((s) => s.addRadnoMjesto);
  const updateRadnoMjesto = useStore((s) => s.updateRadnoMjesto);
  const removeRadnoMjesto = useStore((s) => s.removeRadnoMjesto);
  const { fokus } = useNav();
  const { prikazi } = useToast();

  const ukupno = radnaMjesta.reduce((zbroj, rm) => zbroj + rm.brojRadnika, 0);

  function ukloni(rm: RadnoMjesto) {
    removeRadnoMjesto(rm.id);
    prikazi(`Uklonjeno radno mjesto „${rm.naziv || "bez naziva"}”.`, {
      oznaka: "Poništi",
      onClick: () => addRadnoMjesto(rm.naziv, rm.brojRadnika),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Korak 2 · Prikupljanje podataka"
        naslov="Radna mjesta"
        opis="Radno mjesto je organizacijska jedinica (npr. „prodavač”, „pekar”). Poslove koje se na njemu obavljaju povezujete u koraku 3 — jedno radno mjesto može obuhvaćati više poslova, a isti posao mogu obavljati radnici na različitim radnim mjestima."
      />

      <Card>
        <CardHeader
          title="Popis radnih mjesta"
          description={`${radnaMjesta.length} radnih mjesta · ${ukupno} radnika ukupno`}
          actions={
            <Button variant="primary" size="sm" onClick={() => addRadnoMjesto("", 1)}>
              <Plus />
              Dodaj radno mjesto
            </Button>
          }
        />
        <CardBody className="p-0">
          {radnaMjesta.length === 0 ? (
            <div className="p-4">
              <EmptyState>Nema unesenih radnih mjesta.</EmptyState>
            </div>
          ) : (
            <>
              {/* ≥768px: tablica */}
              <TableWrap className="hidden md:block">
                <Table>
                  <thead>
                    <tr>
                      <Th>Naziv radnog mjesta</Th>
                      <Th className="w-[140px]">Broj radnika</Th>
                      <Th className="w-[60px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {radnaMjesta.map((rm) => (
                      <RedakRadnogMjesta
                        key={rm.id}
                        rm={rm}
                        fokusirano={fokus?.radnoMjestoId === rm.id}
                        onUpdate={(patch) => updateRadnoMjesto(rm.id, patch)}
                        onUkloni={() => ukloni(rm)}
                      />
                    ))}
                  </tbody>
                </Table>
              </TableWrap>

              {/* <768px: kartice */}
              <div className="flex flex-col gap-2 p-3 md:hidden">
                {radnaMjesta.map((rm) => (
                  <MobileCard
                    key={rm.id}
                    akcije={
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label="Ukloni radno mjesto"
                        onClick={() => ukloni(rm)}
                      >
                        <Trash2 />
                      </Button>
                    }
                  >
                    <MobileField oznaka="Naziv radnog mjesta">
                      <Input
                        value={rm.naziv}
                        placeholder="npr. Voditelj smjene"
                        onChange={(e) => updateRadnoMjesto(rm.id, { naziv: e.target.value })}
                      />
                    </MobileField>
                    <MobileField oznaka="Broj radnika">
                      <Input
                        type="number"
                        min={0}
                        className="tabular max-w-[100px]"
                        value={rm.brojRadnika}
                        onChange={(e) =>
                          updateRadnoMjesto(rm.id, { brojRadnika: Number(e.target.value) || 0 })
                        }
                      />
                    </MobileField>
                  </MobileCard>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function RedakRadnogMjesta({
  rm,
  fokusirano,
  onUpdate,
  onUkloni,
}: {
  rm: RadnoMjesto;
  fokusirano: boolean;
  onUpdate: (patch: Partial<RadnoMjesto>) => void;
  onUkloni: () => void;
}) {
  const ref = useFokusRef<HTMLTableRowElement>(fokusirano);
  return (
    <tr ref={ref} className={cn("group", fokusirano && KLASA_FOKUSA)}>
      <Td>
        <Input
          value={rm.naziv}
          placeholder="npr. Voditelj smjene"
          onChange={(e) => onUpdate({ naziv: e.target.value })}
          aria-label="Naziv radnog mjesta"
        />
      </Td>
      <Td>
        <Input
          type="number"
          min={0}
          className="tabular w-[100px]"
          value={rm.brojRadnika}
          onChange={(e) => onUpdate({ brojRadnika: Number(e.target.value) || 0 })}
          aria-label="Broj radnika"
        />
      </Td>
      <Td>
        <Button
          variant="danger"
          size="icon"
          aria-label="Ukloni radno mjesto"
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          onClick={onUkloni}
        >
          <Trash2 />
        </Button>
      </Td>
    </tr>
  );
}
