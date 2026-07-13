import { useCallback, useEffect, useState } from "react";
import { FiAward, FiDownload, FiShield, FiZap } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Seo } from "@/components/seo/Seo";
import {
  GlassCard,
  Loader,
  Modal,
  OutlineButton,
  PrimaryButton,
  StatusBadge,
} from "@/components/ui";
import { prizes } from "@/constants/campaign";
import { useUI } from "@/hooks/useUI";
import {
  fetchWinnerDraw,
  getAdminServiceError,
  recordWinnerExport,
  requestWinnerDraw,
  type Winner,
  type WinnerDraw,
} from "@/services/adminService";
import { exportRowsToCsv, exportRowsToExcel } from "@/services/exportService";
import { trackCampaignEvent } from "@/services/analyticsService";

function winnerRow(winner: Winner) {
  return {
    Prize: `${winner.prizeRank} — ${winner.prizeName}`,
    "Entry ID": winner.entryId,
    "Participant Name": winner.participantName,
    "Phone Number": winner.phoneNumber,
    "Instagram ID": winner.instagramId,
    Date: new Date(winner.date).toLocaleString(),
  };
}

export default function AdminWinnersPage() {
  const { addToast } = useUI();
  const [draw, setDraw] = useState<WinnerDraw | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDraw(await fetchWinnerDraw());
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Winner data unavailable", message: adminError.message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const performDraw = async () => {
    setDrawing(true);
    try {
      const result = await requestWinnerDraw();
      setDraw(result);
      setConfirmOpen(false);
      void trackCampaignEvent("winner_draw", { winner_count: result.winners.length });
      addToast({
        tone: "success",
        title: "10 winners selected",
        message: "The permanent server-side winner draw has been securely stored.",
      });
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Winner draw failed", message: adminError.message });
    } finally {
      setDrawing(false);
    }
  };

  const exportWinners = async (format: "csv" | "excel") => {
    if (!draw?.winners.length) return;
    setExporting(format);
    try {
      const rows = draw.winners.map(winnerRow);
      if (format === "csv") exportRowsToCsv(rows, "citiwalk-winners.csv");
      else await exportRowsToExcel(rows, "citiwalk-winners.xlsx", "Winners");
      await recordWinnerExport().catch(() => undefined);
      addToast({ tone: "success", title: "Winner export ready", message: `${rows.length} winners exported.` });
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Winner export failed", message: adminError.message });
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <Seo title="Winner Selection" path="/dashboard/winners" noIndex />
      <AdminPageHeader
        eyebrow="Permanent secure draw"
        title="Winner Selection"
        description="Select exactly ten unique winners server-side using cryptographically secure randomness and permanent Firestore storage."
        actions={
          draw?.completed ? (
            <>
              <OutlineButton size="sm" leadingIcon={<FiDownload className="size-4" />} isLoading={exporting === "csv"} onClick={() => void exportWinners("csv")}>CSV</OutlineButton>
              <PrimaryButton size="sm" leadingIcon={<FiDownload className="size-4" />} isLoading={exporting === "excel"} onClick={() => void exportWinners("excel")}>Excel</PrimaryButton>
            </>
          ) : undefined
        }
      />

      {loading ? (
        <div className="grid min-h-[60vh] place-items-center"><Loader size="lg" /></div>
      ) : draw?.completed ? (
        <div className="mt-8 space-y-6">
          <GlassCard className="p-6 sm:p-8" accent="orange">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-300 shadow-glow-orange">
                  <FiAward className="size-6" />
                </span>
                <div>
                  <StatusBadge variant="success" dot>Permanent Draw Complete</StatusBadge>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {draw.drawnAt ? new Date(draw.drawnAt).toLocaleString() : "Draw completed"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted">Eligible pool: {draw.sourceParticipantCount?.toLocaleString() || "—"}</p>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="border-b border-white/[0.07] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">Official Winner Results</h2>
              <p className="mt-1 text-xs text-muted">One unique participant per prize</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-white/[0.025] text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
                  <tr>{["Prize", "Entry ID", "Participant Name", "Phone Number", "Instagram ID", "Date"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {draw.winners.map((winner) => (
                    <tr key={winner.entryId} className="text-xs text-muted hover:bg-white/[0.025]">
                      <td className="max-w-72 px-5 py-4"><p className="font-bold text-accent-300">{winner.prizeRank}</p><p className="mt-1 text-white">{winner.prizeName}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 font-bold text-brand-200">{winner.entryId}</td>
                      <td className="px-5 py-4 font-semibold text-white">{winner.participantName}</td>
                      <td className="whitespace-nowrap px-5 py-4">{winner.phoneNumber}</td>
                      <td className="px-5 py-4">{winner.instagramId}</td>
                      <td className="whitespace-nowrap px-5 py-4">{new Date(winner.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
          <GlassCard className="relative overflow-hidden p-7 text-center sm:p-10" accent="purple">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(124,46,242,.2),transparent_42%)]" />
            <div className="relative">
              <div className="mx-auto grid size-20 place-items-center rounded-[1.6rem] border border-brand-300/20 bg-brand-400/10 text-brand-200 shadow-glow-purple">
                <FiZap className="size-8" />
              </div>
              <h2 className="mt-7 text-3xl font-bold tracking-[-0.05em] text-white">Ready for the official draw?</h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">The backend will securely select exactly ten unique eligible participants. This operation cannot be reversed or repeated.</p>
              <PrimaryButton size="lg" className="mt-8" leadingIcon={<FiAward className="size-5" />} onClick={() => setConfirmOpen(true)}>
                Draw Winners
              </PrimaryButton>
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-lg font-bold text-white">Prize Order</h2><p className="mt-1 text-xs text-muted">Locked draw positions</p></div>
              <StatusBadge variant="orange">10 prizes</StatusBadge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {prizes.map((prize, index) => (
                <div key={prize.rank} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-400/10 text-xs font-bold text-brand-200">{index + 1}</span>
                  <div className="min-w-0"><p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">{prize.rank}</p><p className="mt-1 truncate text-xs font-semibold text-white">{prize.name}</p></div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => !drawing && setConfirmOpen(false)}
        title="Confirm Permanent Winner Draw"
        description="Winner selection is permanent and cannot be rerun."
        dismissible={!drawing}
        size="sm"
        footer={
          <>
            <OutlineButton disabled={drawing} onClick={() => setConfirmOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton isLoading={drawing} onClick={() => void performDraw()} leadingIcon={<FiShield className="size-4" />}>
              Confirm & Draw 10 Winners
            </PrimaryButton>
          </>
        }
      >
        <div className="rounded-card border border-red-300/15 bg-red-400/[0.055] p-5">
          <p className="text-sm font-bold text-red-200">Warning: Winner selection is permanent.</p>
          <p className="mt-2 text-xs leading-6 text-muted">Secure randomness runs only on the server. Each participant can win once, and the resulting draw is stored permanently.</p>
        </div>
      </Modal>
    </>
  );
}
