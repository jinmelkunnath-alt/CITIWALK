import type { AccordionItem } from "@/components/ui";

export const GIVEAWAY_END_ISO = "2026-08-10T16:00:00+05:30";

export const giveawayEndLabel = {
  date: "10 August 2026",
  time: "4:00 PM IST",
} as const;

export type Prize = {
  rank: string;
  name: string;
  featured?: boolean;
};

export const prizes: Prize[] = [
  { rank: "Grand Prize", name: "MacBook Pro M5", featured: true },
  { rank: "2nd Prize", name: "iPhone 17" },
  { rank: "3rd Prize", name: "iPhone 15" },
  { rank: "4th Prize", name: "Sony PlayStation 5 Slim Digital Edition" },
  { rank: "5th Prize", name: "Sony WH-1000XM5 Wireless Headphones" },
  { rank: "6th Prize", name: "Samsung Galaxy Watch 7 LTE (44mm)" },
  { rank: "7th Prize", name: "₹15,000 Cash" },
  { rank: "8th Prize", name: "₹8,000 Cash" },
  { rank: "9th Prize", name: "₹3,000 Cash" },
  { rank: "10th Prize", name: "₹1,000 Cash" },
];

export const campaignFaqs: AccordionItem[] = [
  {
    id: "about",
    question: "What is CITIWALK Global Rewards?",
    answer:
      "CITIWALK Global Rewards is a premium rewards campaign by CITIWALK featuring ten technology and cash prizes. This official experience manages participation, secure entry registration, and winner information.",
  },
  {
    id: "participation",
    question: "How do I participate?",
    answer:
      "Complete the Instagram follow verification and eight successful WhatsApp share verifications. The secure entry form then unlocks so you can validate your details and choose an available entry number.",
  },
  {
    id: "selection",
    question: "How are winners selected?",
    answer:
      "Ten unique winners are selected once by a permanent server-side draw using cryptographically secure randomness. One participant can receive only one prize, in the published prize order.",
  },
  {
    id: "multiple-entries",
    question: "Can I participate more than once?",
    answer:
      "No. Each normalized mobile number can create only one participant registration. Duplicate prevention is enforced again inside the final Firestore transaction.",
  },
  {
    id: "announcement",
    question: "When will winners be announced?",
    answer:
      "The winner announcement is scheduled for 10 August 2026 at 4:00 PM IST. The countdown targets that exact instant for every supported browser and timezone.",
  },
];
