import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import registrationsAdminApi from "../../api/registrations.admin.api";

const REGISTRATION_STATUSES = [
  "PENDING",
  "REGISTERED",
  "CANCELLED",
  "WAITLISTED",
];

const PAYMENT_STATUSES = [
  "NOT_REQUIRED",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const PAGE_LIMIT = 10;

const getRegistrationId = (
  registration,
) =>
  registration?.id ||
  registration?._id;

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
    return "—";
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

const formatDateTime = (
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
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};

const getStatusClasses = (
  status,
) => {
  switch (status) {
    case "REGISTERED":
    case "PAID":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";

    case "CANCELLED":
    case "FAILED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "WAITLISTED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    case "REFUNDED":
      return "border-purple-500/20 bg-purple-500/10 text-purple-400";

    case "NOT_REQUIRED":
      return "border-slate-500/20 bg-slate-500/10 text-slate-400";

    default:
      return "border-white/10 bg-white/5 text-slate-400";
  }
};

const getDisplayName = (
  registration,
) =>
  registration?.user
    ?.fullName ||
  "Unknown participant";

const getEventTitle = (
  registration,
) =>
  registration?.event
    ?.title ||
  "Unknown event";

const getRegistrationType = (
  registration,
) =>
  registration?.team
    ? "Team"
    : "Individual";

function StatusBadge({
  value,
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${getStatusClasses(
        value,
      )}`}
    >
      {value || "—"}
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from(
        { length: 6 },
        (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-white/[0.03]"
          />
        ),
      )}
    </div>
  );
}

function DetailCard({
  title,
  items,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">

      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-violet-400">
        {title}
      </h3>

      <div className="space-y-3">
        {items.map(
          ([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-5 border-b border-white/5 pb-2.5 last:border-0 last:pb-0"
            >
              <span className="text-xs text-slate-500">
                {label}
              </span>

              <span className="max-w-[65%] break-words text-right text-sm font-medium text-slate-200">
                {value || "—"}
              </span>
            </div>
          ),
        )}
      </div>

    </div>
  );
}

function ActionCard({
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">

      <h3 className="mb-4 text-sm font-bold text-white">
        {title}
      </h3>

      {children}

    </div>
  );
}

function RegistrationDetailsModal({
  registration,
  onClose,
  onStatusUpdate,
  onPaymentUpdate,
  onCheckIn,
  onApprove,
  onReject,
  updating,
  canDelete,
  onDelete,
}) {
  const [status, setStatus] = useState(
    registration?.status || "PENDING"
  );
  const [paymentStatus, setPaymentStatus] = useState(
    registration?.paymentStatus || "NOT_REQUIRED"
  );

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(
    registration?.status === "PENDING" && registration?.paymentStatus === "PENDING"
  );
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    let mounted = true;
    
    if (registration?.status === "PENDING" && registration?.paymentStatus === "PENDING") {
      const load = async () => {
        try {
          const data = await registrationsAdminApi.getPaymentByRegistration(getRegistrationId(registration));
          if (mounted) {
            setPaymentDetails(data);
          }
        } catch (err) {
          console.error("Failed to load payment details", err);
        } finally {
          if (mounted) {
            setLoadingPayment(false);
          }
        }
      };
      
      // We set the initial state as true below, so we don't need to synchronously call setState here
      load();
    }

    return () => {
      mounted = false;
    };
  }, [registration]);

  if (!registration) {
    return null;
  }

  const team = registration.team;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
              Registration Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {getDisplayName(
                registration,
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white"
          >
            <X size={19} />
          </button>

        </div>

        <div className="max-h-[calc(90vh-85px)] overflow-y-auto p-6">

          <div className="grid gap-5 md:grid-cols-2">

            <DetailCard
              title="Participant"
              items={[
                [
                  "Name",
                  registration.user
                    ?.fullName,
                ],
                [
                  "Email",
                  registration.user
                    ?.email,
                ],
                [
                  "Phone",
                  registration.user
                    ?.phone,
                ],
                [
                  "College ID",
                  registration.user
                    ?.collegeId,
                ],
              ]}
            />

            <DetailCard
              title="Event"
              items={[
                [
                  "Event",
                  registration.event
                    ?.title,
                ],
                [
                  "Category",
                  registration.event
                    ?.category,
                ],
                [
                  "Type",
                  registration.event
                    ?.type,
                ],
                [
                  "Venue",
                  registration.event
                    ?.venue,
                ],
                [
                  "Start",
                  formatDateTime(
                    registration.event
                      ?.startDateTime,
                  ),
                ],
                [
                  "End",
                  formatDateTime(
                    registration.event
                      ?.endDateTime,
                  ),
                ],
              ]}
            />

            <DetailCard
              title="Registration"
              items={[
                [
                  "Registration ID",
                  getRegistrationId(
                    registration,
                  ),
                ],
                [
                  "Festival",
                  registration.festival
                    ?.title,
                ],
                [
                  "Type",
                  getRegistrationType(
                    registration,
                  ),
                ],
                [
                  "Registered On",
                  formatDateTime(
                    registration.registrationDate,
                  ),
                ],
                [
                  "Cancelled On",
                  formatDateTime(
                    registration.cancellationDate,
                  ),
                ],
              ]}
            />

            <DetailCard
              title="Team"
              items={[
                [
                  "Team",
                  team?.teamName ||
                    "Individual registration",
                ],
                [
                  "Project Title",
                  team?.projectTitle ||
                    "—",
                ],
                [
                  "Leader",
                  team?.leader
                    ?.fullName ||
                    "—",
                ],
                [
                  "Members",
                  team?.members
                    ?.length ??
                    "—",
                ],
                [
                  "Max Members",
                  team?.maxMembers ??
                    "—",
                ],
                [
                  "Team Status",
                  team?.status ||
                    "—",
                ],
              ]}
            />

          </div>

          {registration.status === "PENDING" && registration.paymentStatus === "PENDING" && (
            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
              <h3 className="mb-4 text-sm font-bold text-blue-300">Admin Payment Verification</h3>
              {loadingPayment ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                </div>
              ) : paymentDetails ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex-1 space-y-4">
                      <div className="rounded-xl bg-slate-900/50 p-4">
                        <p className="text-xs text-slate-500">Payment ID</p>
                        <p className="font-mono text-sm text-slate-300">{paymentDetails._id}</p>
                      </div>
                      <div className="rounded-xl bg-slate-900/50 p-4">
                        <p className="text-xs text-slate-500">Amount to Verify</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {paymentDetails.amount} {paymentDetails.currency}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400">Rejection Reason (Optional)</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="If rejecting, please provide a reason..."
                          className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => onApprove(registration)}
                          disabled={updating}
                          className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Approve Payment
                        </button>
                        <button
                          onClick={() => onReject(registration, rejectionReason)}
                          disabled={updating}
                          className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          Reject Payment
                        </button>
                      </div>
                    </div>
                    {paymentDetails.screenshotUrl && (
                      <div className="w-full sm:w-1/2">
                        <p className="mb-2 text-xs font-semibold text-slate-400">Payment Screenshot</p>
                        <a href={paymentDetails.screenshotUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-white/10 transition-colors hover:border-blue-500">
                          <img src={paymentDetails.screenshotUrl} alt="Payment Proof" className="w-full object-contain bg-slate-900" style={{ maxHeight: "400px" }} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No pending payment details found.</p>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <ActionCard title="Registration Status">

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value,
                  )
                }
                disabled={updating}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              >
                {REGISTRATION_STATUSES.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>

              <button
                type="button"
                disabled={
                  updating ||
                  status ===
                    registration.status
                }
                onClick={() =>
                  onStatusUpdate(
                    registration,
                    status,
                  )
                }
                className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Update Status
              </button>

            </ActionCard>

            <ActionCard title="Payment Status">

              <select
                value={paymentStatus}
                onChange={(event) =>
                  setPaymentStatus(
                    event.target.value,
                  )
                }
                disabled={updating}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              >
                {PAYMENT_STATUSES.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>

              <button
                type="button"
                disabled={
                  updating ||
                  paymentStatus ===
                    registration.paymentStatus
                }
                onClick={() =>
                  onPaymentUpdate(
                    registration,
                    paymentStatus,
                  )
                }
                className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Update Payment
              </button>

            </ActionCard>

            <ActionCard title="Check-In">

              <div className="flex min-h-[42px] items-center gap-2">

                {registration.checkedIn ? (
                  <>
                    <CheckCircle2
                      size={18}
                      className="text-emerald-400"
                    />

                    <span className="text-sm font-semibold text-emerald-400">
                      Checked In
                    </span>
                  </>
                ) : (
                  <>
                    <Clock3
                      size={18}
                      className="text-amber-400"
                    />

                    <span className="text-sm font-semibold text-amber-400">
                      Not Checked In
                    </span>
                  </>
                )}

              </div>

              <button
                type="button"
                disabled={
                  updating ||
                  registration.checkedIn
                }
                onClick={() =>
                  onCheckIn(
                    registration,
                  )
                }
                className="mt-3 w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {registration.checkedIn
                  ? "Already Checked In"
                  : "Check In Participant"}
              </button>

            </ActionCard>

          </div>

          {canDelete && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <h3 className="font-semibold text-red-300">
                    Permanent Deletion
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-red-300/60">
                    Permanently removes this
                    registration from the database.
                    This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onDelete(
                      registration,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                >
                  <Trash2 size={16} />
                  Delete Permanently
                </button>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>

    </div>
  );
}

export default function RegistrationTable() {
  const [
    registrations,
    setRegistrations,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    pages: 1,
  });

  const [
    selectedRegistration,
    setSelectedRegistration,
  ] = useState(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const loadRegistrations =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (silent) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const result =
            await registrationsAdminApi.getAllRegistrations(
              {
                page,
                limit: PAGE_LIMIT,
                ...(statusFilter
                  ? {
                      status:
                        statusFilter,
                    }
                  : {}),
                ...(paymentFilter
                  ? {
                      paymentStatus:
                        paymentFilter,
                    }
                  : {}),
              },
            );

          setRegistrations(
            result?.registrations ||
              [],
          );

          setPagination(
            result?.pagination || {
              page,
              limit: PAGE_LIMIT,
              total:
                result?.registrations
                  ?.length || 0,
              pages: 1,
            },
          );
        } catch (requestError) {
          console.error(
            "Unable to load registrations:",
            requestError,
          );

          setError(
            requestError?.response
              ?.data?.message ||
              "Unable to load registrations.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        page,
        statusFilter,
        paymentFilter,
      ],
    );

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadRegistrations();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadRegistrations]);

  const filteredRegistrations =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return registrations;
      }

      return registrations.filter(
        (registration) => {
          const name =
            registration.user
              ?.fullName ||
            "";

          const email =
            registration.user
              ?.email ||
            "";

          const event =
            registration.event
              ?.title ||
            "";

          const team =
            registration.team
              ?.teamName ||
            "";

          return [
            name,
            email,
            event,
            team,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        },
      );
    }, [
      registrations,
      search,
    ]);

  const handleStatusUpdate =
    async (
      registration,
      status,
    ) => {
      try {
        setActionLoading(true);
        setError("");

        const updated =
          await registrationsAdminApi.updateRegistrationStatus(
            getRegistrationId(
              registration,
            ),
            status,
          );

        setRegistrations(
          (current) =>
            current.map(
              (item) =>
                getRegistrationId(
                  item,
                ) ===
                getRegistrationId(
                  registration,
                )
                  ? updated
                  : item,
            ),
        );

        setSelectedRegistration(
          updated,
        );
      } catch (requestError) {
        console.error(
          "Unable to update registration status:",
          requestError,
        );

        setError(
          requestError?.response
            ?.data?.message ||
            "Unable to update registration status.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handlePaymentUpdate =
    async (
      registration,
      paymentStatus,
    ) => {
      try {
        setActionLoading(true);
        setError("");

        const updated =
          await registrationsAdminApi.updatePaymentStatus(
            getRegistrationId(
              registration,
            ),
            paymentStatus,
          );

        setRegistrations(
          (current) =>
            current.map(
              (item) =>
                getRegistrationId(
                  item,
                ) ===
                getRegistrationId(
                  registration,
                )
                  ? updated
                  : item,
            ),
        );

        setSelectedRegistration(
          updated,
        );
      } catch (requestError) {
        console.error(
          "Unable to update payment status:",
          requestError,
        );

        setError(
          requestError?.response
            ?.data?.message ||
            "Unable to update payment status.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleCheckIn =
    async (
      registration,
    ) => {
      try {
        setActionLoading(true);
        setError("");

        const updated =
          await registrationsAdminApi.checkInRegistration(
            getRegistrationId(
              registration,
            ),
          );

        setRegistrations(
          (current) =>
            current.map(
              (item) =>
                getRegistrationId(
                  item,
                ) ===
                getRegistrationId(
                  registration,
                )
                  ? updated
                  : item,
            ),
        );

        setSelectedRegistration(
          updated,
        );
      } catch (requestError) {
        console.error(
          "Unable to check in participant:",
          requestError,
        );

        setError(
          requestError?.response
            ?.data?.message ||
            "Unable to check in participant.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleDelete =
    async (
      registration,
    ) => {
      const confirmed =
        window.confirm(
          `Permanently delete the registration of ${getDisplayName(
            registration,
          )}? This action cannot be undone.`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await registrationsAdminApi.deleteRegistration(
          getRegistrationId(
            registration,
          ),
        );

        setSelectedRegistration(
          null,
        );

        await loadRegistrations({
          silent: true,
        });
      } catch (requestError) {
        console.error(
          "Unable to delete registration:",
          requestError,
        );

        setError(
          requestError?.response
            ?.data?.message ||
            "Unable to delete registration.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleApproveRegistration = async (registration) => {
    try {
      setActionLoading(true);
      setError("");

      const updated = await registrationsAdminApi.approveRegistration(
        getRegistrationId(registration)
      );

      setRegistrations((current) =>
        current.map((item) =>
          getRegistrationId(item) === getRegistrationId(registration)
            ? updated
            : item
        )
      );

      setSelectedRegistration(updated);
    } catch (requestError) {
      console.error("Unable to approve registration:", requestError);
      setError(
        requestError?.response?.data?.message ||
        "Unable to approve registration."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRegistration = async (registration, reason) => {
    try {
      setActionLoading(true);
      setError("");

      const updated = await registrationsAdminApi.rejectRegistration(
        getRegistrationId(registration),
        reason
      );

      setRegistrations((current) =>
        current.map((item) =>
          getRegistrationId(item) === getRegistrationId(registration)
            ? updated
            : item
        )
      );

      setSelectedRegistration(updated);
    } catch (requestError) {
      console.error("Unable to reject registration:", requestError);
      setError(
        requestError?.response?.data?.message ||
        "Unable to reject registration."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const total =
    pagination?.total ??
    registrations.length;

  const pages =
    pagination?.pages ||
    Math.max(
      1,
      Math.ceil(
        total / PAGE_LIMIT,
      ),
    );

  const canGoPrevious =
    page > 1;

  const canGoNext =
    page < pages;

  return (
    <>
      <section className="space-y-6">

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
              Registration Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor participant registrations,
              payment status and event check-ins.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadRegistrations({
                silent: true,
              })
            }
            disabled={
              refreshing ||
              loading
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-500 hover:text-white disabled:opacity-40"
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

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <p className="font-semibold">
                Registration request failed
              </p>

              <p className="mt-1 text-sm text-red-300/70">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-300/60 hover:text-red-300"
            >
              <X size={17} />
            </button>

          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            label="Loaded"
            value={
              filteredRegistrations.length
            }
          />

          <SummaryCard
            label="Registered"
            value={
              filteredRegistrations.filter(
                (item) =>
                  item.status ===
                  "REGISTERED",
              ).length
            }
          />

          <SummaryCard
            label="Paid"
            value={
              filteredRegistrations.filter(
                (item) =>
                  item.paymentStatus ===
                  "PAID",
              ).length
            }
          />

          <SummaryCard
            label="Checked In"
            value={
              filteredRegistrations.filter(
                (item) =>
                  item.checkedIn,
              ).length
            }
          />

        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search participant, email, event or team..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              />

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative">

                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950 py-3 pl-9 pr-9 text-sm text-slate-300 outline-none focus:border-violet-500 sm:w-48"
                >
                  <option value="">
                    All Registration Status
                  </option>

                  {REGISTRATION_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ),
                  )}
                </select>

              </div>

              <select
                value={
                  paymentFilter
                }
                onChange={(event) => {
                  setPaymentFilter(
                    event.target.value,
                  );
                  setPage(1);
                }}
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-violet-500 sm:w-48"
              >
                <option value="">
                  All Payment Status
                </option>

                {PAYMENT_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ),
                )}
              </select>

            </div>

          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

          {loading ? (
            <div className="p-5">
              <LoadingRows />
            </div>
          ) : filteredRegistrations.length ===
            0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Search size={25} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                No registrations found
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are no registrations matching
                the current filters.
              </p>

            </div>
          ) : (
            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px]">

                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">

                      <th className="px-5 py-4 font-semibold">
                        Participant
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Event
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Type
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Registration
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Payment
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Check-In
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>

                      <th className="px-5 py-4 text-right font-semibold">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredRegistrations.map(
                      (
                        registration,
                      ) => {
                        const id =
                          getRegistrationId(
                            registration,
                          );

                        return (
                          <tr
                            key={id}
                            className="border-b border-white/5 transition hover:bg-white/[0.025]"
                          >

                            <td className="px-5 py-4">

                              <div>
                                <p className="font-semibold text-white">
                                  {getDisplayName(
                                    registration,
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    registration
                                      .user
                                      ?.email
                                  }
                                </p>
                              </div>

                            </td>

                            <td className="max-w-[220px] px-5 py-4">

                              <p className="truncate text-sm font-medium text-slate-200">
                                {getEventTitle(
                                  registration,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {registration
                                  .event
                                  ?.category ||
                                  "—"}
                              </p>

                            </td>

                            <td className="px-5 py-4 text-sm text-slate-400">
                              {getRegistrationType(
                                registration,
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                value={
                                  registration.status
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                value={
                                  registration.paymentStatus
                                }
                              />
                            </td>

                            <td className="px-5 py-4">

                              {registration.checkedIn ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                                  <CheckCircle2
                                    size={15}
                                  />
                                  Checked In
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock3
                                    size={15}
                                  />
                                  Pending
                                </span>
                              )}

                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                              {formatDate(
                                registration.registrationDate ||
                                  registration.createdAt,
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedRegistration(
                                    registration,
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-violet-500 hover:text-white"
                              >
                                <Eye
                                  size={15}
                                />
                                View
                              </button>

                            </td>

                          </tr>
                        );
                      },
                    )}
                  </tbody>

                </table>

              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center">

                <p className="text-xs text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-300">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-300">
                    {pages}
                  </span>
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={
                      !canGoPrevious
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            1,
                            current -
                              1,
                          ),
                      )
                    }
                    className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    disabled={
                      !canGoNext
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.min(
                            pages,
                            current +
                              1,
                          ),
                      )
                    }
                    className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight
                      size={17}
                    />
                  </button>

                </div>

              </div>
            </>
          )}

        </div>

      </section>

      {selectedRegistration && (
        <RegistrationDetailsModal
          registration={
            selectedRegistration
          }
          onClose={() =>
            setSelectedRegistration(
              null,
            )
          }
          onStatusUpdate={
            handleStatusUpdate
          }
          onPaymentUpdate={
            handlePaymentUpdate
          }
          onCheckIn={
            handleCheckIn
          }
          onApprove={
            handleApproveRegistration
          }
          onReject={
            handleRejectRegistration
          }
          onDelete={
            handleDelete
          }
          updating={
            actionLoading
          }
          canDelete={
            true
          }
        />
      )}
    </>
  );
}