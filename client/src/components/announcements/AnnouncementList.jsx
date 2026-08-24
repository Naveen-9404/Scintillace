import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementList({
  announcements = [],
  loading = false,
  error = "",
}) {
  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2">

        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
          />
        ))}

      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
        {error}
      </div>
    );
  }

  if (!announcements.length) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
        <h3 className="text-xl font-semibold text-white">
          No announcements
        </h3>

        <p className="mt-2 text-zinc-500">
          There are no announcements available
          right now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {announcements.map(
        (announcement) => (
          <AnnouncementCard
            key={
              announcement.id ||
              announcement._id
            }
            announcement={
              announcement
            }
          />
        ),
      )}
    </div>
  );
}