"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  formatLeadErrorForClient,
  submitKingAutoLead,
} from "@/lib/king-auto-leads";

const SUCCESS_MESSAGE =
  "Thanks! We received your pre-approval request and will contact you shortly.";
const ERROR_MESSAGE = "Something went wrong. Please try again.";

const VEHICLE_OPTIONS = [
  "SUV / Crossover",
  "Sedan",
  "Truck",
  "Coupe / Sports",
  "Electric / Hybrid",
  "Not sure yet",
];

const CREDIT_OPTIONS = [
  "Excellent (720+)",
  "Good (680-719)",
  "Fair (620-679)",
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
        className="peer field-input appearance-none"
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

export type PreApproveDefaults = {
  vehicleInterest?: string;
  budget?: string;
  creditScore?: string;
};

export function LeadForm({
  defaults,
  defaultInterest,
  onClose,
  modal = false,
}: {
  defaults?: PreApproveDefaults;
  /** @deprecated use defaults.vehicleInterest */
  defaultInterest?: string;
  onClose?: () => void;
  /** When true, tighten top padding for sticky close control */
  modal?: boolean;
}) {
  const initialInterest =
    defaults?.vehicleInterest?.trim() || defaultInterest?.trim() || "";
  const initialBudget = defaults?.budget?.trim() || "";
  const initialCredit = defaults?.creditScore?.trim() || "";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleInterest, setVehicleInterest] = useState(initialInterest);
  const [budget, setBudget] = useState(initialBudget);
  const [creditScore, setCreditScore] = useState(initialCredit);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicleOptions = useMemo(() => {
    if (initialInterest && !VEHICLE_OPTIONS.includes(initialInterest)) {
      return [initialInterest, ...VEHICLE_OPTIONS];
    }
    return VEHICLE_OPTIONS;
  }, [initialInterest]);

  const creditOptions = useMemo(() => {
    if (initialCredit && !CREDIT_OPTIONS.includes(initialCredit)) {
      return [initialCredit, ...CREDIT_OPTIONS];
    }
    return CREDIT_OPTIONS;
  }, [initialCredit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await submitKingAutoLead({
        form_type: "pre_approval",
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicle_interest: vehicleInterest.trim(),
        budget: budget.trim() || "Not specified",
        credit_score: creditScore.trim(),
      });

      setFullName("");
      setPhone("");
      setEmail("");
      setVehicleInterest(initialInterest);
      setBudget(initialBudget);
      setCreditScore(initialCredit);
      setSuccess(true);
    } catch (err) {
      setError(formatLeadErrorForClient(err) || ERROR_MESSAGE);
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
      <Card
        strong
        className={`p-5 sm:p-8 lg:p-10 ${modal ? "pt-3 sm:pt-8 rounded-none sm:rounded-2xl border-0 sm:border" : ""}`}
      >
        <BrandLogo
          size="md"
          className={`mb-4 sm:mb-6 max-w-[120px] sm:max-w-[160px] ${modal ? "mt-1" : ""}`}
        />
        <div className={`mb-5 sm:mb-8 ${modal ? "pr-10" : ""}`}>
          <p className="text-xs uppercase tracking-[0.18em] text-king-gold mb-2 sm:mb-3">
            Pre-approval
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
            Get Pre-Approved Fast.
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-neutral-400 max-w-lg">
            Share a few details — we&apos;ll match you with lenders and Havana St
            inventory that fits.
          </p>
        </div>

        <form
          id="preApprovalForm"
          onSubmit={handleSubmit}
          className="grid gap-3.5 sm:gap-4 sm:grid-cols-2"
        >
          <FloatingField
            id="pre_full_name"
            label="Full name"
            value={fullName}
            onChange={setFullName}
            required
          />
          <FloatingField
            id="pre_phone"
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            required
          />
          <div className="sm:col-span-2">
            <FloatingField
              id="pre_email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
          </div>
          <FloatingSelect
            id="pre_vehicle_interest"
            label="Vehicle interest"
            value={vehicleInterest}
            onChange={setVehicleInterest}
            options={vehicleOptions}
            required
          />
          <FloatingField
            id="pre_budget"
            label="Budget (e.g. ~$400/mo)"
            value={budget}
            onChange={setBudget}
          />
          <div className="sm:col-span-2">
            <FloatingSelect
              id="pre_credit_score"
              label="Credit score range"
              value={creditScore}
              onChange={setCreditScore}
              options={creditOptions}
              required
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
          <div className="sm:col-span-2 mt-2 pb-2">
            <Button
              type="submit"
              variant="primary"
              showPlus
              disabled={submitting}
              className="w-full sm:w-auto [&_button]:flex-1 [&_button]:min-h-12 sm:[&_button]:flex-none"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              )}
              {submitting ? "Submitting..." : "Submit pre-approval"}
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
