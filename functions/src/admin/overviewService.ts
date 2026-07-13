import { db } from "../firebase";
import { ENTRY_NUMBER_SPACE_SIZE } from "./adminConstants";
import { startOfTodayIst, timestampToIso } from "./adminUtils";

export async function getAdminOverview() {
  const participants = db.collection("participants");
  const entryNumbers = db.collection("entryNumbers");
  const todayStart = startOfTodayIst();

  const [
    total,
    today,
    completed,
    pending,
    instagramVerified,
    whatsappVerified,
    assignedNumbers,
    reservedNumbers,
    recent,
  ] = await Promise.all([
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
      availableEntryNumbers: Math.max(
        0,
        ENTRY_NUMBER_SPACE_SIZE - assignedCount - reservedCount,
      ),
      reservedEntryNumbers: reservedCount,
    },
    recentActivity: recent.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        fullName: String(data.fullName || "Participant"),
        entryId: String(data.entryId || ""),
        country: String(data.country || ""),
        timestamp: timestampToIso(data.timestamp),
      };
    }),
    generatedAt: new Date().toISOString(),
  };
}
