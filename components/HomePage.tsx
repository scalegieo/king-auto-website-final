"use client";

import { useEffect, useCallback, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { VideoScrollHero } from "@/components/VideoScrollHero";
import { QuickActions } from "@/components/QuickActions";
import { InventoryGrid } from "@/components/InventoryGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { PreQualifySection } from "@/components/PreQualifySection";
import { CarRequestForm } from "@/components/CarRequestForm";
import { TrustSection } from "@/components/TrustSection";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { VisitSection } from "@/components/VisitSection";
import { Footer } from "@/components/Footer";
import { PreApproveModal } from "@/components/PreApproveModal";
import { AIAssistant } from "@/components/AIAssistant";
import type { PreApproveDefaults } from "@/components/LeadForm";
import { DEALERSHIP } from "@/lib/dealership";

export function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [preDefaults, setPreDefaults] = useState<PreApproveDefaults>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openPreApprove = useCallback(
    (prefs?: PreApproveDefaults | string) => {
      if (typeof prefs === "string") {
        setPreDefaults({ vehicleInterest: prefs });
      } else {
        setPreDefaults(prefs ?? {});
      }
      setModalOpen(true);
    },
    []
  );

  return (
    <div className="bg-black min-h-screen">
      <Navbar onPreApprove={() => openPreApprove()} />
      <main className="relative">
        <VideoScrollHero />
        <div className="relative z-30 bg-charcoal-900">
          <p className="sr-only" data-geo-summary>
            {DEALERSHIP.name} is a used car dealership at{" "}
            {DEALERSHIP.addressLine1}, {DEALERSHIP.addressLine2}, serving Denver
            and Aurora with premium vehicles and financing. Call{" "}
            {DEALERSHIP.phoneDisplay}. Browse live inventory, get pre-approved
            with a monthly budget calculator, and visit our Havana Street
            showroom.
          </p>
          <QuickActions />
          <InventoryGrid />
          <HowItWorks />
          <PreQualifySection onPreApprove={openPreApprove} />
          <section
            id="car-request"
            className="section-pad py-14 sm:py-20 md:py-24 bg-charcoal-950 border-t border-white/10"
          >
            <CarRequestForm />
          </section>
          <TrustSection />
          <ReviewsCarousel />
          <VisitSection />
        </div>
      </main>
      <Footer />
      <AIAssistant onOpenFinancing={() => openPreApprove()} />
      <PreApproveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaults={preDefaults}
      />
    </div>
  );
}
