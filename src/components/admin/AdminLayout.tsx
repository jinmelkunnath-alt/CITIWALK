import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BackgroundLayers } from "@/components/layout/BackgroundLayers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  useLockBodyScroll(mobileSidebarOpen);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-canvas text-ink">
      <a
        href="#admin-main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-white px-4 py-2 text-sm font-bold text-canvas transition focus:translate-y-0"
      >
        Skip to admin content
      </a>
      <BackgroundLayers />
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="relative z-10 min-h-screen lg:pl-72">
        <AdminTopbar onMenuOpen={() => setMobileSidebarOpen(true)} />
        <main id="admin-main-content" className="px-gutter py-8 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
