/**
 * ============================================================
 * Accommodation Hostel Types
 * ============================================================
 *
 * Participants select only their preferred hostel.
 *
 * Actual room/bed allotment is handled offline by the
 * Scintillace accommodation team.
 */

const ACCOMMODATION_HOSTEL_TYPES =
  Object.freeze({
    BOYS: "BOYS",
    GIRLS: "GIRLS",
  });

/**
 * ============================================================
 * Accommodation Booking Status
 * ============================================================
 */

const ACCOMMODATION_BOOKING_STATUS =
  Object.freeze({
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
  });

/**
 * ============================================================
 * Accommodation Payment Status
 * ============================================================
 */

const ACCOMMODATION_PAYMENT_STATUS =
  Object.freeze({
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  });

/**
 * ============================================================
 * Accommodation Pricing
 * ============================================================
 *
 * ₹200 per accommodation day per participant.
 */

const ACCOMMODATION_PRICE_PER_DAY = 200;

export {
  ACCOMMODATION_HOSTEL_TYPES,
  ACCOMMODATION_BOOKING_STATUS,
  ACCOMMODATION_PAYMENT_STATUS,
  ACCOMMODATION_PRICE_PER_DAY,
};