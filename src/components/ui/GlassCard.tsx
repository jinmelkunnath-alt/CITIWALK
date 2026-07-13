import { motion, type HTMLMotionProps } from "framer-motion";
import { cardHoverMotion } from "@/animations/presets";
import { cn } from "@/utils/cn";

type GlassCardProps = HTMLMotionProps<"div"> & {
  interactive?: boolean;
  accent?: "purple" | "orange" | "none";
};

export function GlassCard({
  className,
  interactive = false,
  accent = "none",
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "surface-glass relative overflow-hidden rounded-card",
        accent === "purple" && "shadow-glow-purple",
        accent === "orange" && "shadow-glow-orange",
        interactive && "transition-colors hover:border-white/[0.16] hover:bg-white/[0.075]",
        className,
      )}
      whileHover={interactive ? cardHoverMotion : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
