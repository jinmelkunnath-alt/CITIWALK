import { cn } from "@/utils/cn";

type LoaderProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-5",
  md: "size-8",
  lg: "size-14",
};

export function Loader({ label = "Loading", size = "md", className }: LoaderProps) {
  return (
    <span className={cn("relative inline-grid place-items-center", sizes[size], className)} role="status">
      <span className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_0_28%,#a779ff_48%,#f98607_74%,transparent_92%)] motion-reduce:animate-none" aria-hidden="true" />
      <span className="absolute inset-[12%] rounded-full bg-canvas" aria-hidden="true" />
      <span className="relative size-[34%] animate-glow-pulse rounded-full bg-brand-300 shadow-[0_0_14px_rgba(167,121,255,.75)] motion-reduce:animate-none" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
