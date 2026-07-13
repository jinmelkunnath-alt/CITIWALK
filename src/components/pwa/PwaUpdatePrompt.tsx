import { useState } from "react";
import { FiDownloadCloud, FiX } from "react-icons/fi";
import { registerSW } from "virtual:pwa-register";
import { OutlineButton, PrimaryButton } from "@/components/ui";

export function PwaUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateServiceWorker] = useState(() =>
    registerSW({
      immediate: true,
      onNeedRefresh: () => setUpdateAvailable(true),
      onOfflineReady: () => setOfflineReady(true),
    }),
  );

  if (!updateAvailable && !offlineReady) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="surface-glass fixed bottom-4 right-4 z-[95] w-[calc(100%-2rem)] max-w-sm rounded-card p-4 shadow-panel"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
          <FiDownloadCloud className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">
            {updateAvailable ? "A secure update is ready" : "CITIWALK is ready offline"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {updateAvailable
              ? "Refresh to use the latest production version."
              : "Static pages are now available without a connection."}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss update notification"
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-white"
          onClick={() => {
            setUpdateAvailable(false);
            setOfflineReady(false);
          }}
        >
          <FiX className="size-4" />
        </button>
      </div>
      {updateAvailable && (
        <div className="mt-4 flex justify-end gap-2">
          <OutlineButton size="sm" onClick={() => setUpdateAvailable(false)}>Later</OutlineButton>
          <PrimaryButton size="sm" onClick={() => void updateServiceWorker(true)}>Refresh</PrimaryButton>
        </div>
      )}
    </div>
  );
}
