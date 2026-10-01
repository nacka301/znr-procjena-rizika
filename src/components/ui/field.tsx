import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

/** Zajednički stil svih polja: visina 36px, isti obrub i fokus prsten. */
const polje =
  "h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 text-[13px] text-slate-900 transition-shadow placeholder:text-slate-400 focus:border-[var(--color-accent-ring)] disabled:bg-slate-50 disabled:text-slate-500";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(polje, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(polje, "cursor-pointer pr-7", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("flex items-center gap-1.5 text-[12px] font-medium text-slate-600", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {hint ? <p className="text-[12px] leading-snug text-slate-500">{hint}</p> : null}
    </div>
  );
}

/** Textarea koja raste s tekstom - redak u tablici nikad ne reže sadržaj. */
export function AutoTextarea({
  value,
  className,
  minRows = 1,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Visina se preračunava i pri promjeni teksta i pri promjeni širine stupca - inače bi redak
  // tablice, čija se širina ustali tek nakon prvog crtanja, odrezao dio teksta.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prilagodi = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    prilagodi();
    if (typeof ResizeObserver === "undefined") return;
    const promatrac = new ResizeObserver(prilagodi);
    promatrac.observe(el);
    return () => promatrac.disconnect();
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      className={cn(
        "w-full min-w-0 resize-none overflow-hidden rounded-md border border-slate-300 bg-white px-2.5 py-2 text-[13px] leading-snug text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-accent-ring)]",
        className
      )}
      {...props}
    />
  );
}
