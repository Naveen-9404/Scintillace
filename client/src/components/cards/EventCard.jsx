import {
  CalendarDays,
  Users,
  Trophy,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

/**
 * ============================================================
 * Fallback Event Image
 * ============================================================
 */

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80";

/**
 * ============================================================
 * Date Formatter
 * ============================================================
 */

const formatEventDate = (date) => {
  if (!date) {
    return "Date TBA";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date TBA";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
    },
  );
};

/**
 * ============================================================
 * Participation Label
 * ============================================================
 */

const getParticipationLabel = (
  event,
) => {
  if (event.type === "TEAM") {
    return "Team Event";
  }

  return "Individual Event";
};

/**
 * ============================================================
 * Registration Fee
 * ============================================================
 */

const getRegistrationFee = (
  event,
) => {
  const fee =
    Number(event.registrationFee) || 0;

  if (!event.isPaid || fee === 0) {
    return "FREE";
  }

  if (event.type === "TEAM") {
    return `₹${fee} / team`;
  }

  return `₹${fee} / person`;
};

/**
 * ============================================================
 * Event Card
 * ============================================================
 */

export default function EventCard({
  event,
}) {
  const eventId =
    event?._id || event?.id;

  const image =
    event?.poster ||
    event?.banner ||
    DEFAULT_EVENT_IMAGE;

  const isRegistrationOpen =
    Boolean(
      event?.registrationOpen &&
        event?.registrationRequired,
    );

  const isFeatured =
    event?.isFeatured ||
    event?.featured;

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/90
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400/70
        hover:shadow-2xl
        hover:shadow-cyan-500/10
      "
    >
      {/* ======================================================
          Poster
          ====================================================== */}

      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={event?.title || "Event"}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
          onError={(e) => {
            e.currentTarget.src =
              DEFAULT_EVENT_IMAGE;
          }}
        />

        {/* Dark image overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-zinc-950
            via-zinc-950/20
            to-transparent
          "
        />

        {/* Category */}

        <span
          className="
            absolute
            left-4
            top-4
            rounded-full
            bg-cyan-400
            px-3
            py-1
            text-xs
            font-bold
            uppercase
            tracking-wide
            text-zinc-950
          "
        >
          {event?.category ||
            "EVENT"}
        </span>

        {/* Registration / Featured */}

        <div
          className="
            absolute
            right-4
            top-4
            flex
            items-center
            gap-2
          "
        >
          {isRegistrationOpen && (
            <span
              className="
                rounded-full
                bg-emerald-500
                px-3
                py-1
                text-xs
                font-semibold
                text-white
                shadow-lg
              "
            >
              Registration Open
            </span>
          )}

          {isFeatured && (
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-violet-500
                px-3
                py-1
                text-xs
                font-semibold
                text-white
              "
            >
              <Sparkles
                size={13}
              />

              Featured
            </span>
          )}
        </div>
      </div>

      {/* ======================================================
          Content
          ====================================================== */}

      <div className="flex flex-col p-6">
        {/* Title */}

        <h2
          className="
            text-2xl
            font-bold
            leading-tight
            text-white
          "
        >
          {event?.title}
        </h2>

        {/* Description */}

        {event?.description && (
          <p
            className="
              mt-3
              line-clamp-3
              min-h-[72px]
              text-sm
              leading-6
              text-zinc-400
            "
          >
            {event.description}
          </p>
        )}

        {/* ====================================================
            Event Information
            ==================================================== */}

        <div className="mt-5 space-y-3">
          {/* Date */}

          <div
            className="
              flex
              items-center
              gap-3
              text-sm
              text-zinc-300
            "
          >
            <CalendarDays
              size={19}
              className="shrink-0 text-cyan-400"
            />

            <span>
              {formatEventDate(
                event?.startDateTime ||
                  event?.date,
              )}
            </span>
          </div>

          {/* Participation */}

          <div
            className="
              flex
              items-center
              gap-3
              text-sm
              text-zinc-300
            "
          >
            <Users
              size={19}
              className="shrink-0 text-cyan-400"
            />

            <span>
              {getParticipationLabel(
                event,
              )}
            </span>
          </div>

          {/* Prizes */}

          <div
            className="
              flex
              items-center
              gap-3
              text-sm
              text-zinc-300
            "
          >
            <Trophy
              size={19}
              className="shrink-0 text-cyan-400"
            />

            <span>
              {event?.prizePool ||
                "Prize details will be announced"}
            </span>
          </div>

          {/* Registration */}

          {event?.registrationRequired && (
            <div
              className="
                flex
                items-center
                gap-3
                text-sm
                text-zinc-300
              "
            >
              <ClipboardCheck
                size={19}
                className="shrink-0 text-cyan-400"
              />

              <span>
                Online registration required
              </span>
            </div>
          )}
        </div>

        {/* ====================================================
            Footer
            ==================================================== */}

        <div
          className="
            mt-6
            border-t
            border-zinc-800
            pt-5
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            {/* Fee */}

            <div>
              <p className="text-xs text-zinc-500">
                Registration Fee
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-cyan-400
                "
              >
                {getRegistrationFee(
                  event,
                )}
              </p>
            </div>

            {/* Details */}

            <Link
              to={`/events/${eventId}`}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-cyan-400
                px-5
                py-3
                text-sm
                font-bold
                text-zinc-950
                transition
                hover:bg-cyan-300
                hover:shadow-lg
                hover:shadow-cyan-400/20
              "
            >
              View Details

              <ArrowRight
                size={16}
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}