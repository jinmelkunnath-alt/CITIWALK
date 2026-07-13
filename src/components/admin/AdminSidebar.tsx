import { AnimatePresence, motion } from "framer-motion";
import {
  FiBarChart2,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { routePaths } from "@/routes/paths";
import { cn } from "@/utils/cn";

const navigation = [
  { label: "Dashboard", to: routePaths.dashboard, icon: FiGrid, end: true },
  { label: "Participants", to: routePaths.adminParticipants, icon: FiUsers },
  { label: "Analytics", to: routePaths.adminAnalytics, icon: FiBarChart2 },
  { label: "Winner Selection", to: routePaths.adminWinners, icon: FiShield },
  { label: "Settings", to: routePaths.adminSettings, icon: FiSettings },
  { label: "Logs", to: routePaths.adminLogs, icon: FiFileText },
] as const;

type SidebarContentProps = {
  onNavigate?: () => void;
};

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center border-b border-white/[0.07] px-5">
        <BrandLockup />
      </div>
      <div className="px-4 pt-6">
        <p className="px-3 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted">Administration</p>
      </div>
      <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-4" aria-label="Admin navigation">
        {navigation.map(({ label, to, icon: Icon, ...item }) => (
          <NavLink
            key={to}
            to={to}
            end={"end" in item ? item.end : undefined}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted transition",
                isActive
                  ? "border border-brand-300/15 bg-brand-400/10 text-brand-100 shadow-glow-purple"
                  : "border border-transparent hover:bg-white/[0.045] hover:text-white",
              )
            }
          >
            <Icon className="size-4.5" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/[0.07] p-4">
        <div className="mb-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
          <p className="truncate text-xs font-bold text-white">{admin?.displayName}</p>
          <p className="mt-1 truncate text-[0.65rem] text-muted">{admin?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
        >
          <FiLogOut className="size-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  return (
    <>
      <aside className="surface-glass-subtle fixed inset-y-0 left-0 z-40 hidden w-72 border-y-0 border-l-0 bg-canvas/80 lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[70] bg-canvas/75 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) onMobileClose();
            }}
          >
            <motion.aside
              className="surface-glass-subtle h-full w-[min(18rem,88vw)] border-y-0 border-l-0 bg-canvas"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={onMobileClose}
                className="absolute right-3 top-5 z-10 grid size-10 place-items-center rounded-xl text-muted hover:bg-white/[0.06] hover:text-white"
                aria-label="Close admin navigation"
              >
                <FiX className="size-5" />
              </button>
              <SidebarContent onNavigate={onMobileClose} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
