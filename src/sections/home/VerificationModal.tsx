import { motion } from "framer-motion";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { Loader, Modal, PrimaryButton } from "@/components/ui";
import type { VerificationDialog } from "@/context/participant-context";

type VerificationModalProps = {
  dialog: VerificationDialog;
  onClose: () => void;
};

export function VerificationModal({ dialog, onClose }: VerificationModalProps) {
  const verifying = dialog.status === "verifying";

  return (
    <Modal
      open={dialog.open}
      onClose={onClose}
      title={dialog.title}
      description={dialog.message}
      dismissible={!verifying}
      size="sm"
      footer={
        verifying ? undefined : (
          <PrimaryButton onClick={onClose}>Continue</PrimaryButton>
        )
      }
    >
      <div className="relative grid min-h-52 place-items-center overflow-hidden rounded-card border border-white/[0.08] bg-white/[0.03] p-7 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,46,242,.18),transparent_45%)]" aria-hidden="true" />
        <div className="relative">
          {dialog.status === "verifying" && (
            <div>
              <div className="mx-auto grid size-20 place-items-center rounded-full border border-brand-300/20 bg-brand-400/10 shadow-glow-purple">
                <Loader size="lg" label={dialog.title} />
              </div>
              <motion.div
                className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-white/[0.07]"
                aria-hidden="true"
              >
                <motion.div
                  className="h-full w-1/2 rounded-full bg-brand-gradient"
                  animate={{ x: ["-100%", "220%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
                Secure check in progress
              </p>
            </div>
          )}

          {dialog.status === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="mx-auto grid size-20 place-items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 text-emerald-300 shadow-[0_0_50px_rgba(52,211,153,.18)]">
                <FiCheckCircle className="size-9" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-bold text-emerald-200">Verified successfully</p>
            </motion.div>
          )}

          {dialog.status === "failed" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="mx-auto grid size-20 place-items-center rounded-full border border-red-300/20 bg-red-400/10 text-red-300 shadow-[0_0_50px_rgba(248,113,113,.15)]">
                <FiAlertCircle className="size-9" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-bold text-red-200">Please review and try again</p>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
}
