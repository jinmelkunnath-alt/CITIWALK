import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { Container } from "@/components/layout/Container";
import { Seo } from "@/components/seo/Seo";
import { GlassCard, PrimaryButton } from "@/components/ui";

export default function OfflinePage() {
  return (
    <div className="grid min-h-[70vh] place-items-center py-16">
      <Seo title="Offline" path="/offline" noIndex />
      <Container>
        <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-12" accent="purple">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
            <FiWifiOff className="size-7" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl">You&apos;re currently offline.</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">Previously cached pages remain available, but registration, verification, participant status, and admin data always require a fresh secure connection.</p>
          <PrimaryButton className="mt-8" leadingIcon={<FiRefreshCw className="size-4" />} onClick={() => window.location.reload()}>
            Reconnect
          </PrimaryButton>
        </GlassCard>
      </Container>
    </div>
  );
}
