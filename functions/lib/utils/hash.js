"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.getRequestIp = getRequestIp;
exports.getRequestUserAgent = getRequestUserAgent;
exports.getDeviceType = getDeviceType;
const node_crypto_1 = require("node:crypto");
function sha256(value) {
    return (0, node_crypto_1.createHash)("sha256").update(value).digest("hex");
}
function getRequestIp(request) {
    const forwarded = request.rawRequest.headers["x-forwarded-for"];
    const forwardedValues = (Array.isArray(forwarded) ? forwarded : forwarded?.split(","))
        ?.map((value) => value.trim())
        .filter(Boolean);
    // Express/Firebase supplies the trusted request IP. The right-most forwarded
    // value is only a fallback and avoids trusting a client-injected left-most IP.
    return (request.rawRequest.ip ||
        forwardedValues?.[forwardedValues.length - 1] ||
        "unavailable").trim();
}
function getRequestUserAgent(request) {
    return (request.rawRequest.get("user-agent") || "unknown").slice(0, 512);
}
function getDeviceType(userAgent) {
    if (/tablet|ipad|playbook|silk/i.test(userAgent))
        return "tablet";
    if (/mobile|iphone|ipod|android/i.test(userAgent))
        return "mobile";
    return "desktop";
}
//# sourceMappingURL=hash.js.map