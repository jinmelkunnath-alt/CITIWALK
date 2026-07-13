import { LegalDocument } from "@/components/content/LegalDocument";
import { Seo } from "@/components/seo/Seo";

const sections = [
  { title: "Campaign overview", body: "Final sponsor details, campaign dates, jurisdictions, and a no-purchase statement will be published here when approved." },
  { title: "Eligibility", body: "Age, location, exclusions, and other campaign eligibility conditions will be stated precisely in the completed official rules." },
  { title: "How to participate", body: "Approved participation methods, limits, timing, and technical requirements will be added in a future implementation phase." },
  { title: "Reward and selection terms", body: "Reward descriptions, values, selection procedures, notifications, claims, and alternate handling will be documented after campaign approval." },
];

export default function OfficialRulesPage() {
  return (
    <>
      <Seo title="Official Rules" path="/official-rules" description="Official rules for CITIWALK Global Rewards." />
      <LegalDocument eyebrow="Campaign policy" title="Official Rules" introduction="A structured home for complete, jurisdiction-aware campaign rules once final mechanics are approved." sections={sections} />
    </>
  );
}
