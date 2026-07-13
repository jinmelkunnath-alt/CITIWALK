const projectId = "demo-citiwalk";
const functionsBase = `http://127.0.0.1:5001/${projectId}/asia-south1`;

async function createAnonymousUser() {
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  const payload = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(payload));
  return payload.idToken;
}

async function call(name, data, token, expectedError) {
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
    if (expectedError && payload.error.status === expectedError) return payload.error;
    throw new Error(`${name}: ${JSON.stringify(payload.error)}`);
  }
  if (expectedError) throw new Error(`${name}: expected ${expectedError}`);
  return payload.result;
}

async function reserveNumber(number) {
  const url = `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/entryNumbers/${number}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer owner",
    },
    body: JSON.stringify({
      fields: {
        status: { stringValue: "reserved" },
        number: { stringValue: number },
      },
    }),
  });
  if (!response.ok) throw new Error(`reserve failed: ${await response.text()}`);
}

const token = await createAnonymousUser();
const blockedParticipantRead = await fetch(
  `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/participants/%2B919999999999`,
  { headers: { authorization: `Bearer ${token}` } },
);
if (blockedParticipantRead.status !== 403) {
  throw new Error("Firestore participant reads are not securely blocked");
}

const settings = await call("getPublicSettings", {}, token);
if (settings.giveawayEndIso !== "2026-08-10T16:00:00+05:30") {
  throw new Error("settings fallback failed");
}

const locations = await call(
  "getParticipantLocationOptions",
  { scope: "states", countryCode: "IN" },
  token,
);
if (!locations.options.some((option) => option.value === "KL")) {
  throw new Error("location options failed");
}

const instagram1 = await call("verifyInstagramFollow", {}, token);
const instagram2 = await call("verifyInstagramFollow", {}, token);
if (instagram1.success !== false || instagram2.success !== true || !instagram2.instagramVerified) {
  throw new Error("Instagram verification sequence failed");
}

let whatsapp;
const expected = [false, true, true, false, true, true, true, true, true, true];
for (let index = 0; index < expected.length; index += 1) {
  whatsapp = await call("verifyWhatsAppShare", {}, token);
  if (whatsapp.success !== expected[index]) {
    throw new Error(`WhatsApp attempt ${index + 1} did not match`);
  }
}
if (!whatsapp.whatsappVerified || whatsapp.whatsappSuccesses !== 8) {
  throw new Error("WhatsApp did not complete with 8 successes on attempt 10");
}

const mobileNumber = "+919876543210";
const prepared = await call(
  "prepareEntryNumbers",
  { mobileNumber, countryCode: "IN" },
  token,
);
if (prepared.candidates.length !== 3) throw new Error("candidate generation failed");
if (new Set(prepared.candidates.map((candidate) => candidate.canonical)).size !== 3) {
  throw new Error("candidate uniqueness failed");
}

await reserveNumber(prepared.candidates[0].canonical);
const registrationInput = {
  fullName: "Integration Participant",
  mobileNumber,
  instagramId: "@integration.participant",
  countryCode: "IN",
  country: "India",
  state: "Kerala",
  district: "Kasaragod",
  selectedEntryNumber: prepared.candidates[0].canonical,
  browserFingerprint: "a".repeat(64),
};
const conflict = await call(
  "confirmParticipantRegistration",
  registrationInput,
  token,
  "ABORTED",
);
if (conflict.details?.reason !== "ENTRY_NUMBER_UNAVAILABLE") {
  throw new Error("reservation conflict was not detected");
}

const refreshed = await call(
  "prepareEntryNumbers",
  { mobileNumber, countryCode: "IN" },
  token,
);
registrationInput.selectedEntryNumber = refreshed.candidates[0].canonical;
const confirmed = await call(
  "confirmParticipantRegistration",
  registrationInput,
  token,
);
if (confirmed.entryId !== `#GIVE-2026-${registrationInput.selectedEntryNumber}`) {
  throw new Error("entry ID formatting failed");
}

const duplicate = await call(
  "prepareEntryNumbers",
  { mobileNumber, countryCode: "IN" },
  token,
  "ALREADY_EXISTS",
);
if (duplicate.message !== "This mobile number has already participated.") {
  throw new Error("duplicate mobile check failed");
}

console.log("Firebase participant integration flow passed.");
