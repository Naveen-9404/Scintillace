import {
  FaTimes,
  FaDownload,
  FaQrcode,
} from "react-icons/fa";

export default function TicketQRModal({
  ticket,
  qrCode,
  loading = false,
  error = "",
  onClose,
}) {
  if (!ticket) {
    return null;
  }

  const handleDownload = () => {
    if (!qrCode) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = qrCode;
    link.download = `${ticket.ticketNumber || "scintillace-ticket"}-qr.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* =====================================================
            CLOSE
        ====================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close QR code"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <FaTimes />
        </button>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="pt-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-400">
            <FaQrcode />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-white">
            Event Ticket QR
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Show this QR code at the event entrance.
          </p>
        </div>

        {/* =====================================================
            QR CODE
        ====================================================== */}

        <div className="mt-6 rounded-2xl bg-white p-5">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-violet-600" />
            </div>
          ) : error ? (
            <div className="flex min-h-64 items-center justify-center px-4 text-center text-sm text-red-500">
              {error}
            </div>
          ) : qrCode ? (
            <img
              src={qrCode}
              alt={`QR code for ticket ${ticket.ticketNumber}`}
              className="mx-auto aspect-square w-full max-w-xs object-contain"
            />
          ) : (
            <div className="flex min-h-64 items-center justify-center text-center text-sm text-zinc-500">
              QR code is unavailable.
            </div>
          )}
        </div>

        {/* =====================================================
            TICKET NUMBER
        ====================================================== */}

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Ticket Number
          </p>

          <p className="mt-2 break-all text-sm font-bold tracking-wide text-violet-300">
            {ticket.ticketNumber}
          </p>
        </div>

        {/* =====================================================
            DOWNLOAD
        ====================================================== */}

        {qrCode && !loading && !error && (
          <button
            type="button"
            onClick={handleDownload}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            <FaDownload />
            Download QR
          </button>
        )}

        {/* =====================================================
            CLOSE
        ====================================================== */}

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-zinc-800 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}