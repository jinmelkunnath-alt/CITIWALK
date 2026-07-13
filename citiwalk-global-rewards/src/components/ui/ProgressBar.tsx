import { cn } from "@/utils/cn";

type ProgressBarProps = {
  value?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  label = "Progress",
  showValue = false,
  className,
}: ProgressBarProps) {
  const isIndeterminate = value === undefined;
  const normalizedValue = isIndeterminate ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-2.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-4 text-xs font-semibold">
          <span className="text-muted">{label}</span>
          {showValue && !isIndeterminate && <span className="text-ink">{Math.round(normalizedValue)}%</span>}
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-white/[0.07]"
        role="progressbar"
        aria-label={label}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuemax={isIndeterminate ? undefined : 100}
        aria-valuenow={isIndeterminate ? undefined : normalizedValue}
        aria-busy={isIndeterminate || undefined}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400 shadow-[0_0_18px_rgba(167,121,255,.45)] transition-[width] duration-500",
            isIndeterminate && "w-1/3 animate-[shimmer_1.6s_ease-in-out_infinite] bg-[length:200%_100%]",
          )}
          style={isIndeterminate ? undefined : { width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
