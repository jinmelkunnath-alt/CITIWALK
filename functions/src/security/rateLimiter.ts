import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { db } from "../firebase";
import { getRequestIp, sha256 } from "../utils/hash";

export type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowMs: number;
  cooldownMs: number;
  deviceFingerprint?: unknown;
  minimumIntervalMs?: number;
};

type LimitState = {
  windowStartedAt?: Timestamp;
  lastRequestAt?: Timestamp;
  blockedUntil?: Timestamp;
  count?: number;
};

function validFingerprint(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value)
    ? value
    : null;
}

export async function enforceRateLimit(
  request: CallableRequest<unknown>,
  policy: RateLimitPolicy,
  secret: string,
) {
  const now = Timestamp.now();
  const ipHash = sha256(`${secret}:${getRequestIp(request)}`);
  const fingerprint = validFingerprint(policy.deviceFingerprint);
  const identifiers = [
    { type: "ip", value: ipHash },
    ...(fingerprint ? [{ type: "device", value: fingerprint }] : []),
  ];
  const references = identifiers.map(({ type, value }) =>
    db.collection("rateLimits").doc(sha256(`${policy.scope}:${type}:${value}`)),
  );

  const decision = await db.runTransaction(async (transaction) => {
    const snapshots = await Promise.all(
      references.map((reference) => transaction.get(reference)),
    );
    let retryAfterMs = 0;
    let blockedReason = "";
    const updates: Array<{ reference: FirebaseFirestore.DocumentReference; data: Record<string, unknown> }> = [];

    snapshots.forEach((snapshot, index) => {
      const current = (snapshot.data() || {}) as LimitState;
      const blockedUntil = current.blockedUntil?.toMillis() || 0;
      const lastRequestAt = current.lastRequestAt?.toMillis() || 0;
      const windowStartedAt = current.windowStartedAt?.toMillis() || 0;
      const windowExpired = now.toMillis() - windowStartedAt >= policy.windowMs;
      const count = windowExpired ? 1 : Number(current.count || 0) + 1;

      if (blockedUntil > now.toMillis()) {
        retryAfterMs = Math.max(retryAfterMs, blockedUntil - now.toMillis());
        blockedReason = "cooldown";
      } else if (
        policy.minimumIntervalMs &&
        lastRequestAt > 0 &&
        now.toMillis() - lastRequestAt < policy.minimumIntervalMs
      ) {
        retryAfterMs = Math.max(
          retryAfterMs,
          policy.minimumIntervalMs - (now.toMillis() - lastRequestAt),
        );
        blockedReason = "minimum_interval";
      } else if (count > policy.limit) {
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
          blockedUntil:
            count > policy.limit
              ? Timestamp.fromMillis(now.toMillis() + policy.cooldownMs)
              : current.blockedUntil || null,
          expiresAt: Timestamp.fromMillis(
            now.toMillis() + policy.windowMs + policy.cooldownMs,
          ),
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
    await db.collection("logs").add({
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
      timestamp: FieldValue.serverTimestamp(),
    });
    throw new HttpsError(
      "resource-exhausted",
      `Too many requests. Try again in ${Math.ceil(decision.retryAfterMs / 1_000)} seconds.`,
      {
        reason: "RATE_LIMITED",
        retryAfterSeconds: Math.ceil(decision.retryAfterMs / 1_000),
      },
    );
  }
}
