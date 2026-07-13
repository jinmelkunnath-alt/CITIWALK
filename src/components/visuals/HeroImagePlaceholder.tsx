import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useMemo, type PointerEvent } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import { StatusBadge } from "@/components/ui";
import { cn } from "@/utils/cn";

type HeroImagePlaceholderProps = {
  className?: string;
};

const particleLayout = [
  [9, 21, 3], [17, 68, 2], [26, 35, 2], [34, 78, 3], [45, 17, 2],
  [56, 62, 2], [66, 29, 3], [76, 74, 2], [84, 22, 2], [91, 54, 3],
] as const;

export function HeroImagePlaceholder({ className }: HeroImagePlaceholderProps) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 120, damping: 18 });
  const y = useSpring(rawY, { stiffness: 120, damping: 18 });
  const particles = useMemo(() => particleLayout, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 18);
    rawY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 18);
  };

  const resetParallax = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      className={cn(
        "surface-glass group relative aspect-video w-full overflow-hidden rounded-[2rem] p-px shadow-glow-purple",
        className,
      )}
      initial={{ opacity: 0, y: 24, scale: 0.975 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      role="img"
      aria-label="Responsive campaign image placeholder. Final campaign artwork will appear here."
    >
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-brand-300/35 via-brand-600/15 to-accent-400/25 opacity-70" />
      <div className="absolute inset-px overflow-hidden rounded-[calc(2rem-1px)] bg-[radial-gradient(circle_at_50%_42%,rgba(143,70,255,.34),transparent_27%),radial-gradient(circle_at_78%_25%,rgba(249,134,7,.18),transparent_24%),linear-gradient(145deg,#170c2c,#0b0713_58%,#160d25)]">
        <div className="ambient-grid absolute inset-0 opacity-70" />
        <motion.div className="absolute inset-[-5%]" style={{ x, y }}>
          <div className="absolute left-1/2 top-1/2 size-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-200/20 shadow-[0_0_100px_rgba(124,46,242,.26)]">
            <div className="absolute inset-[14%] rounded-full border border-dashed border-white/15 animate-spin-slow motion-reduce:animate-none" />
            <div className="absolute inset-[28%] rounded-full bg-brand-500/25 blur-2xl animate-glow-pulse motion-reduce:animate-none" />
          </div>
          <div className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.5rem] border border-white/15 bg-white/[0.07] text-brand-100 shadow-panel backdrop-blur-xl sm:size-28">
            <HiOutlinePhoto className="size-8 sm:size-11" aria-hidden="true" />
          </div>
          <div className="absolute left-[13%] top-[24%] h-16 w-24 rotate-[-8deg] rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md sm:h-24 sm:w-36" />
          <div className="absolute bottom-[18%] right-[12%] h-20 w-28 rotate-[7deg] rounded-2xl border border-accent-300/15 bg-accent-400/[0.055] backdrop-blur-md sm:h-28 sm:w-44" />
        </motion.div>

        {particles.map(([left, top, size], index) => (
          <motion.span
            key={`${left}-${top}`}
            className="absolute rounded-full bg-brand-100 shadow-[0_0_12px_rgba(196,173,255,.85)]"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
            animate={reduceMotion ? undefined : { y: [0, -16, 0], opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 4.5 + (index % 3), delay: index * -0.45, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <motion.div
          className="absolute inset-y-[-25%] w-[22%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent blur-xl"
          animate={reduceMotion ? undefined : { x: ["-160%", "620%"] }}
          transition={{ duration: 5.8, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/75 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-brand-200">16:9 campaign media</p>
            <p className="mt-1 text-xs text-muted">Image placeholder · Artwork ready</p>
          </div>
          <StatusBadge variant="purple" dot className="hidden sm:inline-flex">Interactive canvas</StatusBadge>
        </div>
      </div>
    </motion.div>
  );
}
