import { FieldValue } from "firebase-admin/firestore";
import type { CallableRequest } from "firebase-functions/v2/https";
import { db } from "../firebase";
import { getRequestIp, sha256 } from "../utils/hash";

export async function logSecurityFailure(
  request: CallableRequest<unknown>,
  action: string,
  error: unknown,
  secret: string,
) {
  const candidate = error as {
    code?: string;
    message?: string;
    details?: { reason?: string };
  };
  await db.collection("logs").add({
    recordType: "security_event",
    action,
    adminUid: request.auth?.token.admin === true ? request.auth.uid : null,
    affectedRecord: request.auth?.uid || "anonymous",
    metadata: {
      code: candidate.code || "unknown",
      reason: candidate.details?.reason || null,
      message: (candidate.message || "Request failed").slice(0, 300),
      ipHash: sha256(`${secret}:${getRequestIp(request)}`),
    },
    timestamp: FieldValue.serverTimestamp(),
  });
}
