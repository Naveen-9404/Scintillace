import { motion } from "framer-motion";

export default function SponsorCard({
  name,
  tier,
  logo,
}) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 30,
        },
        show: {
          opacity: 1,
          y: 0,
        },
      }}
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur transition"
    >
      <div className="flex h-28 items-center justify-center rounded-2xl bg-slate-800">

        {logo ? (
          <img
            src={logo}
            alt={name}
            className="max-h-20 max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-2xl font-bold text-white">
              {name.charAt(0)}
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Logo Coming Soon
            </p>

          </div>
        )}

      </div>

      <div className="mt-6 text-center">

        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
          {tier}
        </span>

        <h3 className="mt-4 text-lg font-bold text-white">
          {name}
        </h3>

      </div>
    </motion.div>
  );
}