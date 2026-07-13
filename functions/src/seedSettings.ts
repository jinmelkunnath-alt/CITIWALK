import { FieldValue } from "firebase-admin/firestore";
import { defaultCampaignSettings } from "./config";
import { db } from "./firebase";

async function seedSettings() {
  await db.collection("settings").doc("public").set(
    {
      ...defaultCampaignSettings,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log("Seeded settings/public for CITIWALK Global Rewards.");
}

void seedSettings()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
