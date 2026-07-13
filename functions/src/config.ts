import { defineSecret } from "firebase-functions/params";
import type { PublicCampaignSettings } from "./types";

export const REGION = "asia-south1";
export const VERIFICATION_DELAY_MS = 5_000;
export const ACTIVE_VERIFICATION_TTL_MS = 30_000;
export const ENTRY_CANDIDATE_TTL_MS = 10 * 60_000;
export const REQUIRED_WHATSAPP_SHARES = 8;
export const callableSecurityOptions = {
  // Enforced by default in production; emulators bypass App Check automatically.
  enforceAppCheck:
    process.env.FUNCTIONS_EMULATOR !== "true" &&
    process.env.ENFORCE_APP_CHECK !== "false",
};

export const ipHashSalt = defineSecret("IP_HASH_SALT");

export const defaultCampaignSettings: PublicCampaignSettings = {
  giveawayEndIso: "2026-08-10T16:00:00+05:30",
  winnerAnnouncementDate: "10 August 2026",
  winnerAnnouncementTime: "4:00 PM IST",
  instagramUrl: "https://instagram.com/citiwalk.official.giveaway",
  publicSiteUrl: process.env.PUBLIC_SITE_URL || "https://YOURDOMAIN.COM",
  whatsappShareMessage: [
    "🎉 I just entered the CITIWALK Global Rewards Giveaway!",
    "",
    "You can also win",
    "",
    "MacBook Pro M5",
    "iPhone 17",
    "iPhone 15",
    "PlayStation 5",
    "Cash Prizes",
    "",
    "Join now:",
    "{URL}",
  ].join("\n"),
  termsUrl: "/terms",
  privacyUrl: "/privacy",
  officialRulesUrl: "/official-rules",
  registrationOpen: true,
  maintenanceMode: false,
};

export const whatsappVerificationOutcomes = [
  false,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
] as const;
