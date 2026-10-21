"use client";

import { createContext, useContext, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PreApproveModal } from "@/components/PreApproveModal";

const OpenFinanceContext = createContext<() => void>(() => {});

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

  return (
    <OpenFinanceContext.Provider value={() => setOpen(true)}>
      <div className="min-h-screen bg-black">
        <Navbar onPreApprove={() => setOpen(true)} />
        {children}
        <Footer />
        <PreApproveModal
          open={open}
          onClose={() => setOpen(false)}
          defaults={{ vehicleInterest }}
        />
      </div>
    </OpenFinanceContext.Provider>
  );
}
