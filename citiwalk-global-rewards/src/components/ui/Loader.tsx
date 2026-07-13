import { cn } from "@/utils/cn";

type LoaderProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-4 border-2",
  md: "size-7 border-2",
  lg: "size-11 border-[3px]",
};

export function Loader({ label = "Loading", size = "md", className }: LoaderProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)} role="status">
      <span
        className={cn(
          "inline-block animate-spin rounded-full border-white/15 border-t-brand-300",
          sizes[size],
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
