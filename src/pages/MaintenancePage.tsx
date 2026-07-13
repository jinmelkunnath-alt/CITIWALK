import { FiClock, FiRefreshCw } from "react-icons/fi";
import { Container } from "@/components/layout/Container";
import { Seo } from "@/components/seo/Seo";
import { GlassCard, PrimaryButton, StatusBadge } from "@/components/ui";

export default function MaintenancePage() {
  return (
    <div className="grid min-h-[75vh] place-items-center py-16">
      <Seo title="Scheduled Maintenance" noIndex />
      <Container>
        <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-12" accent="orange">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-300">
            <FiClock className="size-7" />
          </div>
          <StatusBadge variant="orange" dot className="mt-6">Scheduled Maintenance</StatusBadge>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.045em] text-white sm:text-4xl">We&apos;ll be back shortly.</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">CITIWALK Global Rewards is receiving a secure update. Registration actions are temporarily paused.</p>
          <PrimaryButton className="mt-8" leadingIcon={<FiRefreshCw className="size-4" />} onClick={() => window.location.reload()}>
            Check Again
          </PrimaryButton>
        </GlassCard>
      </Container>
    </div>
  );
}
