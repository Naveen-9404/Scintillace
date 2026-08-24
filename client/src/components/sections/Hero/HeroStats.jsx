import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  CalendarDays,
} from "lucide-react";

const stats = [
  {
    icon: Trophy,
    value: "10+",
    label: "Events",
    color: "text-amber-400",
  },
  {
    icon: Users,
    value: "100+",
    label: "Participants",
    color: "text-cyan-400",
  },
  {
    icon: CalendarDays,
    value: "3",
    label: "Festival Days",
    color: "text-violet-400",
  },
];

export default function HeroStats() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.label}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.1,
            }}
            whileHover={{
              y: -5,
            }}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-[0_0_25px_rgba(34,211,238,.12)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900/70">
                <Icon
                  size={22}
                  className={stat.color}
                />
              </div>

              <div className="min-w-0">
                <p className="text-2xl font-black leading-none text-white">
                  {stat.value}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}