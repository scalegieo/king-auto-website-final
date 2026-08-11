"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BrandLogo } from "@/components/BrandLogo";

const SUCCESS_MESSAGE =
  "Thank you! We've received your request and will contact you shortly.";
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
        className="peer w-full rounded-lg bg-charcoal-950/60 border border-white/15 px-4 pt-6 pb-2 text-white placeholder-transparent outline-none transition-colors focus:border-king-gold focus:ring-1 focus:ring-king-gold"
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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleWant, setVehicleWant] = useState("");
  const [budget, setBudget] = useState("");
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
      const payload = {
        formType: "vehicle_match" as const,
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicleWanted: vehicleWant.trim(),
        budget: budget.trim(),
        notes: notes.trim(),
      };

      const res = await fetch("/api/leads/car-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || data.ok !== true) {
        throw new Error(
          typeof data.error === "string" ? data.error : ERROR_MESSAGE
        );
      }

      setName("");
      setPhone("");
      setEmail("");
      setVehicleWant("");
      setBudget("");
      setNotes("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGE);
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
      <Card strong className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
          <BrandLogo size="md" className="max-w-[140px] shrink-0" />
          <div>
            <div className="flex items-center gap-2 text-king-gold mb-2">
              <Search className="w-5 h-5" />
              <p className="text-xs uppercase tracking-[0.2em]">
                Vehicle match request
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Didn&apos;t find the car you&apos;re looking for?
            </h2>
            <p className="mt-3 text-neutral-400 leading-relaxed">
              Tell us what you want — make, model, budget, must-haves — and
              we&apos;ll notify you when we have a match or can source one.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field
            id="car-req-name"
            label="Full name"
            value={name}
            onChange={setName}
            required
          />
          <Field
            id="car-req-phone"
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            required
          />
          <div className="sm:col-span-2">
            <Field
              id="car-req-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="car-req-want"
              className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              What vehicle are you looking for? *
            </label>
            <textarea
              id="car-req-want"
              required
              rows={3}
              value={vehicleWant}
              onChange={(e) => setVehicleWant(e.target.value)}
              placeholder="e.g. 2019–2021 Toyota Tacoma TRD, under 80k miles, white or gray…"
              className="w-full rounded-lg bg-charcoal-950/60 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-king-gold focus:ring-1 focus:ring-king-gold resize-none"
            />
          </div>
          <Field
            id="car-req-budget"
            label="Budget range (optional)"
            value={budget}
            onChange={setBudget}
          />
          <div className="sm:col-span-2">
            <label
              htmlFor="car-req-notes"
              className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              Anything else? (optional)
            </label>
            <textarea
              id="car-req-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Timeline, trade-in, financing needs…"
              className="w-full rounded-lg bg-charcoal-950/60 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-king-gold focus:ring-1 focus:ring-king-gold resize-none"
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
              className="w-full sm:w-auto"
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
