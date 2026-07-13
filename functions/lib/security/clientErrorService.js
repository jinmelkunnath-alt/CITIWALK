"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeClientError = storeClientError;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../firebase");
const hash_1 = require("../utils/hash");
const payload_1 = require("../utils/payload");
function clean(value, maxLength) {
    return typeof value === "string" ? value.slice(0, maxLength) : "";
}
async function storeClientError(request, input, secret) {
    (0, payload_1.assertPayloadSize)(input, 10_000);
    if (!request.auth)
        throw new https_1.HttpsError("unauthenticated", "Authentication is required.");
    if (!input || typeof input !== "object") {
        throw new https_1.HttpsError("invalid-argument", "Error details are required.");
    }
    const data = input;
    await firebase_1.db.collection("logs").add({
        recordType: "client_error",
        action: "CLIENT_ERROR",
        adminUid: request.auth.token.admin === true ? request.auth.uid : null,
        affectedRecord: clean(data.route, 300) || "client",
        metadata: {
            message: clean(data.message, 500),
            stack: clean(data.stack, 4_000),
            componentStack: clean(data.componentStack, 3_000),
            buildVersion: clean(data.buildVersion, 100),
            ipHash: (0, hash_1.sha256)(`${secret}:${(0, hash_1.getRequestIp)(request)}`),
            userAgent: (0, hash_1.getRequestUserAgent)(request),
        },
        timestamp: firestore_1.FieldValue.serverTimestamp(),
    });
    return { reported: true };
}
//# sourceMappingURL=clientErrorService.js.map