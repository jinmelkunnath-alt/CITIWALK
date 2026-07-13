"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMobileNumber = normalizeMobileNumber;
exports.normalizeInstagramId = normalizeInstagramId;
exports.validateRegistrationPayload = validateRegistrationPayload;
exports.getIstCreatedDate = getIstCreatedDate;
const https_1 = require("firebase-functions/v2/https");
const min_1 = require("libphonenumber-js/min");
const payload_1 = require("./payload");
function requireString(value, field, maxLength) {
    if (typeof value !== "string") {
        throw new https_1.HttpsError("invalid-argument", `${field} is required.`);
    }
    const normalized = value.trim();
    if (!normalized || normalized.length > maxLength) {
        throw new https_1.HttpsError("invalid-argument", `Enter a valid ${field.toLowerCase()}.`);
    }
    return normalized;
}
function normalizeMobileNumber(value, countryCodeValue) {
    const mobileNumber = requireString(value, "Mobile number", 16);
    const countryCode = requireString(countryCodeValue, "Country", 2).toUpperCase();
    if (!/^\+[1-9]\d{7,14}$/.test(mobileNumber)) {
        throw new https_1.HttpsError("invalid-argument", "Enter a valid mobile number with country code using digits only.");
    }
    const parsed = (0, min_1.parsePhoneNumberFromString)(mobileNumber);
    if (!parsed?.isValid()) {
        throw new https_1.HttpsError("invalid-argument", "Enter a valid mobile number.");
    }
    if (parsed.country && parsed.country !== countryCode) {
        throw new https_1.HttpsError("invalid-argument", "The mobile country code does not match the selected country.");
    }
    return parsed.number;
}
function normalizeInstagramId(value) {
    const instagramId = requireString(value, "Instagram ID", 31);
    if (!/^@?[a-zA-Z0-9._]{2,30}$/.test(instagramId)) {
        throw new https_1.HttpsError("invalid-argument", "Enter a valid Instagram ID.");
    }
    return instagramId.startsWith("@") ? instagramId : `@${instagramId}`;
}
function validateRegistrationPayload(input) {
    (0, payload_1.assertPayloadSize)(input, 12_000);
    if (!input || typeof input !== "object") {
        throw new https_1.HttpsError("invalid-argument", "Registration details are required.");
    }
    const data = input;
    const fullName = (0, payload_1.rejectMarkup)(requireString(data.fullName, "Full name", 100), "Full name");
    if (fullName.length < 2) {
        throw new https_1.HttpsError("invalid-argument", "Enter your full name.");
    }
    const countryCode = requireString(data.countryCode, "Country", 2).toUpperCase();
    const mobileNumber = normalizeMobileNumber(data.mobileNumber, countryCode);
    const selectedEntryNumber = requireString(data.selectedEntryNumber, "Entry number", 6);
    const browserFingerprint = requireString(data.browserFingerprint, "Browser fingerprint", 64);
    if (!/^\d{6}$/.test(selectedEntryNumber)) {
        throw new https_1.HttpsError("invalid-argument", "Select a valid entry number.");
    }
    if (!/^[a-f0-9]{64}$/.test(browserFingerprint)) {
        throw new https_1.HttpsError("invalid-argument", "A valid browser fingerprint is required.");
    }
    return {
        fullName,
        mobileNumber,
        instagramId: normalizeInstagramId(data.instagramId),
        countryCode,
        country: (0, payload_1.rejectMarkup)(requireString(data.country, "Country", 100), "Country"),
        state: (0, payload_1.rejectMarkup)(requireString(data.state, "State", 100), "State"),
        district: (0, payload_1.rejectMarkup)(requireString(data.district, "District", 100), "District"),
        selectedEntryNumber,
        browserFingerprint,
    };
}
function getIstCreatedDate(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}
//# sourceMappingURL=validation.js.map