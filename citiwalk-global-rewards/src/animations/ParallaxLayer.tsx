import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@/utils/cn";

type ParallaxLayerProps = Omit<HTMLMotionProps<"div">, "style"> & {
  offset?: number;
};

/** Lightweight scroll-linked layer with an automatic reduced-motion fallback. */
export function ParallaxLayer({
  offset = 24,
  className,
  children,
  ...props
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={{ y: reduceMotion ? 0 : parallaxY }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
