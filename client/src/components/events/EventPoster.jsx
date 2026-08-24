/**
 * ============================================================
 * Scintillace Event Poster
 * ============================================================
 *
 * Clean event poster used on the Events listing page.
 *
 * Each event receives its own visual identity.
 * Only the event name is displayed on the poster.
 */

const POSTER_STYLES = {
  "Embedded & IoT with AI Workshop": {
    background:
      "bg-gradient-to-br from-cyan-950 via-slate-950 to-violet-950",

    glow:
      "bg-cyan-400/20",

    accent:
      "border-cyan-400/30",

    text:
      "text-cyan-300",

    pattern:
      "from-cyan-400/10 to-transparent",
  },

  "Paper Presentation": {
    background:
      "bg-gradient-to-br from-violet-950 via-zinc-950 to-indigo-950",

    glow:
      "bg-violet-500/20",

    accent:
      "border-violet-400/30",

    text:
      "text-violet-300",

    pattern:
      "from-violet-400/10 to-transparent",
  },

  "Poster Presentation": {
    background:
      "bg-gradient-to-br from-fuchsia-950 via-zinc-950 to-purple-950",

    glow:
      "bg-fuchsia-500/20",

    accent:
      "border-fuchsia-400/30",

    text:
      "text-fuchsia-300",

    pattern:
      "from-fuchsia-400/10 to-transparent",
  },

  "Hardware Expo": {
    background:
      "bg-gradient-to-br from-orange-950 via-zinc-950 to-red-950",

    glow:
      "bg-orange-500/20",

    accent:
      "border-orange-400/30",

    text:
      "text-orange-300",

    pattern:
      "from-orange-400/10 to-transparent",
  },

  "Technical Quiz": {
    background:
      "bg-gradient-to-br from-emerald-950 via-zinc-950 to-cyan-950",

    glow:
      "bg-emerald-500/20",

    accent:
      "border-emerald-400/30",

    text:
      "text-emerald-300",

    pattern:
      "from-emerald-400/10 to-transparent",
  },

  "Spot Events": {
    background:
      "bg-gradient-to-br from-pink-950 via-zinc-950 to-purple-950",

    glow:
      "bg-pink-500/20",

    accent:
      "border-pink-400/30",

    text:
      "text-pink-300",

    pattern:
      "from-pink-400/10 to-transparent",
  },
};

const DEFAULT_STYLE = {
  background:
    "bg-gradient-to-br from-cyan-950 via-zinc-950 to-violet-950",

  glow:
    "bg-cyan-400/20",

  accent:
    "border-cyan-400/30",

  text:
    "text-cyan-300",

  pattern:
    "from-cyan-400/10 to-transparent",
};

function formatTitle(title = "") {
  const words = title.trim().split(/\s+/);

  if (words.length <= 2) {
    return (
      <span>{title}</span>
    );
  }

  /*
   * Keep longer event names visually balanced.
   *
   * Example:
   *
   * Embedded & IoT with AI Workshop
   *
   * becomes:
   *
   * EMBEDDED & IoT
   * WITH AI
   * WORKSHOP
   */

  const lines = [];

  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (
      nextLine.length > 18 &&
      currentLine
    ) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return (
    <>
      {lines.map(
        (line, index) => (
          <span
            key={`${line}-${index}`}
            className="block"
          >
            {line}
          </span>
        ),
      )}
    </>
  );
}

export default function EventPoster({
  event,
}) {
  const style =
    POSTER_STYLES[
      event?.title
    ] || DEFAULT_STYLE;

  return (
    <div
      className={`
        relative
        flex
        aspect-[16/9]
        w-full
        items-center
        justify-center
        overflow-hidden
        ${style.background}
      `}
    >
      {/* ====================================================
          Decorative glow
          ==================================================== */}

      <div
        className={`
          absolute
          -left-16
          -top-20
          h-48
          w-48
          rounded-full
          blur-3xl
          ${style.glow}
        `}
      />

      <div
        className={`
          absolute
          -bottom-20
          -right-16
          h-48
          w-48
          rounded-full
          blur-3xl
          ${style.glow}
        `}
      />

      {/* ====================================================
          Circuit-style decorative lines
          ==================================================== */}

      <div className="absolute inset-0 opacity-40">
        <div
          className={`
            absolute
            left-0
            top-8
            h-px
            w-1/3
            bg-gradient-to-r
            ${style.pattern}
          `}
        />

        <div
          className={`
            absolute
            right-0
            top-16
            h-px
            w-1/4
            bg-gradient-to-l
            ${style.pattern}
          `}
        />

        <div
          className={`
            absolute
            bottom-10
            left-1/4
            h-px
            w-1/2
            bg-gradient-to-r
            ${style.pattern}
          `}
        />

        <div
          className={`
            absolute
            bottom-20
            right-10
            h-16
            w-px
            bg-gradient-to-b
            ${style.pattern}
          `}
        />

        <div
          className={`
            absolute
            left-10
            top-1/4
            h-16
            w-px
            bg-gradient-to-b
            ${style.pattern}
          `}
        />
      </div>

      {/* ====================================================
          Inner border
          ==================================================== */}

      <div
        className={`
          absolute
          inset-4
          rounded-xl
          border
          ${style.accent}
        `}
      />

      {/* ====================================================
          Event Name
          ==================================================== */}

      <div
        className="
          relative
          z-10
          px-8
          text-center
        "
      >
        <h3
          className={`
            text-2xl
            font-black
            uppercase
            leading-tight
            tracking-wide
            text-white
            drop-shadow-2xl
            md:text-3xl
          `}
        >
          {formatTitle(
            event?.title,
          )}
        </h3>

        {/* Small Scintillace accent */}
        <div
          className={`
            mx-auto
            mt-4
            h-1
            w-16
            rounded-full
            ${style.text.replace(
              "text-",
              "bg-",
            )}
          `}
        />
      </div>
    </div>
  );
}