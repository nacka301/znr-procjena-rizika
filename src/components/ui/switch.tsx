import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  label,
  hint,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors",
          checked ? "bg-[var(--color-accent)]" : "bg-slate-300"
        )}
      >
        <SwitchPrimitive.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]" />
      </SwitchPrimitive.Root>
      <label htmlFor={id} className="cursor-pointer select-none">
        <span className="block text-[13px] font-medium text-slate-800">{label}</span>
        {hint ? <span className="block text-[12px] text-slate-500">{hint}</span> : null}
      </label>
    </div>
  );
}
