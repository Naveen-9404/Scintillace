import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  BedDouble,
  CalendarDays,
  Clock3,
  CreditCard,
  IndianRupee,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

import {
  getMyAccommodationBookings,
} from "../../api/accommodation.api";

import {
  createAccommodationPaymentOrder,
  verifyPayment,
} from "../../api/payments";

import {
  loadRazorpay,
} from "../../utils/razorpay";

/**
 * ============================================================
 * Constants
 * ============================================================
 */

const HOSTEL_NAMES = Object.freeze({
  BOYS: "Boys Hostel",
  GIRLS: "Girls Hostel",
});

/**
 * ============================================================
 * Helpers
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
 * Accommodation Dashboard
 * ============================================================
 */

const AccommodationDashboard = () => {
  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    payingId,
    setPayingId,
  ] = useState(null);

  /**
   * ==========================================================
   * Load Bookings
   * ==========================================================
   */

  const loadBookings = async () => {
    try {
      setLoading(true);

      const data =
        await getMyAccommodationBookings();

      setBookings(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error) {
      console.error(
        "Accommodation dashboard loading error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load accommodation bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ==========================================================
   * Initial Load
   * ==========================================================
   */

  useEffect(() => {
    loadBookings();
  }, []);

  /**
   * ==========================================================
   * Open Razorpay
   * ==========================================================
   */

  const openPayment = async (
    order,
    booking,
  ) => {
    const loaded =
      await loadRazorpay();

    if (!loaded) {
      throw new Error(
        "Unable to load Razorpay Checkout. Please try again.",
      );
    }

    return new Promise(
      (
        resolve,
        reject,
      ) => {
        const razorpay =
          new window.Razorpay({
            key: order.keyId,

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

            prefill: {
              name:
                booking?.user
                  ?.fullName ||
                "",

              email:
                booking?.user
                  ?.email ||
                "",

              contact:
                booking?.user
                  ?.phone ||
                "",
            },

            notes: {
              accommodationId:
                booking?._id ||
                booking?.id ||
                "",
            },

            theme: {
              color:
                "#7c3aed",
            },

            handler:
              async (
                response,
              ) => {
                try {
                  await verifyPayment({
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  });

                  resolve(
                    response,
                  );
                } catch (
                  verificationError
                ) {
                  reject(
                    verificationError,
                  );
                }
              },

            modal: {
              ondismiss:
                () => {
                  reject(
                    new Error(
                      "Payment was cancelled.",
                    ),
                  );
                },
            },
          });

        razorpay.on(
          "payment.failed",
          (
            response,
          ) => {
            reject(
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
   * Pay For Accommodation
   * ==========================================================
   */

  const handlePayment = async (
    booking,
  ) => {
    const accommodationId =
      booking?._id ||
      booking?.id;

    if (!accommodationId) {
      toast.error(
        "Accommodation booking ID is missing.",
      );

      return;
    }

    try {
      setPayingId(
        accommodationId,
      );

      const order =
        await createAccommodationPaymentOrder(
          accommodationId,
        );

      if (
        !order?.orderId ||
        !order?.keyId
      ) {
        throw new Error(
          "Payment order was not created correctly.",
        );
      }

      await openPayment(
        order,
        booking,
      );

      toast.success(
        "Accommodation payment successful.",
      );

      await loadBookings();
    } catch (error) {
      console.error(
        "Accommodation payment error:",
        error,
      );

      const message =
        error?.message ||
        error?.response?.data
          ?.message ||
        "Accommodation payment failed.";

      if (
        message !==
        "Payment was cancelled."
      ) {
        toast.error(
          message,
        );
      }
    } finally {
      setPayingId(null);
    }
  };

  /**
   * ==========================================================
   * Loading State
   * ==========================================================
   */

  if (loading) {
    return (
      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">

        <div className="flex items-center justify-center py-12">

          <Loader2
            className="animate-spin text-primary"
            size={28}
          />

          <span className="ml-3 text-sm text-muted-foreground">
            Loading accommodation bookings...
          </span>

        </div>

      </section>
    );
  }

  /**
   * ==========================================================
   * Empty State
   * ==========================================================
   */

  if (!bookings.length) {
    return (
      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">

            <BedDouble
              size={30}
              className="text-primary"
            />

          </div>

          <h2 className="mt-5 text-2xl font-bold">
            No Accommodation Booking
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            You have not booked accommodation for
            Scintillace yet.
          </p>

        </div>

      </section>
    );
  }

  /**
   * ==========================================================
   * Booking Cards
   * ==========================================================
   */

  return (
    <section className="space-y-6">

      <div>

        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Accommodation
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          My Accommodation
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your hostel booking and accommodation
          payment.
        </p>

      </div>

      {bookings.map(
        (booking) => {
          const accommodationId =
            booking?._id ||
            booking?.id;

          const hostelName =
            HOSTEL_NAMES[
              booking?.hostelType
            ] ||
            booking?.hostelType ||
            "--";

          const paymentStatus =
            booking?.paymentStatus ||
            "Pending";

          const bookingStatus =
            booking?.bookingStatus ||
            "Pending";

          const amount =
            Number(
              booking?.amount ||
                0,
            );

          const days =
            Number(
              booking?.accommodationDays ||
                0,
            );

          const isPaid =
            String(
              paymentStatus,
            ).toUpperCase() ===
            "PAID";

          const isPaying =
            payingId ===
            accommodationId;

          return (
            <article
              key={
                accommodationId
              }
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >

              {/* ==================================================
                  Header
                  ================================================== */}

              <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">

                    <BedDouble
                      className="text-primary"
                      size={24}
                    />

                  </div>

                  <div>

                    <h3 className="text-xl font-bold">
                      {hostelName}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Booking ID:{" "}
                      {accommodationId}
                    </p>

                  </div>

                </div>

                <div
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >

                  {isPaid ? (
                    <CheckCircle2
                      size={16}
                    />
                  ) : (
                    <Clock3
                      size={16}
                    />
                  )}

                  {formatStatus(
                    paymentStatus,
                  )}

                </div>

              </div>

              {/* ==================================================
                  Details
                  ================================================== */}

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

                {/* Check-In */}

                <div className="rounded-2xl bg-muted/40 p-4">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <CalendarDays
                      size={17}
                    />

                    Check-In

                  </div>

                  <p className="mt-2 font-semibold">
                    {formatDate(
                      booking?.checkInDate,
                    )}
                  </p>

                </div>

                {/* Check-Out */}

                <div className="rounded-2xl bg-muted/40 p-4">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <CalendarDays
                      size={17}
                    />

                    Check-Out

                  </div>

                  <p className="mt-2 font-semibold">
                    {formatDate(
                      booking?.checkOutDate,
                    )}
                  </p>

                </div>

                {/* Days */}

                <div className="rounded-2xl bg-muted/40 p-4">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <Clock3
                      size={17}
                    />

                    Accommodation

                  </div>

                  <p className="mt-2 font-semibold">
                    {days}{" "}
                    {days === 1
                      ? "Day"
                      : "Days"}
                  </p>

                </div>

                {/* Amount */}

                <div className="rounded-2xl bg-muted/40 p-4">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <IndianRupee
                      size={17}
                    />

                    Amount

                  </div>

                  <p className="mt-2 font-semibold">
                    ₹{amount}
                  </p>

                </div>

              </div>

              {/* ==================================================
                  Status & Action
                  ================================================== */}

              <div className="flex flex-col gap-4 border-t border-border bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2 text-sm">

                    <CreditCard
                      size={17}
                      className="text-muted-foreground"
                    />

                    <span className="text-muted-foreground">
                      Payment:
                    </span>

                    <strong>
                      {formatStatus(
                        paymentStatus,
                      )}
                    </strong>

                  </div>

                  <div className="mt-2 text-sm">

                    <span className="text-muted-foreground">
                      Booking:
                    </span>{" "}

                    <strong>
                      {formatStatus(
                        bookingStatus,
                      )}
                    </strong>

                  </div>

                </div>

                {!isPaid && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePayment(
                        booking,
                      )
                    }
                    disabled={
                      isPaying
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isPaying ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard
                          size={18}
                        />

                        Pay ₹{amount}

                        <ArrowRight
                          size={18}
                        />
                      </>
                    )}

                  </button>
                )}

                {isPaid && (
                  <div className="flex items-center gap-2 font-semibold text-green-600">

                    <CheckCircle2
                      size={20}
                    />

                    Payment Completed

                  </div>
                )}

              </div>

            </article>
          );
        },
      )}

    </section>
  );
};

export default AccommodationDashboard;