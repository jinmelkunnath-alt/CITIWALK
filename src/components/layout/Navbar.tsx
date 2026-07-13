import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Container } from "@/components/layout/Container";
import { buttonClassNames } from "@/components/ui";
import { primaryNavigation } from "@/constants/navigation";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-canvas/70 backdrop-blur-2xl">
      <Container className="flex h-[var(--nav-height)] items-center justify-between gap-5">
        <BrandLockup />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-white/[0.045] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/#participation"
            className={buttonClassNames({ variant: "outline", size: "sm" })}
          >
            <span>Enter Giveaway</span>
            <FiArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-white lg:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <FiX className="size-5" /> : <FiMenu className="size-5" />}
        </button>
      </Container>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.06] bg-canvas/95 lg:hidden"
          >
            <Container className="space-y-1 py-4">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-muted transition hover:bg-white/[0.05] hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/#participation"
                className={buttonClassNames({ variant: "primary", className: "mt-3 w-full" })}
                onClick={() => setMenuOpen(false)}
              >
                Enter Giveaway
              </Link>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
