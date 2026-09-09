import {
  ArrowRight,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import {
  Link,
} from "react-router-dom";

import HeroStats from "./HeroStats";

import {
  fadeUp,
  stagger,
} from "./heroAnimations";

export default function HeroContent() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-2xl text-center lg:text-left"
    >
      {/* =====================================================
          Festival Badge
          ===================================================== */}

      <motion.div
        variants={fadeUp}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-300 backdrop-blur-xl">
          <CalendarDays size={16} />

          Annual Tech & Cultural Festival
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-cyan-300 lg:justify-start">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

          Scintillace
        </div>
      </motion.div>

      {/* =====================================================
          Heading
          ===================================================== */}

      <motion.h1
        variants={fadeUp}
        className="mt-8 leading-tight tracking-tight"
      >
        <span className="block text-lg font-semibold uppercase tracking-[0.35em] text-cyan-300 md:text-xl">
          Welcome to
        </span>

        <div className="mt-3 inline-flex flex-col">
          <span
            className="
              bg-gradient-to-r
              from-cyan-300
              via-sky-300
              to-violet-400
              bg-clip-text
              text-5xl
              font-black
              text-transparent
              drop-shadow-[0_0_40px_rgba(34,211,238,.35)]
              md:text-6xl
              xl:text-7xl
            "
          >
            SCINTILLACE
          </span>

          <div className="mt-3 flex w-full items-center justify-center gap-3 px-1 sm:gap-4 sm:px-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <span className="shrink-0 text-lg italic tracking-wide text-cyan-200/90 font-light md:text-xl lg:text-2xl">
              The Rise of Innovation
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-violet-400"></div>
          </div>
        </div>
      </motion.h1>

      {/* =====================================================
          Organizer
          ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="mt-8 flex flex-col gap-2"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
          ORGANIZED BY
        </p>

        <div className="mt-1 flex flex-col items-center lg:items-start text-center lg:text-left text-base font-medium text-white md:text-lg">
          <span className="block">
            Department of Electronics and Communication Engineering
          </span>
          <span className="my-1 block w-full text-center text-cyan-400 font-bold">
            &
          </span>
          <span className="block">
            Electronics and Communication House for Inquisitive Programs (E-CHIP)
          </span>
        </div>

        <div className="mt-3 flex justify-center lg:justify-start">
          <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold tracking-wide text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.15)] md:text-base">
            JNTUA College of Engineering Pulivendula (Autonomous)
          </div>
        </div>
      </motion.div>

      {/* =====================================================
          Description
          ===================================================== */}

      <motion.p
        variants={fadeUp}
        className="mt-8 max-w-xl text-lg leading-8 text-slate-300"
      >
        Experience a celebration of innovation,
        technology, creativity and culture.
        Discover exciting programs, participate
        in engaging experiences, learn through
        workshops and presentations, and create
        unforgettable memories at
        <span className="font-semibold text-cyan-300">
          {" "}
          Scintillace.
        </span>
      </motion.p>

      {/* =====================================================
          CTA Buttons
          ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="mt-10 flex flex-col gap-4 sm:flex-row"
      >
        {/* Register Button */}

        <Link
          to="/events"
          className="
            group
            relative
            inline-flex
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-xl
            bg-cyan-400
            px-8
            py-4
            font-semibold
            text-slate-950
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-cyan-300
            hover:shadow-[0_0_35px_rgba(34,211,238,.45)]
          "
        >
          <span
            className="
              absolute
              inset-0
              -translate-x-full
              bg-gradient-to-r
              from-transparent
              via-white/40
              to-transparent
              transition-transform
              duration-700
              group-hover:translate-x-full
            "
          />

          <span className="relative z-10">
            Register Now
          </span>

          <ArrowRight
            size={18}
            className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>

        {/* Explore Events */}

        <Link
          to="/events"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-slate-900/40
            px-8
            py-4
            font-semibold
            text-white
            backdrop-blur-xl
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-cyan-400/40
            hover:bg-white/10
            hover:shadow-[0_0_25px_rgba(34,211,238,.18)]
          "
        >
          <Sparkles size={18} />

          Explore Events
        </Link>
      </motion.div>

      {/* =====================================================
          Divider
          ===================================================== */}

      <motion.div
        variants={fadeUp}
      >
        <div className="mb-8 mt-14 h-px w-full max-w-md bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </motion.div>

      {/* =====================================================
          Statistics
          ===================================================== */}

      <motion.div
        variants={fadeUp}
      >
        <HeroStats />
      </motion.div>
    </motion.div>
  );
}