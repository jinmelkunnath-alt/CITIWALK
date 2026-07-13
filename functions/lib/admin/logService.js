"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAdminLoginAttempt = recordAdminLoginAttempt;
exports.listAdminLogs = listAdminLogs;
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("../firebase");
const hash_1 = require("../utils/hash");
const adminConstants_1 = require("./adminConstants");
const adminUtils_1 = require("./adminUtils");
async function recordAdminLoginAttempt(request, input, ipSalt, admin) {
    const data = (0, adminUtils_1.asRecord)(input);
    const success = data.success === true && admin !== null;
    const email = (0, adminUtils_1.cleanOptionalString)(data.email, 320).toLocaleLowerCase();
    const userAgent = (0, hash_1.getRequestUserAgent)(request);
    const action = success ? adminConstants_1.ADMIN_LOG_ACTIONS.login : adminConstants_1.ADMIN_LOG_ACTIONS.failedLogin;
    const affectedRecord = success
        ? admin.uid
        : (0, hash_1.sha256)(`${ipSalt}:${email || "unknown"}`);
    await firebase_1.db.collection("logs").add({
        recordType: "admin_audit",
        action,
        adminUid: admin?.uid || null,
        adminEmail: success ? admin?.email : null,
        affectedRecord,
        metadata: {
            success,
            emailHash: success ? null : affectedRecord,
            ipHash: (0, hash_1.sha256)(`${ipSalt}:${(0, hash_1.getRequestIp)(request)}`),
            userAgent,
            deviceType: (0, hash_1.getDeviceType)(userAgent),
        },
        timestamp: firestore_1.Timestamp.now(),
    });
    return { logged: true };
}
function publicLog(document) {
    const data = document.data();
    return {
        id: document.id,
        action: String(data.action || data.recordType || "SYSTEM_EVENT"),
        adminUid: data.adminUid ? String(data.adminUid) : null,
        adminEmail: data.adminEmail ? String(data.adminEmail) : null,
        affectedRecord: String(data.affectedRecord || ""),
        metadata: data.metadata && typeof data.metadata === "object" ? data.metadata : {},
        timestamp: (0, adminUtils_1.timestampToIso)(data.timestamp),
    };
}
async function listAdminLogs(input) {
    const data = (0, adminUtils_1.asRecord)(input);
    const search = (0, adminUtils_1.cleanOptionalString)(data.search, 120).toLocaleLowerCase();
    const action = (0, adminUtils_1.cleanOptionalString)(data.action, 80);
    const dateFrom = (0, adminUtils_1.cleanOptionalString)(data.dateFrom, 30);
    const dateTo = (0, adminUtils_1.cleanOptionalString)(data.dateTo, 30);
    const pageSize = Math.min(100, Math.max(10, Number(data.pageSize) || 25));
    const token = (0, adminUtils_1.decodePageToken)(data.pageToken);
    let query = firebase_1.db
        .collection("logs")
        .orderBy("timestamp", "desc");
    if (token)
        query = query.startAfter(token.timestamp);
    const results = [];
    let lastScanned = null;
    let hasMore = false;
    let scanned = 0;
    while (results.length < pageSize && scanned < 1_000) {
        const snapshot = await query.limit(100).get();
        if (snapshot.empty)
            break;
        for (const document of snapshot.docs) {
            scanned += 1;
            lastScanned = document;
            if (!["admin_audit", "security_event", "client_error"].includes(String(document.get("recordType") || ""))) {
                continue;
            }
            const log = publicLog(document);
            const time = log.timestamp ? new Date(log.timestamp).getTime() : 0;
            const matchesSearch = !search ||
                [log.action, log.adminEmail || "", log.affectedRecord]
                    .join(" ")
                    .toLocaleLowerCase()
                    .includes(search);
            const matchesAction = !action || log.action === action;
            const matchesFrom = !dateFrom || time >= new Date(`${dateFrom}T00:00:00+05:30`).getTime();
            const matchesTo = !dateTo || time <= new Date(`${dateTo}T23:59:59.999+05:30`).getTime();
            if (matchesSearch && matchesAction && matchesFrom && matchesTo)
                results.push(log);
            if (results.length >= pageSize) {
                hasMore = true;
                break;
            }
        }
        if (results.length >= pageSize || snapshot.size < 100)
            break;
        const tail = snapshot.docs[snapshot.docs.length - 1];
        query = firebase_1.db
            .collection("logs")
            .orderBy("timestamp", "desc")
            .startAfter(tail.get("timestamp"));
        hasMore = true;
    }
    return {
        logs: results,
        nextPageToken: hasMore && lastScanned && lastScanned.get("timestamp") instanceof firestore_1.Timestamp
            ? (0, adminUtils_1.encodePageToken)(lastScanned.get("timestamp"), lastScanned.id)
            : null,
    };
}
//# sourceMappingURL=logService.js.map