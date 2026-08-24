import { Link } from "react-router-dom";
import {
  CalendarCheck2,
  ArrowRight,
  Loader2,
  Users,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";

const formatDate = (date) => {
  if (!date) {
    return "Date not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status) => {
  const normalizedStatus =
    status?.toString().toLowerCase();

  if (
    normalizedStatus === "confirmed" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "registered"
  ) {
    return `
      border-emerald-500/20
      bg-emerald-500/10
      text-emerald-400
    `;
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "rejected"
  ) {
    return `
      border-red-500/20
      bg-red-500/10
      text-red-400
    `;
  }

  return `
    border-amber-500/20
    bg-amber-500/10
    text-amber-400
  `;
};

const getPaymentStatusClasses = (status) => {
  const normalizedStatus =
    status?.toString().toLowerCase();

  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "success"
  ) {
    return "text-emerald-400";
  }

  if (
    normalizedStatus === "failed" ||
    normalizedStatus === "cancelled"
  ) {
    return "text-red-400";
  }

  return "text-muted-foreground";
};

export default function RecentRegistrations({
  registrations = [],
  loading = false,
}) {
  const recentRegistrations =
    registrations.slice(0, 5);

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
          flex-col
          gap-3
          border-b
          border-border
          p-6
          sm:flex-row
          sm:items-center
          sm:justify-between
          md:p-7
        "
      >
        <div>
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
                border-cyan-500/20
                bg-cyan-500/10
                text-cyan-400
              "
            >
              <CalendarCheck2 size={20} />
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-foreground
                md:text-2xl
              "
            >
              Recent Registrations
            </h2>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Your latest event registrations
          </p>
        </div>

        <Link
          to="/events"
          className="
            group
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-primary
            transition-colors
            hover:text-primary/80
          "
        >
          Browse Events

          <ArrowRight
            size={16}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-6 md:p-7">

        {/* Loading */}

        {loading && (
          <div
            className="
              flex
              min-h-40
              items-center
              justify-center
              text-muted-foreground
            "
          >
            <div className="flex items-center gap-3">
              <Loader2
                size={20}
                className="
                  animate-spin
                  text-primary
                "
              />

              <span>
                Loading registrations...
              </span>
            </div>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          recentRegistrations.length === 0 && (
            <div
              className="
                flex
                min-h-40
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-border
                bg-background/40
                px-6
                text-center
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-cyan-500/20
                  bg-cyan-500/10
                  text-cyan-400
                "
              >
                <CalendarCheck2 size={22} />
              </div>

              <h3
                className="
                  mt-4
                  font-semibold
                  text-foreground
                "
              >
                No registrations yet
              </h3>

              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  text-muted-foreground
                "
              >
                Register for an event to see your
                participation details here.
              </p>

              <Link
                to="/events"
                className="
                  mt-5
                  rounded-xl
                  bg-primary/10
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-primary
                  transition
                  hover:bg-primary/20
                "
              >
                Explore Events
              </Link>
            </div>
          )}

        {/* Registrations */}

        {!loading &&
          recentRegistrations.length > 0 && (
            <div className="space-y-3">
              {recentRegistrations.map(
                (registration, index) => {
                  const event =
                    registration?.event;

                  const eventId =
                    event?._id ||
                    event?.id;

                  const eventTitle =
                    event?.title ||
                    "Event";

                  const status =
                    registration?.status ||
                    "Pending";

                  const paymentStatus =
                    registration?.paymentStatus ||
                    "Not Available";

                  return (
                    <motion.div
                      key={
                        registration?._id ||
                        registration?.id ||
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
                        flex
                        flex-col
                        gap-4
                        rounded-2xl
                        border
                        border-border
                        bg-background/40
                        p-4
                        transition-all
                        duration-300
                        hover:border-primary/30
                        hover:bg-card
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      {/* Event Information */}

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-cyan-500/20
                            bg-cyan-500/10
                            text-cyan-400
                          "
                        >
                          <Users size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="
                              truncate
                              font-semibold
                              text-foreground
                            "
                          >
                            {eventTitle}
                          </h3>

                          <div
                            className="
                              mt-1
                              flex
                              flex-wrap
                              items-center
                              gap-x-4
                              gap-y-1
                              text-xs
                              text-muted-foreground
                            "
                          >
                            <span>
                              Registered{" "}
                              {formatDate(
                                registration?.registrationDate,
                              )}
                            </span>

                            {event?.category && (
                              <span>
                                {event.category}
                              </span>
                            )}
                          </div>

                          <div
                            className="
                              mt-2
                              flex
                              items-center
                              gap-2
                              text-xs
                            "
                          >
                            <CreditCard
                              size={13}
                              className="text-muted-foreground"
                            />

                            <span className="text-muted-foreground">
                              Payment:
                            </span>

                            <span
                              className={getPaymentStatusClasses(
                                paymentStatus,
                              )}
                            >
                              {paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status + Action */}

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          sm:shrink-0
                        "
                      >
                        <span
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            ${getStatusClasses(status)}
                          `}
                        >
                          {status}
                        </span>

                        {eventId && (
                          <Link
                            to={`/events/${eventId}`}
                            aria-label={`View ${eventTitle}`}
                            className="
                              rounded-lg
                              p-2
                              text-muted-foreground
                              transition
                              hover:bg-primary/10
                              hover:text-primary
                            "
                          >
                            <ArrowRight
                              size={17}
                            />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
      </div>
    </motion.section>
  );
}