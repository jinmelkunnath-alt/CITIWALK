import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type StatusBadgeVariant = "neutral" | "purple" | "orange" | "success" | "danger";

const variants: Record<StatusBadgeVariant, string> = {
  neutral: "border-white/10 bg-white/[0.055] text-muted",
  purple: "border-brand-400/20 bg-brand-400/10 text-brand-200",
  orange: "border-accent-400/20 bg-accent-400/10 text-accent-300",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  danger: "border-red-400/20 bg-red-400/10 text-red-300",
};

type StatusBadgeProps = {
  children: ReactNode;
  variant?: StatusBadgeVariant;
  dot?: boolean;
  className?: string;
};

export function StatusBadge({
  children,
  variant = "neutral",
  dot = false,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.13em]",
        variants[variant],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" aria-hidden="true" />}
      {children}
    </span>
  );
}
