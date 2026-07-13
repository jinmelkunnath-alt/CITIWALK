process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "demo-citiwalk";
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
initializeApp({ projectId: "demo-citiwalk" });
const auth = getAuth();
const db = getFirestore();

async function callable(name, data, token) {
  const response = await fetch(`http://127.0.0.1:5001/demo-citiwalk/asia-south1/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ data }),
  });
  const body = await response.json();
  if (body.error) throw new Error(JSON.stringify(body.error));
  return body.result;
}

async function main() {
  const email = "delete@citiwalk.test";
  const password = "SecureAdmin123!";
  const user = await auth.createUser({ email, password });
  await auth.setCustomUserClaims(user.uid, { admin: true });
  const login = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const token = (await login.json()).idToken;
  const participantId = "+919900001111";
  await db.collection("participants").doc(participantId).set({
    fullName: "Deletion Test",
    mobileNumber: participantId,
    entryId: "#GIVE-2026-123456",
    selectedEntryNumber: "123456",
    timestamp: Timestamp.now(),
    status: "confirmed",
  });
  await callable(
    "adminDeleteParticipant",
    { participantId, reason: "Approved integration deletion test" },
    token,
  );
  if ((await db.collection("participants").doc(participantId).get()).exists) {
    throw new Error("Participant was not deleted");
  }
  const audit = await db
    .collection("logs")
    .where("action", "==", "PARTICIPANT_DELETION")
    .limit(1)
    .get();
  if (audit.empty) throw new Error("Deletion audit log was not created");
  console.log("Admin deletion smoke test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
