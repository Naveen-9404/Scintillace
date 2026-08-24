import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Image,
  IndianRupee,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

const presentationEvents = {
  "paper-presentation": {
    title: "Paper Presentation",
    subtitle: "Research & Ideas",
    description:
      "Present your technical research, ideas, innovations and concepts through an engaging paper presentation.",
    icon: FileText,
    color: "text-cyan-400",
  },

  "poster-presentation": {
    title: "Poster Presentation",
    subtitle: "Visual Showcase",
    description:
      "Present your technical concepts, research and innovative ideas through an engaging and informative poster.",
    icon: Image,
    color: "text-violet-400",
  },
};

const highlights = [
  "Technical knowledge and innovative ideas",
  "Opportunity to present your work",
  "Platform to communicate ideas effectively",
];

export default function PresentationDetails() {
  const {
    presentationId,
  } = useParams();

  const event =
    presentationEvents[
      presentationId
    ];

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">

          <h1 className="text-4xl font-bold">
            Presentation Not Found
          </h1>

          <p className="mt-4 text-slate-400">
            The requested presentation event
            could not be found.
          </p>

          <Link
            to="/events/presentations"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft size={18} />
            Back to Presentations
          </Link>

        </div>
      </main>
    );
  }

  const Icon = event.icon;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative overflow-hidden py-24">

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

          <Link
            to="/events/presentations"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            Back to Presentations
          </Link>

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

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <Icon
                size={38}
                className={event.color}
              />
            </div>

            <p
              className={`mt-8 text-sm font-semibold uppercase tracking-[0.3em] ${event.color}`}
            >
              {event.subtitle}
            </p>

            <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">
              {event.title}
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
              {event.description}
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
                  Showcase Your Ideas
                </h2>

                <p className="mt-6 leading-8 text-slate-400">
                  {event.description}
                </p>

                <div className="mt-10">

                  <h3 className="text-xl font-semibold">
                    Event Highlights
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

                <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900/60 p-6">

                  <h3 className="text-xl font-semibold">
                    Guidelines
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    Detailed guidelines and rules
                    for this event will be announced
                    by the organizing team.
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
                  Participate in{" "}
                  {event.title}
                </h2>

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
                    Temporary fee subject to
                    final confirmation.
                  </p>

                </div>

                <Link
                  to="/register"
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition-all hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,.35)]"
                >
                  Register Now

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                  Registration details and
                  participation requirements will be
                  updated once finalized.
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
            to="/events/presentations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            All Presentations
          </Link>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-300"
          >
            Explore All Events
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>

    </main>
  );
}