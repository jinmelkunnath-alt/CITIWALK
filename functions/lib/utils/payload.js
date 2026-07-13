"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPayloadSize = assertPayloadSize;
exports.rejectMarkup = rejectMarkup;
const https_1 = require("firebase-functions/v2/https");
function assertPayloadSize(input, maximumBytes = 12_000) {
    let serialized = "";
    try {
        serialized = JSON.stringify(input ?? {});
    }
    catch {
        throw new https_1.HttpsError("invalid-argument", "The request payload is invalid.");
    }
    if (Buffer.byteLength(serialized, "utf8") > maximumBytes) {
        throw new https_1.HttpsError("invalid-argument", "The request payload is too large.");
    }
}
function rejectMarkup(value, label) {
    if (/[<>]/.test(value) || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
        throw new https_1.HttpsError("invalid-argument", `${label} contains unsupported characters.`);
    }
    return value;
}
//# sourceMappingURL=payload.js.map