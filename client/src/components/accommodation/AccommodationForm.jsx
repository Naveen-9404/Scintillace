import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  BedDouble,
  CalendarDays,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import RegistrationSelect from "./RegistrationSelect";
import DateSelection from "./DateSelection";
import BookingSummaryCard from "./BookingSummaryCard";

import {
  createAccommodation,
  getMyAccommodationBookings,
} from "../../api/accommodation.api";

import {
  createAccommodationPaymentOrder,
  verifyPayment,
} from "../../api/payments";

import { loadRazorpay } from "../../utils/razorpay";

/**
 * ============================================================
 * Accommodation Configuration
 * ============================================================
 *
 * Participants select only their preferred hostel.
 *
 * Actual room/bed allotment is handled offline by the
 * Scintillace accommodation team.
 *
 * Pricing:
 * ₹100 per accommodation day.
 */

const HOSTEL_TYPES = Object.freeze({
  BOYS: "BOYS",
  GIRLS: "GIRLS",
});

const PRICE_PER_DAY = 100;

/**
 * ============================================================
 * Accommodation Form
 * ============================================================
 */

const AccommodationForm = ({
  selectedRoom,
  onBookingSuccess,
}) => {
  /**
   * ==========================================================
   * Form State
   * ==========================================================
   */

  const [registrationId, setRegistrationId] =
    useState("");

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /**
   * ==========================================================
   * Selected Hostel
   * ==========================================================
   */

  const hostelType = useMemo(() => {
    if (
      selectedRoom === HOSTEL_TYPES.BOYS ||
      selectedRoom === HOSTEL_TYPES.GIRLS
    ) {
      return selectedRoom;
    }

    return "";
  }, [selectedRoom]);

  /**
   * ==========================================================
   * Accommodation Days
   * ==========================================================
   */

  const accommodationDays = useMemo(() => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const difference =
      end.getTime() - start.getTime();

    const days = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24),
    );

    return days > 0 ? days : 0;
  }, [checkIn, checkOut]);

  /**
   * ==========================================================
   * Estimated Amount
   * ==========================================================
   *
   * This is only for frontend display.
   *
   * Backend remains the source of truth.
   */

  const totalAmount = useMemo(() => {
    if (accommodationDays <= 0) {
      return 0;
    }

    return (
      accommodationDays *
      PRICE_PER_DAY
    );
  }, [accommodationDays]);

  /**
   * ==========================================================
   * Reset Form
   * ==========================================================
   */

  const resetForm = () => {
    setRegistrationId("");
    setCheckIn("");
    setCheckOut("");
    setRemarks("");
  };

  /**
   * ==========================================================
   * Validation
   * ==========================================================
   */

  const validateForm = () => {
    if (!hostelType) {
      toast.error(
        "Please select your preferred hostel.",
      );

      return false;
    }

    if (!registrationId) {
      toast.error(
        "Please select an event registration.",
      );

      return false;
    }

    if (!checkIn) {
      toast.error(
        "Please select check-in date.",
      );

      return false;
    }

    if (!checkOut) {
      toast.error(
        "Please select check-out date.",
      );

      return false;
    }

    if (accommodationDays <= 0) {
      toast.error(
        "Check-out date must be after check-in date.",
      );

      return false;
    }

    return true;
  };

  /**
   * ==========================================================
   * Open Razorpay Checkout
   * ==========================================================
   */

  const openAccommodationPayment =
    async ({
      order,
      accommodation,
    }) => {
      const loaded =
        await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please try again.",
        );
      }

      if (!order?.orderId) {
        throw new Error(
          "Payment order was not created correctly.",
        );
      }

      if (!order?.keyId) {
        throw new Error(
          "Razorpay key was not returned by the server.",
        );
      }

      if (
        order?.amount === undefined ||
        order?.amount === null
      ) {
        throw new Error(
          "Payment amount was not returned by the server.",
        );
      }

      return new Promise(
        (
          resolve,
          reject,
        ) => {
          let settled = false;

          const resolveOnce = (
            value,
          ) => {
            if (settled) {
              return;
            }

            settled = true;
            resolve(value);
          };

          const rejectOnce = (
            error,
          ) => {
            if (settled) {
              return;
            }

            settled = true;
            reject(error);
          };

          const razorpay =
            new window.Razorpay({
              key: order.keyId,

              /**
               * Backend amount is INR.
               * Razorpay expects paise.
               */

              amount:
                Number(order.amount) *
                100,

              currency:
                order.currency ||
                "INR",

              name:
                "Scintillace",

              description:
                "Accommodation Booking",

              order_id:
                order.orderId,

              notes: {
                accommodationId:
                  accommodation?._id ||
                  accommodation?.id ||
                  "",

                hostelType:
                  accommodation?.hostelType ||
                  hostelType,

                registrationId:
                  accommodation?.registration?._id ||
                  accommodation?.registration?.id ||
                  accommodation?.registration ||
                  registrationId,
              },

              theme: {
                color:
                  "#06b6d4",
              },

              handler:
                async (
                  response,
                ) => {
                  try {
                    /**
                     * =================================================
                     * Verify Razorpay Payment
                     * =================================================
                     */

                    const verification =
                      await verifyPayment({
                        razorpay_order_id:
                          response.razorpay_order_id,

                        razorpay_payment_id:
                          response.razorpay_payment_id,

                        razorpay_signature:
                          response.razorpay_signature,
                      });

                    /**
                     * Backend verification response
                     * contains the updated accommodation.
                     */

                    const paidAccommodation =
                      verification?.accommodation;

                    if (
                      !paidAccommodation
                    ) {
                      throw new Error(
                        "Payment was verified, but the updated accommodation booking was not returned.",
                      );
                    }

                    /**
                     * Make sure the backend actually
                     * marked the accommodation as paid.
                     */

                    if (
                      paidAccommodation.paymentStatus !==
                      "Paid"
                    ) {
                      throw new Error(
                        "Payment verification completed, but accommodation payment status was not updated.",
                      );
                    }

                    resolveOnce(
                      paidAccommodation,
                    );
                  } catch (
                    verificationError
                  ) {
                    rejectOnce(
                      verificationError,
                    );
                  }
                },

              modal: {
                ondismiss:
                  () => {
                    rejectOnce(
                      new Error(
                        "Payment was cancelled.",
                      ),
                    );
                  },
              },
            });

          /**
           * =================================================
           * Razorpay Payment Failure
           * =================================================
           */

          razorpay.on(
            "payment.failed",
            (response) => {
              rejectOnce(
                new Error(
                  response?.error
                    ?.description ||
                    "Payment failed.",
                ),
              );
            },
          );

          razorpay.open();
        },
      );
    };

  /**
   * ==========================================================
   * Submit Accommodation Booking
   * ==========================================================
   *
   * Complete flow:
   *
   * 1. Try to create accommodation booking
   * 2. If already exists, reuse existing booking
   * 3. Check payment status
   * 4. Create Razorpay order
   * 5. Open Razorpay Checkout
   * 6. Verify payment
   * 7. Return paid accommodation
   * 8. Show success modal
   */

  const handleSubmit = async (
  event,
) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    setLoading(true);

    /**
     * ======================================================
     * 1. FIND EXISTING ACCOMMODATION FIRST
     * ======================================================
     *
     * Do NOT blindly POST /accommodation.
     *
     * The backend correctly rejects duplicate
     * accommodation bookings with 409 Conflict.
     *
     * We avoid that request completely by checking
     * the user's existing accommodation bookings first.
     */

    const existingBookings =
      await getMyAccommodationBookings();

    const existingAccommodation =
      existingBookings.find(
        (booking) => {
          const bookingRegistrationId =
            booking?.registration?._id ||
            booking?.registration?.id ||
            booking?.registration;

          return (
            bookingRegistrationId &&
            bookingRegistrationId.toString() ===
              registrationId.toString()
          );
        },
      );

    let accommodation;

    /**
     * ======================================================
     * 2. REUSE EXISTING BOOKING
     * ======================================================
     */

    if (existingAccommodation) {
      accommodation =
        existingAccommodation;

      console.log(
        "Existing accommodation found:",
        accommodation,
      );
    } else {
      /**
       * ====================================================
       * 3. CREATE NEW ACCOMMODATION
       * ====================================================
       */

      const payload = {
        registrationId,
        hostelType,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        remarks: remarks.trim(),
      };

      accommodation =
        await createAccommodation(
          payload,
        );

      console.log(
        "New accommodation created:",
        accommodation,
      );
    }

    /**
     * ======================================================
     * 4. VALIDATE ACCOMMODATION ID
     * ======================================================
     */

    const accommodationId =
      accommodation?._id ||
      accommodation?.id;

    if (!accommodationId) {
      throw new Error(
        "Accommodation booking was created/found, but no booking ID was returned.",
      );
    }

    /**
     * ======================================================
     * 5. CHECK CURRENT PAYMENT STATUS
     * ======================================================
     */

    const paymentStatus =
      accommodation?.paymentStatus;

    console.log(
      "Accommodation payment status:",
      paymentStatus,
    );

    /**
     * ======================================================
     * ALREADY PAID
     * ======================================================
     *
     * IMPORTANT:
     *
     * Do NOT show Booking Successful here.
     *
     * This is an old/existing completed payment.
     */

    if (
      paymentStatus === "Paid"
    ) {
      toast.success(
        "This accommodation booking is already paid.",
      );

      resetForm();

      return;
    }

    /**
     * ======================================================
     * INVALID PAYMENT STATE
     * ======================================================
     */

    if (
      paymentStatus !== "Pending"
    ) {
      throw new Error(
        `Accommodation payment cannot be started because its current payment status is "${paymentStatus}".`,
      );
    }

    /**
     * ======================================================
     * 6. CREATE / REUSE RAZORPAY ORDER
     * ======================================================
     */

    toast(
      "Accommodation booking found. Opening payment...",
    );

    const paymentOrder =
      await createAccommodationPaymentOrder(
        accommodationId,
      );

    if (
      !paymentOrder?.orderId
    ) {
      throw new Error(
        "Razorpay order ID was not returned by the server.",
      );
    }

    if (
      !paymentOrder?.keyId
    ) {
      throw new Error(
        "Razorpay key was not returned by the server.",
      );
    }

    if (
      paymentOrder?.amount ===
        undefined ||
      paymentOrder?.amount ===
        null
    ) {
      throw new Error(
        "Payment amount was not returned by the server.",
      );
    }

    console.log(
      "Accommodation payment order:",
      paymentOrder,
    );

    /**
     * ======================================================
     * 7. OPEN RAZORPAY
     * ======================================================
     */

    const paidAccommodation =
      await openAccommodationPayment({
        order:
          paymentOrder,

        accommodation,
      });

    /**
     * ======================================================
     * 8. PAYMENT SUCCESS
     * ======================================================
     *
     * This point is reached ONLY after:
     *
     * Razorpay payment succeeds
     * +
     * backend verification succeeds
     * +
     * backend confirms paymentStatus === "Paid"
     */

    if (
      !paidAccommodation
    ) {
      throw new Error(
        "Payment completed, but no updated accommodation booking was returned.",
      );
    }

    if (
      paidAccommodation.paymentStatus !==
      "Paid"
    ) {
      throw new Error(
        "Payment verification completed, but accommodation payment status is not Paid.",
      );
    }

    /**
     * ======================================================
     * 9. SHOW SUCCESS
     * ======================================================
     */

    toast.success(
      "Accommodation payment completed successfully.",
    );

    if (onBookingSuccess) {
      onBookingSuccess(
        paidAccommodation,
      );
    }

    /**
     * Reset only after successful
     * payment + verification.
     */

    resetForm();
  } catch (error) {
    console.error(
      "Accommodation booking/payment error:",
      error,
    );

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to complete accommodation booking.";

    toast.error(message);
  } finally {
    setLoading(false);
  }
};
    /**
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <section
      id="accommodation-booking"
      className="relative overflow-hidden bg-slate-950 py-28 text-white"
    >
      {/* ======================================================
          Background
          ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-10%] top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[140px]" />

        <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-violet-500/5 blur-[140px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">

        {/* ====================================================
            Heading
            ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="mb-12 text-center"
        >

          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Accommodation Registration
          </span>

          <h2 className="mt-7 text-4xl font-black leading-tight sm:text-5xl">
            Reserve Your

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Festival Stay
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Select your preferred hostel,
            choose your stay dates, and
            complete your accommodation
            payment.
          </p>

        </motion.div>

        {/* ====================================================
            Form Container
            ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl"
        >

          {/* ==================================================
              Form Header
              ================================================== */}

          <div className="border-b border-white/10 bg-white/[0.03] p-8 sm:p-10">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">

                <BedDouble
                  size={26}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h3 className="text-2xl font-bold text-white">
                  Accommodation Booking
                </h3>

                <p className="mt-2 text-slate-400">
                  Choose your preferred hostel
                  and accommodation dates.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              Form
              ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-10 p-8 sm:p-10"
          >

            {/* =================================================
                Event Registration
                ================================================= */}

            <div>

              <div className="mb-5 flex items-center gap-3">

                <FileCheck2
                  size={21}
                  className="text-cyan-400"
                />

                <h3 className="text-lg font-semibold text-white">
                  Event Registration
                </h3>

              </div>

              <RegistrationSelect
                value={registrationId}
                onChange={setRegistrationId}
              />

            </div>

            {/* =================================================
                Selected Hostel
                ================================================= */}

            <div>

              <div className="mb-5 flex items-center gap-3">

                <BedDouble
                  size={21}
                  className="text-cyan-400"
                />

                <h3 className="text-lg font-semibold text-white">
                  Preferred Hostel
                </h3>

              </div>

              {!hostelType ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-300">
                  Please select Boys Hostel or
                  Girls Hostel from the hostel
                  selection section above.
                </div>
              ) : (
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">

                      <CheckCircle2
                        size={24}
                        className="text-cyan-400"
                      />

                    </div>

                    <div>

                      <p className="text-sm text-slate-400">
                        Selected Hostel
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        {hostelType ===
                        HOSTEL_TYPES.BOYS
                          ? "Boys Hostel"
                          : "Girls Hostel"}
                      </p>

                    </div>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Actual room and bed allotment
                    will be handled offline by the
                    Scintillace accommodation team.
                  </p>

                </div>
              )}

            </div>

            {/* =================================================
                Stay Dates
                ================================================= */}

            <div>

              <div className="mb-5 flex items-center gap-3">

                <CalendarDays
                  size={21}
                  className="text-cyan-400"
                />

                <h3 className="text-lg font-semibold text-white">
                  Stay Details
                </h3>

              </div>

              <DateSelection
                checkIn={checkIn}
                checkOut={checkOut}
                setCheckIn={setCheckIn}
                setCheckOut={setCheckOut}
              />

            </div>

            {/* =================================================
                Remarks
                ================================================= */}

            <div>

              <label
                htmlFor="accommodation-remarks"
                className="mb-3 block text-sm font-semibold text-slate-200"
              >
                Remarks

                <span className="ml-2 font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <textarea
                id="accommodation-remarks"
                value={remarks}
                onChange={(event) =>
                  setRemarks(
                    event.target.value,
                  )
                }
                maxLength={1000}
                rows={4}
                placeholder="Add any accommodation-related remarks..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />

              <p className="mt-2 text-right text-xs text-slate-600">
                {remarks.length}/1000
              </p>

            </div>

            {/* =================================================
                Booking Summary
                ================================================= */}

            <BookingSummaryCard
              room={hostelType}
              checkIn={checkIn}
              checkOut={checkOut}
              days={accommodationDays}
              amount={totalAmount}
            />

            {/* =================================================
                Pricing Information
                ================================================= */}

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">

              <div className="flex gap-3">

                <ShieldCheck
                  size={21}
                  className="mt-0.5 flex-shrink-0 text-cyan-300"
                />

                <div className="text-sm leading-6 text-slate-400">

                  <p>
                    <strong className="text-slate-200">
                      Accommodation rate:
                    </strong>{" "}
                    ₹100 per day.
                  </p>

                  <p className="mt-1">
                    The final amount is calculated
                    and validated by the backend.
                  </p>

                  <p className="mt-1">
                    You will be redirected to
                    Razorpay to complete the
                    accommodation payment securely.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                Submit
                ================================================= */}

            <button
              type="submit"
              disabled={
                loading ||
                !hostelType ||
                !registrationId ||
                accommodationDays <= 0
              }
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading
                ? "Processing Payment..."
                : accommodationDays > 0
                  ? `Book & Pay — ₹${totalAmount}`
                  : "Select Accommodation Dates"}
            </button>

          </form>

        </motion.div>

        {/* ====================================================
            Security Note
            ==================================================== */}

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">

          <ShieldCheck
            size={17}
            className="text-cyan-400"
          />

          <span>
            Your accommodation information and
            payment are handled through the
            festival registration system.
          </span>

        </div>

      </div>
    </section>
  );
};

export default AccommodationForm;