"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWinnerDraw = getWinnerDraw;
exports.drawWinners = drawWinners;
const node_crypto_1 = require("node:crypto");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../firebase");
const adminConstants_1 = require("./adminConstants");
const adminUtils_1 = require("./adminUtils");
const drawReference = firebase_1.db.collection("winnerDraws").doc("official-2026");
/** Uniform, cryptographically secure reservoir sample without loading all participants. */
async function selectSecureWinners(required) {
    const reservoir = [];
    let eligibleCount = 0;
    const stream = firebase_1.db
        .collection("participants")
        .where("status", "==", "confirmed")
        .stream();
    for await (const document of stream) {
        const participant = document.data();
        if (participant.instagramVerified !== true ||
            participant.whatsappVerified !== true ||
            typeof participant.entryId !== "string") {
            continue;
        }
        eligibleCount += 1;
        const eligibleParticipant = {
            id: document.id,
            entryId: participant.entryId,
            fullName: String(participant.fullName || ""),
            mobileNumber: String(participant.mobileNumber || ""),
            instagramId: String(participant.instagramId || ""),
        };
        if (reservoir.length < required) {
            reservoir.push(eligibleParticipant);
        }
        else {
            const replacementIndex = (0, node_crypto_1.randomInt)(0, eligibleCount);
            if (replacementIndex < required) {
                reservoir[replacementIndex] = eligibleParticipant;
            }
        }
    }
    return { selected: reservoir, eligibleCount };
}
async function getWinnerDraw() {
    const snapshot = await drawReference.get();
    if (!snapshot.exists)
        return { completed: false, winners: [] };
    const data = snapshot.data();
    return {
        completed: true,
        permanent: data.permanent === true,
        drawnAt: (0, adminUtils_1.timestampToIso)(data.drawnAt),
        drawnBy: String(data.drawnBy || ""),
        sourceParticipantCount: Number(data.sourceParticipantCount || 0),
        winners: Array.isArray(data.winners) ? data.winners : [],
    };
}
async function drawWinners(admin) {
    const existing = await drawReference.get();
    if (existing.exists) {
        throw new https_1.HttpsError("already-exists", "The permanent winner draw has already been completed.");
    }
    const { selected, eligibleCount } = await selectSecureWinners(adminConstants_1.winnerPrizes.length);
    if (eligibleCount < adminConstants_1.winnerPrizes.length) {
        throw new https_1.HttpsError("failed-precondition", "At least 10 eligible participants are required before drawing winners.");
    }
    const drawnAt = firestore_1.Timestamp.now();
    const winners = adminConstants_1.winnerPrizes.map((prize, index) => {
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
    await firebase_1.db.runTransaction(async (transaction) => {
        const current = await transaction.get(drawReference);
        if (current.exists) {
            throw new https_1.HttpsError("already-exists", "The permanent winner draw has already been completed.");
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
        transaction.create(firebase_1.db.collection("logs").doc(), {
            recordType: "admin_audit",
            action: adminConstants_1.ADMIN_LOG_ACTIONS.winnerDraw,
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
//# sourceMappingURL=winnerService.js.map