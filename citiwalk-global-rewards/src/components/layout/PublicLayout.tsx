import { Outlet } from "react-router-dom";
import { BackgroundLayers } from "@/components/layout/BackgroundLayers";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-canvas text-ink">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-white px-4 py-2 text-sm font-bold text-canvas transition focus:translate-y-0"
      >
        Skip to main content
      </a>
      <BackgroundLayers />
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="relative z-10 min-h-[70vh] pt-[var(--nav-height)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
