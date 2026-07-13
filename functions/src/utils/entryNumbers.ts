import { randomInt } from "node:crypto";
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "../firebase";
import type { EntryCandidate } from "../types";

export function canonicalizeEntryNumber(value: number | string) {
  return String(value).padStart(6, "0");
}

function isProfessionalNumber(value: string) {
  if (/(\d)\1{3}/.test(value)) return false;
  if (["1234", "2345", "3456", "4567", "5678", "6789", "9876", "8765", "7654", "6543", "5432", "4321"].some((sequence) => value.includes(sequence))) {
    return false;
  }
  if (value.endsWith("000")) return false;
  return new Set(value).size >= 3;
}

async function generateForLength(length: number, selected: Set<string>) {
  const minimum = 10 ** (length - 1);
  const maximum = 10 ** length;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const value = String(randomInt(minimum, maximum));
    const canonical = canonicalizeEntryNumber(value);
    if (selected.has(canonical) || !isProfessionalNumber(value)) continue;

    const snapshot = await db.collection("entryNumbers").doc(canonical).get();
    const available = !snapshot.exists || snapshot.get("status") === "available";
    if (!available) continue;

    selected.add(canonical);
    return { value, canonical } satisfies EntryCandidate;
  }

  throw new HttpsError(
    "resource-exhausted",
    "Available entry numbers could not be prepared. Please try again.",
  );
}

export async function generateAvailableEntryNumbers() {
  const selected = new Set<string>();
  const candidates: EntryCandidate[] = [];

  // One four-, five-, and six-digit value keeps all three options visually distinct.
  for (const length of [4, 5, 6]) {
    candidates.push(await generateForLength(length, selected));
  }

  return candidates.sort(() => randomInt(0, 2) - 0.5);
}
