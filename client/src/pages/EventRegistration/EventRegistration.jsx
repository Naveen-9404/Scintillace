import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaRupeeSign,
  FaUsers,
} from "react-icons/fa";

import {
  getEventById,
} from "../../api/events.api";

import {
  registerForEvent,
} from "../../api/registrations.api";

import {
  createEventPaymentOrder,
  verifyPayment,
} from "../../api/payments";

import {
  getMyTickets,
  getTicketQR,
} from "../../api/tickets.api";

import {
  loadRazorpay,
} from "../../utils/razorpay";

import {
  useAuth,
} from "../../hooks/useAuth";

import TeamRegistration from "../../components/events/TeamRegistration";

import RegistrationSuccess from "../../components/events/RegistrationSuccess";

/**
 * ============================================================
 * Default Poster
 * ============================================================
 */

const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80";

/**
 * ============================================================
 * Event Registration Page
 * ============================================================
 *
 * Supports:
 *
 * INDIVIDUAL EVENTS
 *      ↓
 * Registration
 *      ↓
 * Payment
 *      ↓
 * Ticket
 *
 * TEAM EVENTS
 *      ↓
 * Create / Join Team
 *      ↓
 * Registration
 *      ↓
 * Payment
 *      ↓
 * Ticket
 *
 * Venue is intentionally NOT displayed.
 */

