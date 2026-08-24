import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getEvents,
} from "../../api/events.api";

import {
  deleteEvent,
} from "../../api/admin.events.api";

import EventForm from "./EventForm";

export default function EventTable({
  festivals = [],
}) {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [editingEvent, setEditingEvent] =
    useState(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  /**
   * ============================================================
   * Fetch Events
   * ============================================================
   */

  const fetchEvents =
    useCallback(
      async (showRefresh = false) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const result =
            await getEvents({
              page: 1,
              limit: 100,
            });

          const eventList =
            Array.isArray(result)
              ? result
              : result?.events ||
                [];

          setEvents(eventList);
        } catch (err) {
          console.error(
            "Failed to load admin events:",
            err,
          );

          const message =
            err?.response?.data
              ?.message ||
            "Unable to load events.";

          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  /**
   * ============================================================
   * Initial Load
   * ============================================================
   */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchEvents();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchEvents]);

  /**
   * ============================================================
   * Statuses
   * ============================================================
   */

  const statuses =
    useMemo(() => {
      const values =
        events
          .map(
            (event) =>
              event?.status,
          )
          .filter(Boolean);

      return [
        "ALL",
        ...new Set(values),
      ];
    }, [events]);

  /**
   * ============================================================
   * Filtered Events
   * ============================================================
   */

  const filteredEvents =
    useMemo(() => {
      const searchTerm =
        search
          .trim()
          .toLowerCase();

      return events.filter(
        (event) => {
          const matchesSearch =
            !searchTerm ||
            [
              event?.title,
              event?.name,
              event?.description,
              event?.venue,
              event?.location,
              event?.category,
              event?.type,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    searchTerm,
                  ),
              );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            event?.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      events,
      search,
      statusFilter,
    ]);

  /**
   * ============================================================
   * Open Create Form
   * ============================================================
   */

  const handleCreate =
    () => {
      if (
        !Array.isArray(
          festivals,
        ) ||
        festivals.length === 0
      ) {
        toast.error(
          "No festivals available. Create a festival first.",
        );
        return;
      }

      setEditingEvent(null);
      setIsFormOpen(true);
    };

  /**
   * ============================================================
   * Open Edit Form
   * ============================================================
   */

  const handleEdit =
    (event) => {
      if (!event) {
        return;
      }

      setSelectedEvent(null);
      setEditingEvent(event);
      setIsFormOpen(true);
    };

  /**
   * ============================================================
   * Form Success
   * ============================================================
   */

  const handleFormSuccess =
    async () => {
      setIsFormOpen(false);
      setEditingEvent(null);

      await fetchEvents(true);
    };

  /**
   * ============================================================
   * Close Form
   * ============================================================
   */

  const handleFormClose =
    () => {
      setIsFormOpen(false);
      setEditingEvent(null);
    };

  /**
   * ============================================================
   * Delete Event
   * ============================================================
   */

  const handleDelete =
    async (event) => {
      const id =
        event?._id ||
        event?.id;

      if (!id) {
        toast.error(
          "Event ID is missing.",
        );
        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${
            event?.title ||
            event?.name ||
            "this event"
          }"? This action cannot be undone.`,
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteEvent(id);

        setEvents(
          (current) =>
            current.filter(
              (item) =>
                (item?._id ||
                  item?.id) !== id,
            ),
        );

        toast.success(
          "Event deleted successfully.",
        );
      } catch (err) {
        console.error(
          "Failed to delete event:",
          err,
        );

        toast.error(
          err?.response?.data
            ?.message ||
            "Unable to delete event.",
        );
      }
    };

  /**
   * ============================================================
   * Helpers
   * ============================================================
   */

  const formatDate = (
    value,
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return String(value);
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

  const getEventTitle =
    (event) =>
      event?.title ||
      event?.name ||
      "Untitled Event";

  const getEventDate =
    (event) =>
      event?.startDateTime ||
      event?.startDate ||
      event?.date ||
      event?.eventDate;

  const getEventVenue =
    (event) =>
      event?.venue ||
      event?.location ||
      event?.place ||
      "—";

  const getStatusClasses =
    (status) => {
      switch (
        String(
          status || "",
        ).toUpperCase()
      ) {
        case "PUBLISHED":
        case "ACTIVE":
        case "OPEN":
        case "REGISTRATION_OPEN":
          return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

        case "DRAFT":
          return "border-amber-500/20 bg-amber-500/10 text-amber-400";

        case "CANCELLED":
        case "CANCELED":
        case "ARCHIVED":
          return "border-red-500/20 bg-red-500/10 text-red-400";

        default:
          return "border-slate-500/20 bg-slate-500/10 text-slate-400";
      }
    };

  return (
    <section className="space-y-6">

      {/* =====================================================
          Header
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
            Event Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Create, edit, review, and manage
            Scintillace events.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={
            !Array.isArray(
              festivals,
            ) ||
            festivals.length === 0
          }
          title={
            festivals.length === 0
              ? "Create a festival first"
              : "Create event"
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={18} />
          Create Event
        </button>

      </div>

      {/* =====================================================
          Toolbar
      ====================================================== */}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search events..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 outline-none focus:border-violet-500"
          >
            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "ALL"
                    ? "All Statuses"
                    : status}
                </option>
              ),
            )}
          </select>

          <button
            type="button"
            onClick={() =>
              fetchEvents(true)
            }
            disabled={
              refreshing
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-violet-500 hover:text-white disabled:opacity-40"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* =====================================================
          Error
      ====================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          Statistics
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <MiniStat
          label="Total Events"
          value={events.length}
        />

        <MiniStat
          label="Visible Results"
          value={
            filteredEvents.length
          }
        />

        <MiniStat
          label="Active Statuses"
          value={
            Math.max(
              statuses.length - 1,
              0,
            )
          }
        />

      </div>

      {/* =====================================================
          Table
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">

        <div className="overflow-x-auto">

          <table className="min-w-[900px] w-full">

            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Event
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Venue
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <TableSkeleton />
              ) : filteredEvents.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >
                    <CalendarDays
                      size={32}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-4 font-semibold text-white">
                      No events found
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Try changing your search
                      or status filter.
                    </p>
                  </td>
                </tr>

              ) : (

                filteredEvents.map(
                  (event) => {
                    const id =
                      event?._id ||
                      event?.id;

                    const status =
                      event?.status ||
                      "UNKNOWN";

                    return (
                      <tr
                        key={id}
                        className="border-b border-white/5 transition hover:bg-white/[0.025]"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
                              <CalendarDays
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-white">
                                {getEventTitle(
                                  event,
                                )}
                              </p>

                              {event?.category && (
                                <p className="mt-1 text-xs text-slate-600">
                                  {
                                    event.category
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(
                            getEventDate(
                              event,
                            ),
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {getEventVenue(
                            event,
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {event?.type ||
                            event?.eventType ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              status,
                            )}`}
                          >
                            {status}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            {/* View */}
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedEvent(
                                  event,
                                )
                              }
                              className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-violet-500 hover:text-white"
                              title="View event"
                            >
                              <Eye
                                size={16}
                              />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  event,
                                )
                              }
                              className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-violet-500 hover:text-white"
                              title="Edit event"
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  event,
                                )
                              }
                              className="rounded-lg border border-red-500/10 p-2 text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10"
                              title="Delete event"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  },
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          Event Details Modal
      ====================================================== */}

      {selectedEvent && (
        <EventDetailsModal
          event={
            selectedEvent
          }
          onClose={() =>
            setSelectedEvent(
              null,
            )
          }
          formatDate={
            formatDate
          }
        />
      )}

      {/* =====================================================
          Create / Edit Event Form
      ====================================================== */}

      {isFormOpen && (
        <EventForm
          event={
            editingEvent
          }
          festivals={
            festivals
          }
          onSuccess={
            handleFormSuccess
          }
          onClose={
            handleFormClose
          }
        />
      )}

    </section>
  );
}

