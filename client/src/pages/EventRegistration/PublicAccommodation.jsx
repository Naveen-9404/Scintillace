import { useState, useEffect } from "react";
import { BedDouble, CheckCircle } from "lucide-react";
import { FaCalendarAlt, FaRupeeSign, FaArrowLeft } from "react-icons/fa";
import { createGuestAccommodation, getGuestAccommodation } from "../../api/accommodation.api";
import PaymentProofUpload from "../../components/events/PaymentProofUpload";

export default function PublicAccommodation({ event, registeredData, guestToken, onBack }) {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Booking state
  const [bookingMember, setBookingMember] = useState(null); // null if not booking
  const [hostelType, setHostelType] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const data = await getGuestAccommodation(registeredData._id, guestToken);
      if (Array.isArray(data)) {
        setAccommodations(data);
      } else {
        setAccommodations([]);
      }
    } catch (err) {
      console.error("Failed to load accommodations:", err);
      setError("Failed to load existing accommodation bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAccommodations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registeredData, guestToken]);

  const isTeamEvent = event.type === "TEAM";
  const members = isTeamEvent && registeredData.team ? registeredData.team.members : [];

  const getMemberBooking = (memberId) => {
    return accommodations.find(a => a.teamMemberId === memberId);
  };

  const getIndividualBooking = () => {
    return accommodations.find(a => !a.teamMemberId);
  };

  const getAmount = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diff = utcEnd - utcStart;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days * 200 : 0;
  };

  const amount = getAmount();
  const todayStr = new Date().toISOString().split("T")[0];
  const minCheckOutStr = checkInDate 
    ? new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split("T")[0] 
    : todayStr;

  const handleBookClick = (member) => {
    setBookingMember(member || "INDIVIDUAL");
    setHostelType("");
    setCheckInDate("");
    setCheckOutDate("");
    setPaymentScreenshot(null);
    setError("");
  };

  const handleCancelBooking = () => {
    setBookingMember(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!hostelType) {
      setError("Please select a hostel type.");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    if (amount <= 0) {
      setError("Check-out date must be after check-in date.");
      return;
    }
    if (!paymentScreenshot) {
      setError("Please upload the payment screenshot.");
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        registrationId: registeredData._id,
        hostelType,
        checkInDate,
        checkOutDate,
        screenshotUrl: paymentScreenshot.url,
        screenshotPublicId: paymentScreenshot.publicId,
      };

      if (isTeamEvent && bookingMember !== "INDIVIDUAL") {
        payload.teamMemberId = bookingMember._id;
      }

      await createGuestAccommodation(payload, guestToken);
      setBookingMember(null);
      fetchAccommodations();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to book accommodation. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-zinc-400">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        Loading accommodations...
      </div>
    );
  }

  // Booking Form View
  if (bookingMember) {
    const isIndividual = bookingMember === "INDIVIDUAL";
    const displayName = isIndividual ? registeredData.user.fullName : bookingMember.user.fullName;

    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left shadow-2xl">
        <div className="mb-6 flex items-center gap-4 border-b border-zinc-800 pb-4">
          <button onClick={handleCancelBooking} className="text-zinc-400 hover:text-white transition">
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-bold text-white">Book for {displayName}</h2>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Hostel Type *</label>
            <select
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              value={hostelType}
              onChange={(e) => setHostelType(e.target.value)}
              required
            >
              <option value="" disabled>Select Hostel Type</option>
              <option value="Boys Hostel">Boys Hostel</option>
              <option value="Girls Hostel">Girls Hostel</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Check-in Date *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaCalendarAlt className="text-zinc-500" />
                </div>
                <input
                  type="date"
                  min={todayStr}
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-3 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Check-out Date *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaCalendarAlt className="text-zinc-500" />
                </div>
                <input
                  type="date"
                  min={minCheckOutStr}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-3 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {amount > 0 && (
            <div className="mt-8 border-t border-zinc-800 pt-8">
              <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">Payment Details</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Scan the QR code to pay <span className="text-violet-400 font-bold">₹{amount}</span>
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-xl text-violet-400 font-bold text-xl">
                  <FaRupeeSign /> {amount}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 shrink-0 flex flex-col items-center bg-white p-4 rounded-xl shadow-lg border border-zinc-200">
                  {import.meta.env.VITE_ACCOMMODATION_UPI_QR_URL ? (
                    <img 
                      src={import.meta.env.VITE_ACCOMMODATION_UPI_QR_URL} 
                      alt="UPI QR Code" 
                      className="w-full aspect-square object-contain"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-center p-4 rounded-lg">
                      <p className="text-gray-500 text-sm font-medium">QR Code not configured.</p>
                    </div>
                  )}
                  <p className="mt-3 text-black font-semibold">Pay ₹{amount}</p>
                </div>
                
                <div className="w-full md:w-2/3">
                  <PaymentProofUpload onUploadComplete={setPaymentScreenshot} />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancelBooking}
              className="px-6 py-3 rounded-xl font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || amount <= 0 || !paymentScreenshot}
              className="px-6 py-3 rounded-xl bg-violet-600 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {processing ? "Submitting..." : "Submit Booking"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="mt-12 text-left">
      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <FaArrowLeft size={16} />
          </button>
        )}
        <BedDouble className="text-violet-500" size={32} />
        <h2 className="text-2xl font-bold text-white">Accommodation</h2>
      </div>
      
      <p className="text-zinc-400 mb-6">
        Accommodation is booked individually. You can request accommodation for {isTeamEvent ? "each team member" : "yourself"}. The cost is ₹200 per day.
      </p>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {!isTeamEvent && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-lg">{registeredData.user.fullName}</p>
              <p className="text-sm text-zinc-400">Candidate</p>
            </div>
            <div>
              {getIndividualBooking() ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                    <CheckCircle size={12} /> {getIndividualBooking().status}
                  </span>
                  <span className="text-xs text-zinc-500">Hostel: {getIndividualBooking().hostelType}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleBookClick(null)}
                  className="rounded-xl bg-violet-600/10 px-5 py-2 font-semibold text-violet-400 transition hover:bg-violet-600 hover:text-white border border-violet-500/20"
                >
                  Book Accommodation
                </button>
              )}
            </div>
          </div>
        )}

        {isTeamEvent && members.map((member, idx) => {
          const booking = getMemberBooking(member._id);
          return (
            <div key={member._id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white text-lg">{member.user.fullName}</p>
                <p className="text-sm text-zinc-400">
                  {idx === 0 ? "Team Leader" : "Team Member"} • {member.role}
                </p>
              </div>
              <div>
                {booking ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                      <CheckCircle size={12} /> {booking.status}
                    </span>
                    <span className="text-xs text-zinc-500">Hostel: {booking.hostelType}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBookClick(member)}
                    className="rounded-xl bg-violet-600/10 px-5 py-2 font-semibold text-violet-400 transition hover:bg-violet-600 hover:text-white border border-violet-500/20"
                  >
                    Book Accommodation
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
