process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "demo-citiwalk";
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
initializeApp({ projectId: "demo-citiwalk" });

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
  const user = await getAuth().createUser({ email: "logs@citiwalk.test", password: "SecureAdmin123!" });
  await getAuth().setCustomUserClaims(user.uid, { admin: true });
  const login = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "logs@citiwalk.test", password: "SecureAdmin123!", returnSecureToken: true }),
  });
  const token = (await login.json()).idToken;
  await callable("recordAdminLoginAttempt", { email: "logs@citiwalk.test", success: true }, token);
  const logs = await callable("adminListSystemLogs", { search: "", action: "", dateFrom: "", dateTo: "", pageSize: 25 }, token);
  if (logs.logs.length !== 1 || logs.logs[0].action !== "ADMIN_LOGIN") throw new Error("Admin log read failed");
  console.log("Admin logs smoke test passed.");
}
main().catch((error) => { console.error(error); process.exit(1); });
