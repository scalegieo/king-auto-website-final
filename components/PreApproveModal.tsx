"use client";

import { useEffect } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { X } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";

interface PreApproveModalProps {
  open: boolean;
  onClose: () => void;
  defaultInterest?: string;
}

export function PreApproveModal({
  open,
  onClose,
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
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
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="absolute top-4 left-4 z-10">
          <BrandLogo size="sm" className="max-w-[100px]" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-charcoal-950/60 border border-white/10 text-white hover:bg-white/10 focus-ring"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="preapprove-title" className="sr-only">
          Get pre-approved
        </h2>
        <LeadForm defaultInterest={defaultInterest} onClose={onClose} />
      </div>
    </div>
  );
}
