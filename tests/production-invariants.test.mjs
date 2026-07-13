import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const target = new Date("2026-08-10T16:00:00+05:30");
assert.equal(target.toISOString(), "2026-08-10T10:30:00.000Z");
assert.equal(String(12).padStart(6, "0"), "000012");
assert.equal(String(345).padStart(6, "0"), "000345");
assert.equal(String(9214).padStart(6, "0"), "009214");

const campaign = readFileSync(new URL("../src/constants/campaign.ts", import.meta.url), "utf8");
const prizeBlock = campaign.split("export const prizes:", 2)[1].split("];", 1)[0];
assert.equal((prizeBlock.match(/\{ rank:/g) || []).length, 10);

const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
for (const collection of ["participants", "entryNumbers", "logs", "winnerDraws", "rateLimits"]) {
  assert.match(rules, new RegExp(`match /${collection}`));
}
assert.doesNotMatch(rules, /allow write:\s*if true/);

const firebaseConfig = JSON.parse(
  readFileSync(new URL("../firebase.json", import.meta.url), "utf8"),
);
const securityHeaders = firebaseConfig.hosting.headers
  .flatMap((entry) => entry.headers)
  .map((header) => header.key);
for (const header of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
]) {
  assert.ok(securityHeaders.includes(header), `Missing ${header}`);
}

console.log("Production invariants passed.");
