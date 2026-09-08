import {
  useMemo,
  useState,
} from "react";

import {
  usePublishedEvents,
} from "../../hooks/useEvents";

import LoadingScreen from "../../components/common/LoadingScreen";
import ErrorMessage from "../../components/common/ErrorMessage";

import EventCard from "../../components/sections/Events/EventCard";
import EventFilters from "../../components/sections/Events/EventFilters";

const DEFAULT_FILTERS =
  Object.freeze({
    page: 1,
    limit: 12,
    status: "PUBLISHED",
    category: "",
    q: "",
    sortBy: "startDateTime",
    sortOrder: "asc",
  });

export default function Events() {
  /**
   * ============================================================
   * Filters
   * ============================================================
   */

  const [
    filters,
    setFilters,
  ] = useState(
    DEFAULT_FILTERS,
  );

  /**
   * ============================================================
   * Query Parameters
   * ============================================================
   */

  const queryParams =
    useMemo(() => {
      const params = {
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder:
          filters.sortOrder,
      };

      if (filters.category) {
        params.category =
          filters.category;
      }

      if (filters.q?.trim()) {
        params.q =
          filters.q.trim();
      }

      return params;
    }, [filters]);

  /**
   * ============================================================
   * Events Query
   * ============================================================
   */

  const {
  data,
  isLoading,
  isFetching,
  isError,
  error,
} = usePublishedEvents(
  queryParams,
);

  /**
   * ============================================================
   * Normalize API Response
   * ============================================================
   *
   * IMPORTANT:
   * This useMemo is intentionally BEFORE any return.
   */

  const normalizedData =
    useMemo(() => {
      const responseData =
        data?.data;

      const events =
        Array.isArray(
          responseData,
        )
          ? responseData
          : responseData?.events ||
            data?.events ||
            [];

      const pagination =
        data?.pagination ||
        responseData?.pagination ||
        null;

      return {
        events,
        pagination,
      };
    }, [data]);

  const {
    events,
    pagination,
  } = normalizedData;

  /**
   * ============================================================
   * Filter Handlers
   * ============================================================
   */

  const handleFiltersChange =
    (nextFilters) => {
      setFilters(
        (current) => ({
          ...current,
          ...nextFilters,
          page: 1,
        }),
      );
    };

  const handlePageChange =
    (page) => {
      setFilters(
        (current) => ({
          ...current,
          page,
        }),
      );
    };

  /**
   * ============================================================
   * Loading State
   * ============================================================
   *
   * All hooks have already executed above.
   */

  if (isLoading) {
    return <LoadingScreen />;
  }

  /**
   * ============================================================
   * Error State
   * ============================================================
   */

  if (isError) {
    return (
      <ErrorMessage
        message={
          error?.response?.data
            ?.message ||
          "Unable to load events."
        }
      />
    );
  }

  /**
   * ============================================================
   * Render
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-950">
      <section className="mx-auto max-w-7xl px-4 pt-36 pb-12 sm:px-6 md:pt-40 lg:px-8">

        {/* ====================================================
            Header
            ==================================================== */}

        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Scintillace 2K26
          </p>

          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Explore Events
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Discover competitions, workshops,
            technical events and cultural
            experiences.
          </p>
        </div>

        {/* ====================================================
            Filters
            ==================================================== */}

        <EventFilters
          filters={filters}
          onChange={
            handleFiltersChange
          }
        />

        {/* ====================================================
            Background Fetch Indicator
            ==================================================== */}

        {isFetching && (
          <div className="mb-4 text-sm text-zinc-400">
            Updating events...
          </div>
        )}

        {/* ====================================================
            Events
            ==================================================== */}

        {events.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <h2 className="text-2xl font-semibold text-white">
              No events found
            </h2>

            <p className="mt-3 text-zinc-400">
              Try changing your search
              or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(
              (event) => (
                <EventCard
                  key={
                    event._id ||
                    event.id
                  }
                  event={event}
                />
              ),
            )}
          </div>
        )}

        {/* ====================================================
            Pagination
            ==================================================== */}

        {pagination &&
          pagination.totalPages >
            1 && (
            <div className="mt-10 flex items-center justify-center gap-4">

              <button
                type="button"
                disabled={
                  filters.page <= 1
                }
                onClick={() =>
                  handlePageChange(
                    filters.page - 1,
                  )
                }
                className="
                  rounded-xl
                  border
                  border-zinc-700
                  px-5
                  py-2
                  text-white
                  transition
                  hover:border-violet-500
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              <span className="text-zinc-400">
                Page{" "}
                {pagination.page ||
                  filters.page}{" "}
                of{" "}
                {
                  pagination.totalPages
                }
              </span>

              <button
                type="button"
                disabled={
                  filters.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  handlePageChange(
                    filters.page + 1,
                  )
                }
                className="
                  rounded-xl
                  border
                  border-zinc-700
                  px-5
                  py-2
                  text-white
                  transition
                  hover:border-violet-500
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next
              </button>

            </div>
          )}
      </section>
    </main>
  );
}