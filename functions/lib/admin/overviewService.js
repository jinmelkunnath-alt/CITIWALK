"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOverview = getAdminOverview;
const firebase_1 = require("../firebase");
const adminConstants_1 = require("./adminConstants");
const adminUtils_1 = require("./adminUtils");
async function getAdminOverview() {
    const participants = firebase_1.db.collection("participants");
    const entryNumbers = firebase_1.db.collection("entryNumbers");
    const todayStart = (0, adminUtils_1.startOfTodayIst)();
    const [total, today, completed, pending, instagramVerified, whatsappVerified, assignedNumbers, reservedNumbers, recent,] = await Promise.all([
        participants.count().get(),
        participants.where("timestamp", ">=", todayStart).count().get(),
        participants.where("status", "==", "confirmed").count().get(),
        participants.where("status", "!=", "confirmed").count().get(),
        participants.where("instagramVerified", "==", true).count().get(),
        participants.where("whatsappVerified", "==", true).count().get(),
        entryNumbers.where("status", "==", "assigned").count().get(),
        entryNumbers.where("status", "==", "reserved").count().get(),
        participants.orderBy("timestamp", "desc").limit(8).get(),
    ]);
    const assignedCount = assignedNumbers.data().count;
    const reservedCount = reservedNumbers.data().count;
    return {
        stats: {
            totalParticipants: total.data().count,
            todayParticipants: today.data().count,
            completedEntries: completed.data().count,
            pendingEntries: pending.data().count,
            instagramVerified: instagramVerified.data().count,
            whatsappVerified: whatsappVerified.data().count,
            availableEntryNumbers: Math.max(0, adminConstants_1.ENTRY_NUMBER_SPACE_SIZE - assignedCount - reservedCount),
            reservedEntryNumbers: reservedCount,
        },
        recentActivity: recent.docs.map((document) => {
            const data = document.data();
            return {
                id: document.id,
                fullName: String(data.fullName || "Participant"),
                entryId: String(data.entryId || ""),
                country: String(data.country || ""),
                timestamp: (0, adminUtils_1.timestampToIso)(data.timestamp),
            };
        }),
        generatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=overviewService.js.map