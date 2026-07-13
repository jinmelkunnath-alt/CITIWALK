import { Reveal } from "@/animations/Reveal";
import { Container } from "@/components/layout/Container";
import { GlassCard, StatusBadge } from "@/components/ui";

type LegalSection = {
  title: string;
  body: string;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: LegalSection[];
};

export function LegalDocument({ eyebrow, title, introduction, sections }: LegalDocumentProps) {
  return (
    <div className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <StatusBadge variant="purple">{eyebrow}</StatusBadge>
            <h1 className="mt-6 text-display-sm gradient-text">{title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">{introduction}</p>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-4xl">
          <GlassCard className="p-6 sm:p-10">
            <div className="mb-8 rounded-card border border-brand-300/15 bg-brand-400/[0.055] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-300">Effective date</p>
              <p className="mt-2 text-sm leading-6 text-muted">13 July 2026 · CITIWALK may publish clearly identified updates when legal, security, or campaign requirements change.</p>
            </div>
            <div className="divide-y divide-white/[0.07]">
              {sections.map((section) => (
                <section key={section.title} className="py-7 first:pt-0 last:pb-0">
                  <h2 className="text-xl font-bold tracking-[-0.025em] text-white">{section.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{section.body}</p>
                </section>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </Container>
    </div>
  );
}
