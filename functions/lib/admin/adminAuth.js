"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
const https_1 = require("firebase-functions/v2/https");
function requireAdmin(request) {
    if (!request.auth || request.auth.token.admin !== true) {
        throw new https_1.HttpsError("permission-denied", "Administrator access is required.");
    }
    return {
        uid: request.auth.uid,
        email: typeof request.auth.token.email === "string"
            ? request.auth.token.email
            : "admin",
    };
}
//# sourceMappingURL=adminAuth.js.map