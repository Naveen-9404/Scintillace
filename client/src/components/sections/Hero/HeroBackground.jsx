import { motion } from "framer-motion";

const particles = [
  { top: "12%", left: "10%", size: 10, color: "bg-cyan-400" },
  { top: "22%", right: "12%", size: 8, color: "bg-violet-400" },
  { top: "68%", left: "28%", size: 12, color: "bg-sky-400" },
  { top: "78%", right: "24%", size: 14, color: "bg-cyan-300" },
  { top: "42%", left: "78%", size: 6, color: "bg-blue-400" },
  { top: "58%", left: "8%", size: 8, color: "bg-cyan-500" },
];

export default function HeroBackground() {
  return (
    <>
      {/* Base Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

      {/* Left Aurora */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-cyan-500/20 blur-[170px]"
      />

      {/* Right Aurora */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-violet-500/20 blur-[170px]"
      />

      {/* Center Glow */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[140px]"
      />

      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + index,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute rounded-full ${particle.color}`}
          style={{
            top: particle.top,
            left: particle.left,
            right: particle.right,
            width: particle.size,
            height: particle.size,
            boxShadow: "0 0 30px rgba(34,211,238,.8)",
          }}
        />
      ))}

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial Fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(2,6,23,.15) 45%, rgba(2,6,23,.88) 100%)",
        }}
      />

      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
        }}
      />
    </>
  );
}