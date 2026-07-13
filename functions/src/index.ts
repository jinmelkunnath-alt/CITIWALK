import { setGlobalOptions } from "firebase-functions/v2";
import { onCall } from "firebase-functions/v2/https";
import {
  REGION,
  callableSecurityOptions,
  ipHashSalt,
} from "./config";
import { getAdminAnalytics as loadAdminAnalytics } from "./admin/analyticsService";
import { requireAdmin } from "./admin/adminAuth";
import { ADMIN_LOG_ACTIONS } from "./admin/adminConstants";
import {
  listAdminLogs as loadAdminLogs,
  recordAdminLoginAttempt as writeAdminLoginAttempt,
} from "./admin/logService";
import { getAdminOverview as loadAdminOverview } from "./admin/overviewService";
import {
  deleteParticipant,
  exportParticipants,
  getParticipantDetails,
  getParticipantFilterOptions,
  listParticipants,
} from "./admin/participantAdminService";
import {
  getAdminSettings as loadAdminSettings,
  updateAdminSettings as saveAdminSettings,
} from "./admin/settingsAdminService";
import {
  drawWinners,
  getWinnerDraw as loadWinnerDraw,
} from "./admin/winnerService";
import { writeAuditLog } from "./admin/adminUtils";
import { storeClientError } from "./security/clientErrorService";
import { enforceRateLimit } from "./security/rateLimiter";
import { logSecurityFailure } from "./security/securityLog";
import { getLocationOptions } from "./services/locationService";
import {
  confirmRegistration,
  prepareAvailableEntryNumbers,
} from "./services/registrationService";
import { getPublicCampaignSettings } from "./services/settingsService";
import {
  getVerificationSession,
  performVerification,
  toPublicParticipationState,
} from "./services/verificationService";
import { requireAuthenticatedUid } from "./utils/auth";

setGlobalOptions({
  region: REGION,
  maxInstances: 20,
  concurrency: 40,
  timeoutSeconds: 60,
  memory: "256MiB",
});

// Public participant journey
export const getPublicSettings = onCall(callableSecurityOptions, async () => {
  return getPublicCampaignSettings();
});

export const getParticipationState = onCall(
  callableSecurityOptions,
  async (request) => {
    const uid = requireAuthenticatedUid(request);
    const session = await getVerificationSession(uid);
    return toPublicParticipationState(session);
  },
);

export const getParticipantLocationOptions = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAuthenticatedUid(request);
    return { options: getLocationOptions(request.data) };
  },
);

export const verifyInstagramFollow = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    const uid = requireAuthenticatedUid(request);
    await enforceRateLimit(
      request,
      {
        scope: "verify_instagram",
        limit: 6,
        windowMs: 15 * 60_000,
        cooldownMs: 15 * 60_000,
        minimumIntervalMs: 4_000,
        deviceFingerprint: (request.data as { deviceFingerprint?: unknown } | null)?.deviceFingerprint,
      },
      ipHashSalt.value(),
    );
    return performVerification(uid, "instagram");
  },
);

export const verifyWhatsAppShare = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    const uid = requireAuthenticatedUid(request);
    await enforceRateLimit(
      request,
      {
        scope: "verify_whatsapp",
        limit: 15,
        windowMs: 30 * 60_000,
        cooldownMs: 20 * 60_000,
        minimumIntervalMs: 4_000,
        deviceFingerprint: (request.data as { deviceFingerprint?: unknown } | null)?.deviceFingerprint,
      },
      ipHashSalt.value(),
    );
    return performVerification(uid, "whatsapp");
  },
);

export const prepareEntryNumbers = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    const uid = requireAuthenticatedUid(request);
    await enforceRateLimit(
      request,
      {
        scope: "prepare_entry_numbers",
        limit: 10,
        windowMs: 15 * 60_000,
        cooldownMs: 15 * 60_000,
        deviceFingerprint: (request.data as { deviceFingerprint?: unknown } | null)?.deviceFingerprint,
      },
      ipHashSalt.value(),
    );
    try {
      return await prepareAvailableEntryNumbers(uid, request.data);
    } catch (error: unknown) {
      await logSecurityFailure(
        request,
        "ENTRY_PREPARATION_FAILED",
        error,
        ipHashSalt.value(),
      );
      throw error;
    }
  },
);

