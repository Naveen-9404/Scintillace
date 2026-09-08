import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaTicketAlt,
  FaSyncAlt,
} from "react-icons/fa";

import toast from "react-hot-toast";

import {
  getMyTickets,
  getTicketQR,
} from "../../api/tickets.api";

import TicketCard from "../../components/tickets/TicketCard";
import TicketQRModal from "../../components/tickets/TicketQRModal";

export default function MyTickets() {
  const [
    tickets,
    setTickets,
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
    selectedTicket,
    setSelectedTicket,
  ] = useState(null);

  const [
    qrCode,
    setQrCode,
  ] = useState("");

  const [
    qrLoading,
    setQrLoading,
  ] = useState(false);

  const [
    qrError,
    setQrError,
  ] = useState("");

  /**
   * ==========================================================
   * Load Tickets
   * ==========================================================
   */

  const loadTickets = useCallback(
    async ({
      showLoading = true,
    } = {}) => {
      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const result =
          await getMyTickets();

        setTickets(
          Array.isArray(result)
            ? result
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load tickets:",
          err,
        );

        setError(
          err?.response?.data
            ?.message ||
            "Unable to load your tickets.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  /**
   * ==========================================================
   * Initial Load
   * ==========================================================
   *
   * Defer the initial request so the effect does not
   * synchronously trigger React state updates.
   */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadTickets();
      }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadTickets]);

  /**
   * ==========================================================
   * View QR
   * ==========================================================
   */

  const handleViewQR = async (
    ticket,
  ) => {
    if (!ticket?.id && !ticket?._id) {
      toast.error(
        "Ticket ID is unavailable.",
      );

      return;
    }

    const ticketId =
      ticket.id || ticket._id;

    setSelectedTicket(ticket);
    setQrCode("");
    setQrError("");
    setQrLoading(true);

    try {
      const result =
        await getTicketQR(
          ticketId,
        );

      setQrCode(
        result?.ticketQR
          ?.qrCode ||
          result?.qrCode ||
          "",
      );
    } catch (err) {
      console.error(
        "Failed to load ticket QR:",
        err,
      );

      setQrError(
        err?.response?.data
          ?.message ||
          "Unable to generate the ticket QR code.",
      );
    } finally {
      setQrLoading(false);
    }
  };

  /**
   * ==========================================================
   * Close QR
   * ==========================================================
   */

  const handleCloseQR = () => {
    setSelectedTicket(null);
    setQrCode("");
    setQrError("");
  };

  /**
   * ==========================================================
   * Loading
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 pt-36 pb-10 text-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="h-10 w-52 animate-pulse rounded-lg bg-zinc-800" />

          <div className="mt-3 h-5 w-80 animate-pulse rounded bg-zinc-800" />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  /**
   * ==========================================================
   * Error
   * ==========================================================
   */

  if (error) {
    return (
      <main className="min-h-screen bg-background px-6 pt-36 pb-10 text-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
            <h1 className="text-xl font-bold text-red-300">
              Unable to load tickets
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadTickets()
              }
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-background px-6 pt-36 pb-10 text-foreground md:pt-40 md:pb-14">
        <div className="mx-auto max-w-6xl">

          {/* ==================================================
              HEADER
          =================================================== */}

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <FaTicketAlt />
                </div>

                <h1 className="text-3xl font-extrabold text-white md:text-4xl">
                  My Tickets
                </h1>
              </div>

              <p className="mt-3 max-w-2xl text-zinc-500">
                View your event tickets and show the
                QR code at the event entrance.
              </p>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() =>
                loadTickets({
                  showLoading: false,
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-violet-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSyncAlt
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* ==================================================
              EMPTY STATE
          =================================================== */}

          {!tickets.length ? (
            <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-2xl text-zinc-500">
                <FaTicketAlt />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                No tickets yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Once you successfully register and
                complete payment for an event, your
                ticket will appear here.
              </p>
            </div>
          ) : (
            /* ==================================================
               TICKETS
            =================================================== */

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {tickets.map(
                (ticket) => (
                  <TicketCard
                    key={
                      ticket.id ||
                      ticket._id
                    }
                    ticket={ticket}
                    onViewQR={
                      handleViewQR
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      </main>

      {/* ======================================================
          QR MODAL
      ======================================================= */}

      {selectedTicket && (
        <TicketQRModal
          ticket={
            selectedTicket
          }
          qrCode={qrCode}
          loading={qrLoading}
          error={qrError}
          onClose={
            handleCloseQR
          }
        />
      )}
    </>
  );
}