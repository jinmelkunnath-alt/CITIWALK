import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { defaultCampaignSettings } from "../config";
import { db } from "../firebase";
import type { AdminIdentity } from "./adminAuth";
import { ADMIN_LOG_ACTIONS } from "./adminConstants";
import { asRecord, cleanOptionalString, requireText } from "./adminUtils";
import { rejectMarkup } from "../utils/payload";

const defaultAdminSettings = {
  giveawayName: "CITIWALK Global Rewards",
  companyName: "CITIWALK",
  announcementDate: "2026-08-10",
  countdownTarget: defaultCampaignSettings.giveawayEndIso,
  instagramUrl: defaultCampaignSettings.instagramUrl,
  whatsappShareMessage:
    "🎉 I just entered the CITIWALK Global Rewards Giveaway!\n\nJoin now: {URL}",
  termsUrl: "/terms",
  privacyUrl: "/privacy",
  officialRulesUrl: "/official-rules",
  supportEmail: "",
  supportPhone: "",
};

function validUrl(value: string) {
  if (value.startsWith("/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function getAdminSettings() {
  const snapshot = await db.collection("settings").doc("public").get();
  const data = snapshot.data() || {};
  return {
    ...defaultAdminSettings,
    ...Object.fromEntries(
      Object.keys(defaultAdminSettings).map((key) => [
        key,
        typeof data[key] === "string"
          ? data[key]
          : defaultAdminSettings[key as keyof typeof defaultAdminSettings],
      ]),
    ),
    registrationOpen:
      typeof data.registrationOpen === "boolean" ? data.registrationOpen : true,
    maintenanceMode:
      typeof data.maintenanceMode === "boolean" ? data.maintenanceMode : false,
  };
}

export async function updateAdminSettings(
  admin: AdminIdentity,
  input: unknown,
) {
  const data = asRecord(input);
  const settings = {
    giveawayName: rejectMarkup(
      requireText(data.giveawayName, "Giveaway name", 120),
      "Giveaway name",
    ),
    companyName: rejectMarkup(
      requireText(data.companyName, "Company name", 120),
      "Company name",
    ),
    announcementDate: requireText(data.announcementDate, "Announcement date", 20),
    countdownTarget: requireText(data.countdownTarget, "Countdown target", 40),
    instagramUrl: requireText(data.instagramUrl, "Instagram URL", 300),
    whatsappShareMessage: rejectMarkup(
      requireText(
        data.whatsappShareMessage,
        "WhatsApp share message",
        2_000,
      ),
      "WhatsApp share message",
    ),
    termsUrl: requireText(data.termsUrl, "Terms URL", 300),
    privacyUrl: requireText(data.privacyUrl, "Privacy URL", 300),
    officialRulesUrl: requireText(data.officialRulesUrl, "Official Rules URL", 300),
    supportEmail: cleanOptionalString(data.supportEmail, 200),
    supportPhone: cleanOptionalString(data.supportPhone, 30),
    registrationOpen: data.registrationOpen !== false,
    maintenanceMode: data.maintenanceMode === true,
  };

  for (const [label, value] of [
    ["Instagram URL", settings.instagramUrl],
    ["Terms URL", settings.termsUrl],
    ["Privacy URL", settings.privacyUrl],
    ["Official Rules URL", settings.officialRulesUrl],
  ] as const) {
    if (!validUrl(value)) {
      throw new HttpsError("invalid-argument", `${label} must be a secure URL or site path.`);
    }
  }
  if (Number.isNaN(new Date(settings.countdownTarget).getTime())) {
    throw new HttpsError("invalid-argument", "Countdown target must be a valid date and time.");
  }
  if (settings.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)) {
    throw new HttpsError("invalid-argument", "Support email is invalid.");
  }

  const reference = db.collection("settings").doc("public");
  const beforeSnapshot = await reference.get();
  const before = beforeSnapshot.data() || {};
  const changedFields = Object.entries(settings)
    .filter(([key, value]) => before[key] !== value)
    .map(([key]) => key);

  await db.runTransaction(async (transaction) => {
    transaction.set(
      reference,
      {
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
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: admin.uid,
      },
      { merge: true },
    );
    transaction.create(db.collection("logs").doc(), {
      recordType: "admin_audit",
      action: ADMIN_LOG_ACTIONS.settingsChange,
      adminUid: admin.uid,
      adminEmail: admin.email,
      affectedRecord: "settings/public",
      metadata: { changedFields },
      timestamp: FieldValue.serverTimestamp(),
    });
  });

  return { ...settings, changedFields };
}
