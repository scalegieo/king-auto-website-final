import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl" | "hero";

const heights: Record<LogoSize, string> = {
  sm: "h-9",
  md: "h-12 sm:h-14",
  lg: "h-16 sm:h-[4.5rem]",
  xl: "h-20 sm:h-24",
  hero: "h-auto w-full max-h-[min(38vh,300px)] sm:max-h-[min(42vh,360px)]",
};

interface BrandLogoProps {
  size?: LogoSize;
  className?: string;
  linked?: boolean;
  priority?: boolean;
}

/**
 * King Auto mark — transparent PNG at /brand/logo.png
 * (use native img so alpha is never flattened by the image optimizer)
 */
export function BrandLogo({
  size = "md",
  className,
  linked = false,
  priority = false,
}: BrandLogoProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.png?v=4"
      alt="King Auto Inc."
      width={520}
      height={520}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      className={cn(
        heights[size],
        "w-auto max-w-full object-contain",
        size === "hero" ? "object-center" : "object-left",
        className
      )}
    />
  );

  if (linked) {
    return (
      <Link href="/" className="inline-flex shrink-0 focus-ring rounded-sm">
        {img}
      </Link>
    );
  }

  return img;
}
