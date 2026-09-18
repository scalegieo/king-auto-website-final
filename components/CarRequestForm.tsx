"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BrandLogo } from "@/components/BrandLogo";
import {
  formatLeadErrorForClient,
  submitKingAutoLead,
} from "@/lib/king-auto-leads";

const SUCCESS_MESSAGE =
  "Thanks! We'll contact you when we find a match.";
const ERROR_MESSAGE = "Something went wrong. Please try again.";

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer field-input placeholder-transparent"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-king-gold peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px]"
      >
        {label}
      </label>
    </div>
  );
}

export function CarRequestForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleWanted, setVehicleWanted] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await submitKingAutoLead({
        form_type: "vehicle_match_request",
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicle_wanted: vehicleWanted.trim(),
        budget_range: budgetRange.trim(),
        notes: notes.trim(),
      });

      setFullName("");
      setPhone("");
      setEmail("");
      setVehicleWanted("");
      setBudgetRange("");
      setNotes("");
      setSuccess(true);
    } catch (err) {
      setError(formatLeadErrorForClient(err) || ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      <Card strong className="p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6 mb-6 sm:mb-8">
          <BrandLogo size="md" className="max-w-[120px] sm:max-w-[140px] shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-king-gold mb-2">
              <Search className="w-5 h-5 shrink-0" />
              <p className="text-xs uppercase tracking-[0.2em]">
                Vehicle match request
              </p>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight text-balance">
              Didn&apos;t find the car you&apos;re looking for?
            </h2>
            <p className="mt-3 text-neutral-400 leading-relaxed">
              Tell us what you want — make, model, budget, must-haves — and
              we&apos;ll notify you when we have a match or can source one.
            </p>
          </div>
        </div>

        <form
          id="matchRequestForm"
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field
            id="match_full_name"
            label="Full name"
            value={fullName}
            onChange={setFullName}
            required
          />
          <Field
            id="match_phone"
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            required
          />
          <div className="sm:col-span-2">
            <Field
              id="match_email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="match_vehicle_wanted"
              className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              What vehicle are you looking for? *
            </label>
            <textarea
              id="match_vehicle_wanted"
              required
              rows={3}
              value={vehicleWanted}
              onChange={(e) => setVehicleWanted(e.target.value)}
              placeholder="e.g. 2019–2021 Toyota Tacoma TRD, under 80k miles, white or gray…"
              className="w-full rounded-lg bg-charcoal-950/60 border border-white/15 px-4 py-3 text-base sm:text-sm text-white placeholder:text-neutral-500 outline-none focus:border-king-gold focus:ring-1 focus:ring-king-gold resize-y min-h-[5.5rem]"
            />
          </div>
          <Field
            id="match_budget_range"
            label="Budget range (optional)"
            value={budgetRange}
            onChange={setBudgetRange}
          />
          <div className="sm:col-span-2">
            <label
              htmlFor="match_notes"
              className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              Anything else? (optional)
            </label>
            <textarea
              id="match_notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Timeline, trade-in, financing needs…"
              className="w-full rounded-lg bg-charcoal-950/60 border border-white/15 px-4 py-3 text-base sm:text-sm text-white placeholder:text-neutral-500 outline-none focus:border-king-gold focus:ring-1 focus:ring-king-gold resize-y min-h-[4rem]"
            />
          </div>
          {success && (
            <p className="sm:col-span-2 text-sm text-emerald-400">
              {SUCCESS_MESSAGE}
            </p>
          )}
          {error && (
            <p className="sm:col-span-2 text-sm text-king-red">{error}</p>
          )}
          <div className="sm:col-span-2 mt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full sm:w-auto [&_button]:flex-1 [&_button]:min-h-12 sm:[&_button]:flex-none"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              )}
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
            <p className="mt-3 text-xs text-neutral-500">
              We&apos;ll contact you about matches. No spam.
            </p>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
