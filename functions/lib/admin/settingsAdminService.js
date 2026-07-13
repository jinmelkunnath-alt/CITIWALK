"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminSettings = getAdminSettings;
exports.updateAdminSettings = updateAdminSettings;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("../config");
const firebase_1 = require("../firebase");
const adminConstants_1 = require("./adminConstants");
const adminUtils_1 = require("./adminUtils");
const payload_1 = require("../utils/payload");
const defaultAdminSettings = {
    giveawayName: "CITIWALK Global Rewards",
    companyName: "CITIWALK",
    announcementDate: "2026-08-10",
    countdownTarget: config_1.defaultCampaignSettings.giveawayEndIso,
    instagramUrl: config_1.defaultCampaignSettings.instagramUrl,
    whatsappShareMessage: "🎉 I just entered the CITIWALK Global Rewards Giveaway!\n\nJoin now: {URL}",
    termsUrl: "/terms",
    privacyUrl: "/privacy",
    officialRulesUrl: "/official-rules",
    supportEmail: "",
    supportPhone: "",
};
function validUrl(value) {
    if (value.startsWith("/"))
        return true;
    try {
        return new URL(value).protocol === "https:";
    }
    catch {
        return false;
    }
}
async function getAdminSettings() {
    const snapshot = await firebase_1.db.collection("settings").doc("public").get();
    const data = snapshot.data() || {};
    return {
        ...defaultAdminSettings,
        ...Object.fromEntries(Object.keys(defaultAdminSettings).map((key) => [
            key,
            typeof data[key] === "string"
                ? data[key]
                : defaultAdminSettings[key],
        ])),
        registrationOpen: typeof data.registrationOpen === "boolean" ? data.registrationOpen : true,
        maintenanceMode: typeof data.maintenanceMode === "boolean" ? data.maintenanceMode : false,
    };
}
async function updateAdminSettings(admin, input) {
    const data = (0, adminUtils_1.asRecord)(input);
    const settings = {
        giveawayName: (0, payload_1.rejectMarkup)((0, adminUtils_1.requireText)(data.giveawayName, "Giveaway name", 120), "Giveaway name"),
        companyName: (0, payload_1.rejectMarkup)((0, adminUtils_1.requireText)(data.companyName, "Company name", 120), "Company name"),
        announcementDate: (0, adminUtils_1.requireText)(data.announcementDate, "Announcement date", 20),
        countdownTarget: (0, adminUtils_1.requireText)(data.countdownTarget, "Countdown target", 40),
        instagramUrl: (0, adminUtils_1.requireText)(data.instagramUrl, "Instagram URL", 300),
        whatsappShareMessage: (0, payload_1.rejectMarkup)((0, adminUtils_1.requireText)(data.whatsappShareMessage, "WhatsApp share message", 2_000), "WhatsApp share message"),
        termsUrl: (0, adminUtils_1.requireText)(data.termsUrl, "Terms URL", 300),
        privacyUrl: (0, adminUtils_1.requireText)(data.privacyUrl, "Privacy URL", 300),
        officialRulesUrl: (0, adminUtils_1.requireText)(data.officialRulesUrl, "Official Rules URL", 300),
        supportEmail: (0, adminUtils_1.cleanOptionalString)(data.supportEmail, 200),
        supportPhone: (0, adminUtils_1.cleanOptionalString)(data.supportPhone, 30),
        registrationOpen: data.registrationOpen !== false,
        maintenanceMode: data.maintenanceMode === true,
    };
    for (const [label, value] of [
        ["Instagram URL", settings.instagramUrl],
        ["Terms URL", settings.termsUrl],
        ["Privacy URL", settings.privacyUrl],
        ["Official Rules URL", settings.officialRulesUrl],
    ]) {
        if (!validUrl(value)) {
            throw new https_1.HttpsError("invalid-argument", `${label} must be a secure URL or site path.`);
        }
    }
    if (Number.isNaN(new Date(settings.countdownTarget).getTime())) {
        throw new https_1.HttpsError("invalid-argument", "Countdown target must be a valid date and time.");
    }
    if (settings.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)) {
        throw new https_1.HttpsError("invalid-argument", "Support email is invalid.");
    }
    const reference = firebase_1.db.collection("settings").doc("public");
    const beforeSnapshot = await reference.get();
    const before = beforeSnapshot.data() || {};
    const changedFields = Object.entries(settings)
        .filter(([key, value]) => before[key] !== value)
        .map(([key]) => key);
    await firebase_1.db.runTransaction(async (transaction) => {
        transaction.set(reference, {
            ...settings,
            giveawayEndIso: settings.countdownTarget,
            winnerAnnouncementDate: new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(new Date(`${settings.announcementDate}T12:00:00+05:30`)),
            winnerAnnouncementTime: new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }).format(new Date(settings.countdownTarget)) + " IST",
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            updatedBy: admin.uid,
        }, { merge: true });
        transaction.create(firebase_1.db.collection("logs").doc(), {
            recordType: "admin_audit",
            action: adminConstants_1.ADMIN_LOG_ACTIONS.settingsChange,
            adminUid: admin.uid,
            adminEmail: admin.email,
            affectedRecord: "settings/public",
            metadata: { changedFields },
            timestamp: firestore_1.FieldValue.serverTimestamp(),
        });
    });
    return { ...settings, changedFields };
}
//# sourceMappingURL=settingsAdminService.js.map