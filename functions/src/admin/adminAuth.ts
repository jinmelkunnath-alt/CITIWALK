import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

export type AdminIdentity = {
  uid: string;
  email: string;
};

export function requireAdmin(request: CallableRequest<unknown>): AdminIdentity {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Administrator access is required.",
    );
  }

  return {
    uid: request.auth.uid,
    email:
      typeof request.auth.token.email === "string"
        ? request.auth.token.email
        : "admin",
  };
}
