import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
        secondary:
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        danger: "text-slate-500 hover:bg-[var(--color-risk-veliki-bg)] hover:text-[var(--color-risk-veliki)]",
        link: "h-auto whitespace-normal p-0 text-left text-[13px] font-normal leading-snug text-[var(--color-accent)] underline-offset-2 hover:underline",
      },
      size: {
        // Jedinstvena visina polja i gumba: 36px
        md: "h-9 px-3",
        sm: "h-8 px-2.5",
        icon: "size-9",
        iconSm: "size-8",
        none: "",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
