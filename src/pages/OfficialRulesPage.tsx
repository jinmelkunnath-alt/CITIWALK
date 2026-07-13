import { LegalDocument } from "@/components/content/LegalDocument";
import { Seo } from "@/components/seo/Seo";

const sections = [
  {
    title: "Sponsor and campaign period",
    body: "CITIWALK is the campaign sponsor. The winner announcement is scheduled for 10 August 2026 at 4:00 PM IST. CITIWALK may adjust dates only where reasonably required and will publish any material update through the official experience.",
  },
  {
    title: "Eligibility",
    body: "Participation is open to individuals aged 18 or older, or the age of legal majority in their location, where such campaigns are lawful. Employees, contractors directly involved in administration, and their immediate household members are not eligible. Participation is void where prohibited.",
  },
  {
    title: "How to enter",
    body: "An eligible participant must complete the required Instagram and WhatsApp verification stages, submit accurate required details, choose an available entry number, and receive a confirmed Entry ID. One registration is permitted per normalized mobile number. No purchase is required.",
  },
  {
    title: "Prizes",
    body: "Ten prizes are awarded in the published order: MacBook Pro M5; iPhone 17; iPhone 15; Sony PlayStation 5 Slim Digital Edition; Sony WH-1000XM5 Wireless Headphones; Samsung Galaxy Watch 7 LTE (44mm); and cash prizes of ₹15,000, ₹8,000, ₹3,000, and ₹1,000. Substitutions may be made only where a listed item is unavailable, using an item of reasonably comparable value.",
  },
  {
    title: "Winner selection",
    body: "Exactly ten unique winners are selected once from eligible confirmed participants by a server-side process using cryptographically secure randomness. One participant may win only one prize. The draw is permanent, auditable, and cannot be rerun through the administrator interface.",
  },
  {
    title: "Notification and claims",
    body: "Potential winners may be contacted using their registered details and asked to verify identity, eligibility, and prize-delivery information. Failure to respond within the stated claim period, inability to verify eligibility, or a material rules violation may result in disqualification as permitted by applicable law.",
  },
  {
    title: "Integrity and decisions",
    body: "CITIWALK may reject automated, fraudulent, duplicate, manipulated, or technically abusive entries. Decisions relating to campaign administration are final to the extent permitted by law, while mandatory consumer and regulatory rights remain unaffected.",
  },
];

export default function OfficialRulesPage() {
  return (
    <>
      <Seo title="Official Rules" path="/official-rules" description="Official rules for CITIWALK Global Rewards." />
      <LegalDocument
        eyebrow="Campaign policy"
        title="Official Rules"
        introduction="The official participation, prize, eligibility, and winner-selection rules for CITIWALK Global Rewards."
        sections={sections}
      />
    </>
  );
}
