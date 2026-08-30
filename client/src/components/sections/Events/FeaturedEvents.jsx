import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  CircuitBoard,
  FileText,
  Presentation,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * ============================================================
 * Featured Scintillace Events
 * ============================================================
 *
 * Final public event order:
 *
 * 1. Embedded & IoT with AI Workshop
 * 2. Paper Presentation
 * 3. Poster Presentation
 * 4. Hardware Expo
 * 5. Technical Quiz
 * 6. Spot Events
 *
 * The Workshop is intentionally highlighted as the primary
 * featured event.
 * ============================================================
 */

const featuredEvents = [
  {
    title: "Embedded & IoT with AI Workshop",
    subtitle: "Featured Workshop",
    description:
      "A hands-on learning experience combining Embedded Systems, IoT and Artificial Intelligence for students interested in emerging technologies.",
    date: "30 September",
    fee: "₹600 / person",
    participation: "Individual",
    icon: Wrench,
    color: "text-cyan-300",
    featured: true,
  },

  {
    title: "Paper Presentation",
    subtitle: "Technical Presentation",
    description:
      "Present your research, technical ideas, projects and innovations through an engaging paper presentation.",
    date: "29 September",
    fee: "₹200 / team",
    participation: "Team",
    icon: FileText,
    color: "text-violet-300",
    featured: false,
  },

  {
    title: "Poster Presentation",
    subtitle: "Technical Presentation",
    description:
      "Showcase your ideas and technical work through visually engaging posters and communicate your concepts effectively.",
    date: "29 September",
    fee: "₹200 / team",
    participation: "Team",
    icon: Presentation,
    color: "text-fuchsia-300",
    featured: false,
  },

  {
    title: "Hardware Expo",
    subtitle: "Innovation Showcase",
    description:
      "Showcase innovative hardware projects, engineering solutions, prototypes and creative ideas in electronics and emerging technologies.",
    date: "29 September",
    fee: "₹300 / team",
    participation: "Team",
    icon: CircuitBoard,
    color: "text-emerald-300",
    featured: false,
  },

  {
    title: "Technical Quiz",
    subtitle: "Individual Event",
    description:
      "Test your technical knowledge, logical thinking and problem-solving abilities in an engaging individual quiz.",
    date: null,
    fee: "FREE",
    participation: "Individual",
    icon: BrainCircuit,
    color: "text-amber-300",
    featured: false,
  },

  {
    title: "Spot Events",
    subtitle: "On-the-Spot Events",
    description:
      "Take part in exciting individual spot events that challenge your creativity, skills and presence of mind.",
    date: null,
    fee: "FREE",
    participation: "Individual",
    icon: Sparkles,
    color: "text-pink-300",
    featured: false,
  },
];

/**
 * ============================================================
 * Featured Events Component
 * ============================================================
 */

