"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asRecord = asRecord;
exports.cleanOptionalString = cleanOptionalString;
exports.requireText = requireText;
exports.timestampToIso = timestampToIso;
exports.encodePageToken = encodePageToken;
exports.decodePageToken = decodePageToken;
exports.writeAuditLog = writeAuditLog;
exports.startOfTodayIst = startOfTodayIst;
exports.serverTimestamp = serverTimestamp;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../firebase");
const payload_1 = require("../utils/payload");
function asRecord(input) {
    (0, payload_1.assertPayloadSize)(input, 24_000);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new https_1.HttpsError("invalid-argument", "A valid request is required.");
    }
    return input;
}
function cleanOptionalString(value, maxLength = 200) {
    if (typeof value !== "string")
        return "";
    return value.trim().slice(0, maxLength);
}
function requireText(value, label, maxLength = 200) {
    const text = cleanOptionalString(value, maxLength);
    if (!text)
        throw new https_1.HttpsError("invalid-argument", `${label} is required.`);
    return text;
}
function timestampToIso(value) {
    return value instanceof firestore_1.Timestamp ? value.toDate().toISOString() : null;
}
function encodePageToken(timestamp, id) {
    return Buffer.from(JSON.stringify({ timestamp: timestamp.toMillis(), id }), "utf8").toString("base64url");
}
function decodePageToken(token) {
    if (typeof token !== "string" || !token)
        return null;
    try {
        const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
        if (typeof parsed.timestamp !== "number" || typeof parsed.id !== "string") {
            throw new Error("Invalid token");
        }
        return { timestamp: firestore_1.Timestamp.fromMillis(parsed.timestamp), id: parsed.id };
    }
    catch {
        throw new https_1.HttpsError("invalid-argument", "The page token is invalid.");
    }
}
function writeAuditLog(admin, action, affectedRecord, metadata = {}) {
    return firebase_1.db.collection("logs").add({
        recordType: "admin_audit",
        action,
        adminUid: admin.uid,
        adminEmail: admin.email,
        affectedRecord,
        metadata,
        timestamp: firestore_1.FieldValue.serverTimestamp(),
    });
}
function startOfTodayIst() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return firestore_1.Timestamp.fromMillis(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), -5, -30));
}
function serverTimestamp() {
    return firestore_1.FieldValue.serverTimestamp();
}
//# sourceMappingURL=adminUtils.js.map