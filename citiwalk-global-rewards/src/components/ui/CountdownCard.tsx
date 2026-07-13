import { cn } from "@/utils/cn";

type CountdownCardProps = {
  value?: string | number;
  label: string;
  className?: string;
};

/** Presentational only. Time calculation belongs to a future domain layer. */
export function CountdownCard({
  value = "––",
  label,
  className,
}: CountdownCardProps) {
  return (
    <div
      className={cn(
        "surface-glass-subtle min-w-0 rounded-card px-3 py-4 text-center sm:px-5 sm:py-5",
        className,
      )}
    >
      <strong className="block font-display text-2xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
        {value}
      </strong>
      <span className="mt-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted sm:text-[0.68rem]">
        {label}
      </span>
    </div>
  );
}
