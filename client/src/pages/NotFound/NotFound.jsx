import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <h1 className="text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-violet-400">
          404
        </h1>

        <h2 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
          Page Not Found
        </h2>

        <p className="mt-4 text-slate-400 max-w-md mx-auto leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-cyan-400/30"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1 text-cyan-400"
            />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
