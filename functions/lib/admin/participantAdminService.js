"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listParticipants = listParticipants;
exports.getParticipantFilterOptions = getParticipantFilterOptions;
exports.exportParticipants = exportParticipants;
exports.getParticipantDetails = getParticipantDetails;
exports.deleteParticipant = deleteParticipant;
exports.parseParticipantFilters = parseParticipantFilters;
exports.matchesFilters = matchesFilters;
exports.participantFromSnapshot = participantFromSnapshot;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../firebase");
const adminConstants_1 = require("./adminConstants");
const adminUtils_1 = require("./adminUtils");
function parseFilters(input) {
    const sort = input.sort === "oldest" ? "oldest" : "newest";
    const verificationStatus = input.verificationStatus === "verified" || input.verificationStatus === "pending"
        ? input.verificationStatus
        : "";
    return {
        search: (0, adminUtils_1.cleanOptionalString)(input.search, 120).toLocaleLowerCase(),
        country: (0, adminUtils_1.cleanOptionalString)(input.country, 100),
        state: (0, adminUtils_1.cleanOptionalString)(input.state, 100),
        district: (0, adminUtils_1.cleanOptionalString)(input.district, 100),
        verificationStatus,
        dateFrom: (0, adminUtils_1.cleanOptionalString)(input.dateFrom, 30),
        dateTo: (0, adminUtils_1.cleanOptionalString)(input.dateTo, 30),
        sort,
    };
}
function participantFromSnapshot(snapshot) {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        entryId: String(data.entryId || ""),
        registrationDate: (0, adminUtils_1.timestampToIso)(data.timestamp),
        fullName: String(data.fullName || ""),
        mobileNumber: String(data.mobileNumber || ""),
        instagramId: String(data.instagramId || ""),
        country: String(data.country || ""),
        state: String(data.state || ""),
        district: String(data.district || ""),
        instagramVerified: data.instagramVerified === true,
        whatsappVerified: data.whatsappVerified === true,
        status: String(data.status || "pending"),
        selectedEntryNumber: String(data.selectedEntryNumber || ""),
        deviceType: String(data.deviceType || "unknown"),
        userAgent: String(data.userAgent || "unknown"),
        ipHash: String(data.ipHash || ""),
        browserFingerprint: String(data.browserFingerprint || ""),
        createdDate: String(data.createdDate || ""),
        ownerUid: String(data.ownerUid || ""),
    };
}
function matchesFilters(participant, filters) {
    if (filters.search) {
        const searchable = [
            participant.entryId,
            participant.fullName,
            participant.mobileNumber,
            participant.instagramId,
        ]
            .join(" ")
            .toLocaleLowerCase();
        if (!searchable.includes(filters.search))
            return false;
    }
    if (filters.country && participant.country !== filters.country)
        return false;
    if (filters.state && participant.state !== filters.state)
        return false;
    if (filters.district && participant.district !== filters.district)
        return false;
    const verified = participant.instagramVerified && participant.whatsappVerified;
    if (filters.verificationStatus === "verified" && !verified)
        return false;
    if (filters.verificationStatus === "pending" && verified)
        return false;
    const timestamp = participant.registrationDate
        ? new Date(participant.registrationDate).getTime()
        : 0;
    if (filters.dateFrom) {
        const start = new Date(`${filters.dateFrom}T00:00:00+05:30`).getTime();
        if (Number.isFinite(start) && timestamp < start)
            return false;
    }
    if (filters.dateTo) {
        const end = new Date(`${filters.dateTo}T23:59:59.999+05:30`).getTime();
        if (Number.isFinite(end) && timestamp > end)
            return false;
    }
    return true;
}
async function listParticipants(input) {
    const data = (0, adminUtils_1.asRecord)(input);
    const filters = parseFilters(data);
    const pageSize = Math.min(100, Math.max(10, Number(data.pageSize) || 25));
    const direction = filters.sort === "oldest" ? "asc" : "desc";
    const decodedToken = (0, adminUtils_1.decodePageToken)(data.pageToken);
    let query = firebase_1.db
        .collection("participants")
        .orderBy("timestamp", direction)
        .orderBy(firestore_1.FieldPath.documentId(), direction);
    if (decodedToken)
        query = query.startAfter(decodedToken.timestamp, decodedToken.id);
    const participants = [];
    let lastScanned = null;
    let hasMore = false;
    let scanned = 0;
    while (participants.length < pageSize && scanned < 1_000) {
        const snapshot = await query.limit(100).get();
        if (snapshot.empty)
            break;
        for (const document of snapshot.docs) {
            scanned += 1;
            lastScanned = document;
            const participant = participantFromSnapshot(document);
            if (matchesFilters(participant, filters))
                participants.push(participant);
            if (participants.length >= pageSize) {
                hasMore = true;
                break;
            }
        }
        if (participants.length >= pageSize)
            break;
        if (snapshot.size < 100)
            break;
        const tail = snapshot.docs[snapshot.docs.length - 1];
        query = firebase_1.db
            .collection("participants")
            .orderBy("timestamp", direction)
            .orderBy(firestore_1.FieldPath.documentId(), direction)
            .startAfter(tail.get("timestamp"), tail.id);
        hasMore = true;
    }
    const totalSnapshot = await firebase_1.db.collection("participants").count().get();
    return {
        participants,
        nextPageToken: hasMore && lastScanned && lastScanned.get("timestamp") instanceof firestore_1.Timestamp
            ? (0, adminUtils_1.encodePageToken)(lastScanned.get("timestamp"), lastScanned.id)
            : null,
        totalParticipants: totalSnapshot.data().count,
        scanned,
    };
}
async function getParticipantFilterOptions() {
    const snapshot = await firebase_1.db
        .collection("participants")
        .select("country", "state", "district")
        .limit(20_000)
        .get();
    const countries = new Set();
    const states = new Set();
    const districts = new Set();
    for (const document of snapshot.docs) {
        const data = document.data();
        if (typeof data.country === "string" && data.country)
            countries.add(data.country);
        if (typeof data.state === "string" && data.state)
            states.add(data.state);
        if (typeof data.district === "string" && data.district)
            districts.add(data.district);
    }
    const options = (values) => [...values].sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
    return {
        countries: options(countries),
        states: options(states),
        districts: options(districts),
    };
}
async function exportParticipants(input) {
    const filters = parseFilters((0, adminUtils_1.asRecord)(input));
    const direction = filters.sort === "oldest" ? "asc" : "desc";
    const snapshot = await firebase_1.db
        .collection("participants")
        .orderBy("timestamp", direction)
        .limit(10_000)
        .get();
    return {
        participants: snapshot.docs
            .map(participantFromSnapshot)
            .filter((participant) => matchesFilters(participant, filters)),
        truncated: snapshot.size >= 10_000,
    };
}
async function getParticipantDetails(input) {
    const data = (0, adminUtils_1.asRecord)(input);
    const participantId = (0, adminUtils_1.requireText)(data.participantId, "Participant ID", 30);
    const snapshot = await firebase_1.db.collection("participants").doc(participantId).get();
    if (!snapshot.exists)
        throw new https_1.HttpsError("not-found", "Participant not found.");
    const participant = participantFromSnapshot(snapshot);
    const historySnapshot = participant.ownerUid
        ? await firebase_1.db
            .collection("logs")
            .where("uid", "==", participant.ownerUid)
            .orderBy("timestamp", "desc")
            .limit(100)
            .get()
        : null;
    return {
        participant,
        verificationHistory: historySnapshot?.docs.map((document) => {
            const history = document.data();
            return {
                id: document.id,
                type: String(history.recordType || "activity"),
                channel: String(history.channel || ""),
                attempt: Number(history.attempt || 0),
                success: history.success === true,
                whatsappSuccesses: Number(history.whatsappSuccesses || 0),
                timestamp: (0, adminUtils_1.timestampToIso)(history.timestamp),
            };
        }) ?? [],
    };
}
async function deleteParticipant(admin, input) {
    const data = (0, adminUtils_1.asRecord)(input);
    const participantId = (0, adminUtils_1.requireText)(data.participantId, "Participant ID", 30);
    const reason = (0, adminUtils_1.requireText)(data.reason, "Deletion reason", 500);
    if (reason.length < 5) {
        throw new https_1.HttpsError("invalid-argument", "Provide a meaningful deletion reason.");
    }
    const participantReference = firebase_1.db.collection("participants").doc(participantId);
    const logReference = firebase_1.db.collection("logs").doc();
    await firebase_1.db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(participantReference);
        if (!snapshot.exists)
            throw new https_1.HttpsError("not-found", "Participant not found.");
        const participant = snapshot.data();
        transaction.delete(participantReference);
        transaction.create(logReference, {
            recordType: "admin_audit",
            action: adminConstants_1.ADMIN_LOG_ACTIONS.participantDeletion,
            adminUid: admin.uid,
            adminEmail: admin.email,
            affectedRecord: String(participant.entryId || participantId),
            metadata: {
                reason,
                participantId,
                entryId: participant.entryId || "",
                selectedEntryNumber: participant.selectedEntryNumber || "",
                fullName: participant.fullName || "",
            },
            timestamp: firestore_1.Timestamp.now(),
        });
    });
    return { deleted: true };
}
function parseParticipantFilters(input) {
    return parseFilters((0, adminUtils_1.asRecord)(input));
}
//# sourceMappingURL=participantAdminService.js.map