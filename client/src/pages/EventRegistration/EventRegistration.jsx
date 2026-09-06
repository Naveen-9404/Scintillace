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
import { getEventById } from "../../api/events.api";
import { publicRegisterForEvent, getGuestRegistrationStatus } from "../../api/registrations.api";
import { getPublicTickets } from "../../api/tickets.api";
import { submitGuestPaymentScreenshot } from "../../api/payments.js";
import { getPublicCertificates, downloadPublicCertificate } from "../../api/certificate.api";
import EventPoster from "../../components/events/EventPoster";
import PaymentProofUpload from "../../components/events/PaymentProofUpload";
import PublicAccommodation from "./PublicAccommodation";

export default function EventRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const [registrationStep, setRegistrationStep] = useState("registration");
  const [registeredData, setRegisteredData] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [generatedTickets, setGeneratedTickets] = useState([]);
  const [generatedCertificates, setGeneratedCertificates] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [downloadingCertId, setDownloadingCertId] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [participants, setParticipants] = useState([
    {
      fullName: "",
      email: "",
      phone: "",
      collegeId: "",
      department: "",
      yearOfStudy: "",
    }
  ]);

  const isTeamEvent = event?.type === "TEAM";
  const lowerTitle = event?.title?.toLowerCase() || "";
  const requiresProjectTitle = lowerTitle.includes("paper") || lowerTitle.includes("poster") || lowerTitle.includes("hardware");

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

  useEffect(() => {
    let mounted = true;

    const loadEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getEventById(eventId);

        if (mounted) {
          setEvent(result);
          
          // Try to recover session if they refreshed during payment step
          const pendingStr = sessionStorage.getItem(`pendingPayment_${eventId}`);
          if (pendingStr) {
            try {
              const pending = JSON.parse(pendingStr);
              if (pending && pending.registrationId && pending.guestToken) {
                setRegisteredData({
                  _id: pending.registrationId,
                  registrationId: pending.registrationId,
                  guestToken: pending.guestToken
                });
                setRegistrationStep("payment");
              }
            } catch (e) {
              console.error("Failed to parse pending payment state", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load event:", err);
        if (mounted) {
          setError(err?.response?.data?.message || "Unable to load this event.");
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


  const handleRegister = async () => {
    if (!event) return;

    const isTeamEvent = event.type === "TEAM";
    
    if (isTeamEvent) {
      if (!teamName.trim()) {
        setError("Team Name is required.");
        return;
      }
      if (requiresProjectTitle && !projectTitle.trim()) {
        setError("Project / Topic Title is required.");
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

      const leader = participants[0];
      const registrationPayload = {
        eventId: eventId,
        participantName: leader.fullName,
        participantEmail: leader.email,
        participantPhone: leader.phone,
        collegeId: leader.collegeId,
        department: leader.department,
        yearOfStudy: leader.yearOfStudy,
      };

      if (isTeamEvent) {
        registrationPayload.teamName = teamName;
        registrationPayload.projectTitle = projectTitle;
        registrationPayload.members = participants.map(p => ({
          participantName: p.fullName,
          participantEmail: p.email,
          participantPhone: p.phone,
          collegeId: p.collegeId,
          department: p.department,
          yearOfStudy: p.yearOfStudy,
        }));
      }

      const result = await publicRegisterForEvent(registrationPayload);
      const guestToken = result?.guestToken;
      const registration = result?.registration;

      if (!registration?._id || !guestToken) {
        throw new Error("Registration was not created correctly or guest token is missing.");
      }

      sessionStorage.setItem(`guestToken_${registration._id}`, guestToken);
      
      const isPaidEvent = event.isPaid || event.title?.toLowerCase().includes("workshop") || event.title?.toLowerCase().includes("paper") || event.title?.toLowerCase().includes("poster") || event.title?.toLowerCase().includes("hardware");

      setRegisteredData({
        _id: registration._id,
        registrationId: registration.registrationId || registration._id,
        guestToken: guestToken
      });

      if (isPaidEvent) {
        sessionStorage.setItem(`pendingPayment_${eventId}`, JSON.stringify({
          registrationId: registration._id,
          guestToken: guestToken
        }));
        setRegistrationStep("payment");
      } else {
        setRegistrationStep("success");
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Event registration failed:", err);
      setError(err?.response?.data?.message || err?.message || "Unable to complete registration.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentScreenshot) {
      setError("Please upload the payment screenshot before submitting.");
      return;
    }
    if (!isConfirmed) {
      setError("Please confirm that the information is correct.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await submitGuestPaymentScreenshot(
        registeredData._id,
        {
          screenshotUrl: paymentScreenshot.url,
          screenshotPublicId: paymentScreenshot.publicId
        },
        registeredData.guestToken
      );

      // Perform one-off status check as requested
      try {
        await getGuestRegistrationStatus(registeredData._id, registeredData.guestToken);
      } catch (error) {
        // Ignore failure as instructed: "If status request fails after successful screenshot submission, do not falsely report payment failure."
        console.warn("Status check failed, ignoring:", error);
      }

      sessionStorage.removeItem(`pendingPayment_${eventId}`);
      setRegistrationStep("success");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Payment submission failed:", err);
      setError(err?.response?.data?.message || err?.message || "Unable to submit payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const cancelPaymentAndRestart = () => {
    sessionStorage.removeItem(`pendingPayment_${eventId}`);
    setRegistrationStep("registration");
    setRegisteredData(null);
    setPaymentScreenshot(null);
    setIsConfirmed(false);
    setError("");
  };

  const fetchGuestAssets = async () => {
    if (!registeredData?._id || !registeredData?.guestToken) {
      setError("Registration details missing. Cannot fetch tickets/certificates.");
      return;
    }
    
    try {
      setLoadingAssets(true);
      setError("");
      
      const ticketsPromise = getPublicTickets(registeredData._id, registeredData.guestToken).catch(() => []);
      const certificatesPromise = getPublicCertificates(registeredData._id, registeredData.guestToken).catch(() => []);

      const [tickets, certificates] = await Promise.all([ticketsPromise, certificatesPromise]);
      
      let foundAny = false;
      if (tickets && tickets.length > 0) {
        setGeneratedTickets(tickets);
        foundAny = true;
      }
      
      if (certificates && certificates.length > 0) {
        setGeneratedCertificates(certificates);
        foundAny = true;
      }

      if (!foundAny) {
        setError("Your tickets/certificates are not ready yet. Please wait for payment verification.");
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("Unable to retrieve tickets or certificates. They may not be generated yet.");
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleDownloadCertificate = async (certificateId, certificateNumber) => {
    try {
      setDownloadingCertId(certificateId);
      const blob = await downloadPublicCertificate(registeredData._id, certificateId, registeredData.guestToken);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scintillace-certificate-${certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      alert("Failed to download certificate.");
    } finally {
      setDownloadingCertId(null);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-center py-32">
          <div className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            <p className="text-zinc-400">Loading event...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">Event unavailable</h1>
          <p className="mt-4 text-zinc-400">{error || "We couldn't find this event."}</p>
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

  if (registrationStep === "success") {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center mt-20">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-violet-600/20 text-5xl text-violet-500 ring-4 ring-violet-500/30">
            <FaCheckCircle />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Registration Submitted!
          </h1>

          <div className="my-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800 inline-block text-left">
            <p className="text-sm text-zinc-400 mb-1">Registration ID</p>
            <p className="font-mono text-violet-400 text-lg font-bold">
              {registeredData?.registrationId || registeredData?._id}
            </p>
          </div>

          <p className="text-lg text-zinc-300 mb-2 font-medium">
            Payment proof submitted successfully. Your payment is now pending verification.
          </p>
          <p className="text-zinc-500 mb-8">
            Your registration has been created. It will be confirmed and your ticket will be generated after the organizers verify your payment.
          </p>
          
          {loadingAssets && <p className="text-zinc-400 text-sm mb-4 animate-pulse">Checking for generated tickets and certificates...</p>}
          
          {!loadingAssets && generatedTickets.length > 0 && (
            <div className="mt-4 text-left">
              <h2 className="text-2xl font-bold mb-6 text-center border-b border-zinc-800 pb-4">Your Tickets</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {generatedTickets.map((ticket, i) => (
                  <div key={ticket._id || ticket.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center flex flex-col items-center shadow-lg">
                    <p className="text-sm text-zinc-400 font-semibold mb-1 uppercase tracking-wider">TICKET {i + 1}</p>
                    <p className="font-mono text-violet-400 font-bold mb-4">{ticket.ticketNumber}</p>
                    {ticket.qrCode && (
                      <div className="bg-white p-2 rounded-xl mb-4">
                        <img src={ticket.qrCode} alt="Ticket QR" className="w-32 h-32 object-contain" />
                      </div>
                    )}
                    <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400 border border-green-500/20">
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingAssets && generatedCertificates.length > 0 && (
            <div className="mt-12 text-left">
              <h2 className="text-2xl font-bold mb-6 text-center border-b border-zinc-800 pb-4">Your Certificates</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {generatedCertificates.map((cert) => (
                  <div key={cert.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center flex flex-col items-center shadow-lg">
                    <p className="text-sm text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{cert.participantName}</p>
                    <p className="font-mono text-violet-400 font-bold mb-4">{cert.certificateNumber}</p>
                    <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-4">
                      {cert.status}
                    </span>
                    {cert.status === "ISSUED" && (
                      <button
                        onClick={() => handleDownloadCertificate(cert.id, cert.certificateNumber)}
                        disabled={downloadingCertId === cert.id}
                        className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                      >
                        {downloadingCertId === cert.id ? "Downloading..." : "Download PDF"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingAssets && generatedTickets.length === 0 && generatedCertificates.length === 0 && (
            <button
              onClick={fetchGuestAssets}
              disabled={loadingAssets}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loadingAssets ? "Checking..." : "Check Tickets & Certificates"}
            </button>
          )}

          <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-center gap-4">
            <button
              onClick={() => setRegistrationStep("accommodation")}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
            >
              Book Accommodation
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700"
            >
              <FaArrowLeft />
              Back to Event
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (registrationStep === "accommodation") {
    return (
      <section className="min-h-screen bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl mt-12">
          <PublicAccommodation 
            event={event}
            registeredData={registeredData}
            guestToken={registeredData.guestToken}
            onBack={() => {
              if (sessionStorage.getItem(`pendingPayment_${eventId}`)) {
                setRegistrationStep("payment");
              } else {
                setRegistrationStep("success");
              }
            }}
          />
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                if (sessionStorage.getItem(`pendingPayment_${eventId}`)) {
                  setRegistrationStep("payment");
                } else {
                  setRegistrationStep("success");
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700"
            >
              <FaArrowLeft />
              {sessionStorage.getItem(`pendingPayment_${eventId}`) ? "Back to Payment" : "Back to Success Screen"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const startDate = event.startDateTime ? new Date(event.startDateTime) : null;
  const eventDate = startDate
    ? startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Date unavailable";
  const registrationFee = Number(event.registrationFee || 0);
  const registrationOpen = Boolean(event.registrationOpen);
  const deadlinePassed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;
  const canRegister = registrationOpen && !deadlinePassed;

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          to={`/events/${eventId}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <FaArrowLeft />
          Back to Event
        </Link>

        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="h-64 w-full md:h-80">
            <EventPoster event={event} />
          </div>

          <div className="p-6 md:p-10">
            {event.category && (
              <span className="inline-flex rounded-full bg-violet-600/15 px-4 py-2 text-sm font-semibold text-violet-300 ring-1 ring-violet-500/20">
                {event.category}
              </span>
            )}
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-5xl">
              {event.title}
            </h1>
            {event.description && (
              <p className="mt-5 max-w-3xl leading-7 text-zinc-400">
                {event.description}
              </p>
            )}

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <FaCalendarAlt className="text-violet-400" />
                <p className="mt-3 text-sm text-zinc-500">Date</p>
                <p className="mt-1 font-semibold">{eventDate}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Registration Type</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <FaUsers className="text-violet-400" />
                    {isTeamEvent ? "Team Event" : "Individual Event"}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-zinc-500">Registration Fee</p>
                  <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-violet-400">
                    <FaRupeeSign className="text-lg" />
                    {registrationFee}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* STEP 1: REGISTRATION FORM */}
            {registrationStep === "registration" && (
              <>
                {canRegister ? (
                  <>
                    <div className="mt-8 border-t border-zinc-800 pt-8">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">
                          {isTeamEvent ? "Team Details" : "Participant Details"}
                        </h2>
                      </div>
                      
                      {isTeamEvent && (
                        <div className="mb-8 flex flex-col gap-4">
                          <div>
                            <label className="text-sm font-medium text-zinc-400 mb-2 block">Team Name *</label>
                            <input 
                              type="text"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                              placeholder="Enter team name"
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500"
                            />
                          </div>
                          {requiresProjectTitle && (
                            <div>
                              <label className="text-sm font-medium text-zinc-400 mb-2 block">Project / Topic Title *</label>
                              <input 
                                type="text"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                placeholder="Enter project or topic title"
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500"
                              />
                            </div>
                          )}
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
                                <input type="email" value={p.email} disabled={index === 0 && isTeamEvent && false} onChange={(e) => handleParticipantChange(index, "email", e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50" />
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
                    
                    <div className="mt-8">
                      <button
                        onClick={handleRegister}
                        disabled={processing}
                        className="w-full rounded-xl bg-violet-600 py-4 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Continue to Payment"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800/50 px-5 py-4 text-center text-sm text-zinc-400">
                    Registration for this event is currently closed.
                  </div>
                )}
              </>
            )}

            {/* STEP 2: PAYMENT FORM */}
            {registrationStep === "payment" && (
              <div className="mt-8 border-t border-zinc-800 pt-8">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      Complete Your Payment
                    </h2>
                    <p className="text-sm text-zinc-400">
                      Please scan the QR code to pay the registration fee of <span className="font-bold text-white">₹{registrationFee}</span>. You must upload a screenshot of your successful transaction.
                    </p>
                  </div>
                  <button onClick={cancelPaymentAndRestart} className="text-sm text-red-400 hover:text-red-300">
                    Restart Registration
                  </button>
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

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={processing || !isConfirmed || !paymentScreenshot}
                    className="w-full sm:w-2/3 rounded-xl bg-violet-600 py-4 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    {processing ? "Submitting Payment..." : "Submit Payment Proof"}
                  </button>
                  <button
                    onClick={() => setRegistrationStep("accommodation")}
                    className="w-full sm:w-1/3 rounded-xl bg-zinc-800 py-4 font-bold text-white transition hover:bg-zinc-700"
                  >
                    Book Accommodation
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </section>
  );
}
