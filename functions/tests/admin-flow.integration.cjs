process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "demo-citiwalk";
process.env.GOOGLE_CLOUD_PROJECT = "demo-citiwalk";

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

initializeApp({ projectId: "demo-citiwalk" });
const auth = getAuth();
const db = getFirestore();
const functionsBase = "http://127.0.0.1:5001/demo-citiwalk/asia-south1";

async function signIn(email, password) {
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(payload));
  return payload.idToken;
}

async function anonymousToken() {
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  const payload = await response.json();
  return payload.idToken;
}

async function call(name, data, token, expectedStatus) {
  const response = await fetch(`${functionsBase}/${name}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });
  const payload = await response.json();
  if (payload.error) {
    if (expectedStatus && payload.error.status === expectedStatus) return payload.error;
    throw new Error(`${name}: ${JSON.stringify(payload.error)}`);
  }
  if (expectedStatus) throw new Error(`${name}: expected ${expectedStatus}`);
  return payload.result;
}

async function seedParticipants() {
  const batch = db.batch();
  const now = Date.now();
  for (let index = 0; index < 12; index += 1) {
    const mobileNumber = `+91987654${String(3200 + index)}`;
    const canonical = String(120000 + index);
    const uid = `participant-${index}`;
    batch.set(db.collection("participants").doc(mobileNumber), {
      fullName: `Participant ${index + 1}`,
      mobileNumber,
      instagramId: `@participant.${index + 1}`,
      countryCode: "IN",
      country: "India",
      state: "Kerala",
      district: index % 2 ? "Kasaragod" : "Kannur",
      entryId: `#GIVE-2026-${canonical}`,
      selectedEntryNumber: canonical,
      instagramVerified: true,
      whatsappVerified: true,
      whatsappSuccessfulShares: 8,
      createdDate: "2026-07-13",
      timestamp: Timestamp.fromMillis(now - index * 60_000),
      ipHash: "a".repeat(64),
      browserFingerprint: "b".repeat(64),
      userAgent: index % 2 ? "Mozilla/5.0 Chrome/130.0 Mobile" : "Mozilla/5.0 Safari/605.1.15",
      deviceType: index % 2 ? "mobile" : "desktop",
      status: "confirmed",
      ownerUid: uid,
    });
    batch.set(db.collection("entryNumbers").doc(canonical), {
      number: canonical,
      status: "assigned",
      participantId: mobileNumber,
      entryId: `#GIVE-2026-${canonical}`,
      assignedAt: Timestamp.fromMillis(now - index * 60_000),
    });
    batch.set(db.collection("logs").doc(`verification-${index}`), {
      recordType: "verification_attempt",
      uid,
      channel: "whatsapp",
      attempt: 10,
      success: true,
      whatsappSuccesses: 8,
      timestamp: Timestamp.fromMillis(now - index * 60_000),
    });
  }
  await batch.commit();
}

async function main() {
const adminEmail = "admin@citiwalk.test";
const password = "SecureAdmin123!";
const adminUser = await auth.createUser({ email: adminEmail, password });
await auth.setCustomUserClaims(adminUser.uid, { admin: true });
await seedParticipants();

const adminToken = await signIn(adminEmail, password);
const participantToken = await anonymousToken();

await call("getAdminOverview", {}, participantToken, "PERMISSION_DENIED");
const directRead = await fetch(
  "http://127.0.0.1:8080/v1/projects/demo-citiwalk/databases/(default)/documents/participants/%2B919876543200",
  { headers: { authorization: `Bearer ${adminToken}` } },
);
if (directRead.status !== 403) throw new Error("Direct admin Firestore read should be denied");

await call("recordAdminLoginAttempt", { email: adminEmail, success: true }, adminToken);
const overview = await call("getAdminOverview", {}, adminToken);
if (overview.stats.totalParticipants !== 12 || overview.stats.completedEntries !== 12) {
  throw new Error("Admin overview counts failed");
}

const listed = await call(
  "adminListParticipants",
  {
    search: "Participant",
    country: "India",
    state: "Kerala",
    district: "",
    verificationStatus: "verified",
    dateFrom: "",
    dateTo: "",
    sort: "newest",
    pageSize: 10,
  },
  adminToken,
);
if (listed.participants.length !== 10 || !listed.nextPageToken) {
  throw new Error("Server participant pagination failed");
}

const details = await call(
  "adminGetParticipantDetails",
  { participantId: listed.participants[0].id },
  adminToken,
);
if (!details.participant.entryId || !details.verificationHistory.length) {
  throw new Error("Participant details failed");
}

const analytics = await call("getAdminAnalytics", {}, adminToken);
if (!analytics.countryDistribution.length || analytics.verification.whatsappAttempts !== 12) {
  throw new Error("Admin analytics failed");
}

const settings = await call("getAdminSettings", {}, adminToken);
settings.supportEmail = "support@citiwalk.test";
const savedSettings = await call("updateAdminSettings", settings, adminToken);
if (!savedSettings.changedFields.includes("supportEmail")) {
  throw new Error("Admin settings audit update failed");
}

const draw = await call("drawAdminWinners", {}, adminToken);
if (draw.winners.length !== 10 || new Set(draw.winners.map((winner) => winner.participantId)).size !== 10) {
  throw new Error("Secure unique winner draw failed");
}
await call("drawAdminWinners", {}, adminToken, "ALREADY_EXISTS");

const exported = await call(
  "adminExportParticipants",
  {
    search: "",
    country: "India",
    state: "",
    district: "",
    verificationStatus: "verified",
    dateFrom: "",
    dateTo: "",
    sort: "newest",
  },
  adminToken,
);
if (exported.participants.length !== 12) throw new Error("Filtered participant export failed");

console.log("Firebase admin integration flow passed. Run the dedicated delete and logs smoke tests separately.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
