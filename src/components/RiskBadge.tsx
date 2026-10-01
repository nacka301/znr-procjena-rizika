import type { RazinaRizika } from "../types";

const LABEL: Record<RazinaRizika, string> = {
  mali: "Mali rizik",
  srednji: "Srednji rizik",
  veliki: "Veliki rizik",
};

export default function RiskBadge({ razina }: { razina: RazinaRizika | null }) {
  if (!razina) {
    return <span className="badge-risk nepoznato">Nije ocijenjeno</span>;
  }
  return <span className={`badge-risk ${razina}`}>{LABEL[razina]}</span>;
}
