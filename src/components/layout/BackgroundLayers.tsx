import { useRef, type CSSProperties } from "react";
import { useAmbientMotion } from "@/hooks/useAmbientMotion";

const particles = [
  { left: "7%", top: "18%", size: 2, speed: "7s", drift: "15px", delay: "-2s" },
  { left: "17%", top: "72%", size: 3, speed: "9s", drift: "-12px", delay: "-5s" },
  { left: "29%", top: "34%", size: 2, speed: "8s", drift: "20px", delay: "-1s" },
  { left: "43%", top: "82%", size: 2, speed: "11s", drift: "-18px", delay: "-7s" },
  { left: "58%", top: "23%", size: 3, speed: "10s", drift: "14px", delay: "-3s" },
  { left: "68%", top: "66%", size: 2, speed: "7.5s", drift: "19px", delay: "-4s" },
  { left: "78%", top: "12%", size: 2, speed: "12s", drift: "-22px", delay: "-8s" },
  { left: "89%", top: "44%", size: 3, speed: "8.5s", drift: "13px", delay: "-6s" },
  { left: "94%", top: "79%", size: 2, speed: "10.5s", drift: "-16px", delay: "-2s" },
  { left: "36%", top: "9%", size: 2, speed: "9.5s", drift: "10px", delay: "-5s" },
];

export function BackgroundLayers() {
  const scope = useRef<HTMLDivElement>(null);
  useAmbientMotion(scope);

  return (
    <div ref={scope} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-aurora opacity-90 animate-aurora" />
      <div className="ambient-grid absolute inset-0 opacity-50" />

      <div
        data-ambient-shape
        className="absolute -left-32 top-[8%] h-[28rem] w-[28rem] rounded-full bg-brand-700/20 blur-[110px]"
      />
      <div
        data-ambient-shape
        className="absolute -right-36 top-[22%] h-[25rem] w-[25rem] rounded-full bg-accent-500/10 blur-[110px]"
      />
      <div
        data-ambient-shape
        className="absolute bottom-[-12rem] left-[38%] h-[32rem] w-[32rem] rounded-full bg-brand-500/10 blur-[130px]"
      />

      <div className="absolute inset-0 mask-fade-y">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-brand-200 shadow-[0_0_10px_rgba(196,173,255,.85)] animate-particle"
            style={
              {
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDelay: particle.delay,
                "--particle-speed": particle.speed,
                "--particle-drift": particle.drift,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="noise-overlay absolute inset-0 opacity-[0.025] mix-blend-soft-light" />
    </div>
  );
}
