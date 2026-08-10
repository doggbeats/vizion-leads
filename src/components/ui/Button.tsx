import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-wider transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-ink hover:bg-brand-dark active:scale-[0.98]",
  outline:
    "border border-neutral-600 text-white hover:border-brand hover:text-brand active:scale-[0.98]",
  ghost: "text-neutral-300 hover:text-brand",
  dark: "bg-graphite-light text-white border border-graphite-border hover:border-brand hover:text-brand",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
};

export function buttonClassName(variant: Variant = "primary", size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button className={`${buttonClassName(variant, size)} ${className}`} {...props} />
  );
}
