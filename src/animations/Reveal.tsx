import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import {
  revealPresets,
  revealViewport,
  type RevealPreset,
} from "@/animations/presets";
import { cn } from "@/utils/cn";

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  preset?: RevealPreset;
  delay?: number;
};

export function Reveal({
  children,
  className,
  preset = "fade-up",
  delay = 0,
  ...props
}: RevealProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={revealPresets[preset]}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
