import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isFirebaseConfigured } from "@/firebase/client";
import { useUI } from "@/hooks/useUI";
import {
  ParticipantContext,
  type BackendStatus,
  type VerificationDialog,
} from "@/context/participant-context";
import {
  GIVEAWAY_END_ISO,
  giveawayEndLabel,
} from "@/constants/campaign";
import { trackCampaignEvent } from "@/services/analyticsService";
import { createBrowserFingerprint } from "@/services/fingerprintService";
import {
  fetchParticipationState,
  fetchPublicSettings,
  getParticipantError,
  requestEntryNumbers,
  requestInstagramVerification,
  requestWhatsAppVerification,
  submitParticipantRegistration,
  type EntryCandidate,
  type ParticipationState,
  type PrepareEntryNumbersInput,
  type PublicCampaignSettings,
  type RegistrationInput,
  type RegistrationResult,
} from "@/services/participantService";

const defaultParticipation: ParticipationState = {
  instagramAttempts: 0,
  instagramVerified: false,
  whatsappAttempts: 0,
  whatsappSuccesses: 0,
  whatsappVerified: false,
  registrationComplete: false,
};

const defaultSettings: PublicCampaignSettings = {
  giveawayEndIso: GIVEAWAY_END_ISO,
  winnerAnnouncementDate: giveawayEndLabel.date,
  winnerAnnouncementTime: giveawayEndLabel.time,
  instagramUrl: "https://instagram.com/citiwalk.official.giveaway",
  publicSiteUrl:
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    (typeof window === "undefined" ? "https://YOURDOMAIN.COM" : window.location.origin),
  whatsappShareMessage: [
    "🎉 I just entered the CITIWALK Global Rewards Giveaway!",
    "",
    "You can also win",
    "",
    "MacBook Pro M5",
    "iPhone 17",
    "iPhone 15",
    "PlayStation 5",
    "Cash Prizes",
    "",
    "Join now:",
    "{URL}",
  ].join("\n"),
  termsUrl: "/terms",
  privacyUrl: "/privacy",
  officialRulesUrl: "/official-rules",
  registrationOpen: true,
  maintenanceMode: false,
};

const initialDialog: VerificationDialog = {
  open: false,
  channel: "instagram",
  status: "idle",
  title: "",
  message: "",
};

function getStoredFlag(key: string) {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(key) === "true";
}

