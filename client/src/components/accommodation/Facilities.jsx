import { motion } from "framer-motion";
import {
  BedDouble,
  ShieldCheck,
  MapPin,
  Users,
  Building2,
  Clock3,
} from "lucide-react";

const facilities = [
  {
    icon: BedDouble,
    title: "Comfortable Stay",
    description:
      "Accommodation options arranged for registered festival participants.",
  },
  {
    icon: ShieldCheck,
    title: "Student Safety",
    description:
      "Accommodation arrangements are planned with participant safety and convenience in mind.",
  },
  {
    icon: MapPin,
    title: "Campus Location",
    description:
      "Stay within the campus environment while participating in Scintillace activities.",
  },
  {
    icon: Users,
    title: "Participant Friendly",
    description:
      "Accommodation is organized specifically for students attending the festival.",
  },
  {
    icon: Building2,
    title: "Room Allocation",
    description:
      "Rooms will be allocated according to the selected accommodation category and availability.",
  },
  {
    icon: Clock3,
    title: "Stay Schedule",
    description:
      "Check-in and check-out arrangements will follow the final accommodation schedule.",
  },
];

const Facilities = () => {
  return (
    <section
      id="accommodation-facilities"
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
            Stay Experience
          </span>

          <h2 className="mt-7 text-4xl font-black leading-tight sm:text-5xl">

            Accommodation

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Facilities
            </span>

          </h2>

          <p className="mx-auto mt-6 text-lg leading-8 text-slate-400">
            Explore the accommodation arrangements planned
            to make your stay during Scintillace convenient
            and comfortable.
          </p>

        </motion.div>

        {/* =================================================
            FACILITY GRID
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
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >

          {facilities.map(
            (facility) => {
              const Icon = facility.icon;

              return (
                <motion.div
                  key={facility.title}
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
                  className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/20 hover:bg-white/[0.06] hover:shadow-[0_0_35px_rgba(34,211,238,.08)]"
                >

                  {/* Icon */}

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-white/10 transition-all duration-300 group-hover:ring-cyan-400/30">

                    <Icon
                      size={26}
                      className="text-cyan-400"
                    />

                  </div>

                  {/* Content */}

                  <h3 className="mt-6 text-xl font-bold text-white">
                    {facility.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {facility.description}
                  </p>

                  {/* Bottom accent */}

                  <div className="mt-6 h-px w-0 bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-500 group-hover:w-full" />

                </motion.div>
              );
            }
          )}

        </motion.div>

        {/* =================================================
            INFORMATION NOTE
            ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
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
          className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center"
        >

          <p className="text-sm leading-6 text-slate-500">
            Specific facilities, meal arrangements,
            availability, and other accommodation
            services will be updated once the final
            arrangements are confirmed.
          </p>

        </motion.div>

      </div>
    </section>
  );
};

export default Facilities;