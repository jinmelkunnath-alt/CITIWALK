import { Reveal } from "@/animations/Reveal";
import { Section } from "@/components/layout/Section";
import { Accordion, GlassCard, SectionTitle } from "@/components/ui";
import { campaignFaqs } from "@/constants/campaign";

export function FAQSection() {
  return (
    <Section id="faq" aria-labelledby="faq-title">
      <Reveal>
        <SectionTitle
          eyebrow="Frequently asked questions"
          title={<span id="faq-title">Everything you need to know.</span>}
          description="Clear campaign guidance in a polished, keyboard-accessible accordion."
          align="center"
        />
      </Reveal>
      <Reveal className="mx-auto mt-10 max-w-4xl">
        <GlassCard className="px-5 sm:px-8" accent="purple">
          <Accordion items={campaignFaqs} />
        </GlassCard>
      </Reveal>
    </Section>
  );
}
