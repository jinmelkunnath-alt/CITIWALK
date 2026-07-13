import type { Variants } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease } },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.72, ease } },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.72, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.68, ease } },
};

export const heroEntrance: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.08,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

export const floatMotion = {
  y: [0, -10, 0],
  transition: { duration: 5, ease: "easeInOut", repeat: Infinity },
};

export const glowPulseMotion = {
  opacity: [0.4, 0.8, 0.4],
  scale: [1, 1.06, 1],
  transition: { duration: 5, ease: "easeInOut", repeat: Infinity },
};

export const rotateSlowlyMotion = {
  rotate: 360,
  transition: { duration: 30, ease: "linear", repeat: Infinity },
};

export const buttonHoverMotion = {
  y: -2,
  scale: 1.01,
  transition: { duration: 0.24, ease },
};

export const cardHoverMotion = {
  y: -6,
  transition: { duration: 0.32, ease },
};

export const revealViewport = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -80px 0px",
} as const;

export type RevealPreset = "fade-up" | "fade-left" | "fade-right" | "scale";

export const revealPresets: Record<RevealPreset, Variants> = {
  "fade-up": fadeUp,
  "fade-left": fadeLeft,
  "fade-right": fadeRight,
  scale: scaleIn,
};
