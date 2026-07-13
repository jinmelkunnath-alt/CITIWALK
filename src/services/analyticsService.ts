import { getFirebaseConfig, getFirebaseRuntime, isFirebaseConfigured } from "@/firebase/client";

export type CampaignAnalyticsEvent =
  | "landing_page_view"
  | "countdown_view"
  | "instagram_click"
  | "instagram_verified"
  | "whatsapp_click"
  | "whatsapp_share"
  | "whatsapp_verification_attempt"
  | "entry_form_opened"
  | "entry_number_generated"
  | "entry_confirmed"
  | "registration_completed"
  | "successful_entry"
  | "admin_login"
  | "winner_draw";

export async function trackCampaignEvent(
  event: CampaignAnalyticsEvent,
  parameters?: Record<string, string | number | boolean>,
) {
  if (!isFirebaseConfigured || !getFirebaseConfig().measurementId) return;

  try {
    const { getAnalytics, isSupported, logEvent } = await import("firebase/analytics");
    if (!(await isSupported())) return;
    const { app } = await getFirebaseRuntime();
    logEvent(getAnalytics(app), event, parameters);
  } catch {
    // Analytics must never interrupt the participant or administrator journey.
  }
}
