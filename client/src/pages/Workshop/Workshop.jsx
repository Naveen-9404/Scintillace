import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  IndianRupee,
} from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  "Learn through expert-led technical sessions",
  "Gain practical knowledge through hands-on activities",
  "Explore emerging technologies and real-world applications",
];

export default function Workshop() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative overflow-hidden pt-36 pb-24 md:pt-40">

        {/* Background */}
        <div className="absolute inset-0">

          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />

          <div className="absolute bottom-0 right-1/4 h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-[160px]" />

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
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            Back to Events
          </Link>

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
            className="mx-auto mt-14 max-w-4xl text-center"
          >

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10">
              <Cpu
                size={38}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Primary Event
            </p>

            <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                Workshop
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
              Learn from experts, explore emerging technologies and
              gain practical knowledge through engaging technical
              workshops.
            </p>

          </motion.div>

        </div>
      </section>

      {/* =====================================================
          EVENT INFORMATION
          ===================================================== */}

      <section className="relative pb-32">

        <div className="mx-auto max-w-6xl px-6">

          <div className="grid gap-8 lg:grid-cols-3">

            {/* Main Information */}
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
              className="lg:col-span-2"
            >

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-10">

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  About the Event
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  Learn. Build. Explore.
                </h2>

                <p className="mt-6 leading-8 text-slate-400">
                  The Workshop provides participants with an opportunity
                  to learn practical concepts, interact with experts and
                  gain exposure to technologies beyond the classroom.
                </p>

                <div className="mt-10">

                  <h3 className="text-xl font-semibold">
                    Workshop Highlights
                  </h3>

                  <div className="mt-6 space-y-4">

                    {highlights.map(
                      (highlight) => (
                        <div
                          key={highlight}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2
                            size={20}
                            className="mt-1 shrink-0 text-cyan-400"
                          />

                          <p className="text-slate-300">
                            {highlight}
                          </p>
                        </div>
                      ),
                    )}

                  </div>

                </div>

                {/* Workshop Details */}
                <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900/60 p-6">

                  <h3 className="text-xl font-semibold">
                    Workshop Details
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    Workshop topics, speakers, session details and
                    participation guidelines will be announced by the
                    organizing team.
                  </p>

                </div>

              </div>

            </motion.div>

            {/* Registration Card */}
            <motion.aside
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
                delay: 0.1,
              }}
              className="lg:sticky lg:top-24 lg:self-start"
            >

              <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Registration
                </p>

                <h2 className="mt-4 text-2xl font-bold">
                  Participate in Workshop
                </h2>

                {/* Temporary Fee */}
                <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5">

                  <p className="text-sm text-slate-400">
                    Registration Fee
                  </p>

                  <div className="mt-2 flex items-center gap-1">

                    <IndianRupee
                      size={24}
                      className="text-cyan-400"
                    />

                    <span className="text-3xl font-black text-white">
                      500
                    </span>

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Temporary fee subject to final confirmation.
                  </p>

                </div>

                {/* Register */}
                <Link
                  to="/events/6a8937a5bebeb93493556c6c/register"
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition-all hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,.35)]"
                >
                  Register Now

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                  Registration details and participation requirements
                  will be updated once finalized.
                </p>

              </div>

            </motion.aside>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER NAVIGATION
          ===================================================== */}

      <section className="border-t border-white/10 py-10">

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 sm:flex-row">

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            All Events
          </Link>

          <Link
            to="/events/presentations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-300"
          >
            Explore Presentations
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>

    </main>
  );
}