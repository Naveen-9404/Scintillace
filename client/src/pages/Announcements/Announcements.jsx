import { useState } from "react";

import {
  Search,
  Bell,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  Megaphone,
} from "lucide-react";

import useAnnouncements from "../../hooks/useAnnouncements";

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

const formatDate = (date) => {
  if (!date) {
    return "Recently";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

const getPriorityStyles = (
  priority,
) => {
  switch (priority) {
    case "URGENT":
      return {
        badge:
          "border-red-400/30 bg-red-400/10 text-red-300",
        icon:
          "bg-red-400/10 text-red-300",
      };

    case "HIGH":
      return {
        badge:
          "border-orange-400/30 bg-orange-400/10 text-orange-300",
        icon:
          "bg-orange-400/10 text-orange-300",
      };

    case "LOW":
      return {
        badge:
          "border-slate-400/20 bg-slate-400/10 text-slate-300",
        icon:
          "bg-slate-400/10 text-slate-300",
      };

    case "NORMAL":
    default:
      return {
        badge:
          "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
        icon:
          "bg-cyan-400/10 text-cyan-300",
      };
  }
};

const getScopeLabel = (
  scope,
) => {
  switch (scope) {
    case "EVENT":
      return "Event";

    case "FESTIVAL":
      return "Festival";

    case "GLOBAL":
    default:
      return "General";
  }
};

/**
 * ============================================================
 * Announcement Card
 * ============================================================
 */

function AnnouncementCard({
  announcement,
}) {
  const priority =
    announcement?.priority ||
    "NORMAL";

  const styles =
    getPriorityStyles(
      priority,
    );

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        shadow-xl
        shadow-black/10
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400/20
        hover:bg-white/[0.06]
      "
    >
      <div className="p-6 md:p-7">

        {/* Header */}
        <div className="flex items-start gap-4">

          <div
            className={`
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              ${styles.icon}
            `}
          >
            {priority === "URGENT" ||
            priority === "HIGH" ? (
              <AlertTriangle
                size={22}
              />
            ) : (
              <Megaphone
                size={22}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <h2
                className="
                  text-lg
                  font-bold
                  leading-tight
                  text-white
                  transition-colors
                  group-hover:text-cyan-300
                  md:text-xl
                "
              >
                {announcement?.title ||
                  "Announcement"}
              </h2>

              <span
                className={`
                  rounded-full
                  border
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  ${styles.badge}
                `}
              >
                {priority}
              </span>

            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  size={13}
                />
                {formatDate(
                  announcement?.publishedAt ||
                    announcement?.createdAt,
                )}
              </span>

              <span>
                {getScopeLabel(
                  announcement?.scope,
                )}
              </span>

            </div>

          </div>

        </div>

        {/* Message */}
        <div className="mt-6">

          <p
            className="
              whitespace-pre-line
              text-sm
              leading-7
              text-slate-300
              md:text-base
            "
          >
            {announcement?.message ||
              "No announcement message available."}
          </p>

        </div>

      </div>
    </article>
  );
}

/**
 * ============================================================
 * Loading Skeleton
 * ============================================================
 */

function AnnouncementSkeleton() {
  return (
    <div
      className="
        animate-pulse
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-6
        md:p-7
      "
    >
      <div className="flex gap-4">

        <div
          className="
            h-12
            w-12
            shrink-0
            rounded-2xl
            bg-white/10
          "
        />

        <div className="flex-1">

          <div
            className="
              h-5
              w-2/3
              rounded
              bg-white/10
            "
          />

          <div
            className="
              mt-3
              h-3
              w-1/3
              rounded
              bg-white/10
            "
          />

        </div>

      </div>

      <div className="mt-6 space-y-3">

        <div
          className="
            h-3
            w-full
            rounded
            bg-white/10
          "
        />

        <div
          className="
            h-3
            w-11/12
            rounded
            bg-white/10
          "
        />

        <div
          className="
            h-3
            w-3/4
            rounded
            bg-white/10
          "
        />

      </div>
    </div>
  );
}

/**
 * ============================================================
 * Empty State
 * ============================================================
 */

function EmptyState({
  search,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-dashed
        border-white/10
        bg-white/[0.03]
        px-6
        py-16
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-cyan-400/10
          text-cyan-300
        "
      >
        <Bell size={28} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        {search
          ? "No announcements found"
          : "No announcements yet"}
      </h2>

      <p
        className="
          mx-auto
          mt-3
          max-w-xl
          text-sm
          leading-6
          text-slate-500
        "
      >
        {search
          ? "Try a different search term to find the announcement you are looking for."
          : "Important updates, registration information, event notices, and festival announcements will appear here."}
      </p>
    </div>
  );
}

/**
 * ============================================================
 * Error State
 * ============================================================
 */

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-red-400/20
        bg-red-400/[0.05]
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-red-400/10
          text-red-300
        "
      >
        <AlertTriangle
          size={25}
        />
      </div>

      <h2 className="mt-5 text-lg font-bold text-white">
        Unable to load announcements
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
        {message ||
          "Something went wrong while loading the announcements."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="
          mt-6
          inline-flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          transition-all
          hover:border-cyan-400/40
          hover:bg-cyan-400/10
          hover:text-cyan-300
        "
      >
        <RefreshCw
          size={16}
        />
        Try Again
      </button>
    </div>
  );
}

/**
 * ============================================================
 * Announcements Page
 * ============================================================
 */

export default function Announcements() {
  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const limit = 10;

  const {
    announcements,
    pagination,
    loading,
    error,
    refetch,
  } = useAnnouncements({
    page,
    limit,
    search,
  });

  /**
   * ----------------------------------------------------------
   * Search
   * ----------------------------------------------------------
   */

  const handleSearchSubmit = (
    event,
  ) => {
    event.preventDefault();

    setPage(1);
    setSearch(
      searchInput.trim(),
    );
  };

  /**
   * ----------------------------------------------------------
   * Clear Search
   * ----------------------------------------------------------
   */

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  /**
   * ----------------------------------------------------------
   * Pagination
   * ----------------------------------------------------------
   */

  const totalPages =
    Number(
      pagination?.totalPages,
    ) || 0;

  const currentPage =
    Number(
      pagination?.page,
    ) || page;

  const canGoPrevious =
    currentPage > 1;

  const canGoNext =
    totalPages > 0 &&
    currentPage < totalPages;

  const handlePrevious = () => {
    if (!canGoPrevious) {
      return;
    }

    setPage(
      (previousPage) =>
        Math.max(
          1,
          previousPage - 1,
        ),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (!canGoNext) {
      return;
    }

    setPage(
      (previousPage) =>
        previousPage + 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * ----------------------------------------------------------
   * Render
   * ----------------------------------------------------------
   */

  return (
    <main
      className="
        min-h-screen
        bg-slate-950
        text-white
      "
    >
      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          border-b
          border-white/10
          pt-36
          pb-16
          md:pt-40
          md:pb-20
        "
      >
        {/* Background Effects */}

        <div
          className="
            pointer-events-none
            absolute
            -left-32
            top-20
            h-72
            w-72
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            top-10
            h-80
            w-80
            rounded-full
            bg-blue-600/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-7xl
            px-6
          "
        >

          <div className="max-w-3xl">

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/10
                px-4
                py-2
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-cyan-300
              "
            >
              <Bell size={14} />
              FestSphere Updates
            </div>

            <h1
              className="
                mt-6
                text-4xl
                font-black
                tracking-tight
                text-white
                sm:text-5xl
                md:text-6xl
              "
            >
              Announcements
            </h1>

            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-slate-400
                md:text-lg
              "
            >
              Stay updated with the latest information
              about events, registrations, schedules,
              and everything happening at Scintillace.
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">

        {/* Search */}

        <div
          className="
            mb-10
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <form
            onSubmit={
              handleSearchSubmit
            }
            className="
              flex
              w-full
              max-w-2xl
              gap-3
            "
          >

            <div className="relative flex-1">

              <Search
                size={19}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                type="search"
                value={
                  searchInput
                }
                onChange={(event) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
                placeholder="Search announcements..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  py-3.5
                  pl-12
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  transition-all
                  focus:border-cyan-400/40
                  focus:bg-white/[0.06]
                  focus:ring-2
                  focus:ring-cyan-400/10
                "
              />

            </div>

            <button
              type="submit"
              className="
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500
                via-sky-500
                to-blue-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-cyan-500/20
                transition-all
                hover:-translate-y-0.5
                hover:shadow-cyan-500/30
              "
            >
              Search
            </button>

          </form>

          {search && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              className="
                self-start
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-300
                transition-all
                hover:border-cyan-400/30
                hover:text-cyan-300
                lg:self-auto
              "
            >
              Clear Search
            </button>
          )}

        </div>

        {/* Result information */}

        {!loading &&
          !error && (
            <div className="mb-6 flex items-center justify-between">

              <p className="text-sm text-slate-500">
                {pagination?.total !==
                  undefined
                  ? `${pagination.total} announcement${
                      pagination.total ===
                      1
                        ? ""
                        : "s"
                    }`
                  : `${announcements.length} announcement${
                      announcements.length ===
                      1
                        ? ""
                        : "s"
                    }`}
              </p>

              {search && (
                <p className="text-sm text-cyan-400">
                  Searching for "
                  {search}"
                </p>
              )}

            </div>
          )}

        {/* Loading */}

        {loading && (
          <div className="grid gap-5">

            <AnnouncementSkeleton />
            <AnnouncementSkeleton />
            <AnnouncementSkeleton />

          </div>
        )}

        {/* Error */}

        {!loading &&
          error && (
            <ErrorState
              message={error}
              onRetry={
                refetch
              }
            />
          )}

        {/* Empty */}

        {!loading &&
          !error &&
          announcements.length ===
            0 && (
            <EmptyState
              search={search}
            />
          )}

        {/* Announcements */}

        {!loading &&
          !error &&
          announcements.length >
            0 && (
            <div className="grid gap-5">

              {announcements.map(
                (
                  announcement,
                  index,
                ) => (
                  <AnnouncementCard
                    key={
                      announcement?._id ||
                      announcement?.id ||
                      index
                    }
                    announcement={
                      announcement
                    }
                  />
                ),
              )}

            </div>
          )}

        {/* Pagination */}

        {!loading &&
          !error &&
          announcements.length >
            0 &&
          totalPages > 1 && (
            <div
              className="
                mt-10
                flex
                items-center
                justify-center
                gap-4
              "
            >

              <button
                type="button"
                onClick={
                  handlePrevious
                }
                disabled={
                  !canGoPrevious
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-300
                  transition-all
                  hover:border-cyan-400/30
                  hover:text-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                <ChevronLeft
                  size={17}
                />
                Previous
              </button>

              <div
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {currentPage} /{" "}
                {totalPages}
              </div>

              <button
                type="button"
                onClick={
                  handleNext
                }
                disabled={
                  !canGoNext
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-300
                  transition-all
                  hover:border-cyan-400/30
                  hover:text-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                Next
                <ChevronRight
                  size={17}
                />
              </button>

            </div>
          )}

      </section>
    </main>
  );
}