import { FaInstagram } from "react-icons/fa6";
import { FiArrowUpRight, FiGlobe } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Container } from "@/components/layout/Container";
import { legalNavigation, primaryNavigation } from "@/constants/navigation";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-canvas/70 backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/30 to-transparent" aria-hidden="true" />
      <Container className="py-12 sm:py-16">
        <div className="surface-glass-subtle rounded-panel p-6 sm:p-9 lg:p-11">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr]">
            <div>
              <BrandLockup />
              <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
                CITIWALK Global Rewards brings premium rewards, a refined experience, and global anticipation together in one place.
              </p>
              <div className="mt-6 flex items-center gap-3" aria-label="CITIWALK social links">
                <a
                  href="https://www.instagram.com/citiwalk.official.giveaway/"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-muted transition hover:-translate-y-0.5 hover:border-fuchsia-300/30 hover:bg-fuchsia-400/10 hover:text-fuchsia-200"
                  aria-label="CITIWALK Global Rewards on Instagram"
                >
                  <FaInstagram className="size-4" aria-hidden="true" />
                </a>
                <Link
                  to="/"
                  className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-muted transition hover:-translate-y-0.5 hover:border-brand-300/30 hover:bg-brand-400/10 hover:text-brand-200"
                  aria-label="CITIWALK Global Rewards website"
                >
                  <FiGlobe className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">Explore</p>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1">
                {primaryNavigation.map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-muted transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">CITIWALK</p>
              <ul className="mt-5 space-y-3">
                {legalNavigation.map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-white">
                      {item.label}
                      <FiArrowUpRight className="size-3" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="https://www.instagram.com/citiwalk.official.giveaway/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-white"
                  >
                    Instagram
                    <FiArrowUpRight className="size-3" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} CITIWALK. All rights reserved.</p>
            <p>CITIWALK Global Rewards</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
