import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  IndianRupee,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { useEvent } from "../../hooks/useEvents";

import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorMessage from "../../components/common/ErrorMessage";

import EventPoster from "../../components/sections/Events/EventPoster";

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

const formatEventDate = (value) => {
  if (!value) {
    return "To Be Announced";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "To Be Announced";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getParticipationText = (type) => {
  return String(type).toUpperCase() === "TEAM"
    ? "Team Event"
    : "Individual Event";
};

const getRegistrationFeeText = (event) => {
  const fee = Number(event?.registrationFee) || 0;

  if (fee <= 0) {
    return "FREE";
  }

  const unit =
    String(event?.type).toUpperCase() === "TEAM"
      ? "team"
      : "person";

  return `₹${fee} / ${unit}`;
};

const getRegistrationText = (event) => {
  if (!event?.registrationRequired) {
    return "No Registration";
  }

  if (event?.registrationOpen) {
    return "Online Registration";
  }

  return "Registration Closed";
};

/**
 * ============================================================
 * Information Card
 * ============================================================
 */

function EventInfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-zinc-800
        bg-zinc-900/70
        p-5
        transition
        duration-300
        hover:border-cyan-500/30
      "
    >
      <div
        className="
          mb-5
          flex h-11 w-11
          items-center justify-center
          rounded-full
          bg-cyan-500/10
          text-cyan-400
        "
      >
        <Icon size={20} />
      </div>

      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p
        className="
          mt-2
          text-base
          font-semibold
          leading-6
          text-white
        "
      >
        {value}
      </p>
    </div>
  );
}

/**
 * ============================================================
 * Section Heading
 * ============================================================
 */

function SectionHeading({
  eyebrow,
  title,
  icon: Icon,
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p
          className="
            mb-2
            text-xs
            font-bold
            uppercase
            tracking-[0.28em]
            text-cyan-400
          "
        >
          {eyebrow}
        </p>
      )}

      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            size={24}
            className="text-cyan-400"
          />
        )}

        <h2
          className="
            text-3xl
            font-bold
            tracking-tight
            text-white
            md:text-4xl
          "
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

/**
 * ============================================================
 * Event Details Page
 * ============================================================
 */

