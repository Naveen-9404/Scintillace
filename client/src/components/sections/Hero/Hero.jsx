import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroIllustration from "./HeroIllustration";

export default function Hero() {
  const scrollToNextSection = () => {
    document
      .getElementById("promo-video")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white"
    >
      {/* Background Effects */}
      <HeroBackground />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-20 px-6 pt-32 pb-24 lg:flex-row lg:justify-between">
        <HeroContent />

        <HeroIllustration />
      </div>

      {/* Scroll Indicator */}
      <motion.button
        type="button"
        onClick={scrollToNextSection}
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-slate-300 transition-colors duration-300 hover:text-cyan-300"
        aria-label="Scroll to promo video"
      >
        <span className="mb-2 text-xs font-medium uppercase tracking-[0.3em]">
          Scroll
        </span>

        <ChevronDown size={28} />
      </motion.button>
    </section>
  );
}