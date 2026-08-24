import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import CountdownCard from "./CountdownCard";
import useCountdown from "./useCountdown";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },

  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: "easeOut",
    },
  }),
};

const highlights = [
  {
    icon: CalendarDays,
    title: "29 September – 1 October 2026",
    subtitle: "Three Days of Scintillace",
  },

  {
    icon: MapPin,
    title: "JNTUA College of Engineering",
    subtitle: "Pulivendula",
  },

  {
    icon: Sparkles,
    title: "Technology & Culture",
    subtitle: "Learn, participate and celebrate",
  },
];

export default function Countdown() {
  const {
    days,
    hours,
    minutes,
    seconds,
  } = useCountdown(
    "2026-09-29T09:30:00",
  );

  return (
    <section
      id="countdown"
      className="relative overflow-hidden py-32"
    >
      {/* =====================================================
          Background Glow
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="absolute right-0 top-32 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-container px-6">

        {/* ===================================================
            Heading
            =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.1}
          variants={fadeUp}
          className="mx-auto mt-8 max-w-content text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            September 29 – October 1, 2026
          </p>

          <h2 className="mt-5 font-display text-5xl font-bold leading-tight md:text-6xl">
            Countdown to{" "}
            <span className="text-primary">
              Scintillace
            </span>
          </h2>

          <p className="mt-8 text-lg leading-8 text-muted-foreground md:text-xl">
            Three days of technology, creativity,
            learning and celebration at
            <span className="font-semibold text-primary">
              {" "}
              JNTUA College of Engineering,
              Pulivendula
            </span>
            .
          </p>
        </motion.div>

        {/* ===================================================
            Countdown
            =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.2}
          variants={fadeUp}
          className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4"
        >
          <CountdownCard
            value={days}
            label="Days"
          />

          <CountdownCard
            value={hours}
            label="Hours"
          />

          <CountdownCard
            value={minutes}
            label="Minutes"
          />

          <CountdownCard
            value={seconds}
            label="Seconds"
          />
        </motion.div>

        {/* ===================================================
            Festival Highlights
            =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.3}
          variants={fadeUp}
          className="mt-20 grid gap-6 md:grid-cols-3"
        >
          {highlights.map(
            (item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <Icon
                      size={24}
                      className="text-primary"
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              );
            },
          )}
        </motion.div>

        {/* ===================================================
            Divider
            =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.4}
          variants={fadeUp}
          className="mx-auto mt-20 h-px max-w-xl bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        {/* ===================================================
            CTA
            =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0.5}
          variants={fadeUp}
          className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
          >
            Register Now

            <ArrowRight
              size={18}
            />
          </Link>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-8 py-4 font-semibold backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card"
          >
            Explore Events
          </Link>
        </motion.div>

      </div>
    </section>
  );
}