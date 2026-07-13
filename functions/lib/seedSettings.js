"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase-admin/firestore");
const config_1 = require("./config");
const firebase_1 = require("./firebase");
async function seedSettings() {
    await firebase_1.db.collection("settings").doc("public").set({
        ...config_1.defaultCampaignSettings,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log("Seeded settings/public for CITIWALK Global Rewards.");
}
void seedSettings()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=seedSettings.js.map