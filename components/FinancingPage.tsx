"use client";

import { MarketingShell, useOpenFinance } from "@/components/MarketingShell";
import { PreQualifySection } from "@/components/PreQualifySection";
import { DEALERSHIP } from "@/lib/dealership";

function FinancingBody() {
  const openFinance = useOpenFinance();

  return (
    <main className="pt-16 sm:pt-20">
      <div className="border-b border-white/10 bg-black section-pad py-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.22em] text-king-gold mb-3">
          Financing
        </p>
        <h1 className="heading-display max-w-3xl">
          Car financing in {DEALERSHIP.city}, {DEALERSHIP.region}
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-400 text-base sm:text-lg">
          Check a monthly budget, see an estimated vehicle price, and get
          pre-approved at {DEALERSHIP.name} on Havana Street. Soft pull when you
          apply with our team.
        </p>
      </div>
      <PreQualifySection onPreApprove={openFinance} />
    </main>
  );
}

export function FinancingPage() {
  return (
    <MarketingShell>
      <FinancingBody />
    </MarketingShell>
  );
}
