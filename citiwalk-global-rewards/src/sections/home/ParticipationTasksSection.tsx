import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { FiActivity, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import { Reveal } from "@/animations/Reveal";
import { Section } from "@/components/layout/Section";
import { GlassCard, ProgressBar, SectionTitle, StatusBadge } from "@/components/ui";

export function ParticipationTasksSection() {
  return (
    <Section id="progress" aria-labelledby="progress-title">
      <Reveal>
        <SectionTitle
          eyebrow="Participation progress"
          title={<span id="progress-title">Every step, beautifully in view.</span>}
          description="A polished progress dashboard prepared for future verified activity. All values currently remain at their frontend placeholder state."
        />
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <Reveal preset="fade-right" className="h-full">
          <GlassCard className="relative grid h-full min-h-[22rem] place-items-center p-7 text-center" accent="purple">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,46,242,.17),transparent_40%)]" aria-hidden="true" />
            <div className="relative">
              <div className="relative mx-auto grid size-48 place-items-center rounded-full sm:size-56">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#overall-progress-gradient)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    pathLength="1"
                    initial={{ strokeDasharray: "0 1" }}
                    whileInView={{ strokeDasharray: "0 1" }}
                    viewport={{ once: true }}
                  />
                  <defs>
                    <linearGradient id="overall-progress-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#A779FF" />
                      <stop offset="1" stopColor="#FFA51F" />
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <strong className="block text-5xl font-extrabold tracking-[-0.07em] text-white sm:text-6xl">0%</strong>
                  <span className="mt-2 block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">Complete</span>
                </div>
              </div>
              <StatusBadge variant="purple" dot className="mt-6">Overall Progress</StatusBadge>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-muted">Complete both participation stages to prepare your entry.</p>
            </div>
          </GlassCard>
        </Reveal>

        <div className="grid gap-5">
          <Reveal preset="fade-left">
            <GlassCard className="p-6 sm:p-7" interactive>
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200">
                  <FaInstagram className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white">Instagram</h3>
                    <StatusBadge variant="neutral">Pending</StatusBadge>
                  </div>
                  <ProgressBar label="0 of 1 step completed" value={0} className="mt-4" />
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal preset="fade-left" delay={0.08}>
            <GlassCard className="p-6 sm:p-7" interactive>
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
                  <FaWhatsapp className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white">WhatsApp</h3>
                    <StatusBadge variant="neutral">0 / 8</StatusBadge>
                  </div>
                  <ProgressBar label="0 of 8 shares completed" value={0} className="mt-4" />
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal preset="fade-left" delay={0.16}>
            <GlassCard className="grid gap-4 p-6 sm:grid-cols-3 sm:p-7">
              <div className="flex items-center gap-3">
                <FiActivity className="size-5 text-brand-300" aria-hidden="true" />
                <div><p className="text-xs text-muted">Active stages</p><p className="mt-1 text-lg font-bold text-white">0 / 2</p></div>
              </div>
              <div className="flex items-center gap-3 sm:border-l sm:border-white/[0.07] sm:pl-5">
                <FiCheckCircle className="size-5 text-emerald-300" aria-hidden="true" />
                <div><p className="text-xs text-muted">Completed</p><p className="mt-1 text-lg font-bold text-white">0</p></div>
              </div>
              <div className="flex items-center gap-3 sm:border-l sm:border-white/[0.07] sm:pl-5">
                <FiTrendingUp className="size-5 text-accent-300" aria-hidden="true" />
                <div><p className="text-xs text-muted">Completion</p><p className="mt-1 text-lg font-bold text-white">0%</p></div>
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
