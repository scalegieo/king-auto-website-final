import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

export function Card({ className, strong, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-xl shadow-glass",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