export function ParticipantProvider({ children }: { children: ReactNode }) {
  const { addToast } = useUI();
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("connecting");
  const [settings, setSettings] = useState(defaultSettings);
  const [participation, setParticipation] = useState(defaultParticipation);
  const [instagramOpened, setInstagramOpened] = useState(() =>
    getStoredFlag("citiwalk:instagram-opened"),
  );
  const [whatsappShareOpened, setWhatsappShareOpened] = useState(() =>
    getStoredFlag("citiwalk:whatsapp-opened"),
  );
  const [verificationDialog, setVerificationDialog] = useState(initialDialog);
  const [entryCandidates, setEntryCandidates] = useState<EntryCandidate[]>([]);
  const [entryCandidatesExpiresAt, setEntryCandidatesExpiresAt] = useState<string | null>(null);
  const [preparingEntryNumbers, setPreparingEntryNumbers] = useState(false);
  const [confirmingRegistration, setConfirmingRegistration] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const entryFormTracked = useRef(false);

  const connect = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setBackendStatus("unconfigured");
      return;
    }

    setBackendStatus("connecting");
    try {
      const [remoteSettings, remoteParticipation] = await Promise.all([
        fetchPublicSettings(),
        fetchParticipationState(),
      ]);
      setSettings(remoteSettings);
      setParticipation(remoteParticipation);
      if (remoteParticipation.registrationComplete && remoteParticipation.confirmedEntryId) {
        setRegistrationResult({
          entryId: remoteParticipation.confirmedEntryId,
          selectedEntryNumber: remoteParticipation.confirmedEntryId.slice(-6),
          winnerAnnouncementDate: remoteSettings.winnerAnnouncementDate,
          winnerAnnouncementTime: remoteSettings.winnerAnnouncementTime,
        });
      }
      setBackendStatus("ready");
    } catch (error: unknown) {
      const participantError = getParticipantError(error);
      setBackendStatus("error");
      addToast({
        tone: "error",
        title: "Firebase connection unavailable",
        message: participantError.message,
      });
    }
  }, [addToast]);

  useEffect(() => {
    void connect();
  }, [connect]);

  const participationComplete =
    participation.instagramVerified && participation.whatsappVerified;
  const overallProgress = Math.min(
    100,
    Math.round(
      (participation.instagramVerified ? 50 : 0) +
        (participation.whatsappSuccesses / 8) * 50,
    ),
  );

  useEffect(() => {
    if (
      backendStatus === "ready" &&
      participationComplete &&
      !entryFormTracked.current
    ) {
      entryFormTracked.current = true;
      void trackCampaignEvent("entry_form_opened");
    }
  }, [backendStatus, participationComplete]);

  const ensureReady = useCallback(() => {
    if (backendStatus === "ready") return true;
    addToast({
      tone: "warning",
      title: "Participant service is not ready",
      message:
        backendStatus === "unconfigured"
          ? "Add the Firebase environment configuration before using registration."
          : "Please wait for the secure participant service to connect.",
    });
    return false;
  }, [addToast, backendStatus]);

  const openInstagram = useCallback(() => {
    if (!ensureReady()) return;
    window.open(settings.instagramUrl, "_blank", "noopener,noreferrer");
    window.sessionStorage.setItem("citiwalk:instagram-opened", "true");
    setInstagramOpened(true);
    void trackCampaignEvent("instagram_click");
  }, [ensureReady, settings.instagramUrl]);

  const verifyInstagram = useCallback(async () => {
    if (!ensureReady() || participation.instagramVerified) return;
    setVerificationDialog({
      open: true,
      channel: "instagram",
      status: "verifying",
      title: "Verifying Follow...",
      message: "Securely checking your Instagram participation. This takes 5 seconds.",
    });

    try {
      const result = await requestInstagramVerification(
        await createBrowserFingerprint(),
      );
      setParticipation(result);
      if (result.success) {
        setVerificationDialog({
          open: true,
          channel: "instagram",
          status: "success",
          title: "Verification Successful",
          message: "Instagram task completed.",
        });
        void trackCampaignEvent("instagram_verified", { attempt: result.attempt });
      } else {
        setVerificationDialog({
          open: true,
          channel: "instagram",
          status: "failed",
          title: "Verification Failed",
          message: "Please follow our Instagram account before trying again.",
        });
      }
    } catch (error: unknown) {
      const participantError = getParticipantError(error);
      setVerificationDialog({
        open: true,
        channel: "instagram",
        status: "failed",
        title: "Verification Unavailable",
        message: participantError.message,
      });
      addToast({ tone: "error", title: "Instagram verification failed", message: participantError.message });
    }
  }, [addToast, ensureReady, participation.instagramVerified]);

  const openWhatsApp = useCallback(() => {
    if (!ensureReady()) return;
    const message = settings.whatsappShareMessage.includes("{URL}")
      ? settings.whatsappShareMessage.replaceAll("{URL}", settings.publicSiteUrl)
      : `${settings.whatsappShareMessage}\n\n${settings.publicSiteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    window.sessionStorage.setItem("citiwalk:whatsapp-opened", "true");
    setWhatsappShareOpened(true);
    void trackCampaignEvent("whatsapp_click", {
      successful_shares: participation.whatsappSuccesses,
    });
    void trackCampaignEvent("whatsapp_share", {
      share_number: participation.whatsappAttempts + 1,
    });
  }, [
    ensureReady,
    participation.whatsappAttempts,
    participation.whatsappSuccesses,
    settings.publicSiteUrl,
    settings.whatsappShareMessage,
  ]);

  const verifyWhatsApp = useCallback(async () => {
    if (!ensureReady() || participation.whatsappVerified || !whatsappShareOpened) return;
    setVerificationDialog({
      open: true,
      channel: "whatsapp",
      status: "verifying",
      title: "Verifying Share...",
      message: "Securely checking this WhatsApp share. This takes 5 seconds.",
    });

    try {
      const result = await requestWhatsAppVerification(
        await createBrowserFingerprint(),
      );
      setParticipation(result);
      window.sessionStorage.removeItem("citiwalk:whatsapp-opened");
      setWhatsappShareOpened(false);
      setVerificationDialog({
        open: true,
        channel: "whatsapp",
        status: result.success ? "success" : "failed",
        title: result.success ? "Share Verification Successful" : "Share Verification Failed",
        message: result.success
          ? result.whatsappVerified
            ? "WhatsApp task completed. All 8 shares are verified."
            : `Share verified. ${result.whatsappSuccesses} of 8 successful shares completed.`
          : "This attempt was not verified. Your progress has not increased.",
      });
      void trackCampaignEvent("whatsapp_verification_attempt", {
        attempt: result.attempt,
        success: result.success,
        successful_shares: result.whatsappSuccesses,
      });
    } catch (error: unknown) {
      const participantError = getParticipantError(error);
      setVerificationDialog({
        open: true,
        channel: "whatsapp",
        status: "failed",
        title: "Share Verification Unavailable",
        message: participantError.message,
      });
      addToast({ tone: "error", title: "WhatsApp verification failed", message: participantError.message });
    }
  }, [addToast, ensureReady, participation.whatsappVerified, whatsappShareOpened]);

  const closeVerificationDialog = useCallback(() => {
    setVerificationDialog((current) =>
      current.status === "verifying" ? current : initialDialog,
    );
  }, []);

  const prepareEntryNumbers = useCallback(
    async (input: PrepareEntryNumbersInput) => {
      if (!ensureReady() || !participationComplete) return false;
      setPreparingEntryNumbers(true);
      try {
        const result = await requestEntryNumbers({
          ...input,
          deviceFingerprint: await createBrowserFingerprint(),
        });
        setEntryCandidates(result.candidates);
        setEntryCandidatesExpiresAt(result.expiresAt);
        void trackCampaignEvent("entry_number_generated");
        return true;
      } catch (error: unknown) {
        const participantError = getParticipantError(error);
        addToast({
          tone: participantError.code === "already-exists" ? "warning" : "error",
          title:
            participantError.code === "already-exists"
              ? "Registration already exists"
              : "Entry numbers unavailable",
          message: participantError.message,
        });
        return false;
      } finally {
        setPreparingEntryNumbers(false);
      }
    },
    [addToast, ensureReady, participationComplete],
  );

  const refreshEntryCandidates = useCallback(
    async (input: RegistrationInput) => {
      const result = await requestEntryNumbers({
        mobileNumber: input.mobileNumber,
        countryCode: input.countryCode,
        deviceFingerprint: await createBrowserFingerprint(),
      });
      setEntryCandidates(result.candidates);
      setEntryCandidatesExpiresAt(result.expiresAt);
      void trackCampaignEvent("entry_number_generated");
    },
    [],
  );

  const confirmRegistration = useCallback(
    async (input: RegistrationInput) => {
      if (!ensureReady() || !participationComplete) return false;
      setConfirmingRegistration(true);
      try {
        const result = await submitParticipantRegistration(input);
        setRegistrationResult(result);
        setParticipation((current) => ({
          ...current,
          registrationComplete: true,
          confirmedEntryId: result.entryId,
        }));
        void trackCampaignEvent("entry_confirmed", {
          entry_number_length: String(Number(result.selectedEntryNumber)).length,
        });
        void trackCampaignEvent("registration_completed");
        void trackCampaignEvent("successful_entry");
        return true;
      } catch (error: unknown) {
        const participantError = getParticipantError(error);
        if (
          participantError.reason === "ENTRY_NUMBER_UNAVAILABLE" ||
          participantError.reason === "CANDIDATES_EXPIRED"
        ) {
          try {
            await refreshEntryCandidates(input);
            addToast({
              tone: "warning",
              title: "New entry numbers generated",
              message:
                participantError.reason === "ENTRY_NUMBER_UNAVAILABLE"
                  ? "This entry number was just selected by another participant. Please choose another."
                  : "Your previous number options expired. Please choose from the new set.",
            });
          } catch (refreshError: unknown) {
            const refreshParticipantError = getParticipantError(refreshError);
            addToast({
              tone: "error",
              title: "Could not refresh entry numbers",
              message: refreshParticipantError.message,
            });
          }
          return false;
        }

        addToast({
          tone: participantError.code === "already-exists" ? "warning" : "error",
          title:
            participantError.code === "already-exists"
              ? "Registration already exists"
              : "Registration could not be completed",
          message: participantError.message,
        });
        return false;
      } finally {
        setConfirmingRegistration(false);
      }
    },
    [addToast, ensureReady, participationComplete, refreshEntryCandidates],
  );

  const value = useMemo(
    () => ({
      backendStatus,
      settings,
      participation,
      participationComplete,
      overallProgress,
      instagramOpened,
      whatsappShareOpened,
      verificationDialog,
      entryCandidates,
      entryCandidatesExpiresAt,
      preparingEntryNumbers,
      confirmingRegistration,
      registrationResult,
      openInstagram,
      verifyInstagram,
      openWhatsApp,
      verifyWhatsApp,
      closeVerificationDialog,
      prepareEntryNumbers,
      confirmRegistration,
      retryConnection: connect,
    }),
    [
      backendStatus,
      closeVerificationDialog,
      confirmRegistration,
      connect,
      entryCandidates,
      entryCandidatesExpiresAt,
      instagramOpened,
      openInstagram,
      openWhatsApp,
      overallProgress,
      participation,
      participationComplete,
      prepareEntryNumbers,
      preparingEntryNumbers,
      confirmingRegistration,
      registrationResult,
      settings,
      verificationDialog,
      verifyInstagram,
      verifyWhatsApp,
      whatsappShareOpened,
    ],
  );

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
}
