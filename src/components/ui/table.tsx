import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function TableWrap({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full overflow-x-auto", className)} {...props} />;
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-[13px]", className)}
      {...props}
    />
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-slate-200 bg-slate-50 px-3 py-2 align-bottom text-[11px] font-semibold uppercase tracking-wide text-slate-500",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("cell-wrap border-b border-slate-100 px-3 py-2 align-top", className)}
      {...props}
    >
      {children}
    </td>
  );
}

/** Zaglavlje grupe unutar tablice (npr. naziv posla + broj rizika). */
export function GroupRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="border-y border-slate-200 bg-slate-100/70 px-3 py-1.5 text-[12px] font-semibold text-slate-700"
      >
        {children}
      </td>
    </tr>
  );
}
