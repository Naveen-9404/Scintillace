import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function PromoVideo() {
  return (
    <section
      id="promo-video"
      className="relative overflow-hidden bg-slate-950 py-24"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[150px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[140px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Heading */}
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
          transition={{
            duration: 0.7,
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            <Play size={14} />
            Experience Scintillace
          </span>

          <h2 className="mt-7 text-4xl font-black text-white md:text-5xl">
            Get a Glimpse of
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Scintillace
            </span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            A celebration of technology, creativity, innovation,
            culture, and student talent.
          </p>
        </motion.div>

        {/* Promo Video */}
        <motion.div
          initial={{
            opacity: 0,
            y: 50,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
            delay: 0.15,
          }}
          className="relative mt-14 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-2 shadow-[0_0_60px_rgba(34,211,238,.08)] backdrop-blur-xl"
        >
          <div className="relative aspect-video overflow-hidden rounded-[26px] bg-black">
            <video
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster=""
            >
              <source
                src="/videos/scintillace-promo.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
}