import { useEffect } from "react";
import { PageTransition } from "@/animations/PageTransition";
import { Seo } from "@/components/seo/Seo";
import { NetworkErrorState } from "@/components/errors/NetworkErrorState";
import MaintenancePage from "@/pages/MaintenancePage";
import { useParticipant } from "@/hooks/useParticipant";
import { trackCampaignEvent } from "@/services/analyticsService";
import {
  CountdownSection,
  EntryFormSection,
  FAQSection,
  HeroSection,
  HowItWorksSection,
  ParticipationTasksSection,
  PrizesSection,
} from "@/sections/home";

export default function HomePage() {
  const { settings, backendStatus, retryConnection } = useParticipant();

  useEffect(() => {
    void trackCampaignEvent("landing_page_view");
  }, []);

  if (backendStatus === "ready" && settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  if (backendStatus === "error") {
    return (
      <div className="grid min-h-[70vh] place-items-center px-gutter py-16">
        <NetworkErrorState onRetry={() => void retryConnection()} />
      </div>
    );
  }

  return (
    <PageTransition>
      <Seo path="/" />
      <HeroSection />
      <CountdownSection />
      <PrizesSection />
      <HowItWorksSection />
      <ParticipationTasksSection />
      <EntryFormSection />
      <FAQSection />
    </PageTransition>
  );
}
