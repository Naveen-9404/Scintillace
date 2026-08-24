import { motion } from "framer-motion";
import { Images, Camera, ArrowUpRight } from "lucide-react";

export default function GalleryCard({
  image,
  title,
  category,
}) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
        },
      }}
      whileHover={{
        y: -10,
      }}
      transition={{
        duration: 0.35,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-slate-900
        shadow-lg
        transition-all
        duration-300
        hover:border-cyan-400/30
        hover:shadow-[0_0_35px_rgba(34,211,238,.2)]
      "
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">

        <img
          src={image}
          alt={title}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-110
            group-hover:rotate-1
          "
        />

        {/* Dark Overlay */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-slate-950
            via-slate-950/20
            to-transparent
            opacity-80
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        {/* Glass Overlay */}
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
            via-white/20
            to-transparent
            transition-transform
            duration-1000
            group-hover:translate-x-full
          "
        />

        {/* Category */}
        <div className="absolute left-4 top-4">
          <span
            className="
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/10
              px-3
              py-1
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-cyan-300
              backdrop-blur-md
            "
          >
            {category}
          </span>
        </div>

        {/* Camera Icon */}
        <motion.div
          whileHover={{
            rotate: 15,
          }}
          className="
            absolute
            right-4
            top-4
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-white/10
            text-white
            backdrop-blur-xl
          "
        >
          <Camera size={18} />
        </motion.div>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5">

          <div className="flex items-center gap-2 text-cyan-300">
            <Images size={18} />
            <span className="text-sm font-medium">
              Gallery
            </span>
          </div>

          <h3
            className="
              mt-2
              text-xl
              font-bold
              text-white
              transition-colors
              duration-300
              group-hover:text-cyan-300
            "
          >
            {title}
          </h3>

          {/* CTA */}
          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-cyan-300
              opacity-0
              transition-all
              duration-300
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >
            View Photo

            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
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

      </div>
    </motion.div>
  );
}