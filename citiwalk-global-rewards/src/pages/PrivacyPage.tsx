import { LegalDocument } from "@/components/content/LegalDocument";
import { Seo } from "@/components/seo/Seo";

const sections = [
  { title: "Information overview", body: "The final privacy notice will explain what information is collected, why it is required, and which processing basis applies." },
  { title: "Use and retention", body: "Approved details covering purpose limitation, storage, retention, and deletion practices will be published here before data collection begins." },
  { title: "Sharing and safeguards", body: "This section is reserved for reviewed disclosures about service providers, international processing, and technical safeguards." },
  { title: "Your choices", body: "Applicable privacy rights, preference controls, contact methods, and escalation paths will be clearly documented in the final policy." },
];

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy" path="/privacy" description="Privacy policy for CITIWALK Global Rewards." />
      <LegalDocument eyebrow="Privacy" title="Privacy Policy" introduction="A privacy-first policy surface prepared for reviewed data practices and participant rights." sections={sections} />
    </>
  );
}
