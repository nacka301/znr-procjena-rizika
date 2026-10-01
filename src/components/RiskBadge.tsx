import type { RazinaRizika } from "../types";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

const LABEL: Record<RazinaRizika, string> = {
  mali: "Mali",
  srednji: "Srednji",
  veliki: "Veliki",
};

export default function RiskBadge({
  razina,
  className,
}: {
  razina: RazinaRizika | null;
  className?: string;
}) {
  if (!razina) {
    return (
      <Badge tone="neutral" className={cn("border-dashed", className)}>
        Nije ocijenjeno
      </Badge>
    );
  }
  return (
    <Badge tone={razina} className={className}>
      {LABEL[razina]}
    </Badge>
  );
}
