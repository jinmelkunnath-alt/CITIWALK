import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiClock } from "react-icons/fi";
import { Reveal } from "@/animations/Reveal";
import { Section } from "@/components/layout/Section";
import { CountdownCard, GlassCard, SectionTitle, StatusBadge } from "@/components/ui";
import {
  GIVEAWAY_END_ISO,
  giveawayEndLabel,
} from "@/constants/campaign";
import { useCountdown } from "@/hooks/useCountdown";

export function CountdownSection() {
  const countdown = useCountdown(GIVEAWAY_END_ISO);
  const values = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
    { label: "Seconds", value: countdown.seconds },
  ];

  return (
    <Section
      id="countdown"
      aria-labelledby="countdown-title"
      className="border-y border-white/[0.05] bg-white/[0.018]"
    >
      <Reveal>
        <SectionTitle
          eyebrow="Live countdown"
          title={<span id="countdown-title">The reveal is getting closer.</span>}
          description="Counting down to the official winner announcement at one shared moment worldwide."
          align="center"
        />
      </Reveal>

      <Reveal preset="scale" className="mx-auto mt-11 max-w-5xl">
        <GlassCard className="relative overflow-hidden p-4 sm:p-7 lg:p-9" accent="purple">
          <div className="absolute -left-20 top-1/2 size-56 -translate-y-1/2 rounded-full bg-brand-500/15 blur-[90px]" aria-hidden="true" />
          <div className="absolute -right-20 top-1/3 size-48 rounded-full bg-accent-500/10 blur-[80px]" aria-hidden="true" />

          <div className="relative flex flex-col items-center justify-between gap-5 border-b border-white/[0.07] pb-6 sm:flex-row">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
                <FiClock className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Winner announcement</p>
                <time dateTime={GIVEAWAY_END_ISO} className="mt-1 block text-xs text-muted">
                  {giveawayEndLabel.date} · {giveawayEndLabel.time}
                </time>
              </div>
            </div>
            <StatusBadge variant={countdown.hasEnded ? "orange" : "purple"} dot>
              {countdown.hasEnded ? "Countdown complete" : "Live now"}
            </StatusBadge>
          </div>

          <div className="relative mt-6" aria-label="Time remaining until the winner announcement">
            {countdown.hasEnded ? (
              <motion.div
                role="status"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-panel border border-accent-300/20 bg-accent-400/[0.07] px-6 py-12 text-center shadow-glow-orange"
              >
                <FiCalendar className="mx-auto size-8 text-accent-300" aria-hidden="true" />
                <p className="mt-4 text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
                  GIVEAWAY HAS ENDED
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:gap-4" aria-live="off">
                {values.map(({ label, value }) => (
                  <AnimatePresence key={label} mode="popLayout" initial={false}>
                    <motion.div
                      key={`${label}-${value}`}
                      initial={{ opacity: 0.4, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.22 }}
                    >
                      <CountdownCard
                        label={label}
                        value={String(value).padStart(2, "0")}
                        className="py-6 sm:py-8 [&_strong]:text-3xl sm:[&_strong]:text-5xl"
                      />
                    </motion.div>
                  </AnimatePresence>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </Reveal>
    </Section>
  );
}
