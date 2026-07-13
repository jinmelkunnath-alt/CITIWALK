import { httpsCallable } from "firebase/functions";
import { getFirebaseRuntime, isFirebaseConfigured } from "@/firebase/client";

export type ClientErrorReport = {
  message: string;
  stack?: string;
  componentStack?: string;
  route?: string;
};

let monitoringInitialized = false;
let lastReportSignature = "";
let lastReportAt = 0;

export async function reportClientError(report: ClientErrorReport) {
  if (!isFirebaseConfigured) return;
  const signature = `${report.message}:${report.stack?.slice(0, 120)}`;
  if (signature === lastReportSignature && Date.now() - lastReportAt < 30_000) return;
  lastReportSignature = signature;
  lastReportAt = Date.now();

  try {
    const { functions } = await getFirebaseRuntime();
    const callable = httpsCallable(functions, "reportClientError");
    await callable({
      ...report,
      route: report.route || window.location.pathname,
      buildVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
    });
  } catch {
    // Monitoring must never cascade into another user-facing failure.
  }
}

export async function initializeMonitoring() {
  if (monitoringInitialized || !isFirebaseConfigured) return;
  monitoringInitialized = true;

  try {
    const { getPerformance } = await import("firebase/performance");
    const { app } = await getFirebaseRuntime();
    getPerformance(app);
  } catch {
    // Performance Monitoring is optional in unsupported/privacy-restricted browsers.
  }

  window.addEventListener("error", (event) => {
    void reportClientError({
      message: event.message || "Unhandled browser error",
      stack: event.error instanceof Error ? event.error.stack : undefined,
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    void reportClientError({
      message: reason instanceof Error ? reason.message : "Unhandled promise rejection",
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
}
