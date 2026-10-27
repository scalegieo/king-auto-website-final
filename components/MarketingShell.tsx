"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PreApproveModal } from "@/components/PreApproveModal";
import type { PreApproveDefaults } from "@/components/LeadForm";

type OpenFinance = (prefs?: PreApproveDefaults | string) => void;

const OpenFinanceContext = createContext<OpenFinance>(() => {});

export function useOpenFinance() {
  return useContext(OpenFinanceContext);
}

export function MarketingShell({
  children,
  vehicleInterest,
}: {
  children: React.ReactNode;
  vehicleInterest?: string;
}) {
  const [open, setOpen] = useState(false);
  const [defaults, setDefaults] = useState<PreApproveDefaults>({
    vehicleInterest,
  });

  const openFinance = useCallback(
    (prefs?: PreApproveDefaults | string) => {
      if (typeof prefs === "string") {
        setDefaults({ vehicleInterest: prefs });
      } else if (prefs) {
        setDefaults(prefs);
      } else {
        setDefaults({ vehicleInterest });
      }
      setOpen(true);
    },
    [vehicleInterest]
  );

  return (
    <OpenFinanceContext.Provider value={openFinance}>
      <div className="min-h-screen bg-black">
        <Navbar onPreApprove={() => openFinance()} />
        {children}
        <Footer />
        <PreApproveModal
          open={open}
          onClose={() => setOpen(false)}
          defaults={defaults}
        />
      </div>
    </OpenFinanceContext.Provider>
  );
}
