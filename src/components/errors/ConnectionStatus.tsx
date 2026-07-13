import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiWifiOff } from "react-icons/fi";

export function ConnectionStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="surface-glass fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-3 text-xs font-semibold text-white shadow-panel"
        >
          <FiWifiOff className="size-4 text-accent-300" aria-hidden="true" />
          You&apos;re offline. Live actions will resume when the connection returns.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
