import type { IconType } from "react-icons";
import { GlassCard, StatusBadge } from "@/components/ui";
import { cn } from "@/utils/cn";

type EmptyStateProps = {
  icon: IconType;
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ icon: Icon, eyebrow = "Foundation ready", title, description, className }: EmptyStateProps) {
  return (
    <GlassCard className={cn("mx-auto max-w-2xl p-8 text-center sm:p-12", className)} accent="purple">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <StatusBadge variant="purple" dot className="mt-6">{eyebrow}</StatusBadge>
      <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted sm:text-base">{description}</p>
    </GlassCard>
  );
}
