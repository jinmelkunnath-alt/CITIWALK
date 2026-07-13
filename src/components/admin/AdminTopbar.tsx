import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useUI } from "@/hooks/useUI";
import { routePaths } from "@/routes/paths";

const pageTitles: Record<string, string> = {
  [routePaths.dashboard]: "Dashboard",
  [routePaths.adminParticipants]: "Participants",
  [routePaths.adminAnalytics]: "Analytics",
  [routePaths.adminWinners]: "Winner Selection",
  [routePaths.adminSettings]: "Settings",
  [routePaths.adminLogs]: "System Logs",
};

export function AdminTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { pathname } = useLocation();
  const { admin, logout } = useAdminAuth();
  const { addToast } = useUI();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-canvas/75 backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-between gap-4 px-gutter">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white lg:hidden"
            aria-label="Open admin navigation"
          >
            <FiMenu className="size-5" />
          </button>
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-brand-300">Admin Console</p>
            <p className="mt-1 text-sm font-bold text-white">{pageTitles[pathname] || "CITIWALK"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition hover:text-white"
            aria-label="Notifications"
            onClick={() =>
              addToast({
                tone: "neutral",
                title: "Notifications",
                message: "No new admin notifications.",
              })
            }
          >
            <FiBell className="size-4.5" />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-accent-400 shadow-[0_0_9px_rgba(255,165,31,.8)]" />
          </button>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 text-left transition hover:bg-white/[0.07]"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              onClick={() => setProfileOpen((current) => !current)}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
                {admin?.displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:block">
                <span className="block max-w-32 truncate text-xs font-bold text-white">{admin?.displayName}</span>
                <span className="mt-0.5 block text-[0.6rem] text-muted">Administrator</span>
              </span>
              <FiChevronDown className="size-3.5 text-muted" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="surface-glass absolute right-0 top-[calc(100%+.6rem)] w-64 rounded-card p-2 shadow-panel"
                >
                  <div className="border-b border-white/[0.07] p-3">
                    <p className="truncate text-sm font-bold text-white">{admin?.displayName}</p>
                    <p className="mt-1 truncate text-xs text-muted">{admin?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={() => addToast({ tone: "neutral", title: "Admin profile", message: "Profile management is ready for future MFA enrollment controls." })}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/[0.05] hover:text-white"
                    >
                      <FiUser className="size-4" /> Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-400/10"
                    >
                      <FiLogOut className="size-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
