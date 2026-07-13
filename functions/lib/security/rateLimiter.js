"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceRateLimit = enforceRateLimit;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../firebase");
const hash_1 = require("../utils/hash");
function validFingerprint(value) {
    return typeof value === "string" && /^[a-f0-9]{64}$/.test(value)
        ? value
        : null;
}
async function enforceRateLimit(request, policy, secret) {
    const now = firestore_1.Timestamp.now();
    const ipHash = (0, hash_1.sha256)(`${secret}:${(0, hash_1.getRequestIp)(request)}`);
    const fingerprint = validFingerprint(policy.deviceFingerprint);
    const identifiers = [
        { type: "ip", value: ipHash },
        ...(fingerprint ? [{ type: "device", value: fingerprint }] : []),
    ];
    const references = identifiers.map(({ type, value }) => firebase_1.db.collection("rateLimits").doc((0, hash_1.sha256)(`${policy.scope}:${type}:${value}`)));
    const decision = await firebase_1.db.runTransaction(async (transaction) => {
        const snapshots = await Promise.all(references.map((reference) => transaction.get(reference)));
        let retryAfterMs = 0;
        let blockedReason = "";
        const updates = [];
        snapshots.forEach((snapshot, index) => {
            const current = (snapshot.data() || {});
            const blockedUntil = current.blockedUntil?.toMillis() || 0;
            const lastRequestAt = current.lastRequestAt?.toMillis() || 0;
            const windowStartedAt = current.windowStartedAt?.toMillis() || 0;
            const windowExpired = now.toMillis() - windowStartedAt >= policy.windowMs;
            const count = windowExpired ? 1 : Number(current.count || 0) + 1;
            if (blockedUntil > now.toMillis()) {
                retryAfterMs = Math.max(retryAfterMs, blockedUntil - now.toMillis());
                blockedReason = "cooldown";
            }
            else if (policy.minimumIntervalMs &&
                lastRequestAt > 0 &&
                now.toMillis() - lastRequestAt < policy.minimumIntervalMs) {
                retryAfterMs = Math.max(retryAfterMs, policy.minimumIntervalMs - (now.toMillis() - lastRequestAt));
                blockedReason = "minimum_interval";
            }
            else if (count > policy.limit) {
                retryAfterMs = Math.max(retryAfterMs, policy.cooldownMs);
                blockedReason = "window_limit";
            }
            updates.push({
                reference: references[index],
                data: {
                    scope: policy.scope,
                    identifierType: identifiers[index].type,
                    identifierHash: identifiers[index].value,
                    count,
                    windowStartedAt: windowExpired ? now : current.windowStartedAt || now,
                    lastRequestAt: now,
                    blockedUntil: count > policy.limit
                        ? firestore_1.Timestamp.fromMillis(now.toMillis() + policy.cooldownMs)
                        : current.blockedUntil || null,
                    expiresAt: firestore_1.Timestamp.fromMillis(now.toMillis() + policy.windowMs + policy.cooldownMs),
                    updatedAt: now,
                },
            });
        });
        for (const update of updates) {
            transaction.set(update.reference, update.data, { merge: true });
        }
        return { retryAfterMs, blockedReason, ipHash, fingerprint };
    });
    if (decision.retryAfterMs > 0) {
        await firebase_1.db.collection("logs").add({
            recordType: "security_event",
            action: "SECURITY_RATE_LIMIT",
            adminUid: request.auth?.token.admin === true ? request.auth.uid : null,
            affectedRecord: policy.scope,
            metadata: {
                reason: decision.blockedReason,
                retryAfterSeconds: Math.ceil(decision.retryAfterMs / 1_000),
                ipHash: decision.ipHash,
                deviceHash: decision.fingerprint,
            },
            timestamp: firestore_1.FieldValue.serverTimestamp(),
        });
        throw new https_1.HttpsError("resource-exhausted", `Too many requests. Try again in ${Math.ceil(decision.retryAfterMs / 1_000)} seconds.`, {
            reason: "RATE_LIMITED",
            retryAfterSeconds: Math.ceil(decision.retryAfterMs / 1_000),
        });
    }
}
//# sourceMappingURL=rateLimiter.js.map