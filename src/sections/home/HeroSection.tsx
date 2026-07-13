import { motion } from "framer-motion";
import { FiArrowDown, FiArrowRight } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { fadeUp, heroEntrance } from "@/animations/presets";
import { Container } from "@/components/layout/Container";
import { PrimaryButton, StatusBadge } from "@/components/ui";
import { HeroImagePlaceholder } from "@/components/visuals/HeroImagePlaceholder";

export function HeroSection() {
  const scrollToParticipation = () => {
    document.getElementById("participation")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden pb-14 pt-12 sm:pb-20 sm:pt-20" aria-labelledby="hero-title">
      <Container>
        <motion.div variants={heroEntrance} initial="hidden" animate="visible" className="text-center">
          <motion.div variants={fadeUp}>
            <StatusBadge variant="orange" className="mb-6">
              <HiOutlineSparkles className="size-3.5" aria-hidden="true" />
              CITIWALK Global Rewards
            </StatusBadge>
          </motion.div>
          <motion.h1 id="hero-title" variants={fadeUp} className="mx-auto max-w-5xl text-display gradient-text">
            Your moment could be next.
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
            Ten remarkable rewards. One beautifully simple global experience.
          </motion.p>
        </motion.div>

        <div className="mt-10 sm:mt-14">
          <HeroImagePlaceholder />
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-7 flex flex-col items-center gap-4 sm:mt-9"
        >
          <PrimaryButton
            size="lg"
            trailingIcon={<FiArrowRight className="size-4" aria-hidden="true" />}
            onClick={scrollToParticipation}
            aria-label="Enter giveaway — scroll to participation"
          >
            Enter Giveaway
          </PrimaryButton>
          <a
            href="#countdown"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted transition hover:text-white"
          >
            View live countdown
            <FiArrowDown className="size-4 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
          </a>
        </motion.div>
      </Container>
    </section>
  );
}