export default function FeaturedEvents() {
  return (
    <section
      id="events"
      className="relative overflow-hidden bg-slate-950 py-32"
    >
      {/* =====================================================
          Background
          ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-0
            top-20
            h-96
            w-96
            rounded-full
            bg-cyan-500/10
            blur-[150px]
          "
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-10
            right-0
            h-96
            w-96
            rounded-full
            bg-violet-500/10
            blur-[150px]
          "
        />

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(
                to right,
                rgba(255,255,255,.08) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(255,255,255,.08) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* =====================================================
          Content
          ===================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* ===================================================
            Heading
            =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 60,
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
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              inline-flex
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/10
              px-5
              py-2
              text-sm
              font-semibold
              uppercase
              tracking-[0.25em]
              text-cyan-300
              backdrop-blur-xl
            "
          >
            Scintillace Events
          </motion.span>

          <h2 className="mt-8 text-5xl font-black leading-tight md:text-6xl">
            <span className="text-white">
              Experience
            </span>

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,.3)]">
              Innovation &amp; Excitement
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
            Discover technical presentations,
            innovation showcases, hands-on
            learning and exciting individual
            events at Scintillace.
          </p>

          <div className="mx-auto mt-10 h-px w-40 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        </motion.div>

        {/* ===================================================
            Event Cards
            =================================================== */}

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
                staggerChildren: 0.1,
              },
            },
          }}
          className="mt-20 grid gap-7 md:grid-cols-2 lg:grid-cols-3"
        >
          {featuredEvents.map(
            (event) => {
              const Icon =
                event.icon;

              const encodedTitle =
                encodeURIComponent(
                  event.title,
                );

              /*
               * We don't use the title as
               * the actual ID. This route
               * is only a safe fallback for
               * the current public cards.
               *
               * The main Events page should
               * be used for database-backed
               * event IDs.
               */

              return (
                <motion.div
                  key={event.title}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 40,
                      scale: 0.96,
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    },
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className={
                    event.featured
                      ? "md:col-span-2 lg:col-span-3"
                      : ""
                  }
                >
                  <Link
                    to={`/events?search=${encodedTitle}`}
                    className={`
                      group
                      relative
                      block
                      h-full
                      overflow-hidden
                      rounded-3xl
                      border
                      p-8
                      backdrop-blur-xl
                      transition-all
                      duration-500
                      hover:-translate-y-2
                    ${
                      event.featured
                        ? `
                          border-cyan-400/30
                          bg-gradient-to-br
                          from-cyan-500/[0.12]
                          via-violet-500/[0.10]
                          to-white/[0.04]
                          shadow-[0_0_60px_rgba(34,211,238,.12)]
                        `
                        : `
                          border-white/10
                          bg-white/5
                          hover:border-cyan-400/30
                          hover:bg-white/[0.07]
                          hover:shadow-[0_0_40px_rgba(34,211,238,.12)]
                        `
                    }
                    `}
                  >
                    {/* =================================================
                        Featured Badge
                        ================================================= */}

                    {event.featured && (
                      <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                        <Award
                          size={14}
                        />

                        Featured
                      </div>
                    )}

                    {/* Glow */}

                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative">
                      {/* Icon */}

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
                        <Icon
                          size={30}
                          className={
                            event.color
                          }
                        />
                      </div>

                      {/* Subtitle */}

                      <p
                        className={`mt-8 text-sm font-semibold uppercase tracking-[0.2em] ${event.color}`}
                      >
                        {
                          event.subtitle
                        }
                      </p>

                      {/* Title */}

                      <h3
                        className={`
                          mt-3
                          font-bold
                          text-white
                          ${
                            event.featured
                              ? "text-4xl md:text-5xl"
                              : "text-3xl"
                          }
                        `}
                      >
                        {
                          event.title
                        }
                      </h3>

                      {/* Description */}

                      <p
                        className={`
                          mt-5
                          leading-7
                          text-slate-400
                          ${
                            event.featured
                              ? "max-w-3xl"
                              : "min-h-[140px]"
                          }
                        `}
                      >
                        {
                          event.description
                        }
                      </p>

                      {/* Event Information */}

                      <div className="mt-7 flex flex-wrap gap-3">
                        {event.date && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                            📅{" "}
                            {
                              event.date
                            }
                          </span>
                        )}

                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                          👥{" "}
                          {
                            event.participation
                          }
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-300">
                          {event.fee}
                        </span>
                      </div>

                      {/* CTA */}

                      <div className="mt-8 flex items-center gap-2 font-semibold text-white">
                        <span className="transition-colors group-hover:text-cyan-300">
                          Explore Event
                        </span>

                        <ArrowRight
                          size={18}
                          className="transition-transform duration-300 group-hover:translate-x-2"
                        />
                      </div>
                    </div>

                    {/* Bottom Accent */}

                    <div
                      className={`
                        absolute
                        bottom-0
                        left-0
                        h-[2px]
                        bg-gradient-to-r
                        from-cyan-400
                        to-violet-400
                        transition-all
                        duration-500
                        ${
                          event.featured
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                        }
                      `}
                    />
                  </Link>
                </motion.div>
              );
            },
          )}
        </motion.div>

        {/* ===================================================
            All Events
            =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.3,
          }}
          className="mt-20 flex justify-center"
        >
          <Link
            to="/events"
            className="
              group
              inline-flex
              items-center
              gap-3
              rounded-xl
              border
              border-cyan-400/30
              bg-cyan-400/5
              px-8
              py-4
              font-semibold
              text-cyan-300
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-cyan-400/10
              hover:shadow-[0_0_30px_rgba(34,211,238,.2)]
            "
          >
            <span>
              Explore All Events
            </span>

            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}