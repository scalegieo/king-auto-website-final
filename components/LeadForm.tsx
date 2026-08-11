"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SUCCESS_MESSAGE =
  "Thank you! We've received your request and will contact you shortly.";
const ERROR_MESSAGE = "Something went wrong. Please try again.";

const VEHICLE_OPTIONS = [
  "SUV / Crossover",
  "Sedan",
  "Truck",
  "Coupe / Sports",
  "Electric / Hybrid",
  "Not sure yet",
];

const CREDIT_RANGES = [
  "Excellent (720+)",
  "Good (680–719)",
  "Fair (620–679)",
  "Building credit",
  "Prefer not to say",
];

interface FloatingFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
}: FloatingFieldProps) {
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

interface FloatingSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}

function FloatingSelect({
  id,
  label,
  value,
  onChange,
  options,
  required,
}: FloatingSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full appearance-none rounded-lg bg-charcoal-950/60 border border-white/15 px-4 pt-6 pb-2 text-white outline-none transition-colors focus:border-king-gold focus:ring-1 focus:ring-king-gold"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-charcoal-900">
            {opt}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          value
            ? "top-2.5 text-[11px] text-king-gold"
            : "top-1/2 -translate-y-1/2 text-neutral-400 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-king-gold"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

export function LeadForm({
  defaultInterest,
  onClose,
}: {
  defaultInterest?: string;
  onClose?: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(defaultInterest ?? "");
  const [credit, setCredit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicleOptions = useMemo(() => {
    if (defaultInterest && !VEHICLE_OPTIONS.includes(defaultInterest)) {
      return [defaultInterest, ...VEHICLE_OPTIONS];
    }
    return VEHICLE_OPTIONS;
  }, [defaultInterest]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const payload = {
        formType: "quick_match" as const,
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicleInterest: interest.trim(),
        creditScore: credit.trim(),
      };

      const res = await fetch("/api/leads/quick-match", {
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
      setInterest(defaultInterest ?? "");
      setCredit("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card strong className="p-6 sm:p-8 lg:p-10">
        <BrandLogo size="md" className="mb-6 max-w-[160px]" />
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-king-gold mb-3">
            60-second match
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Find Your Ride in 60 Seconds.
          </h2>
          <p className="mt-3 text-neutral-400 max-w-lg">
            Tell us what you&apos;re after — we&apos;ll check Havana St inventory
            and financing in one pass.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <FloatingField
            id="lead-name"
            label="Full name"
            value={name}
            onChange={setName}
            required
          />
          <FloatingField
            id="lead-phone"
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            required
          />
          <div className="sm:col-span-2">
            <FloatingField
              id="lead-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
          </div>
          <FloatingSelect
            id="lead-interest"
            label="Vehicle interest"
            value={interest}
            onChange={setInterest}
            options={vehicleOptions}
            required
          />
          <FloatingSelect
            id="lead-credit"
            label="Credit score range"
            value={credit}
            onChange={setCredit}
            options={CREDIT_RANGES}
            required
          />
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
              showPlus
              disabled={submitting}
              className="w-full sm:w-auto [&_button]:flex-1 sm:[&_button]:flex-none"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              )}
              {submitting ? "Submitting..." : "Check Availability"}
            </Button>
            <p className="mt-3 text-xs text-neutral-500">
              By submitting, you agree to be contacted about inventory and
              financing. No spam.
            </p>
          </div>
        </form>
        {onClose && success && (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
