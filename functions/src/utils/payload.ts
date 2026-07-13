import { HttpsError } from "firebase-functions/v2/https";

export function assertPayloadSize(input: unknown, maximumBytes = 12_000) {
  let serialized = "";
  try {
    serialized = JSON.stringify(input ?? {});
  } catch {
    throw new HttpsError("invalid-argument", "The request payload is invalid.");
  }
  if (Buffer.byteLength(serialized, "utf8") > maximumBytes) {
    throw new HttpsError("invalid-argument", "The request payload is too large.");
  }
}

export function rejectMarkup(value: string, label: string) {
  if (/[<>]/.test(value) || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    throw new HttpsError(
      "invalid-argument",
      `${label} contains unsupported characters.`,
    );
  }
  return value;
}
