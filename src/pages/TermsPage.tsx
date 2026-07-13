import { LegalDocument } from "@/components/content/LegalDocument";
import { Seo } from "@/components/seo/Seo";

const sections = [
  {
    title: "Acceptance and scope",
    body: "By accessing CITIWALK Global Rewards, you agree to these Terms, the Privacy Policy, and the Official Rules. If you do not agree, do not use the registration or participation services.",
  },
  {
    title: "Account and participation integrity",
    body: "You must provide accurate information, use a mobile number you are authorized to use, and complete participation steps honestly. Automated submissions, attempts to bypass verification, duplicate registrations, abuse of rate limits, or interference with the platform are prohibited.",
  },
  {
    title: "Availability and security",
    body: "CITIWALK may temporarily restrict access for maintenance, security, legal compliance, suspected abuse, or events beyond reasonable control. We may invalidate entries created through fraud, technical manipulation, or material violation of these Terms or the Official Rules.",
  },
  {
    title: "Intellectual property",
    body: "The CITIWALK name, visual identity, interface, campaign content, and associated materials are owned by or licensed to CITIWALK. No rights are granted except the limited right to use this service for its intended purpose.",
  },
  {
    title: "Third-party services",
    body: "Instagram, WhatsApp, Firebase, and other third-party services operate under their own terms and privacy practices. CITIWALK is not responsible for third-party availability, platform policies, or content outside the CITIWALK service.",
  },
  {
    title: "Limitation and contact",
    body: "To the maximum extent permitted by law, CITIWALK is not liable for indirect or consequential loss arising from service interruption or unauthorized misuse. Mandatory consumer rights remain unaffected. Official support contact details are published through the campaign settings and legal notices.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Seo title="Terms" path="/terms" description="Terms for the CITIWALK Global Rewards experience." />
      <LegalDocument
        eyebrow="Legal"
        title="Terms"
        introduction="The conditions governing access to and responsible use of CITIWALK Global Rewards."
        sections={sections}
      />
    </>
  );
}
