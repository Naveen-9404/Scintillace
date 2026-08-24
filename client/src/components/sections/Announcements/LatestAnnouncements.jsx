import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  Bell,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getPublishedAnnouncements,
} from "../../../api/announcements.api";

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

const getPriorityClasses = (
  priority,
) => {
  switch (priority) {
    case "URGENT":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "HIGH":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    default:
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
  }
};

export default function LatestAnnouncements() {
  const [
    announcements,
    setAnnouncements,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const loadAnnouncements =
      async () => {
        try {
          const result =
            await getPublishedAnnouncements(
              {
                page: 1,
                limit: 3,
              },
            );

          setAnnouncements(
            result?.announcements ||
              [],
          );
        } catch (error) {
          console.error(
            "Failed to load latest announcements:",
            error,
          );
        } finally {
          setLoading(false);
        }
      };

    loadAnnouncements();
  }, []);

  return (
    <section
      id="announcements"
      className="relative overflow-hidden bg-slate-950 py-24"
    >
      <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Header */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="flex items-center gap-3 text-cyan-400">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <Bell size={19} />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.25em]">
                Stay Updated
              </span>

            </div>

            <h2 className="mt-5 text-3xl font-black text-white md:text-5xl">
              Latest Announcements
            </h2>

            <p className="mt-4 max-w-2xl text-slate-400">
              Stay informed about important Scintillace
              updates, registration information, and event
              changes.
            </p>

          </div>

          <Link
            to="/announcements"
            className="
              inline-flex
              items-center
              gap-2
              self-start
              rounded-xl
              border
              border-cyan-400/20
              px-5
              py-3
              text-sm
              font-semibold
              text-cyan-400
              transition
              hover:border-cyan-400/40
              hover:bg-cyan-400/5
            "
          >
            View All
            <ArrowRight size={17} />
          </Link>

        </div>

        {/* Content */}

        <div className="mt-10">

          {loading && (
            <div className="grid gap-5 md:grid-cols-3">

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      h-56
                      animate-pulse
                      rounded-3xl
                      border
                      border-white/5
                      bg-white/[0.03]
                    "
                  />
                ),
              )}

            </div>
          )}

          {!loading &&
            announcements.length ===
              0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

                <Bell
                  size={34}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-4 text-slate-500">
                  No announcements yet.
                </p>

              </div>
            )}

          {!loading &&
            announcements.length >
              0 && (
              <div className="grid gap-5 md:grid-cols-3">

                {announcements.map(
                  (
                    announcement,
                  ) => (
                    <article
                      key={
                        announcement.id ||
                        announcement._id
                      }
                      className="
                        group
                        rounded-3xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-6
                        transition
                        duration-300
                        hover:-translate-y-1
                        hover:border-cyan-400/20
                        hover:bg-white/[0.05]
                      "
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                          <Bell size={18} />
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getPriorityClasses(
                            announcement.priority,
                          )}`}
                        >
                          {
                            announcement.priority ||
                            "NORMAL"
                          }
                        </span>

                      </div>

                      <h3 className="mt-5 line-clamp-2 text-xl font-bold text-white">
                        {
                          announcement.title
                        }
                      </h3>

                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">
                        {
                          announcement.message
                        }
                      </p>

                      <div className="mt-5 text-xs text-slate-600">
                        {formatDate(
                          announcement.publishedAt,
                        )}
                      </div>

                    </article>
                  ),
                )}

              </div>
            )}

        </div>

      </div>
    </section>
  );
}