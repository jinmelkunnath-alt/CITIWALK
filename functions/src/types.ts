import type { Timestamp } from "firebase-admin/firestore";

export type VerificationChannel = "instagram" | "whatsapp";

export type ActiveVerification = {
  channel: VerificationChannel;
  token: string;
  attempt: number;
  startedAt: Timestamp;
};

export type VerificationSession = {
  uid: string;
  recordType: "verification_session";
  instagramAttempts: number;
  instagramVerified: boolean;
  whatsappAttempts: number;
  whatsappSuccesses: number;
  whatsappVerified: boolean;
  activeVerification?: ActiveVerification;
  entryCandidates?: string[];
  entryCandidatesExpiresAt?: Timestamp;
  preparedMobileNumber?: string;
  registrationComplete?: boolean;
  confirmedEntryId?: string;
};

export type PublicParticipationState = {
  instagramAttempts: number;
  instagramVerified: boolean;
  whatsappAttempts: number;
  whatsappSuccesses: number;
  whatsappVerified: boolean;
  registrationComplete: boolean;
  confirmedEntryId?: string;
};

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

export type EntryCandidate = {
  value: string;
  canonical: string;
};

export type RegistrationPayload = {
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
