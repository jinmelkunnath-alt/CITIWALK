import { type RefObject, useEffect } from "react";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";

/**
 * Runs low-priority ambient motion through GSAP. GSAP is dynamically imported so
 * it never delays the first render, and the animation is skipped for users who
 * request reduced motion.
 */
export function useAmbientMotion<T extends HTMLElement>(scope: RefObject<T>) {
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (prefersReducedMotion || !scope.current) return;

    let cleanup: () => void = () => undefined;
    let active = true;

    void import("gsap").then(({ gsap }) => {
      if (!active || !scope.current) return;

      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-ambient-shape]").forEach((shape, index) => {
          gsap.to(shape, {
            x: index % 2 === 0 ? 24 : -18,
            y: index % 3 === 0 ? -30 : 22,
            rotate: index % 2 === 0 ? 10 : -8,
            duration: 7 + index * 1.25,
            delay: index * -1.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
      }, scope);

      cleanup = () => context.revert();
    });

    return () => {
      active = false;
      cleanup();
    };
  }, [prefersReducedMotion, scope]);
}
