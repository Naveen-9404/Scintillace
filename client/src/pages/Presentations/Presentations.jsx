import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Image,
  Presentation,
} from "lucide-react";
import { Link } from "react-router-dom";

const presentationEvents = [
  {
    id: "paper-presentation",
    title: "Paper Presentation",
    subtitle: "Research & Ideas",
    description:
      "Present your technical research, ideas, innovations and concepts before an audience and evaluation panel.",
    icon: FileText,
    color: "text-cyan-400",
    route: "/events/presentations/paper-presentation",
  },

  {
    id: "poster-presentation",
    title: "Poster Presentation",
    subtitle: "Visual Showcase",
    description:
      "Communicate your technical concepts and innovative ideas through an engaging and informative poster.",
    icon: Image,
    color: "text-violet-400",
    route: "/events/presentations/poster-presentation",
  },
];

export default function Presentations() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          Hero
          ===================================================== */}

      <section className="relative overflow-hidden pt-36 pb-28 md:pt-40">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />

          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[160px]" />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(
                  to right,
                  rgba(255,255,255,.1) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  to bottom,
                  rgba(255,255,255,.1) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">

          {/* Breadcrumb */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mb-10"
          >
            <Link
              to="/events"
              className="text-sm text-slate-400 transition-colors hover:text-cyan-300"
            >
              Events
            </Link>

            <span className="mx-2 text-slate-600">
              /
            </span>

            <span className="text-sm text-cyan-300">
              Presentations
            </span>
          </motion.div>

          {/* Hero Content */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10">
              <Presentation
                size={38}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Primary Event
            </p>

            <h1 className="mt-4 text-5xl font-black md:text-7xl">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                Presentations
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
              Share your ideas, research and innovations through
              technical presentation events designed to encourage
              creativity, communication and knowledge exchange.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          Presentation Events
          ===================================================== */}

      <section className="relative pb-32">
        <div className="mx-auto max-w-7xl px-6">

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
              duration: 0.6,
            }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Choose an Event
            </p>

            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              Explore Presentation Events
            </h2>

            <p className="mt-4 text-slate-400">
              Select a presentation category to view its details,
              guidelines and registration information.
            </p>
          </motion.div>

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
                  staggerChildren: 0.12,
                },
              },
            }}
            className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2"
          >
            {presentationEvents.map(
              (event) => {
                const Icon = event.icon;

                return (
                  <motion.div
                    key={event.id}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 40,
                      },
                      show: {
                        opacity: 1,
                        y: 0,
                      },
                    }}
                  >
                    <Link
                      to={event.route}
                      className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(34,211,238,.12)]"
                    >
                      {/* Glow */}
                      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="relative">

                        {/* Icon */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
                          <Icon
                            size={30}
                            className={event.color}
                          />
                        </div>

                        {/* Content */}
                        <p
                          className={`mt-8 text-sm font-semibold uppercase tracking-[0.2em] ${event.color}`}
                        >
                          {event.subtitle}
                        </p>

                        <h3 className="mt-3 text-3xl font-bold text-white">
                          {event.title}
                        </h3>

                        <p className="mt-5 min-h-[96px] leading-7 text-slate-400">
                          {event.description}
                        </p>

                        {/* Temporary Fee */}
                        <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                          Registration Fee:{" "}
                          <span className="ml-1 font-semibold text-white">
                            ₹500
                          </span>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 flex items-center gap-2 font-semibold text-white">
                          <span className="transition-colors group-hover:text-cyan-300">
                            View Details
                          </span>

                          <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-2"
                          />
                        </div>
                      </div>

                      {/* Bottom Accent */}
                      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-500 group-hover:w-full" />
                    </Link>
                  </motion.div>
                );
              },
            )}
          </motion.div>

        </div>
      </section>
    </main>
  );
}