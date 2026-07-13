"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAdminLoginAttempt = exports.adminListSystemLogs = exports.updateAdminSettings = exports.getAdminSettings = exports.recordAdminWinnerExport = exports.drawAdminWinners = exports.getAdminWinnerDraw = exports.getAdminAnalytics = exports.adminDeleteParticipant = exports.adminExportParticipants = exports.adminGetParticipantFilterOptions = exports.adminGetParticipantDetails = exports.adminListParticipants = exports.getAdminOverview = exports.reportClientError = exports.confirmParticipantRegistration = exports.prepareEntryNumbers = exports.verifyWhatsAppShare = exports.verifyInstagramFollow = exports.getParticipantLocationOptions = exports.getParticipationState = exports.getPublicSettings = void 0;
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("./config");
const analyticsService_1 = require("./admin/analyticsService");
const adminAuth_1 = require("./admin/adminAuth");
const adminConstants_1 = require("./admin/adminConstants");
const logService_1 = require("./admin/logService");
const overviewService_1 = require("./admin/overviewService");
const participantAdminService_1 = require("./admin/participantAdminService");
const settingsAdminService_1 = require("./admin/settingsAdminService");
const winnerService_1 = require("./admin/winnerService");
const adminUtils_1 = require("./admin/adminUtils");
const clientErrorService_1 = require("./security/clientErrorService");
const rateLimiter_1 = require("./security/rateLimiter");
const securityLog_1 = require("./security/securityLog");
const locationService_1 = require("./services/locationService");
const registrationService_1 = require("./services/registrationService");
const settingsService_1 = require("./services/settingsService");
const verificationService_1 = require("./services/verificationService");
const auth_1 = require("./utils/auth");
(0, v2_1.setGlobalOptions)({
    region: config_1.REGION,
    maxInstances: 20,
    concurrency: 40,
    timeoutSeconds: 60,
    memory: "256MiB",
});
// Public participant journey
exports.getPublicSettings = (0, https_1.onCall)(config_1.callableSecurityOptions, async () => {
    return (0, settingsService_1.getPublicCampaignSettings)();
});
exports.getParticipationState = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    const uid = (0, auth_1.requireAuthenticatedUid)(request);
    const session = await (0, verificationService_1.getVerificationSession)(uid);
    return (0, verificationService_1.toPublicParticipationState)(session);
});
exports.getParticipantLocationOptions = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, auth_1.requireAuthenticatedUid)(request);
    return { options: (0, locationService_1.getLocationOptions)(request.data) };
});
exports.verifyInstagramFollow = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    const uid = (0, auth_1.requireAuthenticatedUid)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, {
        scope: "verify_instagram",
        limit: 6,
        windowMs: 15 * 60_000,
        cooldownMs: 15 * 60_000,
        minimumIntervalMs: 4_000,
        deviceFingerprint: request.data?.deviceFingerprint,
    }, config_1.ipHashSalt.value());
    return (0, verificationService_1.performVerification)(uid, "instagram");
});
exports.verifyWhatsAppShare = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    const uid = (0, auth_1.requireAuthenticatedUid)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, {
        scope: "verify_whatsapp",
        limit: 15,
        windowMs: 30 * 60_000,
        cooldownMs: 20 * 60_000,
        minimumIntervalMs: 4_000,
        deviceFingerprint: request.data?.deviceFingerprint,
    }, config_1.ipHashSalt.value());
    return (0, verificationService_1.performVerification)(uid, "whatsapp");
});
exports.prepareEntryNumbers = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    const uid = (0, auth_1.requireAuthenticatedUid)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, {
        scope: "prepare_entry_numbers",
        limit: 10,
        windowMs: 15 * 60_000,
        cooldownMs: 15 * 60_000,
        deviceFingerprint: request.data?.deviceFingerprint,
    }, config_1.ipHashSalt.value());
    try {
        return await (0, registrationService_1.prepareAvailableEntryNumbers)(uid, request.data);
    }
    catch (error) {
        await (0, securityLog_1.logSecurityFailure)(request, "ENTRY_PREPARATION_FAILED", error, config_1.ipHashSalt.value());
        throw error;
    }
});
exports.confirmParticipantRegistration = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    const uid = (0, auth_1.requireAuthenticatedUid)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, {
        scope: "confirm_registration",
        limit: 5,
        windowMs: 60 * 60_000,
        cooldownMs: 60 * 60_000,
        deviceFingerprint: request.data?.browserFingerprint,
    }, config_1.ipHashSalt.value());
    try {
        return await (0, registrationService_1.confirmRegistration)(uid, request.data, request, config_1.ipHashSalt.value());
    }
    catch (error) {
        await (0, securityLog_1.logSecurityFailure)(request, "REGISTRATION_FAILED", error, config_1.ipHashSalt.value());
        throw error;
    }
});
exports.reportClientError = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    (0, auth_1.requireAuthenticatedUid)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, { scope: "client_error_report", limit: 10, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 }, config_1.ipHashSalt.value());
    return (0, clientErrorService_1.storeClientError)(request, request.data, config_1.ipHashSalt.value());
});
// Secure administrator APIs
exports.getAdminOverview = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, overviewService_1.getAdminOverview)();
});
exports.adminListParticipants = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, participantAdminService_1.listParticipants)(request.data);
});
exports.adminGetParticipantDetails = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, participantAdminService_1.getParticipantDetails)(request.data);
});
exports.adminGetParticipantFilterOptions = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, participantAdminService_1.getParticipantFilterOptions)();
});
exports.adminExportParticipants = (0, https_1.onCall)({
    ...config_1.callableSecurityOptions,
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [config_1.ipHashSalt],
}, async (request) => {
    const admin = (0, adminAuth_1.requireAdmin)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, { scope: "admin_participant_export", limit: 10, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 }, config_1.ipHashSalt.value());
    const result = await (0, participantAdminService_1.exportParticipants)(request.data);
    await (0, adminUtils_1.writeAuditLog)(admin, adminConstants_1.ADMIN_LOG_ACTIONS.participantExport, "participants", { exportedRecords: result.participants.length, truncated: result.truncated });
    return result;
});
exports.adminDeleteParticipant = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    const admin = (0, adminAuth_1.requireAdmin)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, { scope: "admin_participant_delete", limit: 10, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 }, config_1.ipHashSalt.value());
    return (0, participantAdminService_1.deleteParticipant)(admin, request.data);
});
exports.getAdminAnalytics = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, timeoutSeconds: 120, memory: "512MiB" }, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, analyticsService_1.getAdminAnalytics)();
});
exports.getAdminWinnerDraw = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, winnerService_1.getWinnerDraw)();
});
exports.drawAdminWinners = (0, https_1.onCall)({
    ...config_1.callableSecurityOptions,
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [config_1.ipHashSalt],
}, async (request) => {
    const admin = (0, adminAuth_1.requireAdmin)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, { scope: "admin_winner_draw", limit: 3, windowMs: 60 * 60_000, cooldownMs: 60 * 60_000 }, config_1.ipHashSalt.value());
    return (0, winnerService_1.drawWinners)(admin);
});
exports.recordAdminWinnerExport = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    const admin = (0, adminAuth_1.requireAdmin)(request);
    await (0, adminUtils_1.writeAuditLog)(admin, adminConstants_1.ADMIN_LOG_ACTIONS.winnerExport, "winnerDraws/official-2026");
    return { logged: true };
});
exports.getAdminSettings = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, settingsAdminService_1.getAdminSettings)();
});
exports.updateAdminSettings = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    const admin = (0, adminAuth_1.requireAdmin)(request);
    await (0, rateLimiter_1.enforceRateLimit)(request, { scope: "admin_settings_update", limit: 20, windowMs: 60 * 60_000, cooldownMs: 30 * 60_000 }, config_1.ipHashSalt.value());
    return (0, settingsAdminService_1.updateAdminSettings)(admin, request.data);
});
exports.adminListSystemLogs = (0, https_1.onCall)(config_1.callableSecurityOptions, async (request) => {
    (0, adminAuth_1.requireAdmin)(request);
    return (0, logService_1.listAdminLogs)(request.data);
});
exports.recordAdminLoginAttempt = (0, https_1.onCall)({ ...config_1.callableSecurityOptions, secrets: [config_1.ipHashSalt] }, async (request) => {
    const data = request.data;
    await (0, rateLimiter_1.enforceRateLimit)(request, {
        scope: "admin_login",
        limit: 12,
        windowMs: 15 * 60_000,
        cooldownMs: 30 * 60_000,
        deviceFingerprint: data?.deviceFingerprint,
    }, config_1.ipHashSalt.value());
    const admin = data?.success === true ? (0, adminAuth_1.requireAdmin)(request) : null;
    return (0, logService_1.recordAdminLoginAttempt)(request, request.data, config_1.ipHashSalt.value(), admin);
});
//# sourceMappingURL=index.js.map