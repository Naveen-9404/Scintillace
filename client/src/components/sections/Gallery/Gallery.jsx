import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Container,
  SectionHeading,
} from "../../common";

import GalleryCard from "./GalleryCard";

import { gallery } from "@/api/gallery";

export default function Gallery() {
  return (
    <section
      id="gallery"
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
          className="absolute -left-20 top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[160px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[160px]"
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
            badge="Gallery"
            title="Moments That Define Scintillace"
            subtitle="Explore the energy, creativity, technology and celebrations that make Scintillace a memorable campus experience."
          />
        </motion.div>

        {/* ===================================================
            Gallery
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
                staggerChildren: 0.08,
              },
            },
          }}
          className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {gallery.map(
            (item) => (
              <GalleryCard
                key={item.id}
                {...item}
              />
            ),
          )}
        </motion.div>

        {/* ===================================================
            CTA
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
            to="/gallery"
            className="
              group
              relative
              inline-flex
              items-center
              gap-3
              overflow-hidden
              rounded-xl
              bg-cyan-400
              px-9
              py-4
              font-semibold
              text-slate-950
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-cyan-300
              hover:shadow-[0_0_35px_rgba(34,211,238,.4)]
            "
          >
            {/* Shimmer */}

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
              View Full Gallery
            </span>

            <ArrowRight
              size={20}
              className="
                relative
                z-10
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </motion.div>

      </Container>
    </section>
  );
}