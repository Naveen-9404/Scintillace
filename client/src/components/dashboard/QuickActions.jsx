import {
  CalendarDays,
  UserRound,
  Award,
  BedDouble,
  Ticket,
  ArrowRight,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * ============================================================
 * Quick Actions
 * ============================================================
 */

const actions = [
  {
    title: "Browse Events",
    description:
      "Explore competitions, workshops and presentations.",
    icon: CalendarDays,
    to: "/events",
    accent: "cyan",
  },

  {
    title: "My Tickets",
    description:
      "View your event tickets and display your QR codes.",
    icon: Ticket,
    to: "/tickets",
    accent: "blue",
  },

  {
    title: "My Profile",
    description:
      "View and update your participant information.",
    icon: UserRound,
    to: "/profile",
    accent: "violet",
  },

  {
    title: "Certificates",
    description:
      "View your participation and achievement certificates.",
    icon: Award,
    to: "/certificates",
    accent: "amber",
  },

  {
    title: "Accommodation",
    description:
      "Book or manage your hostel accommodation.",
    icon: BedDouble,
    to: "/accommodation",
    accent: "emerald",
  },
];

/**
 * ============================================================
 * Accent Styles
 * ============================================================
 */

const accentClasses = {
  cyan: {
    icon:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-400",

    hover:
      "hover:border-cyan-400/30 hover:bg-cyan-400/5",

    arrow:
      "group-hover:text-cyan-400",
  },

  blue: {
    icon:
      "border-blue-400/20 bg-blue-400/10 text-blue-400",

    hover:
      "hover:border-blue-400/30 hover:bg-blue-400/5",

    arrow:
      "group-hover:text-blue-400",
  },

  violet: {
    icon:
      "border-violet-400/20 bg-violet-400/10 text-violet-400",

    hover:
      "hover:border-violet-400/30 hover:bg-violet-400/5",

    arrow:
      "group-hover:text-violet-400",
  },

  amber: {
    icon:
      "border-amber-400/20 bg-amber-400/10 text-amber-400",

    hover:
      "hover:border-amber-400/30 hover:bg-amber-400/5",

    arrow:
      "group-hover:text-amber-400",
  },

  emerald: {
    icon:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",

    hover:
      "hover:border-emerald-400/30 hover:bg-emerald-400/5",

    arrow:
      "group-hover:text-emerald-400",
  },
};

/**
 * ============================================================
 * Component
 * ============================================================
 */

export default function QuickActions() {
  return (
    <motion.section
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
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/70
        p-6
        shadow-card
        backdrop-blur-xl
        md:p-7
      "
    >

      {/* ======================================================
          Header
          ====================================================== */}

      <div>
        <h2
          className="
            text-xl
            font-bold
            text-foreground
            md:text-2xl
          "
        >
          Quick Actions
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-muted-foreground
          "
        >
          Quickly access the most important sections.
        </p>
      </div>

      {/* ======================================================
          Actions
          ====================================================== */}

      <div
        className="
          mt-6
          grid
          gap-3
          sm:grid-cols-2
        "
      >

        {actions.map(
          (
            action,
            index,
          ) => {
            const Icon =
              action.icon;

            const styles =
              accentClasses[
                action.accent
              ];

            return (
              <motion.div
                key={
                  action.title
                }
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    index * 0.05,
                }}
              >

                <Link
                  to={
                    action.to
                  }
                  className={`
                    group
                    block
                    rounded-2xl
                    border
                    border-border
                    bg-background/40
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    ${styles.hover}
                  `}
                >

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >

                    {/* ==================================================
                        Icon
                        ================================================== */}

                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        transition-transform
                        duration-300
                        group-hover:scale-105
                        ${styles.icon}
                      `}
                    >
                      <Icon
                        size={20}
                      />
                    </div>

                    {/* ==================================================
                        Arrow
                        ================================================== */}

                    <ArrowRight
                      size={17}
                      className={`
                        mt-1
                        text-muted-foreground
                        transition-all
                        duration-300
                        group-hover:translate-x-1
                        ${styles.arrow}
                      `}
                    />

                  </div>

                  {/* ====================================================
                      Title
                      ==================================================== */}

                  <h3
                    className="
                      mt-4
                      font-semibold
                      text-foreground
                    "
                  >
                    {
                      action.title
                    }
                  </h3>

                  {/* ====================================================
                      Description
                      ==================================================== */}

                  <p
                    className="
                      mt-1.5
                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    {
                      action.description
                    }
                  </p>

                </Link>

              </motion.div>
            );
          },
        )}

      </div>

    </motion.section>
  );
}