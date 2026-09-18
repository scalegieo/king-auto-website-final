"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "gold";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  showPlus?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-king-red text-white hover:bg-king-red-bright border border-king-red shadow-red",
  gold: "bg-king-gold text-charcoal-950 hover:bg-king-gold-bright border border-king-gold shadow-gold",
  secondary:
    "bg-transparent text-white border border-white/25 hover:border-king-gold hover:text-king-gold",
  ghost: "bg-transparent text-white hover:bg-white/5 border border-transparent",
  outline:
    "bg-transparent text-white border border-white/80 hover:bg-white hover:text-charcoal-950",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      showPlus = false,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <span className={cn("inline-flex items-stretch gap-1", className)}>
        <button
          ref={ref}
          type={type}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 rounded-md text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-300 ease-cinema focus-ring disabled:opacity-50 disabled:pointer-events-none",
            variants[variant]
          )}
          {...props}
        >
          {children}
        </button>
        {showPlus && (
          <span
            aria-hidden
            className={cn(
              "inline-flex items-center justify-center w-11 border transition-all duration-300",
              variant === "primary"
                ? "bg-king-red border-king-red text-white"
                : variant === "gold"
                  ? "bg-king-gold border-king-gold text-charcoal-950"
                  : "border-white/25 text-white"
            )}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </span>
        )}
      </span>
    );
  }
);

Button.displayName = "Button";
