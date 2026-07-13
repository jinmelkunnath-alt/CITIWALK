import { Component, type ErrorInfo, type ReactNode } from "react";
import { FiAlertTriangle, FiHome, FiRefreshCw } from "react-icons/fi";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { reportClientError } from "@/services/monitoringService";

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportClientError({
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack || undefined,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-gutter py-12 text-ink">
        <div className="absolute left-1/2 top-1/3 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="surface-glass relative w-full max-w-2xl rounded-panel p-8 text-center sm:p-12">
          <BrandLockup linked={false} className="justify-center" />
          <div className="mx-auto mt-8 grid size-16 place-items-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-300">
            <FiAlertTriangle className="size-7" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-red-300">500 · Application Error</p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl">Something unexpected happened.</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">The issue has been reported securely. Refresh the application or return to the homepage.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" className="button-primary" onClick={() => window.location.reload()}>
              <FiRefreshCw className="size-4" /> Refresh Application
            </button>
            <a href="/" className="button-outline">
              <FiHome className="size-4" /> Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
