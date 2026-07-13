import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import type { PointerEvent } from "react";
import { cn } from "@/utils/cn";

type TiltCardProps = HTMLMotionProps<"div"> & {
  maxTilt?: number;
  floatDelay?: number;
};

export function TiltCard({
  className,
  children,
  maxTilt = 4,
  floatDelay = 0,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, { stiffness: 180, damping: 20 });
  const rotateY = useSpring(rotateYValue, { stiffness: 180, damping: 20 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (reduceMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateYValue.set(x * maxTilt * 2);
    rotateXValue.set(y * maxTilt * -2);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    rotateXValue.set(0);
    rotateYValue.set(0);
  };

  return (
    <motion.div
      className={cn("[perspective:1000px]", className)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
      transition={{
        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.012 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
}
