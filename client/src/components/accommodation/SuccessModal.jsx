import { Fragment } from "react";
import {
  Dialog,
  Transition,
} from "@headlessui/react";
import {
  CheckCircle2,
  CalendarDays,
  BedDouble,
  CreditCard,
  ArrowRight,
  X,
  Clock3,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * ============================================================
 * Hostel Names
 * ============================================================
 */

const HOSTEL_NAMES = Object.freeze({
  BOYS: "Boys Hostel",
  GIRLS: "Girls Hostel",
});

/**
 * ============================================================
 * Date Formatter
 * ============================================================
 */

const formatDate = (date) => {
  if (!date) {
    return "--";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

/**
 * ============================================================
 * Status Formatting
 * ============================================================
 */

const formatStatus = (status) => {
  if (!status) {
    return "Pending";
  }

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
};

/**
 * ============================================================
 * Success Modal
 * ============================================================
 *
 * Displayed after an accommodation booking is successfully
 * created.
 *
 * Important:
 *
 * Accommodation booking creation and accommodation payment
 * are separate steps.
 *
 * Initial state:
 *
 * paymentStatus: Pending
 * bookingStatus: Pending
 *
 * Payment can be completed from the participant dashboard
 * after the booking has been created.
 */

const SuccessModal = ({
  open,
  onClose,
  booking,
}) => {
  const navigate = useNavigate();

  if (!booking) {
    return null;
  }

  /**
   * ==========================================================
   * Booking Values
   * ==========================================================
   */

  const accommodationId =
    booking._id ||
    booking.id ||
    booking.bookingId ||
    "--";

  const hostelType =
    booking.hostelType ||
    booking.roomType ||
    "";

  const hostelName =
    HOSTEL_NAMES[hostelType] ||
    hostelType ||
    "Pending";

  const checkInDate =
    booking.checkInDate ||
    booking.checkIn ||
    null;

  const checkOutDate =
    booking.checkOutDate ||
    booking.checkOut ||
    null;

  const accommodationDays =
    booking.accommodationDays ||
    booking.days ||
    0;

  const amount =
    typeof booking.amount === "number"
      ? booking.amount
      : 0;

  const paymentStatus =
    booking.paymentStatus ||
    "Pending";

  const bookingStatus =
    booking.bookingStatus ||
    "Pending";

  /**
   * ==========================================================
   * Navigation
   * ==========================================================
   */



  const handleContinueBrowsing = () => {
    onClose();

    navigate("/events");
  };

  /**
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <Transition.Root
      show={open}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >

        {/* ====================================================
            Backdrop
            ==================================================== */}

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* ====================================================
            Container
            ==================================================== */}

        <div className="fixed inset-0 overflow-y-auto">

          <div className="flex min-h-full items-center justify-center p-6">

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >

              <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* ==================================================
                    Header
                    ================================================== */}

                <div className="border-b border-gray-100 p-8">

                  <div className="flex items-start justify-between gap-6">

                    <div className="flex items-center gap-4">

                      <div className="rounded-full bg-green-100 p-4">

                        <CheckCircle2
                          className="text-green-600"
                          size={40}
                        />

                      </div>

                      <div>

                        <Dialog.Title className="text-3xl font-bold text-gray-900">
                          Booking Successful
                        </Dialog.Title>

                        <p className="mt-2 text-gray-500">
                          Your accommodation request
                          has been submitted successfully.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Close"
                    >
                      <X size={22} />
                    </button>

                  </div>

                </div>

                {/* ==================================================
                    Booking Details
                    ================================================== */}

                <div className="space-y-4 p-8">

                  {/* =================================================
                      Booking ID
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">

                    <span className="text-sm font-medium text-gray-500">
                      Booking ID
                    </span>

                    <strong className="max-w-[60%] break-all text-right text-sm text-gray-900">
                      {accommodationId}
                    </strong>

                  </div>

                  {/* =================================================
                      Hostel
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <BedDouble
                        size={20}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-medium text-gray-600">
                        Preferred Hostel
                      </span>

                    </div>

                    <strong className="text-right text-gray-900">
                      {hostelName}
                    </strong>

                  </div>

                  {/* =================================================
                      Check-In
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <CalendarDays
                        size={20}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-medium text-gray-600">
                        Check-In
                      </span>

                    </div>

                    <strong className="text-right text-gray-900">
                      {formatDate(
                        checkInDate,
                      )}
                    </strong>

                  </div>

                  {/* =================================================
                      Check-Out
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <CalendarDays
                        size={20}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-medium text-gray-600">
                        Check-Out
                      </span>

                    </div>

                    <strong className="text-right text-gray-900">
                      {formatDate(
                        checkOutDate,
                      )}
                    </strong>

                  </div>

                  {/* =================================================
                      Duration
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <Clock3
                        size={20}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-medium text-gray-600">
                        Accommodation Days
                      </span>

                    </div>

                    <strong className="text-right text-gray-900">
                      {accommodationDays > 0
                        ? `${accommodationDays} ${
                            accommodationDays ===
                            1
                              ? "Day"
                              : "Days"
                          }`
                        : "--"}
                    </strong>

                  </div>

                  {/* =================================================
                      Amount
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-blue-50 p-5">

                    <div className="flex items-center gap-3">

                      <IndianRupee
                        size={20}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-medium text-gray-600">
                        Accommodation Amount
                      </span>

                    </div>

                    <strong className="text-xl text-gray-900">
                      {amount > 0
                        ? `₹${amount}`
                        : "TBD"}
                    </strong>

                  </div>

                  {/* =================================================
                      Payment Status
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">

                    <div className="flex items-center gap-3">

                      <CreditCard
                        size={20}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-medium text-gray-600">
                        Payment Status
                      </span>

                    </div>

                    <strong
                      className={
                        paymentStatus === "Paid"
                          ? "text-green-600"
                          : paymentStatus ===
                              "Failed"
                            ? "text-red-600"
                            : "text-orange-600"
                      }
                    >
                      {formatStatus(
                        paymentStatus,
                      )}
                    </strong>

                  </div>

                  {/* =================================================
                      Booking Status
                      ================================================= */}

                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-slate-50 p-5">

                    <span className="text-sm font-medium text-gray-600">
                      Booking Status
                    </span>

                    <strong className="text-blue-600">
                      {formatStatus(
                        bookingStatus,
                      )}
                    </strong>

                  </div>

                </div>

                {/* ==================================================
                    Important Information
                    ================================================== */}

                <div className="mx-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                  <p className="text-sm leading-6 text-amber-800">

                    <strong>
                      Important:
                    </strong>{" "}

                    Your accommodation booking has
                    been created. Room and bed allotment
                    will be handled offline by the
                    Scintillace accommodation team.

                  </p>

                  {paymentStatus !== "Paid" && (
                    <p className="mt-2 text-sm leading-6 text-amber-700">
                      Your accommodation payment is
                      currently pending. Please complete
                      the payment from your accommodation
                      dashboard.
                    </p>
                  )}

                </div>

                {/* ==================================================
                    Actions
                    ================================================== */}

                <div className="flex gap-4 p-8">



                  <button
                    type="button"
                    onClick={
                      handleContinueBrowsing
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-600 py-4 font-semibold text-blue-600 transition hover:bg-blue-50"
                  >

                    Continue Browsing

                    <ArrowRight
                      size={18}
                    />

                  </button>

                </div>

              </Dialog.Panel>

            </Transition.Child>

          </div>

        </div>

      </Dialog>
    </Transition.Root>
  );
};

export default SuccessModal;