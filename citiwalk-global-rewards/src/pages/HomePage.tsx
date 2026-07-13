import { PageTransition } from "@/animations/PageTransition";
import { Seo } from "@/components/seo/Seo";
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
