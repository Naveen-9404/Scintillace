import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock3,
  Ban,
  Users,
  BadgeCheck,
  Trash2,
  Volume2,
  AlertTriangle,
} from "lucide-react";

const rules = [
  {
    icon: BadgeCheck,
    title: "Valid ID Required",
    description:
      "Participants may be required to present a valid College ID or Government ID during accommodation check-in.",
  },
  {
    icon: Clock3,
    title: "Check-In & Check-Out",
    description:
      "Check-in and check-out timings will follow the final accommodation schedule communicated by the organizers.",
  },
  {
    icon: Ban,
    title: "Prohibited Substances",
    description:
      "Smoking, alcohol, drugs, and other prohibited substances will not be permitted in the accommodation premises.",
  },
  {
    icon: Users,
    title: "Visitor Policy",
    description:
      "Visitors may be subject to accommodation access restrictions and organizer approval.",
  },
  {
    icon: Trash2,
    title: "Maintain Cleanliness",
    description:
      "Participants are expected to keep their allocated accommodation clean and dispose of waste responsibly.",
  },
  {
    icon: Volume2,
    title: "Maintain Silence",
    description:
      "Participants should maintain a peaceful environment and avoid disturbing other guests, especially during designated quiet hours.",
  },
  {
    icon: ShieldCheck,
    title: "Property Safety",
    description:
      "Participants are responsible for taking care of the accommodation and any property provided to them.",
  },
  {
    icon: AlertTriangle,
    title: "Management Rights",
    description:
      "The organizing committee reserves the right to take appropriate action in case of accommodation policy violations.",
  },
];

const AccommodationRules = () => {
  return (
    <section
      id="accommodation-rules"
      className="relative overflow-hidden bg-slate-950 py-28 text-white"
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-10%] top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[140px]" />

        <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-violet-500/5 blur-[140px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">

        {/* =================================================
            HEADING
            ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >

          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Important Information
          </span>

          <h2 className="mt-7 text-4xl font-black leading-tight sm:text-5xl">

            Accommodation

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Rules & Guidelines
            </span>

          </h2>

          <p className="mx-auto mt-6 text-lg leading-8 text-slate-400">
            Please review the accommodation guidelines before
            completing your booking. These guidelines help
            maintain a safe, comfortable, and respectful
            environment for all participants.
          </p>

        </motion.div>

        {/* =================================================
            RULES GRID
            ================================================= */}

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
          }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid gap-6 md:grid-cols-2"
        >

          {rules.map((rule) => {
            const Icon = rule.icon;

            return (
              <motion.div
                key={rule.title}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 30,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                className="group flex gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.06]"
              >

                {/* Icon */}

                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/10 transition-all duration-300 group-hover:bg-cyan-400/15 group-hover:ring-cyan-400/30">

                  <Icon
                    size={25}
                    className="text-cyan-400"
                  />

                </div>

                {/* Content */}

                <div>

                  <h3 className="text-lg font-bold text-white">
                    {rule.title}
                  </h3>

                  <p className="mt-2 leading-7 text-slate-400">
                    {rule.description}
                  </p>

                </div>

              </motion.div>
            );
          })}

        </motion.div>

        {/* =================================================
            FINAL NOTICE
            ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
          className="mt-12 rounded-2xl border border-amber-400/10 bg-amber-400/5 px-6 py-5 text-center"
        >

          <p className="text-sm leading-6 text-slate-500">
            <span className="font-semibold text-amber-300">
              Please Note:
            </span>{" "}
            Final accommodation rules, timings, and
            operational instructions will be communicated
            by the organizing committee before the festival.
          </p>

        </motion.div>

      </div>
    </section>
  );
};

export default AccommodationRules;