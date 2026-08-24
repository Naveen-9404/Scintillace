const priorityStyles = {
  LOW: {
    label: "Low",
    className:
      "bg-zinc-800 text-zinc-300",
  },

  NORMAL: {
    label: "Normal",
    className:
      "bg-blue-500/10 text-blue-300",
  },

  HIGH: {
    label: "High",
    className:
      "bg-amber-500/10 text-amber-300",
  },

  URGENT: {
    label: "Urgent",
    className:
      "bg-red-500/10 text-red-300",
  },
};

const scopeLabels = {
  GLOBAL: "General",
  FESTIVAL: "Festival",
  EVENT: "Event",
};

export default function AnnouncementCard({
  announcement,
}) {
  const priority =
    priorityStyles[
      announcement?.priority
    ] ||
    priorityStyles.NORMAL;

  const publishedDate =
    announcement?.publishedAt
      ? new Date(
          announcement.publishedAt,
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          },
        )
      : null;

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-violet-500/40">

      <div className="flex flex-wrap items-center gap-2">

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${priority.className}`}
        >
          {priority.label}
        </span>

        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
          {scopeLabels[
            announcement?.scope
          ] ||
            "Announcement"}
        </span>

      </div>

      <h3 className="mt-4 text-xl font-bold text-white">
        {announcement?.title}
      </h3>

      <p className="mt-3 whitespace-pre-line leading-7 text-zinc-400">
        {announcement?.message}
      </p>

      {publishedDate && (
        <p className="mt-5 text-xs text-zinc-500">
          Published {publishedDate}
        </p>
      )}

    </article>
  );
}