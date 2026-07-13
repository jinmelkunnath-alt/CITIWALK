import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { GlassCard, PrimaryButton } from "@/components/ui";

export function NetworkErrorState({
  title = "We couldn’t reach the service.",
  description = "Check your connection and try again. No participant data has been changed.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <GlassCard className="mx-auto max-w-xl p-8 text-center sm:p-10" accent="orange">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-300">
        <FiWifiOff className="size-6" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
      <PrimaryButton className="mt-7" leadingIcon={<FiRefreshCw className="size-4" />} onClick={onRetry}>
        Try Again
      </PrimaryButton>
    </GlassCard>
  );
}
