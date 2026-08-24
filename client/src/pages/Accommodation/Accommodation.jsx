import { useState } from "react";

import AccommodationHero from "../../components/accommodation/AccommodationHero";
import AccommodationOverview from "../../components/accommodation/AccommodationOverview";
import RoomTypeCards from "../../components/accommodation/RoomTypeCards";
import Facilities from "../../components/accommodation/Facilities";
import AccommodationRules from "../../components/accommodation/AccommodationRules";
import RefundPolicy from "../../components/accommodation/RefundPolicy";
import AccommodationForm from "../../components/accommodation/AccommodationForm";
import BookingSummaryCard from "../../components/accommodation/BookingSummaryCard";
import SuccessModal from "../../components/accommodation/SuccessModal";

const Accommodation = () => {
  const [selectedRoom, setSelectedRoom] = useState("");

  const [bookingSummary, setBookingSummary] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleBookingSuccess = (booking) => {
    setBookingSummary(booking);
    setIsSuccessOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Hero */}
      <AccommodationHero />

      {/* Overview */}
      <AccommodationOverview />

      {/* Room Selection */}
      <RoomTypeCards
        selectedRoom={selectedRoom}
        onSelect={setSelectedRoom}
      />

      {/* Facilities */}
      <Facilities />

      {/* Rules */}
      <AccommodationRules />

      {/* Refund Policy */}
      <RefundPolicy />

      {/* Booking Form */}
      <AccommodationForm
        selectedRoom={selectedRoom}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Booking Summary */}
      {bookingSummary && (
        <BookingSummaryCard booking={bookingSummary} />
      )}

      {/* Success Modal */}
      <SuccessModal
        open={isSuccessOpen}
        booking={bookingSummary}
        onClose={() => setIsSuccessOpen(false)}
      />

    </main>
  );
};

export default Accommodation;