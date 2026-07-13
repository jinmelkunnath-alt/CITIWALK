import { type RefObject, useEffect } from "react";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";

type IdleApi = {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Runs low-priority ambient motion through a lazy GSAP chunk after first paint.
 * Animation pauses when the page is hidden and is omitted for reduced-motion users.
 */
export function useAmbientMotion<T extends HTMLElement>(scope: RefObject<T>) {
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (prefersReducedMotion || !scope.current) return;

    let cleanupAnimation: () => void = () => undefined;
    let active = true;
    const idleApi = window as unknown as IdleApi;

    const startAnimation = () => {
      void import("gsap").then(({ gsap }) => {
        if (!active || !scope.current) return;
        const tweens: ReturnType<typeof gsap.to>[] = [];

        const context = gsap.context(() => {
          gsap.utils
            .toArray<HTMLElement>("[data-ambient-shape]")
            .forEach((shape, index) => {
              tweens.push(
                gsap.to(shape, {
                  x: index % 2 === 0 ? 24 : -18,
                  y: index % 3 === 0 ? -30 : 22,
                  rotate: index % 2 === 0 ? 10 : -8,
                  duration: 7 + index * 1.25,
                  delay: index * -1.4,
                  ease: "sine.inOut",
                  repeat: -1,
                  yoyo: true,
                  force3D: true,
                }),
              );
            });
        }, scope);

        const handleVisibility = () => {
          tweens.forEach((tween) => tween.paused(document.hidden));
        };
        document.addEventListener("visibilitychange", handleVisibility);
        handleVisibility();

        cleanupAnimation = () => {
          document.removeEventListener("visibilitychange", handleVisibility);
          context.revert();
        };
      });
    };

    const requestIdle = idleApi.requestIdleCallback;
    const usedIdleCallback = Boolean(requestIdle);
    const idleHandle = requestIdle
      ? requestIdle(startAnimation, { timeout: 1_500 })
      : window.setTimeout(startAnimation, 600);

    return () => {
      active = false;
      if (usedIdleCallback) {
        idleApi.cancelIdleCallback?.(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }
      cleanupAnimation();
    };
  }, [prefersReducedMotion, scope]);
}
