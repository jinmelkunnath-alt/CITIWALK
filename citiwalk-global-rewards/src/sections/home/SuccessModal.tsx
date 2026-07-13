import { motion } from "framer-motion";
import { FiCalendar, FiHash } from "react-icons/fi";
import { Modal, PrimaryButton, StatusBadge } from "@/components/ui";
import { giveawayEndLabel } from "@/constants/campaign";

type SuccessModalProps = {
  open: boolean;
  onClose: () => void;
};

const confetti = [
  [8, "#A779FF", 0], [15, "#FFA51F", 0.4], [22, "#F8F7FC", 0.9],
  [31, "#7C2EF2", 0.2], [40, "#FFC24A", 0.7], [49, "#C4ADFF", 1.1],
  [58, "#F98607", 0.15], [66, "#A779FF", 0.6], [74, "#FFFFFF", 1],
  [82, "#FFC24A", 0.3], [90, "#7C2EF2", 0.85],
] as const;

export function SuccessModal({ open, onClose }: SuccessModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Congratulations!"
      description="Your Giveaway Entry has been Confirmed Successfully."
      footer={<PrimaryButton onClick={onClose}>Close</PrimaryButton>}
    >
      <div className="relative overflow-hidden rounded-card border border-white/[0.08] bg-gradient-to-b from-brand-500/10 to-transparent p-5 text-center sm:p-7">
        <StatusBadge variant="orange" className="relative z-10">UI Preview</StatusBadge>
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
        <span className="sr-only">Animated confetti and party popper placeholder</span>

        <div className="relative mt-4 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-card border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-brand-300">
              <FiHash className="size-4" aria-hidden="true" />
              <span className="text-[0.63rem] font-bold uppercase tracking-[0.14em]">Entry ID</span>
            </div>
            <p className="mt-3 text-sm font-extrabold tracking-[0.03em] text-white sm:text-base">#GIVE-2026-009214</p>
          </div>
          <div className="rounded-card border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-accent-300">
              <FiCalendar className="size-4" aria-hidden="true" />
              <span className="text-[0.63rem] font-bold uppercase tracking-[0.14em]">Winner Announcement</span>
            </div>
            <p className="mt-3 text-sm font-bold text-white">{giveawayEndLabel.date}</p>
            <p className="mt-1 text-xs text-muted">{giveawayEndLabel.time}</p>
          </div>
        </div>
        <p className="relative mt-5 text-xs leading-5 text-muted">
          Presentation preview only. No entry has been created or stored.
        </p>
      </div>
    </Modal>
  );
}
