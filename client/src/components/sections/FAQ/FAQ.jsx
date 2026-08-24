import { motion } from "framer-motion";

import {
  Container,
  SectionHeading,
} from "../../common";

import FAQItem from "./FAQItem";

import { faqs } from "@/api/faq";

/**
 * ============================================================
 * FAQ Categories
 * ============================================================
 *
 * The category keys must match the category values used
 * inside src/api/faq.js.
 * ============================================================
 */

const categories = [
  {
    key: "General",
    title: "General",
    subtitle:
      "General information about Scintillace 2K26.",
  },

  {
    key: "Registration",
    title: "Registration",
    subtitle:
      "Everything you need to know about event registration.",
  },

  {
    key: "Payment",
    title: "Payment",
    subtitle:
      "Information about registration and payment.",
  },

  {
    key: "Check-In",
    title: "Check-In",
    subtitle:
      "Everything you need to know about event check-in.",
  },

  {
    key: "Accommodation",
    title: "Accommodation",
    subtitle:
      "Everything you need to know about participant accommodation.",
  },

  {
    key: "Certificates",
    title: "Certificates",
    subtitle:
      "Information about certificate eligibility, delivery and verification.",
  },

  {
    key: "QR & Registration",
    title: "QR & Registration",
    subtitle:
      "Information about registration QR codes and their use.",
  },

  {
    key: "Events",
    title: "Events",
    subtitle:
      "Information about events, rules and event details.",
  },
];

/**
 * ============================================================
 * FAQ Section
 * ============================================================
 */

export default function FAQ() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-slate-950 py-32"
    >
      {/* =====================================================
          Background
      ====================================================== */}

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-0
            top-10
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-500/10
            blur-[160px]
          "
        />

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-0
            right-0
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-500/10
            blur-[160px]
          "
        />
      </div>

      <Container>
        {/* ===================================================
            Heading
        ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
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
          }}
        >
          <SectionHeading
            badge="FAQ"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about Scintillace."
          />
        </motion.div>

        {/* ===================================================
            FAQ Categories
        ==================================================== */}

        <div className="mx-auto mt-20 max-w-4xl space-y-14">
          {categories.map((category) => {
            const categoryFaqs = faqs.filter(
              (faq) =>
                faq.category === category.key,
            );

            /**
             * Do not render empty categories.
             */

            if (categoryFaqs.length === 0) {
              return null;
            }

            return (
              <motion.div
                key={category.key}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                {/* Category heading */}

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {category.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {category.subtitle}
                  </p>
                </div>

                {/* FAQ items */}

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
                  className="space-y-4"
                >
                  {categoryFaqs.map(
                    (faq) => (
                      <FAQItem
                        key={faq.id}
                        {...faq}
                      />
                    ),
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}