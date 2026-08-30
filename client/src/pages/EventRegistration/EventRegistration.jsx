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
  FaRupeeSign,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getEventById,
} from "../../api/events.api";

import {
  registerForEvent,
} from "../../api/registrations.api";

import {
  getMyTickets,
  getTicketQR,
} from "../../api/tickets.api";

import { useAuth } from "../../hooks/useAuth";
import usersApi from "../../api/users";
import * as teamsApi from "../../api/teams.api";




import RegistrationSuccess from "../../components/events/RegistrationSuccess";

import EventPoster from "../../components/sections/Events/EventPoster";

import PaymentProofUpload from "../../components/events/PaymentProofUpload";

/**
 * ============================================================
 * Default Poster
 * ============================================================
 */

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

  /**
   * ==========================================================
   * State
   * ==========================================================
   */

  const { user } = useAuth();

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

  const [paymentScreenshot, setPaymentScreenshot] =
    useState(null);

  const [registrationPending, setRegistrationPending] =
    useState(false);

  const [isConfirmed, setIsConfirmed] = 
    useState(false);

  const [teamName, setTeamName] = useState("");
  const [participants, setParticipants] = useState([
    {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || user?.mobileNumber || "",
      collegeId: user?.collegeId || user?.college || "",
      department: "",
      yearOfStudy: "",
    }
  ]);

  useEffect(() => {
    if (event && event.type === "TEAM") {
      const max = event.teamSize || 2;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticipants(prev => {
        const next = [...prev];
        while (next.length < max) {
          next.push({ fullName: "", email: "", phone: "", collegeId: "", department: "", yearOfStudy: "" });
        }
        return next;
      });
    }
  }, [event]);

  const handleParticipantChange = (index, field, value) => {
    setParticipants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

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

      const isPaidEvent = event.isPaid || event.title?.toLowerCase().includes("workshop") || event.title?.toLowerCase().includes("paper") || event.title?.toLowerCase().includes("poster") || event.title?.toLowerCase().includes("hardware");


      if (isPaidEvent && !paymentScreenshot) {
        setError("Payment screenshot is required for paid events.");
        return;
      }

      if (isTeamEvent) {
        if (!teamName.trim()) {
          setError("Team Name is required.");
          return;
        }
        for (let i = 0; i < participants.length; i++) {
           const p = participants[i];
           if (!p.fullName || !p.email || !p.phone || !p.collegeId || !p.department || !p.yearOfStudy) {
              setError(`Please fill all required details for Participant ${i + 1}`);
              return;
           }
        }
      } else {
         const p = participants[0];
         if (!p.fullName || !p.email || !p.phone || !p.collegeId || !p.department || !p.yearOfStudy) {
            setError("Please fill in all required participant details.");
            return;
         }
      }

      try {
        setProcessing(true);
        setError("");

        let finalTeamId = null;
        if (isTeamEvent) {
          const team = await teamsApi.createTeamBulk({
            eventId,
            teamName,
            participants,
          });
          finalTeamId = team._id;
        } else {
          try {
            await usersApi.updateProfile({
              fullName: participants[0].fullName,
              phone: participants[0].phone,
              collegeId: participants[0].collegeId,
            });
          } catch (updateErr) {
            console.error("Failed to update profile:", updateErr);
          }
        }

        const registrationPayload = {
          event: eventId,
        };

        if (isTeamEvent) {
          registrationPayload.teamId = finalTeamId;
        }


        if (isPaidEvent && paymentScreenshot) {
          registrationPayload.screenshotUrl = paymentScreenshot.url;
          registrationPayload.screenshotPublicId = paymentScreenshot.publicId;
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

        const paymentRequired =
          Boolean(
            result?.paymentRequired,
          );

        if (paymentRequired) {
          setRegistrationPending(true);
        } else {
          await loadRegistrationTicket(
            registration._id,
          );
        }
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

  if (registrationPending) {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center mt-20">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-violet-600/20 text-5xl text-violet-500 ring-4 ring-violet-500/30">
            <FaCheckCircle />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Registration Submitted!
          </h1>
          <p className="text-lg text-zinc-400 mb-2">
            Your payment is pending verification.
          </p>
          <p className="text-zinc-500">
            Your registration will be confirmed and your ticket will be generated after the organizers verify your payment.
          </p>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700"
          >
            <FaArrowLeft />
            Back to Event
          </button>
        </div>
      </section>
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

          <div className="h-64 w-full md:h-80">
            <EventPoster event={event} />
          </div>

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
                Participant & Team Details
                ================================================= */}

            {canRegister && (
              <div className="mt-8 border-t border-zinc-800 pt-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {isTeamEvent ? "Team Details" : "Participant Details"}
                  </h2>
                </div>
                
                {isTeamEvent && (
                  <div className="mb-8">
                    <label className="text-sm font-medium text-zinc-400 mb-2 block">Team Name *</label>
                    <input 
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {participants.map((p, index) => (
                    <div key={index} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 border-b border-zinc-800 pb-2">
                        {isTeamEvent ? `PARTICIPANT ${index + 1}${index === 0 ? " — TEAM LEADER" : ""}` : "Details"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-zinc-400 font-medium">Full Name *</label>
                          <input type="text" value={p.fullName} onChange={(e) => handleParticipantChange(index, "fullName", e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-zinc-400 font-medium">Email *</label>
                          <input type="email" value={p.email} disabled={index === 0} onChange={(e) => handleParticipantChange(index, "email", e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-zinc-400 font-medium">Mobile Number *</label>
                          <input type="tel" value={p.phone} onChange={(e) => handleParticipantChange(index, "phone", e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-zinc-400 font-medium">College / Institution *</label>
                          <input type="text" value={p.collegeId} onChange={(e) => handleParticipantChange(index, "collegeId", e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-zinc-400 font-medium">Department *</label>
                          <input type="text" value={p.department} onChange={(e) => handleParticipantChange(index, "department", e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-zinc-400 font-medium">Year of Study *</label>
                          <select value={p.yearOfStudy} onChange={(e) => handleParticipantChange(index, "yearOfStudy", e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                            <option value="" disabled>Select year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="5th Year">5th Year</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                Payment Section
                ================================================= */}


            {canRegister && (event.isPaid || event.title?.toLowerCase().includes("workshop") || event.title?.toLowerCase().includes("paper") || event.title?.toLowerCase().includes("poster") || event.title?.toLowerCase().includes("hardware")) && (
              <div className="mt-8 border-t border-zinc-800 pt-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">
                    Payment Details
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Please scan the QR code to pay the registration fee of <span className="font-bold text-white">₹{registrationFee}</span>. You must upload a screenshot of your successful transaction.
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3 shrink-0 flex flex-col items-center bg-white p-4 rounded-xl shadow-lg border border-zinc-200">
                    {(() => {
                      let qrUrl = null;
                      let upiId = null;
                      let label = null;
                      
                      if (event.title?.toLowerCase().includes("workshop")) {
                        qrUrl = import.meta.env.VITE_WORKSHOP_UPI_QR_URL;
                        upiId = "vallabhravula1821-1@oksbi";
                        label = "₹600 / Individual";
                      } else if (event.title?.toLowerCase().includes("paper")) {
                        qrUrl = import.meta.env.VITE_PAPER_PRESENTATION_UPI_QR_URL;
                        upiId = "p6263919@okhdfcbank";
                        label = "₹200 / Team";
                      } else if (event.title?.toLowerCase().includes("poster")) {
                        qrUrl = import.meta.env.VITE_POSTER_PRESENTATION_UPI_QR_URL;
                        upiId = "shafanashaik2006-1@oksbi";
                        label = "₹200 / Team";
                      } else if (event.title?.toLowerCase().includes("hardware")) {
                        qrUrl = import.meta.env.VITE_HARDWARE_EXPO_UPI_QR_URL;
                        upiId = "manasa08016@okicici";
                        label = "₹300 / Team";
                      }
                      
                      return qrUrl ? (
                        <>
                          <img 
                            src={qrUrl} 
                            alt="Official UPI QR Code" 
                            className="w-full aspect-square object-contain"
                          />
                          {upiId && (
                            <p className="mt-2 text-xs text-gray-500 font-mono tracking-wide">{upiId}</p>
                          )}
                          <p className="mt-2 text-black font-semibold text-lg">{label || `₹${registrationFee}`}</p>
                        </>
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-center p-4 rounded-lg">
                          <p className="text-gray-500 text-sm font-medium">QR Code not configured.</p>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <PaymentProofUpload 
                      onUploadComplete={setPaymentScreenshot}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                Confirmation
                ================================================= */}

            {canRegister && (
              <div className="mt-8 border-t border-zinc-800 pt-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-violet-600 focus:ring-violet-600 focus:ring-offset-zinc-950"
                    />
                  </div>
                  <span className="text-sm text-zinc-300 select-none pt-0.5">
                    I confirm that the above information is correct and that I have completed the payment.
                  </span>
                </label>
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
              <div className="mt-8">
                <button
                  onClick={handleRegister}
                  disabled={processing || !isConfirmed || ((event.isPaid || event.title?.toLowerCase().includes("workshop") || event.title?.toLowerCase().includes("paper") || event.title?.toLowerCase().includes("poster") || event.title?.toLowerCase().includes("hardware")) && !paymentScreenshot) }
                  className="w-full rounded-xl bg-violet-600 py-4 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : (event.isPaid || event.title?.toLowerCase().includes("workshop") || event.title?.toLowerCase().includes("paper") || event.title?.toLowerCase().includes("poster") || event.title?.toLowerCase().includes("hardware"))
                      ? `Submit Registration`
                      : "Register Now"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}