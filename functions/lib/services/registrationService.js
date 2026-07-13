"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareAvailableEntryNumbers = prepareAvailableEntryNumbers;
exports.confirmRegistration = confirmRegistration;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("../config");
const firebase_1 = require("../firebase");
const entryNumbers_1 = require("../utils/entryNumbers");
const payload_1 = require("../utils/payload");
const hash_1 = require("../utils/hash");
const validation_1 = require("../utils/validation");
const verificationService_1 = require("./verificationService");
const settingsService_1 = require("./settingsService");
async function prepareAvailableEntryNumbers(uid, input) {
    (0, payload_1.assertPayloadSize)(input, 4_000);
    if (!input || typeof input !== "object") {
        throw new https_1.HttpsError("invalid-argument", "Mobile details are required.");
    }
    const data = input;
    const mobileNumber = (0, validation_1.normalizeMobileNumber)(data.mobileNumber, data.countryCode);
    const settings = await (0, settingsService_1.getPublicCampaignSettings)();
    if (!settings.registrationOpen) {
        throw new https_1.HttpsError("failed-precondition", "Giveaway registration is currently closed.");
    }
    const [session, participantSnapshot] = await Promise.all([
        (0, verificationService_1.getVerificationSession)(uid),
        firebase_1.db.collection("participants").doc(mobileNumber).get(),
    ]);
    (0, verificationService_1.assertParticipationComplete)(session);
    if (participantSnapshot.exists) {
        throw new https_1.HttpsError("already-exists", "This mobile number has already participated.", { reason: "DUPLICATE_MOBILE" });
    }
    const candidates = await (0, entryNumbers_1.generateAvailableEntryNumbers)();
    const expiresAt = firestore_1.Timestamp.fromMillis(Date.now() + config_1.ENTRY_CANDIDATE_TTL_MS);
    const sessionReference = firebase_1.db.collection("logs").doc(`session_${uid}`);
    const eventReference = firebase_1.db.collection("logs").doc();
    const batch = firebase_1.db.batch();
    batch.set(sessionReference, {
        entryCandidates: candidates.map((candidate) => candidate.canonical),
        entryCandidatesExpiresAt: expiresAt,
        preparedMobileNumber: mobileNumber,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    batch.create(eventReference, {
        recordType: "entry_numbers_generated",
        uid,
        candidates: candidates.map((candidate) => candidate.canonical),
        timestamp: firestore_1.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return {
        candidates,
        expiresAt: expiresAt.toDate().toISOString(),
    };
}
async function confirmRegistration(uid, input, request, ipSalt) {
    const payload = (0, validation_1.validateRegistrationPayload)(input);
    const settings = await (0, settingsService_1.getPublicCampaignSettings)();
    if (!settings.registrationOpen) {
        throw new https_1.HttpsError("failed-precondition", "Giveaway registration is currently closed.");
    }
    const participantReference = firebase_1.db.collection("participants").doc(payload.mobileNumber);
    const entryNumberReference = firebase_1.db
        .collection("entryNumbers")
        .doc(payload.selectedEntryNumber);
    const sessionReference = firebase_1.db.collection("logs").doc(`session_${uid}`);
    const registrationLogReference = firebase_1.db
        .collection("logs")
        .doc(`registration_${uid}_${payload.selectedEntryNumber}`);
    const userAgent = (0, hash_1.getRequestUserAgent)(request);
    const deviceType = (0, hash_1.getDeviceType)(userAgent);
    const ipHash = (0, hash_1.sha256)(`${ipSalt}:${(0, hash_1.getRequestIp)(request)}`);
    const entryId = `#GIVE-2026-${payload.selectedEntryNumber}`;
    const createdDate = (0, validation_1.getIstCreatedDate)();
    await firebase_1.db.runTransaction(async (transaction) => {
        const sessionSnapshot = await transaction.get(sessionReference);
        const participantSnapshot = await transaction.get(participantReference);
        const entryNumberSnapshot = await transaction.get(entryNumberReference);
        const session = (0, verificationService_1.readVerificationSessionData)(sessionSnapshot.data(), uid);
        (0, verificationService_1.assertParticipationComplete)(session);
        if (session.registrationComplete) {
            throw new https_1.HttpsError("already-exists", "This participant session has already completed a registration.");
        }
        if (participantSnapshot.exists) {
            throw new https_1.HttpsError("already-exists", "This mobile number has already participated.", { reason: "DUPLICATE_MOBILE" });
        }
        if (session.preparedMobileNumber !== payload.mobileNumber) {
            throw new https_1.HttpsError("failed-precondition", "Entry numbers must be regenerated for this mobile number.", { reason: "CANDIDATES_EXPIRED" });
        }
        if (!session.entryCandidates?.includes(payload.selectedEntryNumber) ||
            !(session.entryCandidatesExpiresAt instanceof firestore_1.Timestamp) ||
            session.entryCandidatesExpiresAt.toMillis() <= Date.now()) {
            throw new https_1.HttpsError("failed-precondition", "Your entry number options expired. Three new numbers are required.", { reason: "CANDIDATES_EXPIRED" });
        }
        if (entryNumberSnapshot.exists &&
            entryNumberSnapshot.get("status") !== "available") {
            throw new https_1.HttpsError("aborted", "This entry number was just selected by another participant. Please choose another.", { reason: "ENTRY_NUMBER_UNAVAILABLE" });
        }
        const assignment = {
            number: payload.selectedEntryNumber,
            displayNumber: String(Number(payload.selectedEntryNumber)),
            status: "assigned",
            reserved: false,
            participantId: payload.mobileNumber,
            entryId,
            ownerUid: uid,
            assignedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        if (entryNumberSnapshot.exists) {
            transaction.update(entryNumberReference, assignment);
        }
        else {
            transaction.create(entryNumberReference, assignment);
        }
        transaction.create(participantReference, {
            fullName: payload.fullName,
            mobileNumber: payload.mobileNumber,
            instagramId: payload.instagramId,
            countryCode: payload.countryCode,
            country: payload.country,
            state: payload.state,
            district: payload.district,
            entryId,
            selectedEntryNumber: payload.selectedEntryNumber,
            instagramVerified: true,
            whatsappVerified: true,
            whatsappSuccessfulShares: config_1.REQUIRED_WHATSAPP_SHARES,
            createdDate,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            ipHash,
            browserFingerprint: payload.browserFingerprint,
            userAgent,
            deviceType,
            status: "confirmed",
            ownerUid: uid,
        });
        transaction.set(sessionReference, {
            registrationComplete: true,
            confirmedEntryId: entryId,
            confirmedEntryNumber: payload.selectedEntryNumber,
            entryCandidates: firestore_1.FieldValue.delete(),
            entryCandidatesExpiresAt: firestore_1.FieldValue.delete(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.create(registrationLogReference, {
            recordType: "registration_completed",
            uid,
            participantId: payload.mobileNumber,
            entryId,
            selectedEntryNumber: payload.selectedEntryNumber,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
        });
    });
    return {
        entryId,
        selectedEntryNumber: payload.selectedEntryNumber,
        winnerAnnouncementDate: settings.winnerAnnouncementDate,
        winnerAnnouncementTime: settings.winnerAnnouncementTime,
    };
}
//# sourceMappingURL=registrationService.js.map