import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import type { ToastTone } from "@/context/ui-context";
import { useUI } from "@/hooks/useUI";
import { cn } from "@/utils/cn";

const toneStyles: Record<ToastTone, string> = {
  neutral: "text-brand-200 bg-brand-400/10",
  success: "text-emerald-300 bg-emerald-400/10",
  warning: "text-accent-300 bg-accent-400/10",
  error: "text-red-300 bg-red-400/10",
};

const toneIcons = {
  neutral: FiInfo,
  success: FiCheckCircle,
  warning: FiAlertCircle,
  error: FiAlertCircle,
};

export function ToastViewport() {
  const { toasts, removeToast } = useUI();

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-end gap-3 sm:left-auto sm:w-[24rem]"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = toneIcons[toast.tone];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              className="surface-glass pointer-events-auto flex w-full items-start gap-3 rounded-card p-4 shadow-panel"
              role="status"
            >
              <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", toneStyles[toast.tone])}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{toast.title}</p>
                {toast.message && <p className="mt-1 text-xs leading-5 text-muted">{toast.message}</p>}
              </div>
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-white/[0.07] hover:text-white"
                aria-label="Dismiss notification"
                onClick={() => removeToast(toast.id)}
              >
                <FiX className="size-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
