import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  archiveAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  publishAnnouncement,
  updateAnnouncement,
} from "../../api/announcements.api";

import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = {
  title: "",
  message: "",
  scope: "GLOBAL",
  festival: "",
  event: "",
  priority: "NORMAL",
  status: "DRAFT",
  publishedAt: "",
  visibleFrom: "",
  visibleUntil: "",
};

const STATUS_OPTIONS = [
  "ALL",
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

const PRIORITY_OPTIONS = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

const SCOPE_OPTIONS = [
  "GLOBAL",
  "FESTIVAL",
  "EVENT",
];

const INPUT_CLASS =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000,
  );

  return localDate
    .toISOString()
    .slice(0, 16);
};

const getStatusClasses = (status) => {
  if (status === "PUBLISHED") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "ARCHIVED") {
    return "border-zinc-700 bg-zinc-800 text-zinc-400";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-400";
};

const getPriorityClasses = (priority) => {
  if (priority === "URGENT") {
    return "text-red-400";
  }

  if (priority === "HIGH") {
    return "text-orange-400";
  }

  if (priority === "LOW") {
    return "text-zinc-500";
  }

  return "text-violet-400";
};

export default function AnnouncementPanel() {
  const { user } = useAuth();

  const canManage =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "FACULTY";

  const isSuperAdmin =
    user?.role === "SUPER_ADMIN";

  const [
    announcements,
    setAnnouncements,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    scopeFilter,
    setScopeFilter,
  ] = useState("ALL");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("ALL");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [error, setError] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [form, setForm] = useState(
    EMPTY_FORM,
  );

  /**
   * ==========================================================
   * Fetch Announcements
   * ==========================================================
   */

  const fetchAnnouncements =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const params = {
            page,
            limit: 10,
          };

          if (statusFilter !== "ALL") {
            params.status =
              statusFilter;
          }

          if (scopeFilter !== "ALL") {
            params.scope =
              scopeFilter;
          }

          if (
            priorityFilter !== "ALL"
          ) {
            params.priority =
              priorityFilter;
          }

          const result =
            await getAllAnnouncements(
              params,
            );

          setAnnouncements(
            result?.announcements ||
              [],
          );

          setPagination(
            result?.pagination || {
              page,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
          );
        } catch (err) {
          console.error(
            "Failed to load announcements:",
            err,
          );

          setError(
            err?.response?.data
              ?.message ||
              "Unable to load announcements.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        statusFilter,
        scopeFilter,
        priorityFilter,
      ],
    );

  /**
   * ==========================================================
   * Initial / Filtered Load
   * ==========================================================
   *
   * Schedule the fetch asynchronously so the effect does not
   * synchronously trigger state updates.
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [
    fetchAnnouncements,
  ]);

  /**
   * ==========================================================
   * Form
   * ==========================================================
   */

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleEdit = (announcement) => {
    setEditingId(
      announcement.id ||
        announcement._id,
    );

    setForm({
      title:
        announcement.title || "",

      message:
        announcement.message || "",

      scope:
        announcement.scope ||
        "GLOBAL",

      festival:
        announcement.festival
          ?._id ||
        announcement.festival ||
        "",

      event:
        announcement.event?._id ||
        announcement.event ||
        "",

      priority:
        announcement.priority ||
        "NORMAL",

      status:
        announcement.status ===
        "ARCHIVED"
          ? "DRAFT"
          : announcement.status ||
            "DRAFT",

      publishedAt:
        toDateTimeLocal(
          announcement.publishedAt,
        ),

      visibleFrom:
        toDateTimeLocal(
          announcement.visibleFrom,
        ),

      visibleUntil:
        toDateTimeLocal(
          announcement.visibleUntil,
        ),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  /**
   * ==========================================================
   * Submit
   * ==========================================================
   */

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        scope: form.scope,
        priority: form.priority,
        status: form.status,
      };

      if (form.scope === "FESTIVAL") {
        if (!form.festival.trim()) {
          setError(
            "Festival ID is required.",
          );

          return;
        }

        payload.festival =
          form.festival.trim();
      }

      if (form.scope === "EVENT") {
        if (!form.event.trim()) {
          setError(
            "Event ID is required.",
          );

          return;
        }

        payload.event =
          form.event.trim();
      }

      if (form.publishedAt) {
        payload.publishedAt =
          new Date(
            form.publishedAt,
          ).toISOString();
      }

      if (form.visibleFrom) {
        payload.visibleFrom =
          new Date(
            form.visibleFrom,
          ).toISOString();
      }

      if (form.visibleUntil) {
        payload.visibleUntil =
          new Date(
            form.visibleUntil,
          ).toISOString();
      }

      if (editingId) {
        await updateAnnouncement(
          editingId,
          payload,
        );

        setSuccess(
          "Announcement updated successfully.",
        );
      } else {
        await createAnnouncement(
          payload,
        );

        setSuccess(
          "Announcement created successfully.",
        );
      }

      resetForm();

      await fetchAnnouncements();
    } catch (err) {
      console.error(
        "Failed to save announcement:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "Unable to save announcement.",
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * ==========================================================
   * Publish
   * ==========================================================
   */

  const handlePublish = async (id) => {
    try {
      setError("");
      setSuccess("");

      await publishAnnouncement(id);

      setSuccess(
        "Announcement published successfully.",
      );

      await fetchAnnouncements();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to publish announcement.",
      );
    }
  };

  /**
   * ==========================================================
   * Archive
   * ==========================================================
   */

  const handleArchive = async (id) => {
    try {
      setError("");
      setSuccess("");

      await archiveAnnouncement(id);

      setSuccess(
        "Announcement archived successfully.",
      );

      await fetchAnnouncements();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to archive announcement.",
      );
    }
  };

  /**
   * ==========================================================
   * Delete
   * ==========================================================
   */

  const handleDelete = async (id) => {
    if (!isSuperAdmin) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this announcement?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deleteAnnouncement(id);

      setSuccess(
        "Announcement deleted successfully.",
      );

      await fetchAnnouncements();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete announcement.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * ==========================================================
   * Client Search
   * ==========================================================
   */

  const filteredAnnouncements =
    useMemo(() => {
      const value = search
        .trim()
        .toLowerCase();

      if (!value) {
        return announcements;
      }

      return announcements.filter(
        (item) =>
          item.title
            ?.toLowerCase()
            .includes(value) ||
          item.message
            ?.toLowerCase()
            .includes(value),
      );
    }, [
      announcements,
      search,
    ]);

  /**
   * ==========================================================
   * Statistics
   * ==========================================================
   */

  const statistics = useMemo(
    () => ({
      total:
        pagination.total || 0,

      draft:
        announcements.filter(
          (item) =>
            item.status === "DRAFT",
        ).length,

      published:
        announcements.filter(
          (item) =>
            item.status ===
            "PUBLISHED",
        ).length,

      archived:
        announcements.filter(
          (item) =>
            item.status ===
            "ARCHIVED",
        ).length,
    }),
    [
      announcements,
      pagination.total,
    ],
  );

  /**
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl md:p-8">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
            Content Management
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Announcements
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Create, publish and manage important festival announcements.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            + Create Announcement
          </button>
        )}

      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total"
          value={statistics.total}
        />

        <StatCard
          label="Draft"
          value={statistics.draft}
        />

        <StatCard
          label="Published"
          value={
            statistics.published
          }
        />

        <StatCard
          label="Archived"
          value={
            statistics.archived
          }
        />

      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search announcements..."
          className={INPUT_CLASS}
        />

        <select
          value={statusFilter}
          onChange={(event) => {
            setPage(1);
            setStatusFilter(
              event.target.value,
            );
          }}
          className={INPUT_CLASS}
        >
          {STATUS_OPTIONS.map(
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

        <select
          value={scopeFilter}
          onChange={(event) => {
            setPage(1);
            setScopeFilter(
              event.target.value,
            );
          }}
          className={INPUT_CLASS}
        >
          <option value="ALL">
            All Scopes
          </option>

          {SCOPE_OPTIONS.map(
            (scope) => (
              <option
                key={scope}
                value={scope}
              >
                {scope}
              </option>
            ),
          )}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => {
            setPage(1);
            setPriorityFilter(
              event.target.value,
            );
          }}
          className={INPUT_CLASS}
        >
          <option value="ALL">
            All Priorities
          </option>

          {PRIORITY_OPTIONS.map(
            (priority) => (
              <option
                key={priority}
                value={priority}
              >
                {priority}
              </option>
            ),
          )}
        </select>

      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-violet-500/20 bg-zinc-950 p-6"
        >

          <div className="flex items-center justify-between">

            <div>
              <h3 className="text-xl font-bold text-white">
                {editingId
                  ? "Edit Announcement"
                  : "Create Announcement"}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Configure the announcement below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              ✕
            </button>

          </div>

          <div className="mt-6 space-y-5">

            <FormField label="Title">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                minLength={3}
                maxLength={200}
                required
                placeholder="Announcement title"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Message">
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                minLength={5}
                maxLength={5000}
                required
                rows={6}
                placeholder="Write announcement message..."
                className={INPUT_CLASS}
              />
            </FormField>

            <div className="grid gap-5 md:grid-cols-3">

              <FormField label="Scope">
                <select
                  name="scope"
                  value={form.scope}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  {SCOPE_OPTIONS.map(
                    (scope) => (
                      <option
                        key={scope}
                        value={scope}
                      >
                        {scope}
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              <FormField label="Priority">
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  {PRIORITY_OPTIONS.map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              <FormField label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  <option value="DRAFT">
                    DRAFT
                  </option>

                  <option value="PUBLISHED">
                    PUBLISHED
                  </option>
                </select>
              </FormField>

            </div>

            {form.scope ===
              "FESTIVAL" && (
              <FormField label="Festival ID">
                <input
                  name="festival"
                  value={form.festival}
                  onChange={handleChange}
                  required
                  placeholder="Festival MongoDB ID"
                  className={INPUT_CLASS}
                />
              </FormField>
            )}

            {form.scope ===
              "EVENT" && (
              <FormField label="Event ID">
                <input
                  name="event"
                  value={form.event}
                  onChange={handleChange}
                  required
                  placeholder="Event MongoDB ID"
                  className={INPUT_CLASS}
                />
              </FormField>
            )}

            <div className="grid gap-5 md:grid-cols-3">

              <FormField label="Published At">
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={
                    form.publishedAt
                  }
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </FormField>

              <FormField label="Visible From">
                <input
                  type="datetime-local"
                  name="visibleFrom"
                  value={form.visibleFrom}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </FormField>

              <FormField label="Visible Until">
                <input
                  type="datetime-local"
                  name="visibleUntil"
                  value={
                    form.visibleUntil
                  }
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </FormField>

            </div>

          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Announcement"
                  : "Create Announcement"}
            </button>

          </div>

        </form>
      )}

      <div className="mt-8">

        {loading ? (
          <div className="rounded-2xl border border-zinc-800 p-12 text-center text-zinc-500">
            Loading announcements...
          </div>
        ) : filteredAnnouncements.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">

            <h3 className="font-semibold text-white">
              No announcements found
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Try another filter or create a new announcement.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {filteredAnnouncements.map(
              (announcement) => {
                const id =
                  announcement.id ||
                  announcement._id;

                return (
                  <article
                    key={id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-white">
                            {announcement.title}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              announcement.status,
                            )}`}
                          >
                            {
                              announcement.status
                            }
                          </span>

                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">
                          {
                            announcement.message
                          }
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">

                          <span>
                            Scope:{" "}
                            <strong className="text-zinc-300">
                              {
                                announcement.scope
                              }
                            </strong>
                          </span>

                          <span>
                            Priority:{" "}
                            <strong
                              className={getPriorityClasses(
                                announcement.priority,
                              )}
                            >
                              {
                                announcement.priority
                              }
                            </strong>
                          </span>

                          <span>
                            Published:{" "}
                            <strong className="text-zinc-300">
                              {formatDate(
                                announcement.publishedAt,
                              )}
                            </strong>
                          </span>

                        </div>

                      </div>

                      {canManage && (
                        <div className="flex flex-wrap items-start gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                announcement,
                              )
                            }
                            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-violet-500 hover:text-white"
                          >
                            Edit
                          </button>

                          {announcement.status ===
                            "DRAFT" && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePublish(
                                  id,
                                )
                              }
                              className="rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10"
                            >
                              Publish
                            </button>
                          )}

                          {announcement.status ===
                            "PUBLISHED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleArchive(
                                  id,
                                )
                              }
                              className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10"
                            >
                              Archive
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                id
                              }
                              onClick={() =>
                                handleDelete(
                                  id,
                                )
                              }
                              className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-40"
                            >
                              {deletingId ===
                              id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}

                        </div>
                      )}

                    </div>

                  </article>
                );
              },
            )}

          </div>
        )}

      </div>

      {pagination.totalPages >
        1 && (
        <div className="mt-8 flex items-center justify-center gap-4">

          <button
            type="button"
            disabled={
              page <= 1 || loading
            }
            onClick={() =>
              setPage((current) =>
                Math.max(
                  1,
                  current - 1,
                ),
              )
            }
            className="rounded-xl border border-zinc-800 px-5 py-2.5 text-sm font-semibold hover:border-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-zinc-500">
            Page {pagination.page}{" "}
            of{" "}
            {
              pagination.totalPages
            }
          </span>

          <button
            type="button"
            disabled={
              page >=
                pagination.totalPages ||
              loading
            }
            onClick={() =>
              setPage(
                (current) =>
                  current + 1,
              )
            }
            className="rounded-xl border border-zinc-800 px-5 py-2.5 text-sm font-semibold hover:border-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}

    </section>
  );
}

function StatCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </span>

      {children}
    </label>
  );
}