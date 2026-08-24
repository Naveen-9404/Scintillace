import {
  FaCheckCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
} from "react-icons/fa";

export default function RegistrationSuccess({
  event,
  ticket,
  qrCode,
  onDone,
}) {
  const eventDate =
    event?.startDateTime
      ? new Date(
          event.startDateTime,
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        )
      : "Date unavailable";

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6 md:py-16">
      <div className="mx-auto max-w-2xl">

        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">

          {/* =================================================
              SUCCESS HEADER
              ================================================= */}

          <div className="border-b border-zinc-800 bg-gradient-to-r from-violet-700 to-purple-600 px-6 py-10 text-center md:px-10">

            <FaCheckCircle className="mx-auto text-6xl text-white" />

            <h1 className="mt-5 text-3xl font-extrabold md:text-4xl">
              Registration Successful
            </h1>

            <p className="mt-3 text-violet-100">
              Your payment has been verified and your
              event ticket has been generated.
            </p>

          </div>

          <div className="p-6 md:p-10">

            {/* =================================================
                EVENT INFORMATION
                ================================================= */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
                  <FaTicketAlt />
                </div>

                <div className="min-w-0">

                  <p className="text-sm text-zinc-500">
                    Event
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {event?.title ||
                      "Event"}
                  </h2>

                  <div className="mt-3 space-y-2 text-sm text-zinc-400">

                    <p className="flex items-center gap-2">
                      <FaCalendarAlt className="text-violet-400" />

                      {eventDate}
                    </p>

                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-violet-400" />

                      {event?.venue ||
                        "Venue TBA"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                TICKET NUMBER
                ================================================= */}

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">

              <p className="text-sm text-zinc-500">
                Ticket Number
              </p>

              <p className="mt-2 break-all text-lg font-bold tracking-wide text-violet-300">
                {ticket?.ticketNumber ||
                  "Generating..."}
              </p>

            </div>

            {/* =================================================
                QR CODE
                ================================================= */}

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-white p-6">

              <p className="mb-5 text-center text-sm font-semibold text-zinc-700">
                Show this QR code at the event entrance
              </p>

              {qrCode ? (
                <img
                  src={qrCode}
                  alt="Event ticket QR code"
                  className="mx-auto h-64 w-64 object-contain md:h-72 md:w-72"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-zinc-500">
                  Unable to load QR code.
                </div>
              )}

            </div>

            {/* =================================================
                INFORMATION
                ================================================= */}

            <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-center text-sm text-zinc-400">
              Keep this QR code available when you arrive
              at the event.
            </div>

            {/* =================================================
                DONE
                ================================================= */}

            <button
              type="button"
              onClick={onDone}
              className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-4 font-bold text-white transition hover:bg-violet-700"
            >
              Done
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}