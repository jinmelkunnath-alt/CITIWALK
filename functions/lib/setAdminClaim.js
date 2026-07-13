"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("firebase-admin/auth");
const app_1 = require("firebase-admin/app");
if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)();
async function setAdminClaim() {
    const email = process.argv[2]?.trim().toLocaleLowerCase();
    if (!email) {
        throw new Error("Usage: npm run admin:claim -- admin@example.com");
    }
    const user = await (0, auth_1.getAuth)().getUserByEmail(email);
    await (0, auth_1.getAuth)().setCustomUserClaims(user.uid, {
        ...user.customClaims,
        admin: true,
    });
    console.log(`Admin claim enabled for ${email} (${user.uid}).`);
    console.log("The user must sign out and sign in again to refresh the ID token.");
}
void setAdminClaim()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=setAdminClaim.js.map