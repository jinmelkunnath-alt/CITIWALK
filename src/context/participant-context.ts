import { createContext } from "react";
import type {
  EntryCandidate,
  ParticipationState,
  PrepareEntryNumbersInput,
  PublicCampaignSettings,
  RegistrationInput,
  RegistrationResult,
} from "@/services/participantService";

export type BackendStatus = "connecting" | "ready" | "unconfigured" | "error";
export type VerificationDialogStatus = "idle" | "verifying" | "failed" | "success";

export type VerificationDialog = {
  open: boolean;
  channel: "instagram" | "whatsapp";
  status: VerificationDialogStatus;
  title: string;
  message: string;
};

export type ParticipantContextValue = {
  backendStatus: BackendStatus;
  settings: PublicCampaignSettings;
  participation: ParticipationState;
  participationComplete: boolean;
  overallProgress: number;
  instagramOpened: boolean;
  whatsappShareOpened: boolean;
  verificationDialog: VerificationDialog;
  entryCandidates: EntryCandidate[];
  entryCandidatesExpiresAt: string | null;
  preparingEntryNumbers: boolean;
  confirmingRegistration: boolean;
  registrationResult: RegistrationResult | null;
  openInstagram: () => void;
  verifyInstagram: () => Promise<void>;
  openWhatsApp: () => void;
  verifyWhatsApp: () => Promise<void>;
  closeVerificationDialog: () => void;
  prepareEntryNumbers: (input: PrepareEntryNumbersInput) => Promise<boolean>;
  confirmRegistration: (input: RegistrationInput) => Promise<boolean>;
  retryConnection: () => Promise<void>;
};

export const ParticipantContext = createContext<ParticipantContextValue | null>(null);
