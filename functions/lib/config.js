"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappVerificationOutcomes = exports.defaultCampaignSettings = exports.ipHashSalt = exports.callableSecurityOptions = exports.REQUIRED_WHATSAPP_SHARES = exports.ENTRY_CANDIDATE_TTL_MS = exports.ACTIVE_VERIFICATION_TTL_MS = exports.VERIFICATION_DELAY_MS = exports.REGION = void 0;
const params_1 = require("firebase-functions/params");
exports.REGION = "asia-south1";
exports.VERIFICATION_DELAY_MS = 5_000;
exports.ACTIVE_VERIFICATION_TTL_MS = 30_000;
exports.ENTRY_CANDIDATE_TTL_MS = 10 * 60_000;
exports.REQUIRED_WHATSAPP_SHARES = 8;
exports.callableSecurityOptions = {
    // Enforced by default in production; emulators bypass App Check automatically.
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== "true" &&
        process.env.ENFORCE_APP_CHECK !== "false",
};
exports.ipHashSalt = (0, params_1.defineSecret)("IP_HASH_SALT");
exports.defaultCampaignSettings = {
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
exports.whatsappVerificationOutcomes = [
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
];
//# sourceMappingURL=config.js.map