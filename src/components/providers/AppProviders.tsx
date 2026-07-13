import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import type { ReactNode } from "react";
import { ToastViewport } from "@/components/ui";
import { AdminAuthProvider } from "@/context/AdminAuthProvider";
import { ParticipantProvider } from "@/context/ParticipantProvider";
import { UIProvider } from "@/context/UIContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <UIProvider>
        <AdminAuthProvider>
          <ParticipantProvider>
            <MotionConfig reducedMotion="user">
              {children}
              <ToastViewport />
            </MotionConfig>
          </ParticipantProvider>
        </AdminAuthProvider>
      </UIProvider>
    </HelmetProvider>
  );
}
