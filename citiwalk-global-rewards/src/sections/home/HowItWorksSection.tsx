import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { FiArrowUpRight, FiCheck, FiShare2, FiUsers } from "react-icons/fi";
import { Reveal } from "@/animations/Reveal";
import { Section } from "@/components/layout/Section";
import {
  GlassCard,
  OutlineButton,
  PrimaryButton,
  ProgressBar,
  SectionTitle,
  StatusBadge,
} from "@/components/ui";
import { useUI } from "@/hooks/useUI";

export function HowItWorksSection() {
  const { addToast } = useUI();

  const showPreviewNotice = (channel: "Instagram" | "WhatsApp") => {
    addToast({
      tone: "neutral",
      title: `${channel} action preview`,
      message: "This frontend control is not connected to sharing or verification yet.",
    });
  };

  return (
    <Section
      id="participation"
      aria-labelledby="participation-title"
      className="border-y border-white/[0.05] bg-white/[0.018]"
    >
      <Reveal>
        <SectionTitle
          eyebrow="How to participate"
          title={<span id="participation-title">Two simple steps. One premium journey.</span>}
          description="The participation interface is ready for the Instagram and WhatsApp stages. Verification remains intentionally disconnected."
          align="center"
        />
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal preset="fade-right" className="h-full">
          <GlassCard className="group h-full p-6 sm:p-8" accent="purple">
            <div className="flex items-start justify-between gap-5">
              <div className="grid size-14 place-items-center rounded-2xl border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-400/20 to-brand-500/10 text-fuchsia-200 shadow-[0_0_35px_rgba(217,70,239,.16)] transition duration-500 group-hover:scale-105 group-hover:rotate-3">
                <FaInstagram className="size-6" aria-hidden="true" />
              </div>
              <StatusBadge variant="orange" dot>Pending</StatusBadge>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Instagram</p>
            <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">Follow us on Instagram</h3>
            <p className="mt-3 break-all text-sm font-semibold text-fuchsia-200">@citiwalk.official.giveaway</p>

            <div className="mt-7 rounded-card border border-white/[0.07] bg-white/[0.03] p-4">
              <ProgressBar label="Instagram progress" value={0} showValue />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <PrimaryButton
                className="w-full"
                leadingIcon={<FaInstagram className="size-4" aria-hidden="true" />}
                trailingIcon={<FiArrowUpRight className="size-4" aria-hidden="true" />}
                onClick={() => showPreviewNotice("Instagram")}
              >
                Follow on Instagram
              </PrimaryButton>
              <OutlineButton
                className="w-full"
                leadingIcon={<FiCheck className="size-4" aria-hidden="true" />}
                disabled
                aria-label="I Have Followed — unavailable until verification is connected"
              >
                I Have Followed
              </OutlineButton>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal preset="fade-left" className="h-full">
          <GlassCard className="group h-full p-6 sm:p-8" accent="orange">
            <div className="flex items-start justify-between gap-5">
              <div className="grid size-14 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,.14)] transition duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <FaWhatsapp className="size-6" aria-hidden="true" />
              </div>
              <StatusBadge variant="orange" dot>Pending</StatusBadge>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-accent-300">WhatsApp</p>
            <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">Share with your circle</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-muted">
                <FiUsers className="size-3.5 text-emerald-300" aria-hidden="true" />
                5 Contacts
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-muted">
                <FiUsers className="size-3.5 text-emerald-300" aria-hidden="true" />
                3 Groups
              </span>
            </div>

            <div className="mt-7 rounded-card border border-white/[0.07] bg-white/[0.03] p-4">
              <ProgressBar label="WhatsApp progress · 0 / 8" value={0} />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <PrimaryButton
                className="w-full"
                leadingIcon={<FiShare2 className="size-4" aria-hidden="true" />}
                onClick={() => showPreviewNotice("WhatsApp")}
              >
                Share on WhatsApp
              </PrimaryButton>
              <OutlineButton
                className="w-full"
                leadingIcon={<FiCheck className="size-4" aria-hidden="true" />}
                disabled
                aria-label="I Have Shared — unavailable until share requirements are completed"
              >
                I Have Shared
              </OutlineButton>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </Section>
  );
}
