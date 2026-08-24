import { Link } from "react-router-dom";

import {
  CalendarDays,
  Users,
  Trophy,
  ClipboardCheck,
  IndianRupee,
  Sparkles,
} from "lucide-react";

import EventPoster from "./EventPoster";

export default function EventCard({
  event,
}) {
  const eventId =
    event?._id || event?.id;

  const isRegistrationOpen =
    Boolean(
      event?.registrationOpen,
    );

  const isFeatured =
    Boolean(event?.isFeatured);

  const date =
    event?.startDateTime
      ? new Date(
          event.startDateTime,
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
          },
        )
      : null;

  const participation =
    event?.type === "TEAM"
      ? "Team Event"
      : "Individual Event";

  const fee =
    Number(event?.registrationFee) ||
    0;

  const feeText =
    fee > 0
      ? `₹${fee} / ${
          event?.type === "TEAM"
            ? "team"
            : "person"
        }`
      : "FREE";

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/90
        shadow-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-500/70
        hover:shadow-cyan-500/10
      "
    >
      {/* ======================================================
          Poster
          ====================================================== */}

      <Link
        to={`/events/${eventId}`}
        className="
          relative
          block
          h-64
          overflow-hidden
        "
      >
        <EventPoster
          event={event}
          className="
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        {/* Category */}

        {event?.category && (
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
              text-slate-950
              shadow-lg
            "
          >
            {event.category}
          </span>
        )}

        {/* Registration */}

        {isRegistrationOpen && (
          <span
            className="
              absolute
              right-4
              top-4
              rounded-full
              bg-emerald-500
              px-3
              py-1
              text-xs
              font-bold
              text-white
              shadow-lg
            "
          >
            Registration Open
          </span>
        )}

        {/* Featured */}

        {isFeatured && (
          <span
            className="
              absolute
              bottom-4
              left-4
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-violet-600
              px-3
              py-1
              text-xs
              font-semibold
              text-white
              shadow-lg
            "
          >
            <Sparkles size={13} />
            Featured
          </span>
        )}
      </Link>

      {/* ======================================================
          Content
          ====================================================== */}

      <div className="p-6">
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

        <div className="mt-6 space-y-3">
          {/* Date */}

          {date && (
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

              <span>{date}</span>
            </div>
          )}

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
              {participation}
            </span>
          </div>

          {/* Prize */}

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
                "Exciting Prizes"}
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
            Bottom Action
            ==================================================== */}

        <div
          className="
            mt-7
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p className="text-xs text-zinc-500">
              Registration Fee
            </p>

            <p
              className="
                mt-1
                flex
                items-center
                gap-1
                text-lg
                font-bold
                text-cyan-400
              "
            >
              <IndianRupee size={17} />

              {feeText.replace(
                "₹",
                "",
              )}
            </p>
          </div>

          <Link
            to={`/events/${eventId}`}
            className="
              rounded-full
              bg-cyan-400
              px-6
              py-3
              text-sm
              font-bold
              text-slate-950
              transition
              hover:bg-cyan-300
              hover:shadow-lg
              hover:shadow-cyan-400/20
            "
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}