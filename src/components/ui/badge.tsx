import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4",
  {
    variants: {
      tone: {
        neutral: "border-slate-200 bg-slate-100 text-slate-600",
        accent: "border-[#c7d2fe] bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
        veliki:
          "border-[var(--color-risk-veliki-border)] bg-[var(--color-risk-veliki-bg)] text-[var(--color-risk-veliki)]",
        srednji:
          "border-[var(--color-risk-srednji-border)] bg-[var(--color-risk-srednji-bg)] text-[var(--color-risk-srednji)]",
        mali:
          "border-[var(--color-risk-mali-border)] bg-[var(--color-risk-mali-bg)] text-[var(--color-risk-mali)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** Oznaka za sve što je prijedlog alata, a ne pravna tvrdnja. */
export function ProvjeritiTag({ className }: { className?: string }) {
  return (
    <Badge tone="neutral" className={cn("uppercase tracking-wide", className)}>
      Provjeriti
    </Badge>
  );
}
