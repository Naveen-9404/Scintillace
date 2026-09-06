import { motion } from "framer-motion";
import {
  Cpu,
  Trophy,
  Presentation,
  Wrench,
  GraduationCap,
  CircuitBoard,
  Users,
} from "lucide-react";

const cards = [
  {
    icon: Presentation,
    title: "Presentations",
    subtitle: "Paper & Poster",
    color: "text-cyan-400",
    position: "top-2 left-0",
  },
  {
    icon: CircuitBoard,
    title: "Hardware Expo",
    subtitle: "Innovation Showcase",
    color: "text-violet-400",
    position: "top-24 right-0",
  },
  {
    icon: Wrench,
    title: "Workshops",
    subtitle: "Hands-on Learning",
    color: "text-emerald-400",
    position: "bottom-20 left-8",
  },
  {
    icon: Users,
    title: "100+ Participants",
    subtitle: "Students & Innovators",
    color: "text-amber-400",
    position: "bottom-0 right-12",
  },
];

const orbitIcons = [
  {
    icon: Presentation,
    color: "text-cyan-300",
    x: -180,
    y: -60,
  },
  {
    icon: CircuitBoard,
    color: "text-violet-400",
    x: 170,
    y: -40,
  },
  {
    icon: Trophy,
    color: "text-amber-400",
    x: -140,
    y: 150,
  },
  {
    icon: Wrench,
    color: "text-emerald-400",
    x: 150,
    y: 150,
  },
  {
    icon: GraduationCap,
    color: "text-sky-400",
    x: 0,
    y: -210,
  },
  {
    icon: Cpu,
    color: "text-pink-400",
    x: 0,
    y: 210,
  },
];

export default function HeroIllustration() {
  return (
    <div className="relative hidden h-[620px] w-[560px] lg:block pointer-events-none">

      {/* Glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[140px]"
      />

      {/* Outer Ring */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10"
      />

      {/* Inner Ring */}
      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/10"
      />

      {/* Orbit Icons */}
      {orbitIcons.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={index}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(${item.x}px, ${item.y}px)`,
            }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <Icon
                size={26}
                className={item.color}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Center Sphere */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        className="absolute left-1/2 top-1/2 flex h-72 w-72 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,.18)]"
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 shadow-[0_0_60px_rgba(34,211,238,.5)]"
        >
          <Cpu
            size={60}
            className="text-white"
          />
        </motion.div>
      </motion.div>

      {/* Floating Cards */}
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute ${card.position}`}
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-[0_0_35px_rgba(34,211,238,.2)]">
              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-slate-900/60 p-3">
                  <Icon
                    size={24}
                    className={card.color}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    {card.title}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {card.subtitle}
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Orbit Dots */}
      {[
        "left-24 top-28 bg-cyan-400",
        "right-20 top-52 bg-violet-400",
        "bottom-24 left-20 bg-emerald-400",
        "bottom-12 right-28 bg-amber-300",
      ].map((item, index) => (
        <motion.div
          key={index}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + index,
            repeat: Infinity,
          }}
          className={`absolute h-3 w-3 rounded-full ${item} shadow-[0_0_18px_rgba(34,211,238,.8)]`}
        />
      ))}

    </div>
  );
}