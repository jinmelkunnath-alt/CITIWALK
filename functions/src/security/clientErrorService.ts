import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { db } from "../firebase";
import { getRequestIp, getRequestUserAgent, sha256 } from "../utils/hash";
import { assertPayloadSize } from "../utils/payload";

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

export async function storeClientError(
  request: CallableRequest<unknown>,
  input: unknown,
  secret: string,
) {
  assertPayloadSize(input, 10_000);
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  if (!input || typeof input !== "object") {
    throw new HttpsError("invalid-argument", "Error details are required.");
  }
  const data = input as Record<string, unknown>;
  await db.collection("logs").add({
    recordType: "client_error",
    action: "CLIENT_ERROR",
    adminUid: request.auth.token.admin === true ? request.auth.uid : null,
    affectedRecord: clean(data.route, 300) || "client",
    metadata: {
      message: clean(data.message, 500),
      stack: clean(data.stack, 4_000),
      componentStack: clean(data.componentStack, 3_000),
      buildVersion: clean(data.buildVersion, 100),
      ipHash: sha256(`${secret}:${getRequestIp(request)}`),
      userAgent: getRequestUserAgent(request),
    },
    timestamp: FieldValue.serverTimestamp(),
  });
  return { reported: true };
}
