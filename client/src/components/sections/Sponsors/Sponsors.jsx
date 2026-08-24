import { motion } from "framer-motion";

import {
  Container,
  SectionHeading,
} from "../../common";

import SponsorCard from "./SponsorCard";
import { sponsors } from "@/api/sponsors";

export default function Sponsors() {
  return (
    <section
      id="sponsors"
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
            y: [0, -30, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[160px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[160px]"
        />

      </div>

      <Container>

        {/* ===================================================
            Heading
            =================================================== */}

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
        >
          <SectionHeading
            badge="Sponsors & Partners"
            title="Our Partners"
            subtitle="Organizations and partners who support Scintillace and contribute to creating meaningful experiences for students."
          />
        </motion.div>

        {/* ===================================================
            Sponsors
            =================================================== */}

        {sponsors.length > 0 ? (
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
            className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5"
          >
            {sponsors.map(
              (item) => (
                <SponsorCard
                  key={item.id}
                  {...item}
                />
              ),
            )}
          </motion.div>
        ) : (
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
            className="mx-auto mt-20 max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl"
          >
            <h3 className="text-2xl font-bold text-white">
              Partners Coming Soon
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              We are working with our partners to make
              Scintillace a memorable experience.
              Sponsor and partner details will be
              announced soon.
            </p>
          </motion.div>
        )}

      </Container>
    </section>
  );
}