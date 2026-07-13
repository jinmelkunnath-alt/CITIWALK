import { randomInt } from "node:crypto";
import {
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "../firebase";
import type { AdminIdentity } from "./adminAuth";
import { ADMIN_LOG_ACTIONS, winnerPrizes } from "./adminConstants";
import { timestampToIso } from "./adminUtils";

const drawReference = db.collection("winnerDraws").doc("official-2026");

type EligibleParticipant = {
  id: string;
  entryId: string;
  fullName: string;
  mobileNumber: string;
  instagramId: string;
};

/** Uniform, cryptographically secure reservoir sample without loading all participants. */
async function selectSecureWinners(required: number) {
  const reservoir: EligibleParticipant[] = [];
  let eligibleCount = 0;
  const stream = db
    .collection("participants")
    .where("status", "==", "confirmed")
    .stream() as unknown as AsyncIterable<QueryDocumentSnapshot>;

  for await (const document of stream) {
    const participant = document.data();
    if (
      participant.instagramVerified !== true ||
      participant.whatsappVerified !== true ||
      typeof participant.entryId !== "string"
    ) {
      continue;
    }

    eligibleCount += 1;
    const eligibleParticipant: EligibleParticipant = {
      id: document.id,
      entryId: participant.entryId,
      fullName: String(participant.fullName || ""),
      mobileNumber: String(participant.mobileNumber || ""),
      instagramId: String(participant.instagramId || ""),
    };

    if (reservoir.length < required) {
      reservoir.push(eligibleParticipant);
    } else {
      const replacementIndex = randomInt(0, eligibleCount);
      if (replacementIndex < required) {
        reservoir[replacementIndex] = eligibleParticipant;
      }
    }
  }

  return { selected: reservoir, eligibleCount };
}

export async function getWinnerDraw() {
  const snapshot = await drawReference.get();
  if (!snapshot.exists) return { completed: false, winners: [] };
  const data = snapshot.data()!;
  return {
    completed: true,
    permanent: data.permanent === true,
    drawnAt: timestampToIso(data.drawnAt),
    drawnBy: String(data.drawnBy || ""),
    sourceParticipantCount: Number(data.sourceParticipantCount || 0),
    winners: Array.isArray(data.winners) ? data.winners : [],
  };
}

export async function drawWinners(admin: AdminIdentity) {
  const existing = await drawReference.get();
  if (existing.exists) {
    throw new HttpsError(
      "already-exists",
      "The permanent winner draw has already been completed.",
    );
  }

  const { selected, eligibleCount } = await selectSecureWinners(
    winnerPrizes.length,
  );
  if (eligibleCount < winnerPrizes.length) {
    throw new HttpsError(
      "failed-precondition",
      "At least 10 eligible participants are required before drawing winners.",
    );
  }

  const drawnAt = Timestamp.now();
  const winners = winnerPrizes.map((prize, index) => {
    const participant = selected[index];
    return {
      position: index + 1,
      prizeRank: prize.rank,
      prizeName: prize.name,
      participantId: participant.id,
      entryId: participant.entryId,
      participantName: participant.fullName,
      phoneNumber: participant.mobileNumber,
      instagramId: participant.instagramId,
      date: drawnAt.toDate().toISOString(),
    };
  });

  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(drawReference);
    if (current.exists) {
      throw new HttpsError(
        "already-exists",
        "The permanent winner draw has already been completed.",
      );
    }

    transaction.create(drawReference, {
      drawId: "official-2026",
      permanent: true,
      winners,
      sourceParticipantCount: eligibleCount,
      drawnBy: admin.uid,
      drawnByEmail: admin.email,
      drawnAt,
    });
    transaction.create(db.collection("logs").doc(), {
      recordType: "admin_audit",
      action: ADMIN_LOG_ACTIONS.winnerDraw,
      adminUid: admin.uid,
      adminEmail: admin.email,
      affectedRecord: "winnerDraws/official-2026",
      metadata: {
        winnerCount: winners.length,
        sourceParticipantCount: eligibleCount,
        entryIds: winners.map((winner) => winner.entryId),
      },
      timestamp: drawnAt,
    });
  });

  return {
    completed: true,
    permanent: true,
    drawnAt: drawnAt.toDate().toISOString(),
    drawnBy: admin.uid,
    sourceParticipantCount: eligibleCount,
    winners,
  };
}
