import { httpsCallable } from "firebase/functions";
import { getFirebaseRuntime } from "@/firebase/client";

export type PublicCampaignSettings = {
  giveawayEndIso: string;
  winnerAnnouncementDate: string;
  winnerAnnouncementTime: string;
  instagramUrl: string;
  publicSiteUrl: string;
  whatsappShareMessage: string;
  termsUrl: string;
  privacyUrl: string;
  officialRulesUrl: string;
  registrationOpen: boolean;
  maintenanceMode: boolean;
};

export type ParticipationState = {
  instagramAttempts: number;
  instagramVerified: boolean;
  whatsappAttempts: number;
  whatsappSuccesses: number;
  whatsappVerified: boolean;
  registrationComplete: boolean;
  confirmedEntryId?: string;
};

export type VerificationResult = ParticipationState & {
  attempt: number;
  success: boolean;
  channel: "instagram" | "whatsapp";
};

export type EntryCandidate = {
  value: string;
  canonical: string;
};

export type PrepareEntryNumbersInput = {
  mobileNumber: string;
  countryCode: string;
  deviceFingerprint?: string;
};

export type PrepareEntryNumbersResult = {
  candidates: EntryCandidate[];
  expiresAt: string;
};

export type RegistrationInput = {
  fullName: string;
  mobileNumber: string;
  instagramId: string;
  countryCode: string;
  country: string;
  state: string;
  district: string;
  selectedEntryNumber: string;
  browserFingerprint: string;
};

export type RegistrationResult = {
  entryId: string;
  selectedEntryNumber: string;
  winnerAnnouncementDate: string;
  winnerAnnouncementTime: string;
};

export type LocationOption = {
  value: string;
  label: string;
};

export type LocationOptionsInput = {
  scope: "countries" | "states" | "districts";
  countryCode?: string;
  stateCode?: string;
};

async function callFunction<Request, Response>(name: string, data?: Request) {
  const { functions } = await getFirebaseRuntime();
  const callable = httpsCallable<Request, Response>(functions, name);
  const result = await callable(data as Request);
  return result.data;
}

export function fetchPublicSettings() {
  return callFunction<Record<string, never>, PublicCampaignSettings>(
    "getPublicSettings",
    {},
  );
}

export function fetchParticipationState() {
  return callFunction<Record<string, never>, ParticipationState>(
    "getParticipationState",
    {},
  );
}

export function requestInstagramVerification(deviceFingerprint: string) {
  return callFunction<{ deviceFingerprint: string }, VerificationResult>(
    "verifyInstagramFollow",
    { deviceFingerprint },
  );
}

export function requestWhatsAppVerification(deviceFingerprint: string) {
  return callFunction<{ deviceFingerprint: string }, VerificationResult>(
    "verifyWhatsAppShare",
    { deviceFingerprint },
  );
}

export function requestEntryNumbers(input: PrepareEntryNumbersInput) {
  return callFunction<PrepareEntryNumbersInput, PrepareEntryNumbersResult>(
    "prepareEntryNumbers",
    input,
  );
}

export function submitParticipantRegistration(input: RegistrationInput) {
  return callFunction<RegistrationInput, RegistrationResult>(
    "confirmParticipantRegistration",
    input,
  );
}

export async function fetchLocationOptions(input: LocationOptionsInput) {
  const result = await callFunction<
    LocationOptionsInput,
    { options: LocationOption[] }
  >("getParticipantLocationOptions", input);
  return result.options;
}

export function getParticipantError(error: unknown) {
  const candidate = error as {
    code?: string;
    message?: string;
    details?: { reason?: string };
  };
  return {
    code: candidate.code?.replace("functions/", "") || "unknown",
    message: candidate.message || "Something went wrong. Please try again.",
    reason: candidate.details?.reason,
  };
}
