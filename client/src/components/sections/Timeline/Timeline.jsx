import { motion } from "framer-motion";

import {
  CalendarDays,
} from "lucide-react";

import {
  Container,
  SectionHeading,
} from "../../common";

import TimelineCard from "./TimelineCard";
import { timeline } from "@/api/timeline";

export default function Timeline() {
  const hasTimeline =
    Array.isArray(timeline) &&
    timeline.length > 0;

  return (
    <section
      id="timeline"
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
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-0 top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[160px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[160px]"
        />

        {/* Grid */}

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

      <Container>

        {/* ===================================================
            Heading
            =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
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
        >
          <SectionHeading
  badge="Event Schedule"
  title="Three Days of Scintillace"
  subtitle="Experience three days of innovation, learning, creativity and celebration from September 29 to October 1, 2026."
/>
        </motion.div>

        {/* ===================================================
            Schedule
            =================================================== */}

        {hasTimeline ? (

          <div className="relative mt-20">

            {/* Timeline Line */}

            <motion.div
              initial={{
                height: 0,
              }}
              whileInView={{
                height: "100%",
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.4,
              }}
              className="
                absolute
                left-6
                top-0
                w-[3px]
                rounded-full
                bg-gradient-to-b
                from-cyan-400
                via-sky-500
                via-violet-500
                to-transparent
                shadow-[0_0_20px_rgba(34,211,238,.5)]
                md:left-1/2
                md:-translate-x-1/2
              "
            />

            <div className="space-y-24">

              {timeline.map(
                (day, index) => (
                  <motion.div
                    key={
                      day.day ||
                      day.date ||
                      index
                    }
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
                      delay: index * 0.15,
                    }}
                    className="relative"
                  >

                    {/* Day Badge */}

                    <div className="mb-12 flex justify-center">

                      <motion.div
                        whileHover={{
                          scale: 1.05,
                        }}
                        className="
                          relative
                          overflow-hidden
                          rounded-full
                          border
                          border-cyan-400/20
                          bg-slate-900/90
                          px-8
                          py-4
                          backdrop-blur-xl
                          shadow-[0_0_30px_rgba(34,211,238,.12)]
                        "
                      >

                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5" />

                        <h3 className="relative text-center text-xl font-bold text-white">
                          {day.day}
                        </h3>

                        <p className="relative mt-1 text-center text-sm font-medium text-cyan-300">
                          {day.date}
                        </p>

                      </motion.div>

                    </div>

                    {/* Cards */}

                    <div className="grid gap-8 lg:grid-cols-2">

                      {day.events?.map(
                        (event) => (
                          <TimelineCard
                            key={event.title}
                            {...event}
                            Icon={event.icon}
                          />
                        ),
                      )}

                    </div>

                  </motion.div>
                ),
              )}

            </div>

          </div>

        ) : (

          /* =================================================
             Schedule Coming Soon
             ================================================= */

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
              duration: 0.7,
            }}
            className="mx-auto mt-20 max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl md:p-14"
          >

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
              <CalendarDays
                size={30}
                className="text-cyan-400"
              />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-white md:text-3xl">
              Detailed Schedule Coming Soon
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Scintillace will take place across three
              days — September 29, September 30 and
              October 1, 2026. Program details and
              timings will be announced soon.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">

              {[
                "29 September 2026",
                "30 September 2026",
                "1 October 2026",
              ].map((date) => (
                <span
                  key={date}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-300"
                >
                  {date}
                </span>
              ))}

            </div>

          </motion.div>

        )}

      </Container>
    </section>
  );
}