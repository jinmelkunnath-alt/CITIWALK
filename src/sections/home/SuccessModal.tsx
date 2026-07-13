import { motion } from "framer-motion";
import { useRef } from "react";
import { FiCalendar, FiCopy, FiDownload, FiHash, FiHome } from "react-icons/fi";
import {
  Modal,
  OutlineButton,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "@/components/ui";
import { useUI } from "@/hooks/useUI";
import type { RegistrationResult } from "@/services/participantService";

type SuccessModalProps = {
  open: boolean;
  result: RegistrationResult | null;
  onBackHome: () => void;
};

const confetti = [
  [8, "#A779FF", 0], [15, "#FFA51F", 0.4], [22, "#F8F7FC", 0.9],
  [31, "#7C2EF2", 0.2], [40, "#FFC24A", 0.7], [49, "#C4ADFF", 1.1],
  [58, "#F98607", 0.15], [66, "#A779FF", 0.6], [74, "#FFFFFF", 1],
  [82, "#FFC24A", 0.3], [90, "#7C2EF2", 0.85],
] as const;

export function SuccessModal({ open, result, onBackHome }: SuccessModalProps) {
  const { addToast } = useUI();
  const captureRef = useRef<HTMLDivElement>(null);

  const copyEntryId = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.entryId);
      addToast({ tone: "success", title: "Entry ID copied", message: result.entryId });
    } catch {
      addToast({ tone: "error", title: "Copy failed", message: "Select and copy the Entry ID manually." });
    }
  };

  const saveScreenshot = async () => {
    if (!captureRef.current || !result) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: "#090610",
        cacheBust: true,
      });
      const download = document.createElement("a");
      download.download = `CITIWALK-${result.selectedEntryNumber}.png`;
      download.href = dataUrl;
      download.click();
      addToast({ tone: "success", title: "Screenshot saved", message: "Keep it for your records." });
    } catch {
      addToast({ tone: "error", title: "Screenshot unavailable", message: "Please use your device screenshot controls." });
    }
  };

  return (
    <Modal
      open={open && Boolean(result)}
      onClose={onBackHome}
      title="Congratulations!"
      description="Your Giveaway Entry has been Confirmed Successfully."
      dismissible={false}
      size="lg"
    >
      {result && (
        <motion.div
          ref={captureRef}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-card border border-white/[0.08] bg-gradient-to-b from-brand-500/10 to-canvas p-5 text-center sm:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(249,134,7,.13),transparent_35%)]" aria-hidden="true" />
          <StatusBadge variant="success" dot className="relative z-10">Registration Complete</StatusBadge>

          <div className="relative mx-auto mt-4 h-28 max-w-sm overflow-hidden" aria-hidden="true">
            {confetti.map(([left, color, delay], index) => (
              <motion.span
                key={`${left}-${color}`}
                className="absolute top-[-14px] h-3 w-1.5 rounded-sm"
                style={{ left: `${left}%`, backgroundColor: color }}
                animate={{ y: [0, 105], x: [0, index % 2 ? 12 : -10], rotate: [0, 240], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.2 + (index % 3) * 0.3, delay, repeat: Infinity, ease: "easeIn" }}
              />
            ))}
            <motion.div
              className="absolute inset-x-0 bottom-0 text-5xl"
              animate={{ rotate: [-5, 5, -5], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              🎉
            </motion.div>
          </div>
          <span className="sr-only">Animated confetti and party poppers</span>

          <div className="relative mt-4 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-card border border-white/[0.08] bg-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-brand-300">
                <FiHash className="size-4" aria-hidden="true" />
                <span className="text-[0.63rem] font-bold uppercase tracking-[0.14em]">Entry ID</span>
              </div>
              <p className="mt-3 break-all text-base font-extrabold tracking-[0.03em] text-white sm:text-lg">{result.entryId}</p>
            </div>
            <div className="rounded-card border border-white/[0.08] bg-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-accent-300">
                <FiCalendar className="size-4" aria-hidden="true" />
                <span className="text-[0.63rem] font-bold uppercase tracking-[0.14em]">Winner Announcement</span>
              </div>
              <p className="mt-3 text-sm font-bold text-white">{result.winnerAnnouncementDate}</p>
              <p className="mt-1 text-xs text-muted">{result.winnerAnnouncementTime}</p>
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            <SecondaryButton
              onClick={() => void saveScreenshot()}
              leadingIcon={<FiDownload className="size-4" aria-hidden="true" />}
              className="w-full"
            >
              Save Screenshot
            </SecondaryButton>
            <OutlineButton
              onClick={() => void copyEntryId()}
              leadingIcon={<FiCopy className="size-4" aria-hidden="true" />}
              className="w-full"
            >
              Copy Entry ID
            </OutlineButton>
            <PrimaryButton
              onClick={onBackHome}
              leadingIcon={<FiHome className="size-4" aria-hidden="true" />}
              className="w-full"
            >
              Back to Home
            </PrimaryButton>
          </div>
        </motion.div>
      )}
    </Modal>
  );
}
