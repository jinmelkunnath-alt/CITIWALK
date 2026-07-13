import { Outlet } from "react-router-dom";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { BackgroundLayers } from "@/components/layout/BackgroundLayers";
import { Container } from "@/components/layout/Container";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export function PortalLayout() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-canvas">
      <BackgroundLayers />
      <ScrollToTop />
      <header className="relative z-20">
        <Container className="flex h-[var(--nav-height)] items-center">
          <BrandLockup />
        </Container>
      </header>
      <main id="main-content" className="relative z-10 grid min-h-[calc(100vh-var(--nav-height))] place-items-center px-gutter py-12">
        <Outlet />
      </main>
    </div>
  );
}
