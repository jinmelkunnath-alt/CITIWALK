import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "../firebase";
import type { AdminIdentity } from "./adminAuth";
import { assertPayloadSize } from "../utils/payload";

export function asRecord(input: unknown) {
  assertPayloadSize(input, 24_000);
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpsError("invalid-argument", "A valid request is required.");
  }
  return input as Record<string, unknown>;
}

export function cleanOptionalString(value: unknown, maxLength = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function requireText(value: unknown, label: string, maxLength = 200) {
  const text = cleanOptionalString(value, maxLength);
  if (!text) throw new HttpsError("invalid-argument", `${label} is required.`);
  return text;
}

export function timestampToIso(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

export function encodePageToken(timestamp: Timestamp, id: string) {
  return Buffer.from(
    JSON.stringify({ timestamp: timestamp.toMillis(), id }),
    "utf8",
  ).toString("base64url");
}

export function decodePageToken(token: unknown) {
  if (typeof token !== "string" || !token) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    ) as { timestamp?: unknown; id?: unknown };
    if (typeof parsed.timestamp !== "number" || typeof parsed.id !== "string") {
      throw new Error("Invalid token");
    }
    return { timestamp: Timestamp.fromMillis(parsed.timestamp), id: parsed.id };
  } catch {
    throw new HttpsError("invalid-argument", "The page token is invalid.");
  }
}

export function writeAuditLog(
  admin: AdminIdentity,
  action: string,
  affectedRecord: string,
  metadata: Record<string, unknown> = {},
) {
  return db.collection("logs").add({
    recordType: "admin_audit",
    action,
    adminUid: admin.uid,
    adminEmail: admin.email,
    affectedRecord,
    metadata,
    timestamp: FieldValue.serverTimestamp(),
  });
}

export function startOfTodayIst() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Timestamp.fromMillis(
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      -5,
      -30,
    ),
  );
}

export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}
