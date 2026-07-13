import { LegalDocument } from "@/components/content/LegalDocument";
import { Seo } from "@/components/seo/Seo";

const sections = [
  {
    title: "Information we process",
    body: "Registration processes your full name, mobile number, Instagram ID, country, state, district, selected entry number, verification status, registration date, and Entry ID. Security records include a salted IP hash, a SHA-256 browser fingerprint, user agent, device type, and verification-attempt history.",
  },
  {
    title: "How information is used",
    body: "Information is used to validate eligibility, prevent duplicate participation, reserve entry numbers, operate the campaign, select and contact winners, provide support, measure performance, detect abuse, maintain audit records, and comply with legal obligations.",
  },
  {
    title: "Security and minimization",
    body: "Participant records are not publicly readable. Sensitive database collections are accessible only through authenticated, App Check-protected Cloud Functions. Raw IP addresses are not stored; only salted hashes are retained. Administrative access requires Firebase Authentication and a server-issued admin claim.",
  },
  {
    title: "Service providers and transfers",
    body: "CITIWALK uses Firebase and Google Cloud services for authentication, hosting, database, analytics, performance monitoring, security, and server execution. Data may be processed in locations where these providers operate, subject to applicable safeguards.",
  },
  {
    title: "Retention",
    body: "Participant and winner records are retained for the campaign, prize fulfillment, dispute handling, fraud prevention, and legal recordkeeping. Rate-limit records expire automatically. Security and audit records are retained only as long as reasonably necessary for integrity and compliance.",
  },
  {
    title: "Your choices and rights",
    body: "Depending on your location, you may request access, correction, restriction, objection, or deletion where legally available. Deletion may be limited where records are required for campaign integrity, winner administration, fraud prevention, or legal obligations.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy" path="/privacy" description="Privacy policy for CITIWALK Global Rewards." />
      <LegalDocument
        eyebrow="Privacy"
        title="Privacy Policy"
        introduction="How CITIWALK Global Rewards processes, protects, and retains participant information."
        sections={sections}
      />
    </>
  );
}
