import { motion } from "framer-motion";
import {
  MapPin,
  Clock3,
  Building2,
  ShieldCheck,
  BedDouble,
  Users,
} from "lucide-react";

const overviewItems = [
  {
    icon: Building2,
    title: "Accommodation",
    value: "On-Campus Accommodation",
  },
  {
    icon: BedDouble,
    title: "Room Options",
    value: "Multiple Room Types",
  },
  {
    icon: Clock3,
    title: "Check-In",
    value: "As per the final schedule",
  },
  {
    icon: Clock3,
    title: "Check-Out",
    value: "As per the final schedule",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "JNTUA College Campus",
  },
  {
    icon: Users,
    title: "Eligibility",
    value: "Registered Participants",
  },
];

const AccommodationOverview = () => {
  return (
    <section
      id="accommodation-overview"
      className="relative overflow-hidden bg-slate-950 py-28 text-white"
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/5 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/5 blur-[140px]" />

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
            Accommodation Overview
          </span>

          <h2 className="mt-7 text-4xl font-black leading-tight sm:text-5xl">

            A Comfortable Stay During

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Scintillace
            </span>

          </h2>

          <p className="mx-auto mt-6 text-lg leading-8 text-slate-400">
            Explore the accommodation facilities available
            for registered participants and plan your stay
            during the festival.
          </p>

        </motion.div>

        {/* =================================================
            OVERVIEW CARDS
            ================================================= */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {overviewItems.map(
            (item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 35,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.07,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/20 hover:bg-white/[0.06] hover:shadow-[0_0_35px_rgba(34,211,238,.08)]"
                >

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/10 transition-all duration-300 group-hover:bg-cyan-400/15 group-hover:ring-cyan-400/30">

                    <Icon
                      size={27}
                      className="text-cyan-400"
                    />

                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {item.value}
                  </p>

                </motion.div>
              );
            }
          )}

        </div>

        {/* =================================================
            WHY STAY
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
            delay: 0.2,
          }}
          viewport={{
            once: true,
          }}
          className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
        >

          {/* Accent */}

          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 via-sky-400 to-violet-500" />

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            {/* Text */}

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Why Stay With Us?
              </p>

              <h3 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                Make Your Festival Experience
                <span className="block text-cyan-300">
                  Simple & Comfortable
                </span>
              </h3>

              <p className="mt-5 max-w-xl leading-8 text-slate-400">
                Accommodation is planned to provide
                participating students with a convenient
                place to stay while they take part in the
                technical and cultural activities of
                Scintillace.
              </p>

            </div>

            {/* Features */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                <ShieldCheck
                  size={22}
                  className="text-cyan-400"
                />

                <h4 className="mt-4 font-semibold text-white">
                  Student Focused
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Accommodation arrangements designed
                  around participating students.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                <MapPin
                  size={22}
                  className="text-cyan-400"
                />

                <h4 className="mt-4 font-semibold text-white">
                  Convenient Location
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Stay within the campus environment
                  during the festival.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                <BedDouble
                  size={22}
                  className="text-cyan-400"
                />

                <h4 className="mt-4 font-semibold text-white">
                  Room Choices
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose from the room types made
                  available for the festival.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                <Clock3
                  size={22}
                  className="text-cyan-400"
                />

                <h4 className="mt-4 font-semibold text-white">
                  Flexible Planning
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Final check-in and check-out details
                  will be communicated before booking.
                </p>

              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default AccommodationOverview;