import { useEffect, useState } from "react";
import { FiGlobe, FiHash, FiMonitor, FiShield, FiSmartphone, FiUser } from "react-icons/fi";
import { Drawer, GlassCard, Loader, StatusBadge } from "@/components/ui";
import { useUI } from "@/hooks/useUI";
import {
  fetchParticipantDetails,
  getAdminServiceError,
  type ParticipantDetailsResult,
} from "@/services/adminService";

function detectBrowser(userAgent = "") {
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Chrome\//i.test(userAgent)) return "Google Chrome";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Other / Unknown";
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-white">{value || "—"}</p>
    </div>
  );
}

export function ParticipantDrawer({
  participantId,
  open,
  onClose,
}: {
  participantId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { addToast } = useUI();
  const [details, setDetails] = useState<ParticipantDetailsResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !participantId) return;
    let active = true;
    setLoading(true);
    setDetails(null);
    void fetchParticipantDetails(participantId)
      .then((result) => {
        if (active) setDetails(result);
      })
      .catch((error: unknown) => {
        const adminError = getAdminServiceError(error);
        addToast({ tone: "error", title: "Participant details unavailable", message: adminError.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [addToast, open, participantId]);

  const participant = details?.participant;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Participant Details"
      description={participant?.entryId || "Complete registration profile and verification history"}
      width="xl"
    >
      {loading ? (
        <div className="grid min-h-72 place-items-center"><Loader size="lg" /></div>
      ) : participant ? (
        <div className="space-y-6">
          <GlassCard className="p-5" accent="purple">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
                  <FiUser className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{participant.fullName}</h3>
                  <p className="mt-1 text-xs text-muted">{participant.mobileNumber} · {participant.instagramId}</p>
                </div>
              </div>
              <StatusBadge
                variant={participant.instagramVerified && participant.whatsappVerified ? "success" : "orange"}
                dot
              >
                {participant.instagramVerified && participant.whatsappVerified ? "Fully Verified" : "Pending"}
              </StatusBadge>
            </div>
          </GlassCard>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white"><FiHash className="text-brand-300" /> Entry Profile</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <DetailItem label="Entry ID" value={participant.entryId} />
              <DetailItem label="Selected Number" value={participant.selectedEntryNumber} />
              <DetailItem
                label="Registration Time"
                value={participant.registrationDate ? new Date(participant.registrationDate).toLocaleString() : null}
              />
              <DetailItem label="Status" value={participant.status} />
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white"><FiGlobe className="text-accent-300" /> Location</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <DetailItem label="Country" value={participant.country} />
              <DetailItem label="State" value={participant.state} />
              <DetailItem label="District" value={participant.district} />
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white"><FiMonitor className="text-brand-300" /> Device & Security</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <DetailItem label="Device Type" value={participant.deviceType} />
              <DetailItem label="Browser" value={detectBrowser(participant.userAgent)} />
              <DetailItem label="IP Hash" value={participant.ipHash} />
              <DetailItem label="Browser Fingerprint" value={participant.browserFingerprint} />
            </div>
            <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">User Agent</p>
              <p className="mt-2 break-all font-mono text-xs leading-6 text-white/80">{participant.userAgent || "—"}</p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white"><FiShield className="text-emerald-300" /> Verification History</h3>
              <StatusBadge variant="neutral">{details.verificationHistory.length} events</StatusBadge>
            </div>
            <div className="mt-3 space-y-3">
              {details.verificationHistory.length ? (
                details.verificationHistory.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${event.success ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                      {event.channel === "whatsapp" ? <FiSmartphone className="size-4" /> : <FiShield className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold capitalize text-white">{event.channel || event.type} attempt {event.attempt || ""}</p>
                      <p className="mt-1 text-xs text-muted">
                        {event.success ? "Successful" : "Failed"}
                        {event.channel === "whatsapp" ? ` · ${event.whatsappSuccesses} successful shares` : ""}
                      </p>
                    </div>
                    <span className="text-[0.62rem] text-muted">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : "—"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-8 text-center text-sm text-muted">No verification events found.</p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted">Participant details could not be loaded.</p>
      )}
    </Drawer>
  );
}
