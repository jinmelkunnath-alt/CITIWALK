import type { IconType } from "react-icons";
import { GlassCard, OutlineButton } from "@/components/ui";

type AdminEmptyStateProps = {
  icon: IconType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <GlassCard className="mx-auto max-w-xl p-8 text-center sm:p-10">
      <div className="relative mx-auto grid size-16 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
        <div className="absolute inset-[-18px] rounded-full bg-brand-500/10 blur-2xl" />
        <Icon className="relative size-7" />
      </div>
      <h3 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
      {actionLabel && onAction && (
        <OutlineButton className="mt-7" onClick={onAction}>{actionLabel}</OutlineButton>
      )}
    </GlassCard>
  );
}
