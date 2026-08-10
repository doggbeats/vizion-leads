import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "brand" | "dark" | "outline";
};

const variants = {
  brand: "bg-brand text-ink",
  dark: "bg-ink/80 text-brand border border-brand/40",
  outline: "border border-neutral-600 text-neutral-200",
};

export function Badge({ variant = "brand", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
