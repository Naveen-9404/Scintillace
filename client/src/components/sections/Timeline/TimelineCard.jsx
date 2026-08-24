import { motion } from "framer-motion";
import { Clock3, Sparkles } from "lucide-react";

import { Card } from "../../common";

export default function TimelineCard({
  time,
  title,
  description,
  Icon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
    >
      <Card
        className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-6
          backdrop-blur-xl
          transition-all
          duration-300
          hover:border-cyan-400/40
          hover:bg-white/10
          hover:shadow-[0_0_40px_rgba(34,211,238,.18)]
        "
      >
        {/* Background Glow */}
        <div
          className="
            absolute
            inset-0
            opacity-0
            transition-opacity
            duration-500
            group-hover:opacity-100
            bg-gradient-to-br
            from-cyan-500/10
            via-transparent
            to-violet-500/10
          "
        />

        {/* Shimmer */}
        <div
          className="
            absolute
            inset-0
            -translate-x-full
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
            transition-transform
            duration-1000
            group-hover:translate-x-full
          "
        />

        <div className="relative flex items-start gap-5">

          {/* Icon */}
          <motion.div
            whileHover={{
              rotate: 8,
              scale: 1.08,
            }}
            className="
              relative
              flex
              h-16
              w-16
              flex-shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-500/10
              text-cyan-300
              shadow-[0_0_20px_rgba(34,211,238,.15)]
            "
          >
            <Icon size={28} />

            <div className="absolute -right-1 -top-1">
              <Sparkles
                size={14}
                className="text-cyan-300"
              />
            </div>
          </motion.div>

          <div className="flex-1">

            {/* Time */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-500/10
                px-3
                py-1
                text-sm
                font-semibold
                text-cyan-300
              "
            >
              <Clock3 size={15} />
              {time}
            </div>

            {/* Title */}
            <h3
              className="
                mt-5
                text-2xl
                font-bold
                text-white
                transition-colors
                duration-300
                group-hover:text-cyan-300
              "
            >
              {title}
            </h3>

            {/* Divider */}
            <div className="mt-4 h-px w-16 bg-gradient-to-r from-cyan-400/50 to-transparent" />

            {/* Description */}
            <p
              className="
                mt-4
                leading-7
                text-slate-400
              "
            >
              {description}
            </p>

          </div>

        </div>

        {/* Bottom Accent */}
        <div
          className="
            absolute
            bottom-0
            left-0
            h-1
            w-0
            bg-gradient-to-r
            from-cyan-400
            via-sky-400
            to-violet-400
            transition-all
            duration-500
            group-hover:w-full
          "
        />
      </Card>
    </motion.div>
  );
}