import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import type { ReactNode } from "react";
import { ToastViewport } from "@/components/ui";
import { UIProvider } from "@/context/UIContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <UIProvider>
        <MotionConfig reducedMotion="user">
          {children}
          <ToastViewport />
        </MotionConfig>
      </UIProvider>
    </HelmetProvider>
  );
}
