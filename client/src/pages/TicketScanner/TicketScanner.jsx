import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Html5Qrcode,
} from "html5-qrcode";

import toast from "react-hot-toast";

import {
  verifyTicketQR,
  checkInTicket,
} from "../../api/tickets.api";

import {
  getMyVolunteerAssignments,
} from "../../api/volunteers.api";

export default function TicketScanner() {
  /**
   * ============================================================
   * Scanner
   * ============================================================
   */

  const scannerRef =
    useRef(null);

  const processingScanRef =
    useRef(false);

  /**
   * ============================================================
   * State
   * ============================================================
   */

  const [
    assignment,
    setAssignment,
  ] = useState(null);

  const [
    assignmentLoading,
    setAssignmentLoading,
  ] = useState(true);

  const [
    assignmentError,
    setAssignmentError,
  ] = useState("");

  const [
    scanning,
    setScanning,
  ] = useState(false);

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const [
    checkingIn,
    setCheckingIn,
  ] = useState(false);

  const [
    ticket,
    setTicket,
  ] = useState(null);

  const [
    checkInSuccessful,
    setCheckInSuccessful,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /**
   * ============================================================
   * Assigned Event
   * ============================================================
   */

  const assignedEvent =
    assignment?.event || null;

  const assignedEventId =
    assignedEvent?.id ||
    assignedEvent?._id ||
    assignment?.eventId ||
    null;

  /**
   * ============================================================
   * Load Assignment
   * ============================================================
   */

  const loadAssignment =
    async () => {
      try {
        setAssignmentLoading(true);
        setAssignmentError("");

        const assignments =
          await getMyVolunteerAssignments();

        const activeAssignment =
          assignments.find(
            (item) =>
              item?.status ===
                "ACTIVE" &&
              (
                item?.event?.id ||
                item?.event?._id ||
                item?.eventId
              ),
          );

        if (!activeAssignment) {
          throw new Error(
            "This scanner account is not assigned to an active event.",
          );
        }

        setAssignment(
          activeAssignment,
        );
      } catch (loadError) {
        console.error(
          "Scanner assignment error:",
          loadError,
        );

        const message =
          loadError?.response
            ?.data?.message ||
          loadError?.message ||
          "Unable to load scanner assignment.";

        setAssignmentError(
          message,
        );

        toast.error(
          message,
        );
      } finally {
        setAssignmentLoading(
          false,
        );
      }
    };

  /**
   * ============================================================
   * Initial Load
   * ============================================================
   */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssignment();
  }, []);

  /**
   * ============================================================
   * Stop Scanner
   * ============================================================
   */

  const stopScanner =
    async () => {
      const scanner =
        scannerRef.current;

      if (!scanner) {
        setScanning(false);
        return;
      }

      try {
        await scanner.stop();
      } catch (stopError) {
        console.warn(
          "Scanner stop warning:",
          stopError,
        );
      }

      try {
        await scanner.clear();
      } catch (clearError) {
        console.warn(
          "Scanner clear warning:",
          clearError,
        );
      }

      scannerRef.current =
        null;

      setScanning(false);
    };

  /**
   * ============================================================
   * Get Event ID
   * ============================================================
   */

  const getEventId =
    (event) => {
      if (!event) {
        return null;
      }

      if (
        typeof event ===
        "string"
      ) {
        return event;
      }

      return (
        event.id ||
        event._id ||
        null
      );
    };

  /**
   * ============================================================
   * Get Ticket Event ID
   * ============================================================
   */

  const getTicketEventId =
    (verifiedTicket) => {
      if (!verifiedTicket) {
        return null;
      }

      if (
        verifiedTicket.event
      ) {
        return getEventId(
          verifiedTicket.event,
        );
      }

      return (
        verifiedTicket.eventId ||
        null
      );
    };

  /**
   * ============================================================
   * Verify QR
   * ============================================================
   */

  const handleScan =
    async (decodedText) => {
      if (
        !decodedText ||
        processingScanRef.current ||
        verifying ||
        checkingIn
      ) {
        return;
      }

      processingScanRef.current =
        true;

      try {
        setVerifying(true);
        setError("");
        setTicket(null);
        setCheckInSuccessful(false);

        await stopScanner();

        /**
         * ------------------------------------------------------
         * Backend QR Verification
         * ------------------------------------------------------
         */

        const result =
          await verifyTicketQR(
            decodedText,
          );

        if (
          !result?.valid ||
          !result?.ticket
        ) {
          throw new Error(
            "Invalid ticket QR code.",
          );
        }

        const verifiedTicket =
          result.ticket;

        /**
         * ------------------------------------------------------
         * Event Authorization
         * ------------------------------------------------------
         */

        const ticketEventId =
          getTicketEventId(
            verifiedTicket,
          );

        if (
          !ticketEventId ||
          !assignedEventId
        ) {
          throw new Error(
            "Unable to determine the event associated with this ticket.",
          );
        }

        if (
          ticketEventId.toString() !==
          assignedEventId.toString()
        ) {
          throw new Error(
            `Wrong event. This scanner is assigned to ${
              assignedEvent?.title ||
              "another event"
            }.`,
          );
        }

        /**
         * ------------------------------------------------------
         * Ticket is valid for this scanner
         * ------------------------------------------------------
         */

        setTicket(
          verifiedTicket,
        );

        toast.success(
          "Ticket verified successfully.",
        );
      } catch (scanError) {
        console.error(
          "QR verification error:",
          scanError,
        );

        const message =
          scanError?.response
            ?.data?.message ||
          scanError?.message ||
          "Unable to verify this QR code.";

        setError(
          message,
        );

        toast.error(
          message,
        );
      } finally {
        setVerifying(false);

        processingScanRef.current =
          false;
      }
    };

  /**
   * ============================================================
   * Start Scanner
   * ============================================================
   */

  const startScanner =
    async () => {
      if (
        scannerRef.current ||
        scanning ||
        assignmentLoading ||
        !assignedEventId
      ) {
        return;
      }

      setError("");
      setTicket(null);
      setCheckInSuccessful(false);

      processingScanRef.current =
        false;

      let scanner = null;

      try {
        scanner =
          new Html5Qrcode(
            "ticket-qr-reader",
          );

        scannerRef.current =
          scanner;

        await scanner.start(
          {
            facingMode:
              "environment",
          },
          {
            fps: 10,

            qrbox: {
              width: 280,
              height: 280,
            },

            aspectRatio: 1,
          },
          handleScan,
          () => {},
        );

        setScanning(true);
      } catch (scannerError) {
        console.error(
          "Unable to start scanner:",
          scannerError,
        );

        if (scanner) {
          try {
            await scanner.clear();
          } catch {
            // Ignore cleanup errors.
          }
        }

        scannerRef.current =
          null;

        setScanning(false);

        const message =
          scannerError?.message ||
          "Unable to access the camera.";

        setError(
          `Camera error: ${message}`,
        );

        toast.error(
          "Unable to access the camera.",
        );
      }
    };

  /**
   * ============================================================
   * Check In Ticket
   * ============================================================
   */

  const handleCheckIn =
    async () => {
      const ticketId =
        ticket?.id ||
        ticket?._id;

      if (!ticketId) {
        toast.error(
          "Ticket ID is unavailable.",
        );

        return;
      }

      /**
       * ------------------------------------------------------
       * Prevent duplicate check-in
       * ------------------------------------------------------
       */

      if (
        ticket.checkedIn ||
        ticket.status === "USED"
      ) {
        toast.error(
          "This ticket has already been checked in.",
        );

        return;
      }

      /**
       * ------------------------------------------------------
       * Ticket must be active
       * ------------------------------------------------------
       */

      if (
        ticket.status !== "ACTIVE"
      ) {
        toast.error(
          "This ticket cannot be checked in.",
        );

        return;
      }

      /**
       * ------------------------------------------------------
       * Final frontend event check
       * ------------------------------------------------------
       */

      const ticketEventId =
        getTicketEventId(
          ticket,
        );

      if (
        !ticketEventId ||
        !assignedEventId ||
        ticketEventId.toString() !==
          assignedEventId.toString()
      ) {
        toast.error(
          "This ticket does not belong to your assigned event.",
        );

        return;
      }

      try {
        setCheckingIn(true);
        setError("");

        /**
         * Backend performs the final authorization.
         *
         * It receives:
         *
         * - ticket ID
         * - authenticated user ID
         * - authenticated user role
         *
         * and verifies the volunteer assignment.
         */

        const updatedTicket =
          await checkInTicket(
            ticketId,
          );

        const finalTicket =
          updatedTicket || {
            ...ticket,

            checkedIn:
              true,

            checkedInAt:
              new Date().toISOString(),

            status:
              "USED",
          };

        setTicket(
          finalTicket,
        );

        setCheckInSuccessful(
          true,
        );

        toast.success(
          "Participant checked in successfully.",
        );
      } catch (checkInError) {
        console.error(
          "Ticket check-in error:",
          checkInError,
        );

        const message =
          checkInError?.response
            ?.data?.message ||
          checkInError?.message ||
          "Unable to check in this ticket.";

        setError(
          message,
        );

        toast.error(
          message,
        );
      } finally {
        setCheckingIn(false);
      }
    };

  /**
   * ============================================================
   * Scan Another Ticket
   * ============================================================
   */

  const handleScanAnother =
    async () => {
      await stopScanner();

      setTicket(null);
      setError("");
      setVerifying(false);
      setCheckingIn(false);
      setCheckInSuccessful(false);

      processingScanRef.current =
        false;

      setTimeout(() => {
        startScanner();
      }, 100);
    };

  /**
   * ============================================================
   * Retry Assignment
   * ============================================================
   */

  const handleRetry =
    async () => {
      setAssignment(null);
      setAssignmentError("");

      await loadAssignment();
    };

  /**
   * ============================================================
   * Cleanup
   * ============================================================
   */

  useEffect(() => {
    return () => {
      const scanner =
        scannerRef.current;

      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current =
              null;
          });
      }
    };
  }, []);

  /**
   * ============================================================
   * Assignment Loading
   * ============================================================
   */

  if (assignmentLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6 md:py-14">
        <div className="mx-auto max-w-3xl">

          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Scintillace
            </p>

            <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Ticket Scanner
            </h1>

            <p className="mt-3 text-zinc-400">
              Loading scanner assignment...
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-violet-500" />

            <p className="mt-5 text-sm text-zinc-400">
              Verifying your event access.
            </p>

          </div>

        </div>
      </main>
    );
  }

  /**
   * ============================================================
   * Assignment Error
   * ============================================================
   */

  if (
    assignmentError ||
    !assignment ||
    !assignedEventId
  ) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6 md:py-14">
        <div className="mx-auto max-w-3xl">

          <div className="mb-8 text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Scintillace
            </p>

            <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Ticket Scanner
            </h1>

          </div>

          <div className="rounded-3xl border border-red-500/20 bg-zinc-900 p-8 text-center shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Scanner Access Unavailable
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {assignmentError ||
                "This scanner account is not assigned to an active event."}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold transition hover:bg-violet-700"
            >
              Retry
            </button>

          </div>

        </div>
      </main>
    );
  }

  /**
   * ============================================================
   * Main UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6 md:py-14">
      <div className="mx-auto max-w-3xl">

        {/* ====================================================
            Header
            ==================================================== */}

        <div className="mb-8 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Scintillace
          </p>

          <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">
            Ticket Scanner
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Scan participant QR codes for your assigned event.
          </p>

        </div>

        {/* ====================================================
            Assigned Event
            ==================================================== */}

        <div className="mb-8 rounded-3xl border border-violet-500/20 bg-violet-500/10 p-5 text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Assigned Event
          </p>

          <h2 className="mt-2 text-xl font-extrabold text-white md:text-2xl">
            {assignedEvent?.title ||
              "Assigned Event"}
          </h2>

          {assignedEvent?.venue && (
            <p className="mt-2 text-sm text-violet-200/70">
              {assignedEvent.venue}
            </p>
          )}

          <p className="mt-3 text-xs text-violet-300/70">
            Only tickets belonging to this event
            can be checked in.
          </p>

        </div>

        {/* ====================================================
            Scanner
            ==================================================== */}

        {!ticket && (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">

            <div className="border-b border-zinc-800 px-6 py-5">

              <h2 className="text-lg font-bold">
                Scan Ticket QR
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Position the participant QR code inside
                the scanning box.
              </p>

            </div>

            <div className="p-6">

              <div
                id="ticket-qr-reader"
                className="mx-auto min-h-[320px] max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-black"
              />

              {!scanning &&
                !verifying && (
                  <button
                    type="button"
                    onClick={
                      startScanner
                    }
                    className="mt-6 w-full rounded-xl bg-violet-600 px-6 py-4 font-bold text-white transition hover:bg-violet-700"
                  >
                    Open Camera
                  </button>
                )}

              {scanning && (
                <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center text-sm text-emerald-300">
                  Camera active. Scan the participant&apos;s QR code.
                </div>
              )}

              {verifying && (
                <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/10 px-5 py-4 text-center text-sm text-violet-300">
                  Verifying ticket...
                </div>
              )}

              {error && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
                  {error}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ====================================================
            Ticket Result
            ==================================================== */}

        {ticket && (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">

            {/* ==================================================
                Result Header
                ================================================== */}

            <div
              className={`px-6 py-8 text-center ${
                checkInSuccessful
                  ? "bg-gradient-to-r from-emerald-700 to-green-600"
                  : "bg-gradient-to-r from-violet-700 to-purple-600"
              }`}
            >

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-3xl">
                {checkInSuccessful
                  ? "✓"
                  : "✓"}
              </div>

              <h2 className="mt-4 text-2xl font-extrabold">

                {checkInSuccessful
                  ? "Check-In Successful"
                  : "Ticket Verified"}

              </h2>

              <p className="mt-2 text-violet-100">

                {checkInSuccessful
                  ? "Participant entry has been recorded."
                  : "This ticket belongs to your assigned event."}

              </p>

            </div>

            <div className="space-y-5 p-6 md:p-8">

              {/* ==================================================
                  Ticket Number
                  ================================================== */}

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-sm text-zinc-500">
                  Ticket Number
                </p>

                <p className="mt-1 break-all text-xl font-bold text-violet-300">
                  {ticket.ticketNumber}
                </p>

              </div>

              {/* ==================================================
                  Event
                  ================================================== */}

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                <p className="text-sm text-zinc-500">
                  Event
                </p>

                <p className="mt-1 text-lg font-bold">
                  {ticket.event?.title ||
                    assignedEvent?.title ||
                    "Event"}
                </p>

                {ticket.event?.venue && (
                  <p className="mt-2 text-sm text-zinc-400">
                    {ticket.event.venue}
                  </p>
                )}

              </div>

              {/* ==================================================
                  Participant
                  ================================================== */}

              {ticket.user && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                  <p className="text-sm text-zinc-500">
                    Participant
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {ticket.user.fullName ||
                      "Participant"}
                  </p>

                  {ticket.user.email && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {ticket.user.email}
                    </p>
                  )}

                  {ticket.user.phone && (
                    <p className="mt-1 text-sm text-zinc-400">
                      {ticket.user.phone}
                    </p>
                  )}

                  {ticket.user.collegeId && (
                    <p className="mt-1 text-sm text-zinc-400">
                      ID:{" "}
                      {ticket.user.collegeId}
                    </p>
                  )}

                </div>
              )}

              {/* ==================================================
                  Status
                  ================================================== */}

              <div
                className={`rounded-2xl border p-5 ${
                  checkInSuccessful
                    ? "border-emerald-500/20 bg-emerald-500/10"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >

                <p className="text-sm text-zinc-500">
                  Ticket Status
                </p>

                <p
                  className={`mt-1 font-bold ${
                    ticket.checkedIn ||
                    ticket.status ===
                      "USED"
                      ? "text-emerald-400"
                      : "text-violet-300"
                  }`}
                >
                  {ticket.checkedIn ||
                  ticket.status === "USED"
                    ? "CHECKED IN"
                    : ticket.status}
                </p>

                {ticket.checkedInAt && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Checked in at:{" "}
                    {new Date(
                      ticket.checkedInAt,
                    ).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                )}

              </div>

              {/* ==================================================
                  Error
                  ================================================== */}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* ==================================================
                  Check In
                  ================================================== */}

              {!checkInSuccessful &&
                !ticket.checkedIn &&
                ticket.status !==
                  "USED" && (
                  <button
                    type="button"
                    onClick={
                      handleCheckIn
                    }
                    disabled={
                      checkingIn ||
                      ticket.status !==
                        "ACTIVE"
                    }
                    className="w-full rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checkingIn
                      ? "Checking In..."
                      : "Check In Participant"}
                  </button>
                )}

              {/* ==================================================
                  Scan Another
                  ================================================== */}

              <button
                type="button"
                onClick={
                  handleScanAnother
                }
                disabled={
                  checkingIn
                }
                className="w-full rounded-xl border border-zinc-700 px-6 py-4 font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Scan Another Ticket
              </button>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}