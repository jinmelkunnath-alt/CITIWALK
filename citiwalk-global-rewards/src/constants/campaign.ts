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

export const entryNumberOptions = ["9214", "4837", "7562"] as const;

export const campaignFaqs: AccordionItem[] = [
  {
    id: "about",
    question: "What is CITIWALK Global Rewards?",
    answer:
      "CITIWALK Global Rewards is a premium rewards campaign experience created by CITIWALK. This interface presents the campaign journey, rewards, participation steps, and key dates in one place.",
  },
  {
    id: "participation",
    question: "How do I participate?",
    answer:
      "The planned participation journey includes the Instagram and WhatsApp steps shown on this page, followed by the entry form. These controls are currently frontend previews and do not verify or submit participation.",
  },
  {
    id: "selection",
    question: "How are winners selected?",
    answer:
      "The final winner-selection method will be published in the Official Rules before the campaign opens. No selection or lucky-number logic is active in this frontend release.",
  },
  {
    id: "multiple-entries",
    question: "Can I participate more than once?",
    answer:
      "Participation limits will be defined by the final Official Rules. The current interface does not create, store, or validate entries.",
  },
  {
    id: "announcement",
    question: "When will winners be announced?",
    answer:
      "The winner announcement is scheduled for 10 August 2026 at 4:00 PM IST, subject to the final campaign rules and any official updates from CITIWALK.",
  },
];

export type DropdownOption = {
  value: string;
  label: string;
};

export const countryOptions: DropdownOption[] = [
  { value: "india", label: "India" },
  { value: "uae", label: "United Arab Emirates" },
  { value: "singapore", label: "Singapore" },
  { value: "united-kingdom", label: "United Kingdom" },
  { value: "united-states", label: "United States" },
  { value: "canada", label: "Canada" },
];

export const stateOptions: DropdownOption[] = [
  { value: "kerala", label: "Kerala" },
  { value: "karnataka", label: "Karnataka" },
  { value: "tamil-nadu", label: "Tamil Nadu" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "delhi", label: "Delhi" },
  { value: "other", label: "Other / Not listed" },
];

export const districtOptions: DropdownOption[] = [
  { value: "kasaragod", label: "Kasaragod" },
  { value: "kannur", label: "Kannur" },
  { value: "kozhikode", label: "Kozhikode" },
  { value: "wayanad", label: "Wayanad" },
  { value: "malappuram", label: "Malappuram" },
  { value: "ernakulam", label: "Ernakulam" },
  { value: "other", label: "Other / Not listed" },
];
