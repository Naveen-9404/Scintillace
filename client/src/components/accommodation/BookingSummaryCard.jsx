import {
  BedDouble,
  CalendarDays,
  Moon,
  IndianRupee,
} from "lucide-react";

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
 * Booking Summary Card
 * ============================================================
 *
 * Displays:
 *
 * - Preferred hostel
 * - Check-in date
 * - Check-out date
 * - Accommodation days
 * - Rate per day
 * - Estimated total
 *
 * The backend remains the source of truth for the final
 * accommodation amount.
 */

const BookingSummaryCard = ({
  room,
  checkIn,
  checkOut,
  days = 0,
  amount = 0,
  booking = null,
}) => {
  /**
   * ==========================================================
   * Support Booking Object
   * ==========================================================
   *
   * This component is used in two places:
   *
   * 1. Inside AccommodationForm
   * 2. After successful booking from Accommodation.jsx
   *
   * Therefore support both:
   *
   * room / checkIn / checkOut / days / amount
   *
   * and:
   *
   * booking.hostelType / booking.checkInDate /
   * booking.checkOutDate / booking.accommodationDays /
   * booking.amount
   */

  const hostelType =
    room ||
    booking?.hostelType ||
    "";

  const hostelName =
    HOSTEL_NAMES[hostelType] ||
    hostelType ||
    "--";

  const resolvedCheckIn =
    checkIn ||
    booking?.checkInDate ||
    null;

  const resolvedCheckOut =
    checkOut ||
    booking?.checkOutDate ||
    null;

  const resolvedDays =
    days ||
    booking?.accommodationDays ||
    0;

  const resolvedAmount =
    typeof amount === "number" &&
    amount > 0
      ? amount
      : typeof booking?.amount === "number"
        ? booking.amount
        : 0;

  const hasAmount =
    resolvedAmount > 0;

  /**
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-xl backdrop-blur-xl">

      {/* ======================================================
          Header
          ====================================================== */}

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Review
        </p>

        <h3 className="mt-2 text-2xl font-bold text-white">
          Accommodation Summary
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Review your hostel preference and stay
          details before submitting your booking.
        </p>

      </div>

      {/* ======================================================
          Details
          ====================================================== */}

      <div className="space-y-5">

        {/* ====================================================
            Hostel
            ==================================================== */}

        <div className="flex items-center justify-between gap-6 rounded-2xl border border-white/5 bg-slate-900/50 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">

              <BedDouble
                size={20}
                className="text-cyan-400"
              />

            </div>

            <span className="text-sm text-slate-400">
              Preferred Hostel
            </span>

          </div>

          <span className="text-right font-semibold text-white">
            {hostelName}
          </span>

        </div>

        {/* ====================================================
            Check-In
            ==================================================== */}

        <div className="flex items-center justify-between gap-6">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={20}
              className="text-cyan-400"
            />

            <span className="text-sm text-slate-400">
              Check-In
            </span>

          </div>

          <span className="font-medium text-white">
            {formatDate(resolvedCheckIn)}
          </span>

        </div>

        {/* ====================================================
            Check-Out
            ==================================================== */}

        <div className="flex items-center justify-between gap-6">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={20}
              className="text-cyan-400"
            />

            <span className="text-sm text-slate-400">
              Check-Out
            </span>

          </div>

          <span className="font-medium text-white">
            {formatDate(resolvedCheckOut)}
          </span>

        </div>

        {/* ====================================================
            Accommodation Days
            ==================================================== */}

        <div className="flex items-center justify-between gap-6">

          <div className="flex items-center gap-3">

            <Moon
              size={20}
              className="text-cyan-400"
            />

            <span className="text-sm text-slate-400">
              Accommodation Days
            </span>

          </div>

          <span className="font-medium text-white">

            {resolvedDays > 0
              ? `${resolvedDays} ${
                  resolvedDays === 1
                    ? "Day"
                    : "Days"
                }`
              : "--"}

          </span>

        </div>

      </div>

      {/* ======================================================
          Pricing
          ====================================================== */}

      <div className="my-7 h-px bg-white/10" />

      <div className="space-y-4">

        {/* Rate */}

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <IndianRupee
              size={20}
              className="text-cyan-400"
            />

            <span className="text-sm text-slate-400">
              Rate
            </span>

          </div>

          <span className="font-medium text-slate-300">
            ₹100 / Day
          </span>

        </div>

        {/* Estimated Amount */}

        <div className="flex items-center justify-between">

          <span className="text-sm text-slate-400">
            Estimated Amount
          </span>

          <span className="font-medium text-slate-300">

            {hasAmount
              ? `₹${resolvedAmount}`
              : "To be calculated"}

          </span>

        </div>

      </div>

      {/* ======================================================
          Total
          ====================================================== */}

      <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">

        <div className="flex items-center justify-between gap-6">

          <div>

            <p className="text-sm text-slate-400">
              Total Accommodation Amount
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Final amount is calculated and validated
              by the Scintillace backend.
            </p>

          </div>

          <span className="whitespace-nowrap text-2xl font-black text-cyan-300">

            {hasAmount
              ? `₹${resolvedAmount}`
              : "TBD"}

          </span>

        </div>

      </div>

    </div>
  );
};

export default BookingSummaryCard;