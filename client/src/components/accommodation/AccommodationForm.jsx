import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BedDouble, ShieldCheck } from "lucide-react";
import { FaCalendarAlt, FaRupeeSign, FaSpinner } from "react-icons/fa";

import { createAccommodation } from "../../api/accommodation.api";
import { getMyRegistrations } from "../../api/registrations.api";
import PaymentProofUpload from "../events/PaymentProofUpload";

const AccommodationForm = ({ selectedRoom, onBookingSuccess }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loadingReg, setLoadingReg] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const [registrationId, setRegistrationId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoadingReg(true);
        const data = await getMyRegistrations();
        const activeRegistrations = data.filter(
          (reg) => reg.status === "REGISTERED"
        );
        setRegistrations(activeRegistrations);
        if (activeRegistrations.length === 1) {
          setRegistrationId(activeRegistrations[0]._id);
        }
      } catch (err) {
        console.error("Failed to load registrations:", err);
      } finally {
        setLoadingReg(false);
      }
    };
    fetchRegistrations();
  }, []);

  const getAmount = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    
    // Use UTC to avoid daylight saving time anomalies
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    
    const diff = utcEnd - utcStart;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    return days > 0 ? days * 200 : 0;
  };

  const amount = getAmount();
  
  // Set min check-in date to today, check-out minimum to check-in + 1 day
  const todayStr = new Date().toISOString().split("T")[0];
  const minCheckOutStr = checkInDate 
    ? new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split("T")[0] 
    : todayStr;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRoom) {
      setError("Please select a room type above.");
      return;
    }
    if (!registrationId) {
      setError("Please select a registration.");
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
        registrationId,
        hostelType: selectedRoom,
        checkInDate,
        checkOutDate,
        screenshotUrl: paymentScreenshot.url,
        screenshotPublicId: paymentScreenshot.publicId,
      };

      const booking = await createAccommodation(payload);
      if (onBookingSuccess) {
        onBookingSuccess(booking);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to book accommodation. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-20 pb-32">
      <div className="mx-auto max-w-3xl pt-24 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
            <BedDouble size={36} className="text-cyan-400" />
          </div>

          <h2 className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            Book Accommodation
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
            Submit your accommodation request. Our team will verify your payment and confirm your booking.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl md:p-10"
        >
          {!selectedRoom ? (
             <div className="text-center py-10">
               <p className="text-lg text-red-400 mb-4">Please select a room type above first.</p>
               <a href="#rooms" className="text-cyan-400 hover:underline">Scroll up to select a room type</a>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Registration Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Registration</label>
                {loadingReg ? (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 animate-pulse h-12"></div>
                ) : registrations.length === 0 ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    You do not have any active event registrations. You must be registered for an event to book accommodation.
                  </div>
                ) : (
                  <select
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    required
                  >
                    <option value="" disabled className="bg-zinc-900">-- Select a Registration --</option>
                    {registrations.map(reg => (
                      <option key={reg._id} value={reg._id} className="bg-zinc-900">
                        {reg.event?.title || "Unknown Event"} ({reg.registrationId})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Check-in Date</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FaCalendarAlt className="text-slate-400" />
                    </div>
                    <input
                      type="date"
                      min={todayStr}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                      className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Check-out Date</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FaCalendarAlt className="text-slate-400" />
                    </div>
                    <input
                      type="date"
                      min={minCheckOutStr}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                      className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              {amount > 0 && (
                <div className="mt-8 border-t border-white/10 pt-8">
                  <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Payment Details</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Scan the QR code to pay <span className="text-cyan-400 font-bold">₹{amount}</span>.
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 font-bold text-xl">
                      <FaRupeeSign /> {amount}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 shrink-0 flex flex-col items-center bg-white p-4 rounded-xl shadow-lg border border-zinc-200">
                      {import.meta.env.VITE_ACCOMMODATION_UPI_QR_URL ? (
                        <img 
                          src={import.meta.env.VITE_ACCOMMODATION_UPI_QR_URL} 
                          alt="Official UPI QR Code" 
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
                      <PaymentProofUpload 
                        onUploadComplete={setPaymentScreenshot}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={processing || registrations.length === 0 || amount <= 0 || !paymentScreenshot}
                className="w-full mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 text-lg font-bold text-white transition hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
              >
                {processing ? (
                  <><FaSpinner className="animate-spin" /> Processing...</>
                ) : (
                  `Submit & Pay ₹${amount}`
                )}
              </button>
            </form>
          )}
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
          <ShieldCheck size={17} className="text-cyan-400" />
          <span>
            Your accommodation information is handled securely by the FestSphere team.
          </span>
        </div>
      </div>
    </section>
  );
};

export default AccommodationForm;