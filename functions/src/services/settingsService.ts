import { db } from "../firebase";
import { defaultCampaignSettings } from "../config";
import type { PublicCampaignSettings } from "../types";

function pickString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function getPublicCampaignSettings(): Promise<PublicCampaignSettings> {
  const snapshot = await db.collection("settings").doc("public").get();
  const data = snapshot.data();

  return {
    giveawayEndIso: pickString(data?.giveawayEndIso, defaultCampaignSettings.giveawayEndIso),
    winnerAnnouncementDate: pickString(
      data?.winnerAnnouncementDate,
      defaultCampaignSettings.winnerAnnouncementDate,
    ),
    winnerAnnouncementTime: pickString(
      data?.winnerAnnouncementTime,
      defaultCampaignSettings.winnerAnnouncementTime,
    ),
    instagramUrl: pickString(data?.instagramUrl, defaultCampaignSettings.instagramUrl),
    publicSiteUrl: pickString(data?.publicSiteUrl, defaultCampaignSettings.publicSiteUrl),
    whatsappShareMessage: pickString(
      data?.whatsappShareMessage,
      defaultCampaignSettings.whatsappShareMessage,
    ),
    termsUrl: pickString(data?.termsUrl, defaultCampaignSettings.termsUrl),
    privacyUrl: pickString(data?.privacyUrl, defaultCampaignSettings.privacyUrl),
    officialRulesUrl: pickString(
      data?.officialRulesUrl,
      defaultCampaignSettings.officialRulesUrl,
    ),
    registrationOpen:
      typeof data?.registrationOpen === "boolean"
        ? data.registrationOpen
        : defaultCampaignSettings.registrationOpen,
    maintenanceMode:
      typeof data?.maintenanceMode === "boolean"
        ? data.maintenanceMode
        : defaultCampaignSettings.maintenanceMode,
  };
}
