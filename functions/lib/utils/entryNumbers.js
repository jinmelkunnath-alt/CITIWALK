"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalizeEntryNumber = canonicalizeEntryNumber;
exports.generateAvailableEntryNumbers = generateAvailableEntryNumbers;
const node_crypto_1 = require("node:crypto");
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../firebase");
function canonicalizeEntryNumber(value) {
    return String(value).padStart(6, "0");
}
function isProfessionalNumber(value) {
    if (/(\d)\1{3}/.test(value))
        return false;
    if (["1234", "2345", "3456", "4567", "5678", "6789", "9876", "8765", "7654", "6543", "5432", "4321"].some((sequence) => value.includes(sequence))) {
        return false;
    }
    if (value.endsWith("000"))
        return false;
    return new Set(value).size >= 3;
}
async function generateForLength(length, selected) {
    const minimum = 10 ** (length - 1);
    const maximum = 10 ** length;
    for (let attempt = 0; attempt < 100; attempt += 1) {
        const value = String((0, node_crypto_1.randomInt)(minimum, maximum));
        const canonical = canonicalizeEntryNumber(value);
        if (selected.has(canonical) || !isProfessionalNumber(value))
            continue;
        const snapshot = await firebase_1.db.collection("entryNumbers").doc(canonical).get();
        const available = !snapshot.exists || snapshot.get("status") === "available";
        if (!available)
            continue;
        selected.add(canonical);
        return { value, canonical };
    }
    throw new https_1.HttpsError("resource-exhausted", "Available entry numbers could not be prepared. Please try again.");
}
async function generateAvailableEntryNumbers() {
    const selected = new Set();
    const candidates = [];
    // One four-, five-, and six-digit value keeps all three options visually distinct.
    for (const length of [4, 5, 6]) {
        candidates.push(await generateForLength(length, selected));
    }
    return candidates.sort(() => (0, node_crypto_1.randomInt)(0, 2) - 0.5);
}
//# sourceMappingURL=entryNumbers.js.map