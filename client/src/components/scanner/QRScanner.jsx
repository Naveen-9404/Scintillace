import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Html5Qrcode,
} from "html5-qrcode";

import {
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaQrcode,
} from "react-icons/fa";

import toast from "react-hot-toast";

import {
  verifyTicketQR,
} from "../../api/tickets.api";

/**
 * ============================================================
 * QR Scanner
 * ============================================================
 *
 * Responsibilities:
 *
 * 1. Start device camera.
 * 2. Scan Scintillace ticket QR.
 * 3. Send scanned payload to backend.
 * 4. Display verification result.
 *
 * Check-in is intentionally handled separately.
 */

export default function QRScanner({
  onVerified,
  onError,
}) {
  const scannerRef = useRef(null);
  const containerId = "scintillace-qr-reader";

  const [
    scanning,
    setScanning,
  ] = useState(false);

  const [
    starting,
    setStarting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    verifiedTicket,
    setVerifiedTicket,
  ] = useState(null);

  /**
   * ==========================================================
   * Stop Scanner
   * ==========================================================
   */

  const stopScanner = async () => {
    const scanner =
      scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      const state =
        scanner.getState();

      /**
       * Html5Qrcode scanner states:
       *
       * 1 = NOT_STARTED
       * 2 = SCANNING
       * 3 = PAUSED
       */

      if (
        state === 2 ||
        state === 3
      ) {
        await scanner.stop();
      }
    } catch (stopError) {
      console.error(
        "Unable to stop QR scanner:",
        stopError,
      );
    }

    try {
      await scanner.clear();
    } catch (clearError) {
      console.error(
        "Unable to clear QR scanner:",
        clearError,
      );
    }

    scannerRef.current = null;

    setScanning(false);
  };

  /**
   * ==========================================================
   * Verify Scanned QR
   * ==========================================================
   */

  const handleScanSuccess = async (
    decodedText,
  ) => {
    /**
     * Stop scanning immediately after
     * receiving a QR result.
     *
     * This prevents multiple verification
     * requests from the same QR code.
     */

    await stopScanner();

    try {
      setError("");

      /**
       * The backend accepts the complete
       * QR payload.
       */

      const result =
        await verifyTicketQR(
          decodedText,
        );

      const ticket =
        result?.ticket ||
        result?.data?.ticket ||
        result;

      setVerifiedTicket(ticket);

      if (onVerified) {
        onVerified(ticket);
      }

      toast.success(
        "Ticket verified successfully.",
      );
    } catch (verificationError) {
      console.error(
        "Ticket verification failed:",
        verificationError,
      );

      const message =
        verificationError
          ?.response?.data?.message ||
        "Invalid or unavailable ticket.";

      setError(message);

      setVerifiedTicket(null);

      toast.error(message);

      if (onError) {
        onError(
          verificationError,
        );
      }
    }
  };

  /**
   * ==========================================================
   * Start Scanner
   * ==========================================================
   */

  const startScanner = async () => {
    if (scanning || starting) {
      return;
    }

    setStarting(true);
    setError("");
    setVerifiedTicket(null);

    try {
      const scanner =
        new Html5Qrcode(
          containerId,
        );

      scannerRef.current =
        scanner;

      await scanner.start(
        {
          facingMode: {
            ideal: "environment",
          },
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        handleScanSuccess,
        () => {
          /**
           * Ignore normal scanning failures.
           *
           * html5-qrcode continuously reports
           * frames where no QR code is detected.
           */
        },
      );

      setScanning(true);
    } catch (scannerError) {
      console.error(
        "Unable to start QR scanner:",
        scannerError,
      );

      scannerRef.current = null;

      const message =
        scannerError?.message ||
        "Unable to access the camera.";

      setError(message);

      toast.error(
        "Unable to access the camera.",
      );
    } finally {
      setStarting(false);
    }
  };

  /**
   * ==========================================================
   * Cleanup
   * ==========================================================
   */

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  /**
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
    <section className="w-full">

      {/* =====================================================
          Scanner
          ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <FaQrcode />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Scan Event Ticket
              </h2>

              <p className="text-sm text-zinc-500">
                Scan the participant's QR code
              </p>
            </div>

          </div>

        </div>

        <div className="p-5">

          <div
            id={containerId}
            className="overflow-hidden rounded-xl bg-black"
          />

          {!scanning && (
            <button
              type="button"
              onClick={startScanner}
              disabled={starting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaCamera />

              {starting
                ? "Starting Camera..."
                : "Start Scanner"}
            </button>
          )}

          {scanning && (
            <button
              type="button"
              onClick={stopScanner}
              className="mt-5 w-full rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-900"
            >
              Stop Scanner
            </button>
          )}

        </div>

      </div>

      {/* =====================================================
          Error
          ===================================================== */}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">

          <FaExclamationTriangle className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Ticket Verification Failed
            </p>

            <p className="mt-1 text-sm text-red-300/80">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* =====================================================
          Verified Ticket
          ===================================================== */}

      {verifiedTicket && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">

          <div className="flex items-center gap-3">

            <FaCheckCircle className="text-2xl text-emerald-400" />

            <div>
              <h3 className="font-bold text-white">
                Ticket Verified
              </h3>

              <p className="text-sm text-zinc-500">
                The QR code is valid.
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Ticket Number
              </p>

              <p className="mt-1 font-semibold text-white">
                {verifiedTicket.ticketNumber ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Status
              </p>

              <p className="mt-1 font-semibold text-emerald-400">
                {verifiedTicket.status ||
                  "VALID"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Checked In
              </p>

              <p className="mt-1 font-semibold text-white">
                {verifiedTicket.checkedIn
                  ? "Yes"
                  : "No"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Event
              </p>

              <p className="mt-1 font-semibold text-white">
                {verifiedTicket.event
                  ?.title ||
                  verifiedTicket.event ||
                  "—"}
              </p>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}