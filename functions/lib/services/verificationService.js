"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readVerificationSessionData = readVerificationSessionData;
exports.toPublicParticipationState = toPublicParticipationState;
exports.getVerificationSession = getVerificationSession;
exports.assertParticipationComplete = assertParticipationComplete;
exports.performVerification = performVerification;
const node_crypto_1 = require("node:crypto");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("../config");
const firebase_1 = require("../firebase");
const sleep_1 = require("../utils/sleep");
function sessionReference(uid) {
    return firebase_1.db.collection("logs").doc(`session_${uid}`);
}
function readVerificationSessionData(data, uid) {
    return {
        uid,
        recordType: "verification_session",
        instagramAttempts: Number(data?.instagramAttempts || 0),
        instagramVerified: data?.instagramVerified === true,
        whatsappAttempts: Number(data?.whatsappAttempts || 0),
        whatsappSuccesses: Number(data?.whatsappSuccesses || 0),
        whatsappVerified: data?.whatsappVerified === true,
        activeVerification: data?.activeVerification,
        entryCandidates: Array.isArray(data?.entryCandidates) ? data.entryCandidates : undefined,
        entryCandidatesExpiresAt: data?.entryCandidatesExpiresAt,
        preparedMobileNumber: data?.preparedMobileNumber,
        registrationComplete: data?.registrationComplete === true,
        confirmedEntryId: typeof data?.confirmedEntryId === "string" ? data.confirmedEntryId : undefined,
    };
}
function toPublicParticipationState(session) {
    return {
        instagramAttempts: session.instagramAttempts,
        instagramVerified: session.instagramVerified,
        whatsappAttempts: session.whatsappAttempts,
        whatsappSuccesses: session.whatsappSuccesses,
        whatsappVerified: session.whatsappVerified,
        registrationComplete: session.registrationComplete === true,
        confirmedEntryId: session.confirmedEntryId,
    };
}
async function getVerificationSession(uid) {
    const snapshot = await sessionReference(uid).get();
    return readVerificationSessionData(snapshot.data(), uid);
}
function assertParticipationComplete(session) {
    if (!session.instagramVerified || !session.whatsappVerified || session.whatsappSuccesses < config_1.REQUIRED_WHATSAPP_SHARES) {
        throw new https_1.HttpsError("failed-precondition", "Complete all participation steps to unlock the entry form.", { reason: "PARTICIPATION_INCOMPLETE" });
    }
}
async function beginVerification(uid, channel) {
    const reference = sessionReference(uid);
    return firebase_1.db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(reference);
        const session = readVerificationSessionData(snapshot.data(), uid);
        const verified = channel === "instagram" ? session.instagramVerified : session.whatsappVerified;
        const currentAttempts = channel === "instagram" ? session.instagramAttempts : session.whatsappAttempts;
        if (verified)
            return { alreadyVerified: true, attempt: currentAttempts };
        if ((channel === "instagram" && currentAttempts >= 10) || (channel === "whatsapp" && currentAttempts >= 25)) {
            throw new https_1.HttpsError("resource-exhausted", "Too many verification attempts. Please wait before trying again.");
        }
        const active = session.activeVerification;
        if (active?.startedAt instanceof firestore_1.Timestamp &&
            Date.now() - active.startedAt.toMillis() < config_1.ACTIVE_VERIFICATION_TTL_MS) {
            throw new https_1.HttpsError("resource-exhausted", "A verification is already in progress.");
        }
        const attempt = currentAttempts + 1;
        const token = (0, node_crypto_1.randomUUID)();
        const createFields = snapshot.exists
            ? {}
            : {
                uid,
                recordType: "verification_session",
                instagramAttempts: 0,
                instagramVerified: false,
                whatsappAttempts: 0,
                whatsappSuccesses: 0,
                whatsappVerified: false,
                registrationComplete: false,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
        transaction.set(reference, {
            ...createFields,
            activeVerification: {
                channel,
                token,
                attempt,
                startedAt: firestore_1.Timestamp.now(),
            },
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        return { alreadyVerified: false, attempt, token };
    });
}
async function finalizeVerification(uid, channel, attempt, token) {
    const reference = sessionReference(uid);
    return firebase_1.db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(reference);
        const session = readVerificationSessionData(snapshot.data(), uid);
        const active = session.activeVerification;
        if (!active || active.token !== token || active.channel !== channel || active.attempt !== attempt) {
            throw new https_1.HttpsError("aborted", "The verification session expired. Please try again.");
        }
        const success = channel === "instagram"
            ? attempt >= 2
            : (config_1.whatsappVerificationOutcomes[attempt - 1] ?? true);
        const nextInstagramVerified = channel === "instagram" ? success || session.instagramVerified : session.instagramVerified;
        const nextWhatsappSuccesses = channel === "whatsapp" && success
            ? Math.min(config_1.REQUIRED_WHATSAPP_SHARES, session.whatsappSuccesses + 1)
            : session.whatsappSuccesses;
        const nextWhatsappVerified = nextWhatsappSuccesses >= config_1.REQUIRED_WHATSAPP_SHARES;
        const updates = {
            instagramAttempts: channel === "instagram" ? attempt : session.instagramAttempts,
            instagramVerified: nextInstagramVerified,
            whatsappAttempts: channel === "whatsapp" ? attempt : session.whatsappAttempts,
            whatsappSuccesses: nextWhatsappSuccesses,
            whatsappVerified: nextWhatsappVerified,
            activeVerification: firestore_1.FieldValue.delete(),
            lastVerificationAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        transaction.set(reference, updates, { merge: true });
        transaction.create(firebase_1.db.collection("logs").doc(), {
            recordType: "verification_attempt",
            uid,
            channel,
            attempt,
            success,
            whatsappSuccesses: nextWhatsappSuccesses,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            ...toPublicParticipationState({
                ...session,
                instagramAttempts: updates.instagramAttempts,
                instagramVerified: nextInstagramVerified,
                whatsappAttempts: updates.whatsappAttempts,
                whatsappSuccesses: nextWhatsappSuccesses,
                whatsappVerified: nextWhatsappVerified,
            }),
            attempt,
            success,
            channel,
        };
    });
}
async function performVerification(uid, channel) {
    const start = await beginVerification(uid, channel);
    if (start.alreadyVerified) {
        const session = await getVerificationSession(uid);
        return {
            ...toPublicParticipationState(session),
            attempt: start.attempt,
            success: true,
            channel,
        };
    }
    await (0, sleep_1.sleep)(config_1.VERIFICATION_DELAY_MS);
    return finalizeVerification(uid, channel, start.attempt, start.token);
}
//# sourceMappingURL=verificationService.js.map