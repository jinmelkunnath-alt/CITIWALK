import { Timestamp, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../firebase";
import { getDeviceType, getRequestIp, getRequestUserAgent, sha256 } from "../utils/hash";
import type { AdminIdentity } from "./adminAuth";
import { ADMIN_LOG_ACTIONS } from "./adminConstants";
import {
  asRecord,
  cleanOptionalString,
  decodePageToken,
  encodePageToken,
  timestampToIso,
} from "./adminUtils";

export async function recordAdminLoginAttempt(
  request: CallableRequest<unknown>,
  input: unknown,
  ipSalt: string,
  admin: AdminIdentity | null,
) {
  const data = asRecord(input);
  const success = data.success === true && admin !== null;
  const email = cleanOptionalString(data.email, 320).toLocaleLowerCase();
  const userAgent = getRequestUserAgent(request);
  const action = success ? ADMIN_LOG_ACTIONS.login : ADMIN_LOG_ACTIONS.failedLogin;
  const affectedRecord = success
    ? admin.uid
    : sha256(`${ipSalt}:${email || "unknown"}`);

  await db.collection("logs").add({
    recordType: "admin_audit",
    action,
    adminUid: admin?.uid || null,
    adminEmail: success ? admin?.email : null,
    affectedRecord,
    metadata: {
      success,
      emailHash: success ? null : affectedRecord,
      ipHash: sha256(`${ipSalt}:${getRequestIp(request)}`),
      userAgent,
      deviceType: getDeviceType(userAgent),
    },
    timestamp: Timestamp.now(),
  });

  return { logged: true };
}

function publicLog(document: QueryDocumentSnapshot) {
  const data = document.data();
  return {
    id: document.id,
    action: String(data.action || data.recordType || "SYSTEM_EVENT"),
    adminUid: data.adminUid ? String(data.adminUid) : null,
    adminEmail: data.adminEmail ? String(data.adminEmail) : null,
    affectedRecord: String(data.affectedRecord || ""),
    metadata:
      data.metadata && typeof data.metadata === "object" ? data.metadata : {},
    timestamp: timestampToIso(data.timestamp),
  };
}

export async function listAdminLogs(input: unknown) {
  const data = asRecord(input);
  const search = cleanOptionalString(data.search, 120).toLocaleLowerCase();
  const action = cleanOptionalString(data.action, 80);
  const dateFrom = cleanOptionalString(data.dateFrom, 30);
  const dateTo = cleanOptionalString(data.dateTo, 30);
  const pageSize = Math.min(100, Math.max(10, Number(data.pageSize) || 25));
  const token = decodePageToken(data.pageToken);
  let query = db
    .collection("logs")
    .orderBy("timestamp", "desc");
  if (token) query = query.startAfter(token.timestamp);

  const results: ReturnType<typeof publicLog>[] = [];
  let lastScanned: QueryDocumentSnapshot | null = null;
  let hasMore = false;
  let scanned = 0;

  while (results.length < pageSize && scanned < 1_000) {
    const snapshot = await query.limit(100).get();
    if (snapshot.empty) break;
    for (const document of snapshot.docs) {
      scanned += 1;
      lastScanned = document;
      if (
        !["admin_audit", "security_event", "client_error"].includes(
          String(document.get("recordType") || ""),
        )
      ) {
        continue;
      }
      const log = publicLog(document);
      const time = log.timestamp ? new Date(log.timestamp).getTime() : 0;
      const matchesSearch =
        !search ||
        [log.action, log.adminEmail || "", log.affectedRecord]
          .join(" ")
          .toLocaleLowerCase()
          .includes(search);
      const matchesAction = !action || log.action === action;
      const matchesFrom =
        !dateFrom || time >= new Date(`${dateFrom}T00:00:00+05:30`).getTime();
      const matchesTo =
        !dateTo || time <= new Date(`${dateTo}T23:59:59.999+05:30`).getTime();
      if (matchesSearch && matchesAction && matchesFrom && matchesTo) results.push(log);
      if (results.length >= pageSize) {
        hasMore = true;
        break;
      }
    }
    if (results.length >= pageSize || snapshot.size < 100) break;
    const tail = snapshot.docs[snapshot.docs.length - 1];
    query = db
      .collection("logs")
      .orderBy("timestamp", "desc")
      .startAfter(tail.get("timestamp"));
    hasMore = true;
  }

  return {
    logs: results,
    nextPageToken:
      hasMore && lastScanned && lastScanned.get("timestamp") instanceof Timestamp
        ? encodePageToken(lastScanned.get("timestamp"), lastScanned.id)
        : null,
  };
}
