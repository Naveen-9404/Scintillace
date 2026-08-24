import { motion } from "framer-motion";

import {
  CalendarDays,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Container } from "../../common";

const stats = [
  {
    icon: CalendarDays,
    title: "Dates",
    value: "29 Sep – 1 Oct 2026",
  },
  {
    icon: MapPin,
    title: "Venue",
    value: "JNTUA College of Engineering, Pulivendula",
  },
  {
    icon: Sparkles,
    title: "Experience",
    value: "Technology & Culture",
  },
];

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">

      {/* =====================================================
          Background
          ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 top-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[170px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-24 bottom-0 h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-[170px]"
        />

      </div>

      <Container>

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
        >

          {/* =================================================
              Heading
              ================================================= */}

          <div className="text-center">

            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-cyan-300">
              <Sparkles size={15} />
              Join Scintillace
            </span>

            <h2 className="mt-8 text-4xl font-black leading-tight text-white md:text-6xl">

              Ready to{" "}

              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                Build.
              </span>{" "}

              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                Learn.
              </span>{" "}

              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                Celebrate.
              </span>

            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Be part of Scintillace — a celebration of
              technology, creativity, learning and culture
              at JNTUA College of Engineering, Pulivendula.
            </p>

          </div>

          {/* =================================================
              Information Cards
              ================================================= */}

          <div className="mt-14 grid gap-6 md:grid-cols-3">

            {stats.map(
              ({
                icon: Icon,
                title,
                value,
              }) => (
                <motion.div
                  key={title}
                  whileHover={{
                    y: -6,
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:shadow-[0_0_25px_rgba(34,211,238,.18)]"
                >

                  <Icon
                    className="mb-4 text-cyan-400"
                    size={30}
                  />

                  <p className="text-sm uppercase tracking-wide text-slate-400">
                    {title}
                  </p>

                  <h3 className="mt-2 text-lg font-bold leading-7 text-white">
                    {value}
                  </h3>

                </motion.div>
              ),
            )}

          </div>

          {/* =================================================
              Buttons
              ================================================= */}

          <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">

            <Link
              to="/register"
              className="group inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-8 py-4 font-semibold text-slate-950 transition-all hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,.35)]"
            >
              Register Now

              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 px-8 py-4 font-semibold text-cyan-300 transition-all hover:-translate-y-1 hover:bg-cyan-400/10"
            >
              Explore Events
            </Link>

          </div>

        </motion.div>

      </Container>

    </section>
  );
}