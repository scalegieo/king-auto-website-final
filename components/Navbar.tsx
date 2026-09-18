"use client";

import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { DEALERSHIP } from "@/lib/dealership";

const LINKS = [
  { href: "#inventory", label: "Inventory" },
  { href: "#financing", label: "Financing" },
  { href: "#about", label: "About Us" },
  { href: "#visit", label: "Visit Us" },
  { href: "#contact", label: "Contact" },
];

interface NavbarProps {
  onPreApprove: () => void;
}

export function Navbar({ onPreApprove }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="section-pad flex items-center justify-between h-[4.25rem] sm:h-[5rem] max-w-[1400px] mx-auto gap-3 sm:gap-4">
        <BrandLogo
          size="md"
          linked
          priority
          className="max-w-[148px] sm:max-w-[180px] md:max-w-[200px]"
        />

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-300 hover:text-king-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a
            href={`tel:${DEALERSHIP.phoneTel}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4 text-king-gold" />
            {DEALERSHIP.phoneDisplay}
          </a>
          <Button variant="primary" onClick={onPreApprove}>
            Get Financed
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex min-h-11 min-w-11 items-center justify-center text-white focus-ring rounded-md"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden max-h-[min(80dvh,32rem)] overflow-y-auto border-t border-white/10 bg-black/98 backdrop-blur-md section-pad py-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-0.5">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block min-h-12 py-3.5 text-base text-neutral-200 border-b border-white/5 hover:text-king-gold"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <a
              href={`tel:${DEALERSHIP.phoneTel}`}
              className="inline-flex min-h-12 items-center text-base text-king-gold font-medium"
            >
              {DEALERSHIP.phoneDisplay}
            </a>
            <Button
              variant="primary"
              className="w-full [&_button]:flex-1 [&_button]:min-h-12"
              onClick={() => {
                setOpen(false);
                onPreApprove();
              }}
            >
              Get Financed
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
