import { motion } from "framer-motion";
import {
  CircleDollarSign,
  CalendarCheck,
  Clock3,
  ShieldAlert,
  CreditCard,
  FileCheck,
} from "lucide-react";

const refundPolicies = [
  {
    icon: CircleDollarSign,
    title: "Cancellation Refunds",
    description:
      "Refund eligibility will depend on the cancellation conditions defined by the Scintillace organizing committee.",
  },
  {
    icon: CalendarCheck,
    title: "Cancellation Timeline",
    description:
      "The applicable cancellation period and refund eligibility will be communicated before accommodation booking.",
  },
  {
    icon: Clock3,
    title: "Refund Timeline",
    description:
      "Approved refunds will be processed according to the final refund policy and applicable payment processing timelines.",
  },
  {
    icon: CreditCard,
    title: "Original Payment Method",
    description:
      "Where applicable, approved refunds will be processed through the payment method used for the original booking.",
  },
  {
    icon: ShieldAlert,
    title: "Organizer Cancellation",
    description:
      "Refund arrangements in the event of organizer-side cancellation will be governed by the final accommodation policy.",
  },
  {
    icon: FileCheck,
    title: "Refund Approval",
    description:
      "Refund requests may be subject to verification and approval by the Scintillace organizing committee.",
  },
];

const RefundPolicy = () => {
  return (
    <section
      id="accommodation-refund"
      className="relative overflow-hidden bg-slate-950 py-28 text-white"
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-10%] top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[140px]" />

        <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-violet-500/5 blur-[140px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">

        {/* =================================================
            HEADING
            ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >

          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Booking Information
          </span>

          <h2 className="mt-7 text-4xl font-black leading-tight sm:text-5xl">

            Accommodation

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Refund Policy
            </span>

          </h2>

          <p className="mx-auto mt-6 text-lg leading-8 text-slate-400">
            Please review the refund and cancellation
            conditions before confirming your accommodation
            booking.
          </p>

        </motion.div>

        {/* =================================================
            POLICY CARDS
            ================================================= */}

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
          }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >

          {refundPolicies.map((policy) => {
            const Icon = policy.icon;

            return (
              <motion.div
                key={policy.title}
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
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/20 hover:bg-white/[0.06]"
              >

                {/* Icon */}

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/10 transition-all duration-300 group-hover:bg-cyan-400/15 group-hover:ring-cyan-400/30">

                  <Icon
                    size={26}
                    className="text-cyan-400"
                  />

                </div>

                {/* Content */}

                <h3 className="mt-6 text-xl font-bold text-white">
                  {policy.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {policy.description}
                </p>

                {/* Accent */}

                <div className="mt-6 h-px w-0 bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-500 group-hover:w-full" />

              </motion.div>
            );
          })}

        </motion.div>

        {/* =================================================
            IMPORTANT NOTICE
            ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
          className="mt-12 rounded-2xl border border-amber-400/10 bg-amber-400/5 p-6"
        >

          <div className="flex gap-4">

            <ShieldAlert
              size={22}
              className="mt-0.5 flex-shrink-0 text-amber-300"
            />

            <div>

              <h3 className="font-semibold text-amber-300">
                Important Note
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                The final refund percentages, cancellation
                deadlines, processing timelines, and other
                applicable conditions will be published by
                the Scintillace organizing committee before
                accommodation registration opens.
              </p>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default RefundPolicy;