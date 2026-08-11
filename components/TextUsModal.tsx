"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface TextUsModalProps {
  open: boolean;
  onClose: () => void;
}

export function TextUsModal({ open, onClose }: TextUsModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

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

  useEffect(() => {
    if (!open) {
      setSent(false);
      setFirstName("");
      setLastName("");
      setPhone("");
      setMessage("");
    }
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: wire SMS / CRM webhook
    setSent(true);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="textus-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <Card strong className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 focus-ring"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <BrandLogo size="sm" className="max-w-[88px]" />
          <div>
            <h2 id="textus-title" className="text-lg font-bold text-white">
              Text Us
            </h2>
            <p className="text-xs text-neutral-500">Quick message to the team</p>
          </div>
        </div>
        <p className="text-sm text-neutral-400 mb-6">
          Send a message — we usually reply same day.
        </p>

        {sent ? (
          <div className="text-center py-6">
            <p className="text-lg font-semibold text-white">Message received.</p>
            <p className="mt-2 text-sm text-neutral-400">
              We&apos;ll text you back shortly at the number you provided.
            </p>
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="First name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg bg-charcoal-950 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-king-gold"
              />
              <input
                required
                placeholder="Last name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg bg-charcoal-950 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-king-gold"
              />
            </div>
            <input
              required
              type="tel"
              placeholder="Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg bg-charcoal-950 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-king-gold"
            />
            <textarea
              required
              rows={4}
              placeholder="Message *"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg bg-charcoal-950 border border-white/15 px-3 py-2.5 text-sm text-white outline-none focus:border-king-gold resize-none"
            />
            <Button
              type="submit"
              variant="primary"
              showPlus
              className="w-full [&_button]:flex-1"
            >
              Send Text
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
