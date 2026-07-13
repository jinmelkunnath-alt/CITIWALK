import { createHash } from "node:crypto";
import type { CallableRequest } from "firebase-functions/v2/https";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getRequestIp(request: CallableRequest<unknown>) {
  const forwarded = request.rawRequest.headers["x-forwarded-for"];
  const forwardedValues = (Array.isArray(forwarded) ? forwarded : forwarded?.split(","))
    ?.map((value) => value.trim())
    .filter(Boolean);
  // Express/Firebase supplies the trusted request IP. The right-most forwarded
  // value is only a fallback and avoids trusting a client-injected left-most IP.
  return (
    request.rawRequest.ip ||
    forwardedValues?.[forwardedValues.length - 1] ||
    "unavailable"
  ).trim();
}

export function getRequestUserAgent(request: CallableRequest<unknown>) {
  return (request.rawRequest.get("user-agent") || "unknown").slice(0, 512);
}

export function getDeviceType(userAgent: string) {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}
