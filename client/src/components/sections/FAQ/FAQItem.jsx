import { useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQItem({
  question,
  answer,
}) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-expanded={open}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-6
          px-6
          py-5
          text-left
          transition-colors
          hover:bg-white/[0.03]
        "
      >
        <h3 className="text-lg font-semibold text-white">
          {question}
        </h3>

        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="shrink-0"
        >
          <ChevronDown
            size={20}
            className="text-cyan-300"
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <div className="border-t border-white/10 px-6 pb-6 pt-4 leading-7 text-slate-300">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}