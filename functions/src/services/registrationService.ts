import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import {
  ENTRY_CANDIDATE_TTL_MS,
  REQUIRED_WHATSAPP_SHARES,
} from "../config";
import { db } from "../firebase";
import type { EntryCandidate } from "../types";
import { generateAvailableEntryNumbers } from "../utils/entryNumbers";
import { assertPayloadSize } from "../utils/payload";
import {
  getDeviceType,
  getRequestIp,
  getRequestUserAgent,
  sha256,
} from "../utils/hash";
import {
  getIstCreatedDate,
  normalizeMobileNumber,
  validateRegistrationPayload,
} from "../utils/validation";
import {
  assertParticipationComplete,
  getVerificationSession,
  readVerificationSessionData,
} from "./verificationService";
import { getPublicCampaignSettings } from "./settingsService";

export type PrepareEntryNumbersInput = {
  mobileNumber: string;
  countryCode: string;
};

export type PrepareEntryNumbersResult = {
  candidates: EntryCandidate[];
  expiresAt: string;
};

export async function prepareAvailableEntryNumbers(
  uid: string,
  input: unknown,
): Promise<PrepareEntryNumbersResult> {
  assertPayloadSize(input, 4_000);
  if (!input || typeof input !== "object") {
    throw new HttpsError("invalid-argument", "Mobile details are required.");
  }
  const data = input as Record<string, unknown>;
  const mobileNumber = normalizeMobileNumber(data.mobileNumber, data.countryCode);
  const settings = await getPublicCampaignSettings();
  if (!settings.registrationOpen) {
    throw new HttpsError("failed-precondition", "Giveaway registration is currently closed.");
  }

  const [session, participantSnapshot] = await Promise.all([
    getVerificationSession(uid),
    db.collection("participants").doc(mobileNumber).get(),
  ]);
  assertParticipationComplete(session);

  if (participantSnapshot.exists) {
    throw new HttpsError(
      "already-exists",
      "This mobile number has already participated.",
      { reason: "DUPLICATE_MOBILE" },
    );
  }

  const candidates = await generateAvailableEntryNumbers();
  const expiresAt = Timestamp.fromMillis(Date.now() + ENTRY_CANDIDATE_TTL_MS);
  const sessionReference = db.collection("logs").doc(`session_${uid}`);
  const eventReference = db.collection("logs").doc();
  const batch = db.batch();

  batch.set(
    sessionReference,
    {
      entryCandidates: candidates.map((candidate) => candidate.canonical),
      entryCandidatesExpiresAt: expiresAt,
      preparedMobileNumber: mobileNumber,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  batch.create(eventReference, {
    recordType: "entry_numbers_generated",
    uid,
    candidates: candidates.map((candidate) => candidate.canonical),
    timestamp: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return {
    candidates,
    expiresAt: expiresAt.toDate().toISOString(),
  };
}

export type RegistrationResult = {
  entryId: string;
  selectedEntryNumber: string;
  winnerAnnouncementDate: string;
  winnerAnnouncementTime: string;
};

export async function confirmRegistration(
  uid: string,
  input: unknown,
  request: CallableRequest<unknown>,
  ipSalt: string,
): Promise<RegistrationResult> {
  const payload = validateRegistrationPayload(input);
  const settings = await getPublicCampaignSettings();
  if (!settings.registrationOpen) {
    throw new HttpsError("failed-precondition", "Giveaway registration is currently closed.");
  }

  const participantReference = db.collection("participants").doc(payload.mobileNumber);
  const entryNumberReference = db
    .collection("entryNumbers")
    .doc(payload.selectedEntryNumber);
  const sessionReference = db.collection("logs").doc(`session_${uid}`);
  const registrationLogReference = db
    .collection("logs")
    .doc(`registration_${uid}_${payload.selectedEntryNumber}`);
  const userAgent = getRequestUserAgent(request);
  const deviceType = getDeviceType(userAgent);
  const ipHash = sha256(`${ipSalt}:${getRequestIp(request)}`);
  const entryId = `#GIVE-2026-${payload.selectedEntryNumber}`;
  const createdDate = getIstCreatedDate();

  await db.runTransaction(async (transaction) => {
    const sessionSnapshot = await transaction.get(sessionReference);
    const participantSnapshot = await transaction.get(participantReference);
    const entryNumberSnapshot = await transaction.get(entryNumberReference);
    const session = readVerificationSessionData(sessionSnapshot.data(), uid);

    assertParticipationComplete(session);

    if (session.registrationComplete) {
      throw new HttpsError(
        "already-exists",
        "This participant session has already completed a registration.",
      );
    }
    if (participantSnapshot.exists) {
      throw new HttpsError(
        "already-exists",
        "This mobile number has already participated.",
        { reason: "DUPLICATE_MOBILE" },
      );
    }
    if (session.preparedMobileNumber !== payload.mobileNumber) {
      throw new HttpsError(
        "failed-precondition",
        "Entry numbers must be regenerated for this mobile number.",
        { reason: "CANDIDATES_EXPIRED" },
      );
    }
    if (
      !session.entryCandidates?.includes(payload.selectedEntryNumber) ||
      !(session.entryCandidatesExpiresAt instanceof Timestamp) ||
      session.entryCandidatesExpiresAt.toMillis() <= Date.now()
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Your entry number options expired. Three new numbers are required.",
        { reason: "CANDIDATES_EXPIRED" },
      );
    }

    if (
      entryNumberSnapshot.exists &&
      entryNumberSnapshot.get("status") !== "available"
    ) {
      throw new HttpsError(
        "aborted",
        "This entry number was just selected by another participant. Please choose another.",
        { reason: "ENTRY_NUMBER_UNAVAILABLE" },
      );
    }

    const assignment = {
      number: payload.selectedEntryNumber,
      displayNumber: String(Number(payload.selectedEntryNumber)),
      status: "assigned",
      reserved: false,
      participantId: payload.mobileNumber,
      entryId,
      ownerUid: uid,
      assignedAt: FieldValue.serverTimestamp(),
    };

    if (entryNumberSnapshot.exists) {
      transaction.update(entryNumberReference, assignment);
    } else {
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
      whatsappSuccessfulShares: REQUIRED_WHATSAPP_SHARES,
      createdDate,
      timestamp: FieldValue.serverTimestamp(),
      ipHash,
      browserFingerprint: payload.browserFingerprint,
      userAgent,
      deviceType,
      status: "confirmed",
      ownerUid: uid,
    });

    transaction.set(
      sessionReference,
      {
        registrationComplete: true,
        confirmedEntryId: entryId,
        confirmedEntryNumber: payload.selectedEntryNumber,
        entryCandidates: FieldValue.delete(),
        entryCandidatesExpiresAt: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    transaction.create(registrationLogReference, {
      recordType: "registration_completed",
      uid,
      participantId: payload.mobileNumber,
      entryId,
      selectedEntryNumber: payload.selectedEntryNumber,
      timestamp: FieldValue.serverTimestamp(),
    });
  });

  return {
    entryId,
    selectedEntryNumber: payload.selectedEntryNumber,
    winnerAnnouncementDate: settings.winnerAnnouncementDate,
    winnerAnnouncementTime: settings.winnerAnnouncementTime,
  };
}
