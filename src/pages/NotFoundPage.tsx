import { FiArrowLeft, FiCompass } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Reveal } from "@/animations/Reveal";
import { Container } from "@/components/layout/Container";
import { Seo } from "@/components/seo/Seo";
import { GlassCard, buttonClassNames } from "@/components/ui";
import { routePaths } from "@/routes/paths";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center py-16">
      <Seo title="Page Not Found" noIndex />
      <Container>
        <Reveal preset="scale">
          <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-12" accent="purple">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
              <FiCompass className="size-6" aria-hidden="true" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-300">404 · Off route</p>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">This path hasn&apos;t been mapped.</h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted sm:text-base">The page may have moved, or the address may be incomplete. Return to the rewards experience.</p>
            <Link to={routePaths.home} className={buttonClassNames({ variant: "primary", size: "lg", className: "mt-8" })}>
              <FiArrowLeft className="size-4" aria-hidden="true" />
              Back home
            </Link>
          </GlassCard>
        </Reveal>
      </Container>
    </div>
  );
}
