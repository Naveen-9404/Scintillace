import { motion } from "framer-motion";
import {
  BedDouble,
  ShieldCheck,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";

const features = [
  {
    icon: BedDouble,
    title: "Comfortable Rooms",
    description:
      "Accommodation options designed for participating students.",
  },
  {
    icon: ShieldCheck,
    title: "Student-Friendly Stay",
    description:
      "A convenient accommodation arrangement for festival participants.",
  },
  {
    icon: MapPin,
    title: "Convenient Location",
    description:
      "Stay close to the festival venue and participating activities.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Facilities",
    description:
      "Accommodation facilities and meal arrangements will be provided as per the final schedule.",
  },
];

const AccommodationHero = () => {
  const scrollToBooking = () => {
    document
      .getElementById("accommodation-booking")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const scrollToRules = () => {
    document
      .getElementById("accommodation-rules")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <section
      id="accommodation-hero"
      className="relative overflow-hidden bg-slate-950 text-white"
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            x: [0, 35, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-[150px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/15 blur-[150px]"
        />

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

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-7xl items-center px-6 py-32">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">

          {/* =================================================
              LEFT CONTENT
              ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: -60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            viewport={{
              once: true,
            }}
          >

            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
              Scintillace Accommodation
            </span>

            <h1 className="mt-8 text-5xl font-black leading-tight sm:text-6xl">

              Stay Comfortable,

              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                Experience Scintillace.
              </span>

            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
              Plan your stay during Scintillace with
              convenient accommodation options for
              participating students. Explore available
              rooms, facilities, rules, and booking
              information before registering.
            </p>

            {/* =================================================
                BUTTONS
                ================================================= */}

            <div className="mt-10 flex flex-wrap gap-4">

              <button
                type="button"
                onClick={scrollToBooking}
                className="rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-400/30"
              >
                Book Accommodation
              </button>

              <button
                type="button"
                onClick={scrollToRules}
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-slate-200 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10 hover:text-cyan-300"
              >
                View Rules
              </button>

            </div>

            {/* Location */}

            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">

              <MapPin
                size={17}
                className="text-cyan-400"
              />

              <span>
                JNTUA College of Engineering Pulivendula (Autonomous)
              </span>

            </div>

          </motion.div>

          {/* =================================================
              RIGHT FEATURE PANEL
              ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: 60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            viewport={{
              once: true,
            }}
            className="relative"
          >

            {/* Outer Glow */}

            <div className="absolute -inset-6 rounded-[2rem] bg-cyan-500/5 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">

              <div className="mb-7">

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Accommodation
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Everything You Need for Your Stay
                </h2>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {features.map(
                  (feature, index) => {
                    const Icon = feature.icon;

                    return (
                      <motion.div
                        key={feature.title}
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
                          duration: 0.5,
                          delay:
                            index * 0.1,
                        }}
                        className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.07]"
                      >

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/80 ring-1 ring-white/10 transition-all duration-300 group-hover:ring-cyan-400/30">

                          <Icon
                            size={22}
                            className="text-cyan-400"
                          />

                        </div>

                        <h3 className="mt-4 font-semibold text-white">
                          {feature.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {feature.description}
                        </p>

                      </motion.div>
                    );
                  }
                )}

              </div>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default AccommodationHero;