import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { IconType } from "react-icons";
import { GlassCard } from "@/components/ui";

type MetricCardProps = {
  label: string;
  value: number;
  icon: IconType;
  tone?: "purple" | "orange" | "green" | "neutral";
  formatter?: (value: number) => string;
};

const toneClasses = {
  purple: "border-brand-300/20 bg-brand-400/10 text-brand-200",
  orange: "border-accent-300/20 bg-accent-400/10 text-accent-300",
  green: "border-emerald-300/20 bg-emerald-400/10 text-emerald-300",
  neutral: "border-white/10 bg-white/[0.05] text-muted",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "purple",
  formatter = (number) => number.toLocaleString(),
}: MetricCardProps) {
  const spring = useSpring(0, { stiffness: 85, damping: 20 });
  const display = useTransform(spring, (current) => formatter(Math.round(current)));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <GlassCard interactive className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted">{label}</p>
          <motion.p className="mt-3 text-2xl font-extrabold tracking-[-0.045em] text-white sm:text-3xl">
            {display}
          </motion.p>
        </div>
        <span className={`grid size-11 place-items-center rounded-xl border ${toneClasses[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </GlassCard>
  );
}
