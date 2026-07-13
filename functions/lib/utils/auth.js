"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuthenticatedUid = requireAuthenticatedUid;
const https_1 = require("firebase-functions/v2/https");
function requireAuthenticatedUid(request) {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new https_1.HttpsError("unauthenticated", "A secure participant session could not be established. Please refresh and try again.");
    }
    return uid;
}
//# sourceMappingURL=auth.js.map