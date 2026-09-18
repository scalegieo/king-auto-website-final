"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { LeadForm, type PreApproveDefaults } from "@/components/LeadForm";

interface PreApproveModalProps {
  open: boolean;
  onClose: () => void;
  defaults?: PreApproveDefaults;
  /** @deprecated use defaults.vehicleInterest */
  defaultInterest?: string;
}

export function PreApproveModal({
  open,
  onClose,
  defaults,
  defaultInterest,
}: PreApproveModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const merged: PreApproveDefaults = {
    vehicleInterest: defaults?.vehicleInterest ?? defaultInterest,
    budget: defaults?.budget,
    creditScore: defaults?.creditScore,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preapprove-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[min(96dvh,100%)] overflow-y-auto overscroll-contain rounded-t-2xl sm:rounded-2xl pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 z-10 flex justify-end bg-gradient-to-b from-charcoal-950 via-charcoal-950/90 to-transparent px-3 pt-3 pb-6 pointer-events-none">
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-charcoal-950/90 border border-white/10 text-white hover:bg-white/10 focus-ring"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 id="preapprove-title" className="sr-only">
          Get pre-approved
        </h2>
        <div className="-mt-8">
          <LeadForm
            key={`${merged.vehicleInterest ?? ""}-${merged.budget ?? ""}-${merged.creditScore ?? ""}`}
            defaults={merged}
            onClose={onClose}
            modal
          />
        </div>
      </div>
    </div>
  );
}