export default function EventRegistration() {
  const { eventId } =
    useParams();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  /**
   * ==========================================================
   * State
   * ==========================================================
   */

  const [event, setEvent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [ticket, setTicket] =
    useState(null);

  const [qrCode, setQrCode] =
    useState("");

  /**
   * ==========================================================
   * Selected team for TEAM events.
   * ==========================================================
   */

  const [selectedTeamId, setSelectedTeamId] =
    useState(null);

  /**
   * ==========================================================
   * Load Event
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await getEventById(
            eventId,
          );

        if (mounted) {
          setEvent(result);
        }
      } catch (err) {
        console.error(
          "Failed to load event:",
          err,
        );

        if (mounted) {
          setError(
            err?.response?.data
              ?.message ||
              "Unable to load this event.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (eventId) {
      loadEvent();
    }

    return () => {
      mounted = false;
    };
  }, [eventId]);

  /**
   * ==========================================================
   * Load Registration Ticket
   * ==========================================================
   */

  const loadRegistrationTicket =
    async (
      registrationId,
    ) => {
      const tickets =
        await getMyTickets();

      const matchingTicket =
        tickets.find(
          (item) => {
            const ticketRegistration =
              item?.registration?._id ||
              item?.registration;

            return (
              ticketRegistration?.toString() ===
              registrationId?.toString()
            );
          },
        );

      /**
       * Fallback by event.
       */

      const eventTicket =
        matchingTicket ||
        tickets.find(
          (item) => {
            const ticketEvent =
              item?.event?._id ||
              item?.event;

            return (
              ticketEvent?.toString() ===
              eventId?.toString()
            );
          },
        );

      if (!eventTicket?._id) {
        throw new Error(
          "Payment was successful, but your ticket could not be loaded. Please contact the event coordinator.",
        );
      }

      const qr =
        await getTicketQR(
          eventTicket._id,
        );

      setTicket(
        eventTicket,
      );

      /**
       * ========================================================
       * QR CODE RESPONSE
       * ========================================================
       *
       * Backend response:
       *
       * {
       *   ticketQR: {
       *     ticketNumber: "...",
       *     qrCode: "data:image/png;base64,..."
       *   }
       * }
       *
       * Keep qr?.qrCode as a fallback for compatibility.
       */

      setQrCode(
        qr?.ticketQR?.qrCode ||
        qr?.qrCode ||
        "",
      );
    };

  /**
   * ==========================================================
   * Open Razorpay
   * ==========================================================
   */

  const openPayment =
    async (order) => {
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

              /**
               * Backend amount is INR.
               * Razorpay expects paise.
               */

              amount:
                Number(order.amount) *
                100,

              currency:
                order.currency,

              name:
                "Scintillace",

              description:
                event?.title ||
                "Event Registration",

              order_id:
                order.orderId,

              prefill: {
                name:
                  user?.fullName ||
                  "",

                email:
                  user?.email ||
                  "",

                contact:
                  user?.phone ||
                  "",
              },

              notes: {
                eventId:
                  event?._id ||
                  eventId,
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
            (response) => {
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
   * Register For Event
   * ==========================================================
   */

  const handleRegister =
    async () => {
      if (!event) {
        return;
      }

      /**
       * --------------------------------------------------------
       * Determine Event Type
       * --------------------------------------------------------
       *
       * IMPORTANT:
       *
       * Do NOT use teamSize here.
       *
       * The current Scintillace seed data intentionally has
       * teamSize: null for some team events.
       *
       * Event.type is the source of truth.
       */

      const isTeamEvent =
        event.type === "TEAM";

      /**
       * --------------------------------------------------------
       * Validate Team Selection
       * --------------------------------------------------------
       */

      if (
        isTeamEvent &&
        !selectedTeamId
      ) {
        setError(
          "Please create or join a team before continuing.",
        );

        return;
      }

      try {
        setProcessing(true);
        setError("");

        /**
         * ------------------------------------------------------
         * 1. CREATE REGISTRATION
         * ------------------------------------------------------
         */

        const registrationPayload =
          {
            event: eventId,
          };

        if (isTeamEvent) {
          registrationPayload.teamId =
            selectedTeamId;
        }

        const result =
          await registerForEvent(
            registrationPayload,
          );

        const registration =
          result?.registration;

        if (!registration?._id) {
          throw new Error(
            "Registration was not created correctly.",
          );
        }

        /**
         * ------------------------------------------------------
         * 2. CHECK WHETHER PAYMENT IS REQUIRED
         * ------------------------------------------------------
         *
         * The registration backend already determines this.
         */

        const paymentRequired =
          Boolean(
            result?.paymentRequired,
          );

        /**
         * ------------------------------------------------------
         * 3. PAYMENT
         * ------------------------------------------------------
         */

        if (paymentRequired) {
          const order =
            await createEventPaymentOrder(
              registration._id,
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
          );
        }

        /**
         * ------------------------------------------------------
         * 4. LOAD TICKET
         * ------------------------------------------------------
         *
         * For paid events, the backend creates the ticket
         * after successful payment verification.
         */

        await loadRegistrationTicket(
          registration._id,
        );
      } catch (err) {
        console.error(
          "Event registration failed:",
          err,
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Unable to complete registration.",
        );
      } finally {
        setProcessing(false);
      }
    };

  /**
   * ==========================================================
   * Loading
   * ==========================================================
   */

  if (loading) {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-center py-32">
          <div className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />

            <p className="text-zinc-400">
              Loading event...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * ==========================================================
   * Event Not Found
   * ==========================================================
   */

  if (!event) {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">
            Event unavailable
          </h1>

          <p className="mt-4 text-zinc-400">
            {error ||
              "We couldn't find this event."}
          </p>

          <Link
            to="/events"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-700"
          >
            <FaArrowLeft />
            Back to Events
          </Link>
        </div>
      </section>
    );
  }

  /**
   * ==========================================================
   * Success / Ticket Screen
   * ==========================================================
   */

  if (ticket) {
    return (
      <RegistrationSuccess
        event={event}
        ticket={ticket}
        qrCode={qrCode}
        onDone={() =>
          navigate(
            `/events/${eventId}`,
          )
        }
      />
    );
  }

  /**
   * ==========================================================
   * Event Information
   * ==========================================================
   */

  const startDate =
    event.startDateTime
      ? new Date(
          event.startDateTime,
        )
      : null;

  const eventDate =
    startDate
      ? startDate.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        )
      : "Date unavailable";

  const eventTime =
    startDate
      ? startDate.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )
      : "Time unavailable";

  const registrationFee =
    Number(
      event.registrationFee || 0,
    );

  /**
   * Event.type is the source of truth.
   */

  const isTeamEvent =
    event.type === "TEAM";

  const registrationOpen =
    Boolean(
      event.registrationOpen,
    );

  const deadlinePassed =
    event.registrationDeadline
      ? new Date(
          event.registrationDeadline,
        ) < new Date()
      : false;

  const canRegister =
    registrationOpen &&
    !deadlinePassed;

  /**
   * ==========================================================
   * Registration Page
   * ==========================================================
   */

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">

        {/* Back */}

        <Link
          to={`/events/${eventId}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <FaArrowLeft />

          Back to Event
        </Link>

        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">

          {/* ==================================================
              Poster
              ================================================== */}

          <img
            src={
              event.poster ||
              event.posterUrl ||
              DEFAULT_POSTER
            }
            alt={
              event.title ||
              "Event"
            }
            className="h-64 w-full object-cover md:h-80"
          />

          <div className="p-6 md:p-10">

            {/* Category */}

            {event.category && (
              <span className="inline-flex rounded-full bg-violet-600/15 px-4 py-2 text-sm font-semibold text-violet-300 ring-1 ring-violet-500/20">
                {event.category}
              </span>
            )}

            {/* Title */}

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-5xl">
              {event.title}
            </h1>

            {/* Description */}

            {event.description && (
              <p className="mt-5 max-w-3xl leading-7 text-zinc-400">
                {event.description}
              </p>
            )}

            {/* =================================================
                Event Information
                ================================================= */}

            <div className="mt-8 grid gap-4 md:grid-cols-2">

              {/* Date */}

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <FaCalendarAlt className="text-violet-400" />

                <p className="mt-3 text-sm text-zinc-500">
                  Date
                </p>

                <p className="mt-1 font-semibold">
                  {eventDate}
                </p>
              </div>

              {/* Time */}

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <FaClock className="text-violet-400" />

                <p className="mt-3 text-sm text-zinc-500">
                  Time
                </p>

                <p className="mt-1 font-semibold">
                  {eventTime}
                </p>
              </div>

            </div>

            {/* =================================================
                Registration Summary
                ================================================= */}

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                {/* Registration Type */}

                <div>
                  <p className="text-sm text-zinc-500">
                    Registration Type
                  </p>

                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <FaUsers className="text-violet-400" />

                    {isTeamEvent
                      ? "Team Event"
                      : "Individual Event"}
                  </p>
                </div>

                {/* Fee */}

                <div className="sm:text-right">
                  <p className="text-sm text-zinc-500">
                    Registration Fee
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-violet-400">
                    <FaRupeeSign className="text-lg" />

                    {registrationFee}
                  </p>
                </div>

              </div>

            </div>

            {/* =================================================
                Team Registration
                ================================================= */}

            {isTeamEvent &&
              canRegister && (
                <div className="mt-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Team Registration
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Create a new team or join
                      an existing team before
                      registering for this event.
                    </p>
                  </div>

                  <TeamRegistration
                    event={event}
                    selectedTeamId={
                      selectedTeamId
                    }
                    onTeamSelected={
                      setSelectedTeamId
                    }
                  />
                </div>
              )}

            {/* =================================================
                Error
                ================================================= */}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {/* =================================================
                Closed Registration
                ================================================= */}

            {!canRegister && (
              <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800/50 px-5 py-4 text-center text-sm text-zinc-400">
                Registration for this event is
                currently closed.
              </div>
            )}

            {/* =================================================
                Register Button
                ================================================= */}

            {canRegister && (
              <button
                type="button"
                disabled={
                  processing ||
                  (isTeamEvent &&
                    !selectedTeamId)
                }
                onClick={
                  handleRegister
                }
                className="
                  mt-8
                  w-full
                  rounded-xl
                  bg-violet-600
                  px-6
                  py-4
                  text-base
                  font-bold
                  text-white
                  transition
                  hover:bg-violet-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  md:text-lg
                "
              >
                {processing
                  ? "Processing..."
                  : isTeamEvent
                    ? `Register Team & Pay ₹${registrationFee}`
                    : `Register & Pay ₹${registrationFee}`}
              </button>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}