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
import { useParticipant } from "@/hooks/useParticipant";
import { VerificationModal } from "@/sections/home/VerificationModal";

export function HowItWorksSection() {
  const {
    backendStatus,
    participation,
    instagramOpened,
    whatsappShareOpened,
    verificationDialog,
    openInstagram,
    verifyInstagram,
    openWhatsApp,
    verifyWhatsApp,
    closeVerificationDialog,
  } = useParticipant();
  const serviceReady = backendStatus === "ready";
  const instagramProgress = participation.instagramVerified ? 100 : 0;
  const whatsappProgress = Math.min(100, (participation.whatsappSuccesses / 8) * 100);

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
          description="Complete the Instagram follow and eight verified WhatsApp shares to securely unlock your entry."
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
              <StatusBadge
                variant={participation.instagramVerified ? "success" : "orange"}
                dot
              >
                {participation.instagramVerified ? "Verified" : "Pending"}
              </StatusBadge>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Instagram</p>
            <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">Follow us on Instagram</h3>
            <p className="mt-3 break-all text-sm font-semibold text-fuchsia-200">@citiwalk.official.giveaway</p>

            <div className="mt-7 rounded-card border border-white/[0.07] bg-white/[0.03] p-4">
              <ProgressBar
                label={`Instagram progress · ${instagramProgress}%`}
                value={instagramProgress}
              />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <PrimaryButton
                className="w-full"
                leadingIcon={<FaInstagram className="size-4" aria-hidden="true" />}
                trailingIcon={<FiArrowUpRight className="size-4" aria-hidden="true" />}
                onClick={openInstagram}
                disabled={!serviceReady || participation.instagramVerified}
              >
                {participation.instagramVerified ? "Follow Verified" : "Follow on Instagram"}
              </PrimaryButton>
              <OutlineButton
                className="w-full"
                leadingIcon={<FiCheck className="size-4" aria-hidden="true" />}
                disabled={
                  !serviceReady ||
                  !instagramOpened ||
                  participation.instagramVerified ||
                  verificationDialog.status === "verifying"
                }
                onClick={() => void verifyInstagram()}
                aria-label={
                  participation.instagramVerified
                    ? "Instagram follow verified"
                    : "I Have Followed — verify Instagram participation"
                }
              >
                {participation.instagramVerified ? "Verified" : "I Have Followed"}
              </OutlineButton>
            </div>
            {!instagramOpened && !participation.instagramVerified && (
              <p className="mt-3 text-center text-xs text-muted">Open Instagram first, then return to verify.</p>
            )}
          </GlassCard>
        </Reveal>

        <Reveal preset="fade-left" className="h-full">
          <GlassCard className="group h-full p-6 sm:p-8" accent="orange">
            <div className="flex items-start justify-between gap-5">
              <div className="grid size-14 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,.14)] transition duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <FaWhatsapp className="size-6" aria-hidden="true" />
              </div>
              <StatusBadge
                variant={participation.whatsappVerified ? "success" : "orange"}
                dot
              >
                {participation.whatsappVerified ? "Verified" : "Pending"}
              </StatusBadge>
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
              <ProgressBar
                label={`WhatsApp progress · ${participation.whatsappSuccesses} / 8`}
                value={whatsappProgress}
              />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <PrimaryButton
                className="w-full"
                leadingIcon={<FiShare2 className="size-4" aria-hidden="true" />}
                onClick={openWhatsApp}
                disabled={!serviceReady || participation.whatsappVerified}
              >
                {participation.whatsappVerified ? "Sharing Complete" : "Share on WhatsApp"}
              </PrimaryButton>
              <OutlineButton
                className="w-full"
                leadingIcon={<FiCheck className="size-4" aria-hidden="true" />}
                disabled={
                  !serviceReady ||
                  !whatsappShareOpened ||
                  participation.whatsappVerified ||
                  verificationDialog.status === "verifying"
                }
                onClick={() => void verifyWhatsApp()}
                aria-label={
                  participation.whatsappVerified
                    ? "WhatsApp sharing verified"
                    : "I Have Shared — verify the latest WhatsApp share"
                }
              >
                {participation.whatsappVerified ? "Verified" : "I Have Shared"}
              </OutlineButton>
            </div>
            {!whatsappShareOpened && !participation.whatsappVerified && (
              <p className="mt-3 text-center text-xs text-muted">Open WhatsApp for each share, then return to verify.</p>
            )}
          </GlassCard>
        </Reveal>
      </div>

      <VerificationModal dialog={verificationDialog} onClose={closeVerificationDialog} />
    </Section>
  );
}
