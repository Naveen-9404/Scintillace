import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export default function CountdownCard({ value, label }) {
  const displayValue = useMemo(
    () => String(value).padStart(2, "0"),
    [value]
  );

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 20,
      }}
      aria-label={`${displayValue} ${label} remaining`}
      className="group relative overflow-hidden rounded-3xl"
    >
      {/* Gradient Border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-transparent to-accent/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Card */}
      <div
        className="
          relative
          flex
          aspect-square
          w-full
          items-center
          justify-center
          rounded-3xl
          border
          border-border
          bg-card/60
          p-6
          backdrop-blur-2xl
          shadow-card
          transition-all
          duration-300
          group-hover:border-primary/30
          group-hover:shadow-glow
        "
      >
        {/* Decorative Glow */}
        <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* Decorative Dot */}
        <span className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-primary animate-glow" />

        {/* Content */}
        <div className="relative flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={displayValue}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                duration: 0.25,
              }}
              className="font-display text-6xl font-black leading-none tracking-tight text-primary md:text-7xl"
            >
              {displayValue}
            </motion.h2>
          </AnimatePresence>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {label}
          </p>
        </div>

        {/* Bottom Shine */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </motion.div>
  );
}