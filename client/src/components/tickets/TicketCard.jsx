import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaQrcode,
  FaTicketAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const statusStyles = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    icon: FaCheckCircle,
  },

  USED: {
    label: "Checked In",
    className:
      "bg-blue-500/10 text-blue-300 border-blue-500/20",
    icon: FaCheckCircle,
  },

  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-red-500/10 text-red-300 border-red-500/20",
    icon: FaTimesCircle,
  },

  EXPIRED: {
    label: "Expired",
    className:
      "bg-amber-500/10 text-amber-300 border-amber-500/20",
    icon: FaExclamationCircle,
  },
};

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
};

export default function TicketCard({
  ticket,
  onViewQR,
}) {
  if (!ticket) {
    return null;
  }

  const status =
    statusStyles[ticket.status] ||
    statusStyles.ACTIVE;

  const StatusIcon = status.icon;

  const event =
    ticket.event || {};

  const eventDate = formatDate(
    event.startDateTime,
  );

  const eventTime = formatTime(
    event.startDateTime,
  );

  const canShowQR =
    ticket.status === "ACTIVE";

  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-lg transition hover:border-violet-500/30">
      {/* =====================================================
          TOP
      ====================================================== */}

      <div className="border-b border-zinc-800 bg-gradient-to-r from-violet-700/20 to-purple-600/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <FaTicketAlt />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Event Ticket
              </p>

              <h2 className="mt-1 truncate text-xl font-bold text-white">
                {event.title ||
                  "Event"}
              </h2>
            </div>
          </div>

          {/* Status */}

          <div
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
          >
            <StatusIcon />

            {status.label}
          </div>
        </div>
      </div>

      {/* =====================================================
          BODY
      ====================================================== */}

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-violet-400" />

              <div>
                <p className="text-xs text-zinc-500">
                  Date
                </p>

                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {eventDate}
                </p>

                {eventTime && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {eventTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Venue */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-violet-400" />

              <div className="min-w-0">
                <p className="text-xs text-zinc-500">
                  Venue
                </p>

                <p className="mt-1 truncate text-sm font-medium text-zinc-200">
                  {event.venue ||
                    "Venue TBA"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            TICKET NUMBER
        ====================================================== */}

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Ticket Number
          </p>

          <p className="mt-2 break-all text-sm font-bold tracking-wide text-violet-300">
            {ticket.ticketNumber ||
              "Unavailable"}
          </p>
        </div>

        {/* =====================================================
            CHECK-IN
        ====================================================== */}

        {ticket.checkedIn && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <FaCheckCircle className="shrink-0 text-blue-400" />

            <div>
              <p className="text-sm font-semibold text-blue-300">
                Checked in successfully
              </p>

              {ticket.checkedInAt && (
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(
                    ticket.checkedInAt,
                  ).toLocaleString(
                    "en-IN",
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            ACTION
        ====================================================== */}

        {canShowQR ? (
          <button
            type="button"
            onClick={() =>
              onViewQR?.(ticket)
            }
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-5 py-3.5 font-bold text-white transition hover:bg-violet-700"
          >
            <FaQrcode className="text-lg" />
            View Ticket QR
          </button>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-zinc-500">
            <FaClock />

            QR unavailable for this ticket
          </div>
        )}
      </div>
    </article>
  );
}