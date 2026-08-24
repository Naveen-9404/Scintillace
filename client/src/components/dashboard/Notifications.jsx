import {
  Bell,
  Info,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "URGENT":
      return `
        border-red-400/20
        bg-red-400/10
        text-red-400
      `;

    case "HIGH":
      return `
        border-orange-400/20
        bg-orange-400/10
        text-orange-400
      `;

    case "LOW":
      return `
        border-border
        bg-muted/40
        text-muted-foreground
      `;

    default:
      return `
        border-emerald-400/20
        bg-emerald-400/10
        text-emerald-400
      `;
  }
};

export default function Notifications({
  notifications = [],
  loading = false,
}) {
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
        shadow-card
        backdrop-blur-xl
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-border
          p-6
          md:p-7
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-emerald-400/20
              bg-emerald-400/10
              text-emerald-400
            "
          >
            <Bell size={20} />
          </div>

          <div>
            <h2
              className="
                text-xl
                font-bold
                text-foreground
                md:text-2xl
              "
            >
              Announcements
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-muted-foreground
              "
            >
              Latest updates from Scintillace
            </p>
          </div>
        </div>

        <Link
          to="/announcements"
          className="
            hidden
            items-center
            gap-1
            text-sm
            font-semibold
            text-emerald-400
            transition
            hover:text-emerald-300
            sm:flex
          "
        >
          View All

          <ArrowRight size={16} />
        </Link>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-6 md:p-7">

        {/* Loading */}

        {loading && (
          <div className="flex items-center justify-center py-10">
            <div
              className="
                h-7
                w-7
                animate-spin
                rounded-full
                border-2
                border-emerald-400/20
                border-t-emerald-400
              "
            />
          </div>
        )}

        {/* Empty */}

        {!loading &&
          notifications.length === 0 && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-border
                bg-background/40
                px-6
                py-10
                text-center
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-emerald-400/20
                  bg-emerald-400/10
                  text-emerald-400
                "
              >
                <Info size={25} />
              </div>

              <h3
                className="
                  mt-4
                  font-semibold
                  text-foreground
                "
              >
                No announcements
              </h3>

              <p
                className="
                  mt-2
                  max-w-lg
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Important updates about the fest will
                appear here.
              </p>
            </div>
          )}

        {/* Announcements */}

        {!loading &&
          notifications.length > 0 && (
            <div className="space-y-3">
              {notifications
                .slice(0, 5)
                .map(
                  (
                    notification,
                    index,
                  ) => {
                    const priority =
                      notification?.priority ||
                      "NORMAL";

                    return (
                      <motion.div
                        key={
                          notification?._id ||
                          notification?.id ||
                          index
                        }
                        initial={{
                          opacity: 0,
                          x: -10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.05,
                        }}
                        className="
                          group
                          rounded-2xl
                          border
                          border-border
                          bg-background/40
                          p-4
                          transition-all
                          duration-300
                          hover:border-emerald-400/20
                          hover:bg-card
                        "
                      >
                        <div className="flex items-start gap-3">

                          {/* Icon */}

                          <div className="mt-1 shrink-0">
                            {priority ===
                            "URGENT" ? (
                              <AlertTriangle
                                size={17}
                                className="text-red-400"
                              />
                            ) : (
                              <Bell
                                size={17}
                                className="text-emerald-400"
                              />
                            )}
                          </div>

                          {/* Content */}

                          <div className="min-w-0 flex-1">

                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >
                              <h3
                                className="
                                  font-semibold
                                  text-foreground
                                "
                              >
                                {
                                  notification.title
                                }
                              </h3>

                              <span
                                className={`
                                  rounded-full
                                  border
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-semibold
                                  ${getPriorityClasses(
                                    priority,
                                  )}
                                `}
                              >
                                {priority}
                              </span>
                            </div>

                            <p
                              className="
                                mt-1
                                line-clamp-3
                                text-sm
                                leading-6
                                text-muted-foreground
                              "
                            >
                              {
                                notification.message
                              }
                            </p>

                            {notification.publishedAt && (
                              <p
                                className="
                                  mt-2
                                  text-xs
                                  text-muted-foreground
                                "
                              >
                                {formatDate(
                                  notification.publishedAt,
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  },
                )}
            </div>
          )}

        {/* Mobile View All */}

        {!loading &&
          notifications.length > 0 && (
            <Link
              to="/announcements"
              className="
                mt-5
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-border
                px-4
                py-3
                text-sm
                font-semibold
                text-emerald-400
                transition
                hover:border-emerald-400/30
                hover:bg-emerald-400/5
                sm:hidden
              "
            >
              View All Announcements

              <ArrowRight size={16} />
            </Link>
          )}
      </div>
    </motion.section>
  );
}