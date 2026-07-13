import { httpsCallable } from "firebase/functions";
import { getFirebaseRuntime } from "@/firebase/client";
import type { RegistrationResult } from "@/services/participantService";

export type AdminOverview = {
  stats: {
    totalParticipants: number;
    todayParticipants: number;
    completedEntries: number;
    pendingEntries: number;
    instagramVerified: number;
    whatsappVerified: number;
    availableEntryNumbers: number;
    reservedEntryNumbers: number;
  };
  recentActivity: Array<{
    id: string;
    fullName: string;
    entryId: string;
    country: string;
    timestamp: string | null;
  }>;
  generatedAt: string;
};

export type AdminParticipant = {
  id: string;
  entryId: string;
  registrationDate: string | null;
  fullName: string;
  mobileNumber: string;
  instagramId: string;
  country: string;
  state: string;
  district: string;
  instagramVerified: boolean;
  whatsappVerified: boolean;
  status: string;
  selectedEntryNumber: string;
  deviceType?: string;
  userAgent?: string;
  ipHash?: string;
  browserFingerprint?: string;
  createdDate?: string;
  ownerUid?: string;
};

export type ParticipantFilters = {
  search: string;
  country: string;
  state: string;
  district: string;
  verificationStatus: "" | "verified" | "pending";
  dateFrom: string;
  dateTo: string;
  sort: "newest" | "oldest";
};

export type ParticipantListRequest = ParticipantFilters & {
  pageSize: number;
  pageToken?: string | null;
};

export type ParticipantListResult = {
  participants: AdminParticipant[];
  nextPageToken: string | null;
  totalParticipants: number;
  scanned: number;
};

export type VerificationHistoryItem = {
  id: string;
  type: string;
  channel: string;
  attempt: number;
  success: boolean;
  whatsappSuccesses: number;
  timestamp: string | null;
};

export type ParticipantDetailsResult = {
  participant: AdminParticipant;
  verificationHistory: VerificationHistoryItem[];
};

export type DistributionItem = { name: string; value: number };
export type AdminAnalytics = {
  dailyRegistrations: Array<{ date: string; value: number }>;
  trafficTrend: Array<{ date: string; value: number }>;
  hourlyParticipation: Array<{ hour: string; value: number }>;
  countryDistribution: DistributionItem[];
  stateDistribution: DistributionItem[];
  districtDistribution: DistributionItem[];
  deviceTypes: DistributionItem[];
  browserTypes: DistributionItem[];
  verification: {
    instagramAttempts: number;
    instagramSuccesses: number;
    instagramSuccessRate: number;
    whatsappAttempts: number;
    whatsappSuccesses: number;
    whatsappSuccessRate: number;
  };
  generatedAt: string;
};

export type Winner = {
  position: number;
  prizeRank: string;
  prizeName: string;
  participantId: string;
  entryId: string;
  participantName: string;
  phoneNumber: string;
  instagramId: string;
  date: string;
};

export type WinnerDraw = {
  completed: boolean;
  permanent?: boolean;
  drawnAt?: string | null;
  drawnBy?: string;
  sourceParticipantCount?: number;
  winners: Winner[];
};

export type AdminSettings = {
  giveawayName: string;
  companyName: string;
  announcementDate: string;
  countdownTarget: string;
  instagramUrl: string;
  whatsappShareMessage: string;
  termsUrl: string;
  privacyUrl: string;
  officialRulesUrl: string;
  supportEmail: string;
  supportPhone: string;
  registrationOpen: boolean;
  maintenanceMode: boolean;
};

export type AdminLog = {
  id: string;
  action: string;
  adminUid: string | null;
  adminEmail: string | null;
  affectedRecord: string;
  metadata: Record<string, unknown>;
  timestamp: string | null;
};

export type AdminLogFilters = {
  search: string;
  action: string;
  dateFrom: string;
  dateTo: string;
  pageSize: number;
  pageToken?: string | null;
};

async function callAdmin<Request, Response>(name: string, data?: Request) {
  const { functions } = await getFirebaseRuntime();
  const callable = httpsCallable<Request, Response>(functions, name);
  const response = await callable(data as Request);
  return response.data;
}

export const fetchAdminOverview = () =>
  callAdmin<Record<string, never>, AdminOverview>("getAdminOverview", {});

export const fetchParticipants = (input: ParticipantListRequest) =>
  callAdmin<ParticipantListRequest, ParticipantListResult>("adminListParticipants", input);

export const fetchParticipantDetails = (participantId: string) =>
  callAdmin<{ participantId: string }, ParticipantDetailsResult>(
    "adminGetParticipantDetails",
    { participantId },
  );

export const fetchParticipantFilterOptions = () =>
  callAdmin<
    Record<string, never>,
    {
      countries: Array<{ value: string; label: string }>;
      states: Array<{ value: string; label: string }>;
      districts: Array<{ value: string; label: string }>;
    }
  >("adminGetParticipantFilterOptions", {});

export const requestParticipantExport = (filters: ParticipantFilters) =>
  callAdmin<ParticipantFilters, { participants: AdminParticipant[]; truncated: boolean }>(
    "adminExportParticipants",
    filters,
  );

export const requestParticipantDeletion = (participantId: string, reason: string) =>
  callAdmin<{ participantId: string; reason: string }, { deleted: boolean }>(
    "adminDeleteParticipant",
    { participantId, reason },
  );

export const fetchAdminAnalytics = () =>
  callAdmin<Record<string, never>, AdminAnalytics>("getAdminAnalytics", {});

export const fetchWinnerDraw = () =>
  callAdmin<Record<string, never>, WinnerDraw>("getAdminWinnerDraw", {});

export const requestWinnerDraw = () =>
  callAdmin<Record<string, never>, WinnerDraw>("drawAdminWinners", {});

export const recordWinnerExport = () =>
  callAdmin<Record<string, never>, { logged: boolean }>("recordAdminWinnerExport", {});

export const fetchAdminSettings = () =>
  callAdmin<Record<string, never>, AdminSettings>("getAdminSettings", {});

export const saveAdminSettings = (settings: AdminSettings) =>
  callAdmin<AdminSettings, AdminSettings & { changedFields: string[] }>(
    "updateAdminSettings",
    settings,
  );

export const fetchSystemLogs = (filters: AdminLogFilters) =>
  callAdmin<AdminLogFilters, { logs: AdminLog[]; nextPageToken: string | null }>(
    "adminListSystemLogs",
    filters,
  );

export const logAdminLoginAttempt = (
  email: string,
  success: boolean,
  deviceFingerprint: string,
) =>
  callAdmin<
    { email: string; success: boolean; deviceFingerprint: string },
    { logged: boolean }
  >("recordAdminLoginAttempt", { email, success, deviceFingerprint });

export function getAdminServiceError(error: unknown) {
  const candidate = error as {
    code?: string;
    message?: string;
    details?: { reason?: string };
  };
  return {
    code: candidate.code?.replace("functions/", "") || "unknown",
    message: candidate.message || "The admin request could not be completed.",
    reason: candidate.details?.reason,
  };
}

export type { RegistrationResult };
