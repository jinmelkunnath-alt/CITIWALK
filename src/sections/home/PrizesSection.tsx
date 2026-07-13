import { FiGift, FiStar } from "react-icons/fi";
import { HiOutlinePhoto } from "react-icons/hi2";
import { Reveal } from "@/animations/Reveal";
import { TiltCard } from "@/components/interactions/TiltCard";
import { Section } from "@/components/layout/Section";
import { GlassCard, SectionTitle, StatusBadge } from "@/components/ui";
import { prizes } from "@/constants/campaign";

const cardGradients = [
  "from-brand-400/30 via-brand-600/12 to-accent-400/15",
  "from-accent-400/20 via-brand-500/12 to-transparent",
  "from-brand-300/20 via-brand-700/12 to-transparent",
  "from-fuchsia-400/15 via-brand-600/15 to-transparent",
];

export function PrizesSection() {
  return (
    <Section id="prizes" aria-labelledby="prizes-title">
      <Reveal>
        <SectionTitle
          eyebrow="Ten extraordinary rewards"
          title={<span id="prizes-title">A prize line-up worth celebrating.</span>}
          description="From flagship technology to cash rewards, every prize has its own premium reveal moment. Product imagery will be added before launch."
          align="center"
        />
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {prizes.map((prize, index) => (
          <Reveal key={prize.rank} delay={(index % 4) * 0.06} className="h-full">
            <TiltCard className="h-full" floatDelay={index * -0.35} maxTilt={3.5}>
              <GlassCard
                className="group flex h-full min-h-[23rem] flex-col p-4 sm:p-5"
                accent={prize.featured ? "orange" : index % 3 === 0 ? "purple" : "none"}
              >
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}
                >
                  <div className="ambient-grid absolute inset-0 opacity-70" />
                  <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-3xl transition duration-500 group-hover:scale-150" />
                  <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/[0.14] bg-white/[0.065] text-white shadow-panel backdrop-blur-xl transition duration-500 group-hover:-rotate-3 group-hover:scale-110">
                    <HiOutlinePhoto className="size-7" aria-hidden="true" />
                  </div>
                  <StatusBadge
                    className="absolute left-3 top-3"
                    variant={prize.featured ? "orange" : "purple"}
                  >
                    {prize.rank}
                  </StatusBadge>
                  <span className="absolute bottom-3 right-3 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted">
                    Image placeholder
                  </span>
                  <div className="absolute -right-8 -top-8 size-20 rounded-full border border-white/10 bg-white/[0.03] transition duration-500 group-hover:scale-125" />
                </div>

                <div className="flex flex-1 flex-col pt-5">
                  <div className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-muted">
                    {prize.featured ? (
                      <FiStar className="size-3.5 text-accent-300" aria-hidden="true" />
                    ) : (
                      <FiGift className="size-3.5 text-brand-300" aria-hidden="true" />
                    )}
                    CITIWALK reward
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-7 tracking-[-0.03em] text-white">
                    {prize.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-5">
                    <span className="text-xs font-semibold text-muted">Prize {String(index + 1).padStart(2, "0")}</span>
                    <span className="size-2 rounded-full bg-brand-300 shadow-[0_0_14px_rgba(196,173,255,.85)]" aria-hidden="true" />
                  </div>
                </div>
              </GlassCard>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
