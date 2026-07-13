"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicCampaignSettings = getPublicCampaignSettings;
const firebase_1 = require("../firebase");
const config_1 = require("../config");
function pickString(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
async function getPublicCampaignSettings() {
    const snapshot = await firebase_1.db.collection("settings").doc("public").get();
    const data = snapshot.data();
    return {
        giveawayEndIso: pickString(data?.giveawayEndIso, config_1.defaultCampaignSettings.giveawayEndIso),
        winnerAnnouncementDate: pickString(data?.winnerAnnouncementDate, config_1.defaultCampaignSettings.winnerAnnouncementDate),
        winnerAnnouncementTime: pickString(data?.winnerAnnouncementTime, config_1.defaultCampaignSettings.winnerAnnouncementTime),
        instagramUrl: pickString(data?.instagramUrl, config_1.defaultCampaignSettings.instagramUrl),
        publicSiteUrl: pickString(data?.publicSiteUrl, config_1.defaultCampaignSettings.publicSiteUrl),
        whatsappShareMessage: pickString(data?.whatsappShareMessage, config_1.defaultCampaignSettings.whatsappShareMessage),
        termsUrl: pickString(data?.termsUrl, config_1.defaultCampaignSettings.termsUrl),
        privacyUrl: pickString(data?.privacyUrl, config_1.defaultCampaignSettings.privacyUrl),
        officialRulesUrl: pickString(data?.officialRulesUrl, config_1.defaultCampaignSettings.officialRulesUrl),
        registrationOpen: typeof data?.registrationOpen === "boolean"
            ? data.registrationOpen
            : config_1.defaultCampaignSettings.registrationOpen,
        maintenanceMode: typeof data?.maintenanceMode === "boolean"
            ? data.maintenanceMode
            : config_1.defaultCampaignSettings.maintenanceMode,
    };
}
//# sourceMappingURL=settingsService.js.map