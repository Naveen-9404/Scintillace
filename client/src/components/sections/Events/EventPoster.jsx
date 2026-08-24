/**
 * ============================================================
 * Event Poster
 * ============================================================
 *
 * Generates a clean event-specific visual poster.
 *
 * The poster intentionally contains only the event name.
 * No venue, date, fee, coordinator, or registration details
 * are displayed inside the poster.
 */

const EVENT_POSTER_THEMES = {
  WORKSHOP: {
    accent: "from-cyan-400 via-blue-500 to-violet-600",
    glow: "bg-cyan-500/20",
  },

  TECHNICAL: {
    accent: "from-cyan-400 via-violet-500 to-fuchsia-500",
    glow: "bg-violet-500/20",
  },

  CULTURAL: {
    accent: "from-fuchsia-400 via-purple-500 to-pink-500",
    glow: "bg-fuchsia-500/20",
  },

  SPORTS: {
    accent: "from-emerald-400 via-cyan-500 to-blue-500",
    glow: "bg-emerald-500/20",
  },

  LITERARY: {
    accent: "from-amber-300 via-orange-500 to-red-500",
    glow: "bg-orange-500/20",
  },

  GAMING: {
    accent: "from-purple-400 via-fuchsia-500 to-pink-500",
    glow: "bg-purple-500/20",
  },

  OTHER: {
    accent: "from-cyan-400 via-blue-500 to-violet-600",
    glow: "bg-cyan-500/20",
  },
};

export default function EventPoster({
  event,
  className = "",
}) {
  const title =
    event?.title ||
    "Scintillace Event";

  const category =
    event?.category || "OTHER";

  const theme =
    EVENT_POSTER_THEMES[
      category
    ] ||
    EVENT_POSTER_THEMES.OTHER;

  return (
    <div
      className={`
        relative
        flex
        h-full
        min-h-[220px]
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-[#050816]
        ${className}
      `}
    >
      {/* ======================================================
          Ambient Glow
          ====================================================== */}

      <div
        className={`
          absolute
          -left-20
          -top-20
          h-64
          w-64
          rounded-full
          blur-3xl
          ${theme.glow}
        `}
      />

      <div
        className={`
          absolute
          -bottom-24
          -right-20
          h-72
          w-72
          rounded-full
          blur-3xl
          ${theme.glow}
        `}
      />

      {/* ======================================================
          Decorative Grid
          ====================================================== */}

      <div
        className="
          absolute
          inset-0
          opacity-20
          [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
          [background-size:40px_40px]
        "
      />

      {/* ======================================================
          Border Frame
          ====================================================== */}

      <div
        className="
          absolute
          inset-5
          rounded-2xl
          border
          border-white/10
        "
      />

      {/* ======================================================
          Accent Lines
          ====================================================== */}

      <div
        className={`
          absolute
          left-0
          top-0
          h-1
          w-full
          bg-gradient-to-r
          ${theme.accent}
        `}
      />

      <div
        className={`
          absolute
          bottom-0
          left-0
          h-1
          w-full
          bg-gradient-to-r
          ${theme.accent}
        `}
      />

      {/* ======================================================
          Content
          ====================================================== */}

      <div className="relative z-10 px-8 text-center">
        <div
          className={`
            mx-auto
            mb-5
            h-1
            w-16
            rounded-full
            bg-gradient-to-r
            ${theme.accent}
          `}
        />

        <h2
          className="
            max-w-2xl
            text-3xl
            font-black
            uppercase
            leading-tight
            tracking-tight
            text-white
            drop-shadow-2xl
            sm:text-4xl
          "
        >
          {title}
        </h2>

        <div
          className={`
            mx-auto
            mt-5
            h-1
            w-16
            rounded-full
            bg-gradient-to-r
            ${theme.accent}
          `}
        />
      </div>
    </div>
  );
}