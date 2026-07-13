import { randomUUID } from "node:crypto";
import {
  FieldValue,
  Timestamp,
  type DocumentData,
} from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import {
  ACTIVE_VERIFICATION_TTL_MS,
  REQUIRED_WHATSAPP_SHARES,
  VERIFICATION_DELAY_MS,
  whatsappVerificationOutcomes,
} from "../config";
import { db } from "../firebase";
import type {
  PublicParticipationState,
  VerificationChannel,
  VerificationSession,
} from "../types";
import { sleep } from "../utils/sleep";

function sessionReference(uid: string) {
  return db.collection("logs").doc(`session_${uid}`);
}

export function readVerificationSessionData(data: DocumentData | undefined, uid: string): VerificationSession {
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

export function toPublicParticipationState(session: VerificationSession): PublicParticipationState {
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

export async function getVerificationSession(uid: string) {
  const snapshot = await sessionReference(uid).get();
  return readVerificationSessionData(snapshot.data(), uid);
}

export function assertParticipationComplete(session: VerificationSession) {
  if (!session.instagramVerified || !session.whatsappVerified || session.whatsappSuccesses < REQUIRED_WHATSAPP_SHARES) {
    throw new HttpsError(
      "failed-precondition",
      "Complete all participation steps to unlock the entry form.",
      { reason: "PARTICIPATION_INCOMPLETE" },
    );
  }
}

type VerificationStart = {
  alreadyVerified: boolean;
  attempt: number;
  token?: string;
};

async function beginVerification(uid: string, channel: VerificationChannel): Promise<VerificationStart> {
  const reference = sessionReference(uid);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const session = readVerificationSessionData(snapshot.data(), uid);
    const verified = channel === "instagram" ? session.instagramVerified : session.whatsappVerified;
    const currentAttempts = channel === "instagram" ? session.instagramAttempts : session.whatsappAttempts;

    if (verified) return { alreadyVerified: true, attempt: currentAttempts };
    if ((channel === "instagram" && currentAttempts >= 10) || (channel === "whatsapp" && currentAttempts >= 25)) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many verification attempts. Please wait before trying again.",
      );
    }

    const active = session.activeVerification;
    if (
      active?.startedAt instanceof Timestamp &&
      Date.now() - active.startedAt.toMillis() < ACTIVE_VERIFICATION_TTL_MS
    ) {
      throw new HttpsError(
        "resource-exhausted",
        "A verification is already in progress.",
      );
    }

    const attempt = currentAttempts + 1;
    const token = randomUUID();
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
          createdAt: FieldValue.serverTimestamp(),
        };

    transaction.set(
      reference,
      {
        ...createFields,
        activeVerification: {
          channel,
          token,
          attempt,
          startedAt: Timestamp.now(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { alreadyVerified: false, attempt, token };
  });
}

export type VerificationResult = PublicParticipationState & {
  attempt: number;
  success: boolean;
  channel: VerificationChannel;
};

async function finalizeVerification(
  uid: string,
  channel: VerificationChannel,
  attempt: number,
  token: string,
): Promise<VerificationResult> {
  const reference = sessionReference(uid);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const session = readVerificationSessionData(snapshot.data(), uid);
    const active = session.activeVerification;

    if (!active || active.token !== token || active.channel !== channel || active.attempt !== attempt) {
      throw new HttpsError("aborted", "The verification session expired. Please try again.");
    }

    const success =
      channel === "instagram"
        ? attempt >= 2
        : (whatsappVerificationOutcomes[attempt - 1] ?? true);
    const nextInstagramVerified =
      channel === "instagram" ? success || session.instagramVerified : session.instagramVerified;
    const nextWhatsappSuccesses =
      channel === "whatsapp" && success
        ? Math.min(REQUIRED_WHATSAPP_SHARES, session.whatsappSuccesses + 1)
        : session.whatsappSuccesses;
    const nextWhatsappVerified = nextWhatsappSuccesses >= REQUIRED_WHATSAPP_SHARES;

    const updates = {
      instagramAttempts:
        channel === "instagram" ? attempt : session.instagramAttempts,
      instagramVerified: nextInstagramVerified,
      whatsappAttempts:
        channel === "whatsapp" ? attempt : session.whatsappAttempts,
      whatsappSuccesses: nextWhatsappSuccesses,
      whatsappVerified: nextWhatsappVerified,
      activeVerification: FieldValue.delete(),
      lastVerificationAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    transaction.set(reference, updates, { merge: true });
    transaction.create(db.collection("logs").doc(), {
      recordType: "verification_attempt",
      uid,
      channel,
      attempt,
      success,
      whatsappSuccesses: nextWhatsappSuccesses,
      timestamp: FieldValue.serverTimestamp(),
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

export async function performVerification(uid: string, channel: VerificationChannel) {
  const start = await beginVerification(uid, channel);
  if (start.alreadyVerified) {
    const session = await getVerificationSession(uid);
    return {
      ...toPublicParticipationState(session),
      attempt: start.attempt,
      success: true,
      channel,
    } satisfies VerificationResult;
  }

  await sleep(VERIFICATION_DELAY_MS);
  return finalizeVerification(uid, channel, start.attempt, start.token!);
}
