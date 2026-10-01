import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

/**
 * Bočna ploča s desne strane (~480px). Tablica ispod ostaje vidljiva, Esc zatvara.
 * modal=false drži pozadinu upotrebljivom, pa se tablica može listati dok je ploča otvorena.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  subtitle,
  header,
  footer,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/20 data-[state=open]:animate-[fadeIn_120ms_ease-out]" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-slate-200 bg-white shadow-lg outline-none",
            className
          )}
          aria-describedby={undefined}
        >
          <div className="flex items-start gap-3 border-b border-slate-200 px-4 py-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[15px] font-semibold leading-snug text-slate-900">
                {title}
              </Dialog.Title>
              {subtitle ? (
                <p className="mt-0.5 text-[12px] leading-snug text-slate-500">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {header}
              <Dialog.Close asChild>
                <Button variant="ghost" size="iconSm" aria-label="Zatvori ploču (Esc)">
                  <X />
                </Button>
              </Dialog.Close>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer ? (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">{footer}</div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