/**
 * ============================================================
 * Mini Statistic
 * ============================================================
 */

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">
        {Number(
          value || 0,
        ).toLocaleString(
          "en-IN",
        )}
      </p>

    </div>
  );
}

/**
 * ============================================================
 * Table Skeleton
 * ============================================================
 */

function TableSkeleton() {
  return (
    <>
      {Array.from({
        length: 6,
      }).map(
        (_, index) => (
          <tr
            key={index}
            className="border-b border-white/5"
          >
            {Array.from({
              length: 6,
            }).map(
              (_, cell) => (
                <td
                  key={cell}
                  className="px-5 py-5"
                >
                  <div className="h-5 animate-pulse rounded bg-white/5" />
                </td>
              ),
            )}
          </tr>
        ),
      )}
    </>
  );
}

/**
 * ============================================================
 * Event Details Modal
 * ============================================================
 */

function EventDetailsModal({
  event,
  onClose,
  formatDate,
}) {
  const fields = [
    [
      "Title",
      event?.title ||
        event?.name ||
        "—",
    ],

    [
      "Description",
      event?.description ||
        "—",
    ],

    [
      "Festival",
      event?.festival?.title ||
        event?.festival?.name ||
        event?.festival ||
        "—",
    ],

    [
      "Date",
      formatDate(
        event?.startDateTime ||
          event?.startDate ||
          event?.date ||
          event?.eventDate,
      ),
    ],

    [
      "End Date",
      formatDate(
        event?.endDateTime ||
          event?.endDate,
      ),
    ],

    [
      "Venue",
      event?.venue ||
        event?.location ||
        event?.place ||
        "—",
    ],

    [
      "Category",
      event?.category ||
        "—",
    ],

    [
      "Type",
      event?.type ||
        event?.eventType ||
        "—",
    ],

    [
      "Status",
      event?.status ||
        "—",
    ],

    [
      "Capacity",
      event?.maxParticipants ??
        event?.capacity ??
        "—",
    ],

    [
      "Team Size",
      event?.teamSize ??
        "—",
    ],

    [
      "Registration Fee",
      event?.isPaid
        ? `${event?.registrationFee ?? 0} ${event?.currency || "INR"}`
        : "Free",
    ],

    [
      "Registration Open",
      event?.registrationOpen
        ? "Yes"
        : "No",
    ],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/10 p-6">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
              Event Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {event?.title ||
                event?.name ||
                "Event"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-violet-500 hover:text-white"
          >
            <X size={20} />
          </button>

        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">

          {fields.map(
            ([label, value]) => (
              <div
                key={label}
                className={`rounded-xl border border-white/5 bg-white/[0.025] p-4 ${
                  label ===
                    "Description"
                    ? "sm:col-span-2"
                    : ""
                }`}
              >

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {label}
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {String(value)}
                </p>

              </div>
            ),
          )}

        </div>

        <div className="border-t border-white/10 p-6 text-right">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-500 hover:text-white"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}