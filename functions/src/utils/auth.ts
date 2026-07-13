import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export function requireAuthenticatedUid(request: CallableRequest<unknown>) {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "A secure participant session could not be established. Please refresh and try again.",
    );
  }
  return uid;
}