export default function EventDetails() {
  const { id } = useParams();

  /**
   * ==========================================================
   * Fetch Event
   * ==========================================================
   */

  const {
    data,
    isLoading,
    isError,
    error,
  } = useEvent(id);

  /**
   * ==========================================================
   * Normalize Event Response
   * ==========================================================
   */

  const event =
    data?.data?.event ||
    data?.data ||
    data?.event ||
    data ||
    null;

  /**
   * ==========================================================
   * Loading
   * ==========================================================
   */

  if (isLoading) {
    return <LoadingScreen />;
  }

  /**
   * ==========================================================
   * Error / Not Found
   * ==========================================================
   */

  if (isError || !event) {
    return (
      <main
        className="
          min-h-screen
          bg-slate-950
          px-4
          py-20
        "
      >
        <div className="mx-auto max-w-3xl">
          {isError ? (
            <ErrorMessage
              message={
                error?.response?.data?.message ||
                "Unable to load event details."
              }
            />
          ) : (
            <div
              className="
                rounded-3xl
                border border-zinc-800
                bg-zinc-900
                p-12
                text-center
              "
            >
              <h1
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Event Not Found
              </h1>

              <p
                className="
                  mt-3
                  text-zinc-400
                "
              >
                The requested event
                could not be found.
              </p>

              <Link
                to="/events"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-cyan-400
                  px-6
                  py-3
                  font-semibold
                  text-slate-950
                  transition
                  hover:bg-cyan-300
                "
              >
                <ArrowLeft size={18} />

                Back to Events
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  /**
   * ==========================================================
   * Derived Event Data
   * ==========================================================
   */

  const date = formatEventDate(
    event.startDateTime,
  );

  const participation =
    getParticipationText(event.type);

  const registrationFee =
    getRegistrationFeeText(event);

  const registrationText =
    getRegistrationText(event);

  const rules = Array.isArray(event.rules)
    ? event.rules.filter(Boolean)
    : [];

  const highlights =
    Array.isArray(event.highlights)
      ? event.highlights.filter(Boolean)
      : [];
  /**
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
    <main
      className="
        min-h-screen
        bg-slate-950
        text-white
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          pt-36
          pb-8
          sm:px-6
          md:pt-40
          lg:px-8
        "
      >
        {/* ====================================================
            Back Button
            ==================================================== */}

        <Link
          to="/events"
          className="
            mb-10
            inline-flex
            items-center
            gap-2
            rounded-full
            border border-zinc-700
            bg-zinc-900/60
            px-5
            py-2.5
            text-sm
            font-semibold
            text-zinc-200
            transition
            hover:border-cyan-500
            hover:text-white
          "
        >
          <ArrowLeft size={17} />

          Back to Events
        </Link>

        {/* ====================================================
            HERO
            ==================================================== */}

        <section
          className="
            grid
            items-center
            gap-10
            lg:grid-cols-2
            lg:gap-14
          "
        >
          {/* ==================================================
              Hero Content
              ================================================== */}

          <div>
            <div
              className="
                mb-6
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className="
                  rounded-full
                  border border-cyan-500/30
                  bg-cyan-500/10
                  px-4 py-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-400
                "
              >
                Scintillace 2K26
              </span>

              {event.category && (
                <span
                  className="
                    rounded-full
                    bg-violet-600
                    px-4 py-2
                    text-xs
                    font-bold
                    uppercase
                    text-white
                  "
                >
                  {event.category}
                </span>
              )}
            </div>

            <h1
              className="
                max-w-3xl
                text-4xl
                font-black
                leading-[1.05]
                tracking-tight
                text-white
                sm:text-5xl
                lg:text-6xl
              "
            >
              {event.title}
            </h1>

            {event.description && (
              <p
                className="
                  mt-7
                  max-w-2xl
                  text-base
                  leading-7
                  text-zinc-400
                  sm:text-lg
                "
              >
                {event.description}
              </p>
            )}

            {/* Registration Status */}

            <div className="mt-8">
              {event.registrationRequired &&
              event.registrationOpen ? (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-emerald-500/30
                    bg-emerald-500/10
                    px-4 py-2
                    text-sm
                    font-semibold
                    text-emerald-400
                  "
                >
                  <span
                    className="
                      h-2 w-2
                      rounded-full
                      bg-emerald-400
                    "
                  />

                  Registration Open
                </span>
              ) : (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border border-zinc-700
                    bg-zinc-900
                    px-4 py-2
                    text-sm
                    font-semibold
                    text-zinc-400
                  "
                >
                  {registrationText}
                </span>
              )}
            </div>
          </div>

          {/* ==================================================
              Event Poster
              ================================================== */}

          <div
            className="
              overflow-hidden
              rounded-3xl
              border border-cyan-500/20
              bg-zinc-950
              shadow-2xl
              shadow-cyan-500/5
            "
          >
            <EventPoster
              event={event}
              className="
                min-h-[320px]
                sm:min-h-[380px]
              "
            />
          </div>
        </section>

        {/* ====================================================
            EVENT INFORMATION
            ==================================================== */}

        <section className="mt-20">
          <SectionHeading
            eyebrow="Event Overview"
            title="Event Information"
          />

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <EventInfoCard
              icon={CalendarDays}
              label="Date"
              value={date}
            />

            <EventInfoCard
              icon={Users}
              label="Participation"
              value={participation}
            />

            <EventInfoCard
              icon={IndianRupee}
              label="Registration Fee"
              value={registrationFee}
            />

            <EventInfoCard
              icon={Trophy}
              label="Prizes"
              value={
                event.prizePool ||
                "Exciting Prizes"
              }
            />

            <EventInfoCard
              icon={ClipboardCheck}
              label="Registration"
              value={registrationText}
            />

            <EventInfoCard
              icon={Award}
              label="Certificate"
              value="Participation Certificate"
            />
          </div>
        </section>

        {/* ====================================================
            RULES & HIGHLIGHTS
            ==================================================== */}

        <section
          className="
            mt-16
            grid
            gap-6
            lg:grid-cols-2
          "
        >
          {/* ==================================================
              Rules
              ================================================== */}

          <div
            className="
              rounded-3xl
              border border-zinc-800
              bg-zinc-900/70
              p-7
              md:p-8
            "
          >
            <div
              className="
                mb-6
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11 w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/10
                  text-violet-400
                "
              >
                <ClipboardCheck size={21} />
              </div>

              <h2
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Rules & Regulations
              </h2>
            </div>

            {rules.length > 0 ? (
              <ol className="space-y-4">
                {rules.map(
                  (rule, index) => (
                    <li
                      key={`${rule}-${index}`}
                      className="
                        flex
                        gap-4
                        text-sm
                        leading-6
                        text-zinc-300
                      "
                    >
                      <span
                        className="
                          flex
                          h-7 w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-violet-500/15
                          text-xs
                          font-bold
                          text-violet-400
                        "
                      >
                        {index + 1}
                      </span>

                      <span>{rule}</span>
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <p className="text-zinc-500">
                Rules will be announced soon.
              </p>
            )}
          </div>

          {/* ==================================================
              Highlights
              ================================================== */}

          <div
            className="
              rounded-3xl
              border border-zinc-800
              bg-zinc-900/70
              p-7
              md:p-8
            "
          >
            <div
              className="
                mb-6
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11 w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                  text-cyan-400
                "
              >
                <Sparkles size={21} />
              </div>

              <h2
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Highlights
              </h2>
            </div>

            {highlights.length > 0 ? (
              <ul className="space-y-4">
                {highlights.map(
                  (highlight, index) => (
                    <li
                      key={`${highlight}-${index}`}
                      className="
                        flex
                        items-start
                        gap-3
                        text-sm
                        leading-6
                        text-zinc-300
                      "
                    >
                      <CheckCircle2
                        size={19}
                        className="
                          mt-0.5
                          shrink-0
                          text-cyan-400
                        "
                      />

                      <span>
                        {highlight}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="text-zinc-500">
                Event highlights will be
                announced soon.
              </p>
            )}
          </div>
        </section>

        {/* ====================================================
            ABOUT EVENT
            ==================================================== */}

        <section className="mt-16">
          <div
            className="
              rounded-3xl
              border border-cyan-500/20
              bg-slate-950/80
              p-7
              md:p-10
            "
          >
            <p
              className="
                mb-3
                text-xs
                font-bold
                uppercase
                tracking-[0.28em]
                text-cyan-400
              "
            >
              About
            </p>

            <h2
              className="
                text-3xl
                font-bold
                text-white
              "
            >
              About the Event
            </h2>

            <p
              className="
                mt-5
                max-w-5xl
                text-base
                leading-8
                text-zinc-300
              "
            >
              {event.description ||
                "Event details will be announced soon."}
            </p>
          </div>
        </section>

        {/* ====================================================
            REGISTRATION CTA
            ==================================================== */}

        <section
          className="
            relative
            mt-16
            overflow-hidden
            rounded-3xl
            border border-violet-500/30
            bg-gradient-to-r
            from-cyan-600
            via-violet-600
            to-fuchsia-600
            p-8
            text-center
            md:p-12
          "
        >
          {/* Decorative Glow */}

          <div
            className="
              pointer-events-none
              absolute
              -left-20
              -top-20
              h-64 w-64
              rounded-full
              bg-cyan-400/20
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -right-20
              h-72 w-72
              rounded-full
              bg-fuchsia-400/20
              blur-3xl
            "
          />

          <div className="relative z-10">
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.3em]
                text-white/80
              "
            >
              Registration
            </p>

            <h2
              className="
                mt-3
                text-3xl
                font-black
                text-white
                md:text-4xl
              "
            >
              Ready to Participate?
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-white/80
              "
            >
              Secure your place in this
              event and be part of
              Scintillace 2K26.
            </p>

            <div
              className="
                mx-auto
                mt-8
                grid
                max-w-3xl
                gap-6
                md:grid-cols-3
              "
            >
              <div>
                <p className="text-sm text-white/70">
                  Registration Fee
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                    text-white
                  "
                >
                  {registrationFee}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/70">
                  Participation
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                    text-white
                  "
                >
                  {participation}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/70">
                  Date
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                    text-white
                  "
                >
                  {date}
                </p>
              </div>
            </div>

            {/* ==================================================
                Register Button
                ================================================== */}

            {event.registrationRequired &&
            event.registrationOpen ? (
              <Link
                to={`/events/${
                  event._id || event.id
                }/register`}
                className="
                  mt-9
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-white
                  px-8 py-3.5
                  font-bold
                  text-violet-700
                  shadow-xl
                  transition
                  hover:-translate-y-0.5
                  hover:bg-zinc-100
                "
              >
                <ClipboardCheck size={18} />

                Register Now
              </Link>
            ) : (
              <span
                className="
                  mt-9
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-zinc-700/80
                  px-8 py-3.5
                  font-bold
                  text-zinc-300
                "
              >
                {registrationText}
              </span>
            )}
          </div>
        </section>

        <div className="h-16" />
      </div>
    </main>
  );
}