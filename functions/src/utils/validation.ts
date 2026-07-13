import { HttpsError } from "firebase-functions/v2/https";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import type { RegistrationPayload } from "../types";
import { assertPayloadSize, rejectMarkup } from "./payload";

function requireString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new HttpsError("invalid-argument", `Enter a valid ${field.toLowerCase()}.`);
  }
  return normalized;
}

export function normalizeMobileNumber(value: unknown, countryCodeValue: unknown) {
  const mobileNumber = requireString(value, "Mobile number", 16);
  const countryCode = requireString(countryCodeValue, "Country", 2).toUpperCase() as CountryCode;

  if (!/^\+[1-9]\d{7,14}$/.test(mobileNumber)) {
    throw new HttpsError(
      "invalid-argument",
      "Enter a valid mobile number with country code using digits only.",
    );
  }

  const parsed = parsePhoneNumberFromString(mobileNumber);
  if (!parsed?.isValid()) {
    throw new HttpsError("invalid-argument", "Enter a valid mobile number.");
  }
  if (parsed.country && parsed.country !== countryCode) {
    throw new HttpsError(
      "invalid-argument",
      "The mobile country code does not match the selected country.",
    );
  }

  return parsed.number;
}

export function normalizeInstagramId(value: unknown) {
  const instagramId = requireString(value, "Instagram ID", 31);
  if (!/^@?[a-zA-Z0-9._]{2,30}$/.test(instagramId)) {
    throw new HttpsError("invalid-argument", "Enter a valid Instagram ID.");
  }
  return instagramId.startsWith("@") ? instagramId : `@${instagramId}`;
}

export function validateRegistrationPayload(input: unknown): RegistrationPayload {
  assertPayloadSize(input, 12_000);
  if (!input || typeof input !== "object") {
    throw new HttpsError("invalid-argument", "Registration details are required.");
  }
  const data = input as Record<string, unknown>;
  const fullName = rejectMarkup(
    requireString(data.fullName, "Full name", 100),
    "Full name",
  );
  if (fullName.length < 2) {
    throw new HttpsError("invalid-argument", "Enter your full name.");
  }

  const countryCode = requireString(data.countryCode, "Country", 2).toUpperCase();
  const mobileNumber = normalizeMobileNumber(data.mobileNumber, countryCode);
  const selectedEntryNumber = requireString(data.selectedEntryNumber, "Entry number", 6);
  const browserFingerprint = requireString(data.browserFingerprint, "Browser fingerprint", 64);

  if (!/^\d{6}$/.test(selectedEntryNumber)) {
    throw new HttpsError("invalid-argument", "Select a valid entry number.");
  }
  if (!/^[a-f0-9]{64}$/.test(browserFingerprint)) {
    throw new HttpsError("invalid-argument", "A valid browser fingerprint is required.");
  }

  return {
    fullName,
    mobileNumber,
    instagramId: normalizeInstagramId(data.instagramId),
    countryCode,
    country: rejectMarkup(requireString(data.country, "Country", 100), "Country"),
    state: rejectMarkup(requireString(data.state, "State", 100), "State"),
    district: rejectMarkup(requireString(data.district, "District", 100), "District"),
    selectedEntryNumber,
    browserFingerprint,
  };
}

export function getIstCreatedDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
