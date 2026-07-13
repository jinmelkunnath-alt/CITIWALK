import { LegalDocument } from "@/components/content/LegalDocument";
import { Seo } from "@/components/seo/Seo";

const sections = [
  { title: "Scope", body: "The approved terms governing access to and use of the CITIWALK Global Rewards experience will be placed in this section." },
  { title: "Eligibility and responsibilities", body: "Campaign-specific eligibility, participant responsibilities, and applicable limitations will be documented after legal review." },
  { title: "Platform use", body: "Acceptable use, availability, intellectual property, and limitation language will be inserted into this prepared document structure." },
  { title: "Contact and updates", body: "The final policy will identify the appropriate contact channel, effective date, and process for publishing material updates." },
];

export default function TermsPage() {
  return (
    <>
      <Seo title="Terms" path="/terms" description="Terms for the CITIWALK Global Rewards experience." />
      <LegalDocument eyebrow="Legal" title="Terms" introduction="A clear, accessible document surface for the final terms governing the CITIWALK Global Rewards experience." sections={sections} />
    </>
  );
}
