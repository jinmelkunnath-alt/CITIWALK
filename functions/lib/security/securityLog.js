"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityFailure = logSecurityFailure;
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("../firebase");
const hash_1 = require("../utils/hash");
async function logSecurityFailure(request, action, error, secret) {
    const candidate = error;
    await firebase_1.db.collection("logs").add({
        recordType: "security_event",
        action,
        adminUid: request.auth?.token.admin === true ? request.auth.uid : null,
        affectedRecord: request.auth?.uid || "anonymous",
        metadata: {
            code: candidate.code || "unknown",
            reason: candidate.details?.reason || null,
            message: (candidate.message || "Request failed").slice(0, 300),
            ipHash: (0, hash_1.sha256)(`${secret}:${(0, hash_1.getRequestIp)(request)}`),
        },
        timestamp: firestore_1.FieldValue.serverTimestamp(),
    });
}
//# sourceMappingURL=securityLog.js.map