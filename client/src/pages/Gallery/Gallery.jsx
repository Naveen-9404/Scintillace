import { motion } from "framer-motion";
import { Container } from "../../components/common";
import GalleryCard from "../../components/sections/Gallery/GalleryCard";
import { gallery } from "../../api/gallery";

export default function Gallery() {
  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <Container className="relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400 mb-6 backdrop-blur-sm">
            Scintillace Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Full <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Gallery</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore the complete collection of moments, energy, and celebrations from the Scintillace campus experience.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {gallery.map((item) => (
            <GalleryCard key={item.id} {...item} />
          ))}
        </motion.div>
      </Container>
    </main>
  );
}
