import { Link } from "react-router-dom";
import {
  CalendarDays,
  ArrowRight,
  Loader2,
  MapPin,
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

const formatTime = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function UpcomingEvents({
  events = [],
  loading = false,
}) {
  const visibleEvents = events.slice(0, 5);

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
      {/* Header */}

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
                border-violet-400/20
                bg-violet-400/10
                text-violet-400
              "
            >
              <CalendarDays size={20} />
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-foreground
                md:text-2xl
              "
            >
              Upcoming Events
            </h2>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Discover what's coming up at Scintillace
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
            text-violet-400
            transition-colors
            hover:text-violet-300
          "
        >
          View All Events

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

      {/* Content */}

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
                className="animate-spin text-violet-400"
              />

              <span>
                Loading upcoming events...
              </span>
            </div>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          visibleEvents.length === 0 && (
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
                  border-violet-400/20
                  bg-violet-400/10
                  text-violet-400
                "
              >
                <CalendarDays size={22} />
              </div>

              <h3 className="mt-4 font-semibold text-foreground">
                No upcoming events
              </h3>

              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  text-muted-foreground
                "
              >
                Upcoming Scintillace events will appear
                here once they are published.
              </p>

              <Link
                to="/events"
                className="
                  mt-5
                  rounded-xl
                  border
                  border-violet-400/20
                  bg-violet-400/10
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-violet-400
                  transition
                  hover:bg-violet-400/20
                "
              >
                Explore Events
              </Link>
            </div>
          )}

        {/* Events */}

        {!loading &&
          visibleEvents.length > 0 && (
            <div className="space-y-3">
              {visibleEvents.map(
                (event, index) => {
                  const eventId =
                    event?._id || event?.id;

                  return (
                    <motion.div
                      key={
                        eventId || index
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
                        hover:border-violet-400/30
                        hover:bg-card
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      {/* Event information */}

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
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-violet-400/20
                            bg-violet-400/10
                            text-violet-400
                          "
                        >
                          <CalendarDays size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="
                              truncate
                              font-semibold
                              text-foreground
                            "
                          >
                            {event?.title ||
                              "Untitled Event"}
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
                              {formatDate(
                                event?.startDateTime,
                              )}
                            </span>

                            {formatTime(
                              event?.startDateTime,
                            ) && (
                              <span>
                                {formatTime(
                                  event?.startDateTime,
                                )}
                              </span>
                            )}

                            <span className="flex items-center gap-1">
                              <MapPin size={13} />

                              {event?.venue ||
                                "Venue not available"}
                            </span>
                          </div>

                          {event?.category && (
                            <div className="mt-2">
                              <span
                                className="
                                  inline-flex
                                  rounded-full
                                  border
                                  border-violet-400/20
                                  bg-violet-400/10
                                  px-2.5
                                  py-1
                                  text-[11px]
                                  font-semibold
                                  uppercase
                                  tracking-wide
                                  text-violet-400
                                "
                              >
                                {event.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View */}

                      {eventId && (
                        <Link
                          to={`/events/${eventId}`}
                          className="
                            inline-flex
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-border
                            bg-background/60
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-muted-foreground
                            transition-all
                            duration-300
                            hover:border-violet-400/30
                            hover:bg-violet-400/10
                            hover:text-violet-400
                          "
                        >
                          View

                          <ArrowRight size={15} />
                        </Link>
                      )}
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