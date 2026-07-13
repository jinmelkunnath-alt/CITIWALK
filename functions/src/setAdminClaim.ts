import { getAuth } from "firebase-admin/auth";
import { getApps, initializeApp } from "firebase-admin/app";

if (!getApps().length) initializeApp();

async function setAdminClaim() {
  const email = process.argv[2]?.trim().toLocaleLowerCase();
  if (!email) {
    throw new Error("Usage: npm run admin:claim -- admin@example.com");
  }
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true,
  });
  console.log(`Admin claim enabled for ${email} (${user.uid}).`);
  console.log("The user must sign out and sign in again to refresh the ID token.");
}

void setAdminClaim()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
