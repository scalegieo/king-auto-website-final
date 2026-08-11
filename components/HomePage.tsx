"use client";

import { useEffect, useCallback, useState } from "react";
import type { Vehicle } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { VideoScrollHero } from "@/components/VideoScrollHero";
import { QuickActions } from "@/components/QuickActions";
import { InventoryGrid } from "@/components/InventoryGrid";
import { CarRequestForm } from "@/components/CarRequestForm";
import { TrustSection } from "@/components/TrustSection";
import { VisitSection } from "@/components/VisitSection";
import { LeadForm } from "@/components/LeadForm";
import { Footer } from "@/components/Footer";
import { PreApproveModal } from "@/components/PreApproveModal";
import { AIAssistant } from "@/components/AIAssistant";

interface HomePageProps {
  vehicles: Vehicle[];
}

export function HomePage({ vehicles }: HomePageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [interest, setInterest] = useState<string | undefined>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openPreApprove = useCallback((vehicleInterest?: string) => {
    setInterest(vehicleInterest);
    setModalOpen(true);
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <Navbar onPreApprove={() => openPreApprove()} />
      <main className="relative">
        <VideoScrollHero />
        <div className="relative z-30 bg-charcoal-900">
          <p className="sr-only" data-geo-summary>
            King Auto Inc. is a used car dealership at 2180 S Havana St, Aurora,
            CO 80014, serving Denver and Aurora with premium vehicles and
            financing. Call (303) 502-3022.
          </p>
          <QuickActions />
          <InventoryGrid
            vehicles={vehicles}
            onApply={(v) =>
              openPreApprove(`${v.year} ${v.make} ${v.model}`)
            }
          />
          <section
            id="car-request"
            className="section-pad py-14 sm:py-20 md:py-24 bg-charcoal-950 border-t border-white/10"
          >
            <CarRequestForm />
          </section>
          <TrustSection />
          <VisitSection />
          <section
            id="financing"
            className="section-pad py-14 sm:py-20 md:py-28"
          >
            <div className="max-w-3xl mx-auto w-full">
              <LeadForm />
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <AIAssistant onOpenFinancing={() => openPreApprove()} />
      <PreApproveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultInterest={interest}
      />
    </div>
  );
}