export const confirmParticipantRegistration = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    const uid = requireAuthenticatedUid(request);
    await enforceRateLimit(
      request,
      {
        scope: "confirm_registration",
        limit: 5,
        windowMs: 60 * 60_000,
        cooldownMs: 60 * 60_000,
        deviceFingerprint: (request.data as { browserFingerprint?: unknown } | null)?.browserFingerprint,
      },
      ipHashSalt.value(),
    );
    try {
      return await confirmRegistration(
        uid,
        request.data,
        request,
        ipHashSalt.value(),
      );
    } catch (error: unknown) {
      await logSecurityFailure(
        request,
        "REGISTRATION_FAILED",
        error,
        ipHashSalt.value(),
      );
      throw error;
    }
  },
);

export const reportClientError = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    requireAuthenticatedUid(request);
    await enforceRateLimit(
      request,
      { scope: "client_error_report", limit: 10, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 },
      ipHashSalt.value(),
    );
    return storeClientError(request, request.data, ipHashSalt.value());
  },
);

// Secure administrator APIs
export const getAdminOverview = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAdmin(request);
    return loadAdminOverview();
  },
);

export const adminListParticipants = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAdmin(request);
    return listParticipants(request.data);
  },
);

export const adminGetParticipantDetails = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAdmin(request);
    return getParticipantDetails(request.data);
  },
);

export const adminGetParticipantFilterOptions = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAdmin(request);
    return getParticipantFilterOptions();
  },
);

export const adminExportParticipants = onCall(
  {
    ...callableSecurityOptions,
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [ipHashSalt],
  },
  async (request) => {
    const admin = requireAdmin(request);
    await enforceRateLimit(
      request,
      { scope: "admin_participant_export", limit: 10, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 },
      ipHashSalt.value(),
    );
    const result = await exportParticipants(request.data);
    await writeAuditLog(
      admin,
      ADMIN_LOG_ACTIONS.participantExport,
      "participants",
      { exportedRecords: result.participants.length, truncated: result.truncated },
    );
    return result;
  },
);

export const adminDeleteParticipant = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    const admin = requireAdmin(request);
    await enforceRateLimit(
      request,
      { scope: "admin_participant_delete", limit: 10, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 },
      ipHashSalt.value(),
    );
    return deleteParticipant(admin, request.data);
  },
);

export const getAdminAnalytics = onCall(
  { ...callableSecurityOptions, timeoutSeconds: 120, memory: "512MiB" },
  async (request) => {
    requireAdmin(request);
    return loadAdminAnalytics();
  },
);

export const getAdminWinnerDraw = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAdmin(request);
    return loadWinnerDraw();
  },
);

export const drawAdminWinners = onCall(
  {
    ...callableSecurityOptions,
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [ipHashSalt],
  },
  async (request) => {
    const admin = requireAdmin(request);
    await enforceRateLimit(
      request,
      { scope: "admin_winner_draw", limit: 3, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 },
      ipHashSalt.value(),
    );
    return drawWinners(admin);
  },
);

export const recordAdminWinnerExport = onCall(
  callableSecurityOptions,
  async (request) => {
    const admin = requireAdmin(request);
    await writeAuditLog(
      admin,
      ADMIN_LOG_ACTIONS.winnerExport,
      "winnerDraws/official-2026",
    );
    return { logged: true };
  },
);

export const getAdminSettings = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAdmin(request);
    return loadAdminSettings();
  },
);

export const updateAdminSettings = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    const admin = requireAdmin(request);
    await enforceRateLimit(
      request,
      { scope: "admin_settings_update", limit: 20, windowMs: 60 * 60_000, cooldownMs: 30 * 60_000 },
      ipHashSalt.value(),
    );
    return saveAdminSettings(admin, request.data);
  },
);

export const adminListSystemLogs = onCall(
  callableSecurityOptions,
  async (request) => {
    requireAdmin(request);
    return loadAdminLogs(request.data);
  },
);

export const recordAdminLoginAttempt = onCall(
  { ...callableSecurityOptions, secrets: [ipHashSalt] },
  async (request) => {
    const data = request.data as { success?: unknown; deviceFingerprint?: unknown } | null;
    await enforceRateLimit(
      request,
      {
        scope: "admin_login",
        limit: 12,
        windowMs: 15 * 60_000,
        cooldownMs: 30 * 60_000,
        deviceFingerprint: data?.deviceFingerprint,
      },
      ipHashSalt.value(),
    );
    const admin = data?.success === true ? requireAdmin(request) : null;
    return writeAdminLoginAttempt(
      request,
      request.data,
      ipHashSalt.value(),
      admin,
    );
  },
);
