import mongoose from "mongoose";

import {
  ACCOMMODATION_HOSTEL_TYPES,
  ACCOMMODATION_BOOKING_STATUS,
  ACCOMMODATION_PAYMENT_STATUS,
  ACCOMMODATION_PRICE_PER_DAY,
} from "../constants/accommodation.constants.js";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Accommodation Schema
 * ============================================================
 *
 * Represents accommodation requested by a registered
 * participant.
 *
 * IMPORTANT:
 *
 * The participant selects only:
 *
 * - Boys Hostel
 * - Girls Hostel
 *
 * Actual room / bed allocation is handled offline by the
 * Scintillace accommodation team.
 *
 * Pricing:
 *
 * ₹100 per accommodation day per booking.
 * ============================================================
 */

const accommodationSchema = new Schema(
  {
    /**
     * ========================================================
     * User
     * ========================================================
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Registration
     * ========================================================
     *
     * One accommodation booking per registration.
     */

    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      unique: true,
    },

    /**
     * ========================================================
     * Event
     * ========================================================
     */

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Hostel Type
     * ========================================================
     *
     * Participant only chooses the hostel category.
     *
     * Actual room / bed assignment happens offline.
     */

    hostelType: {
      type: String,
      enum: Object.values(
        ACCOMMODATION_HOSTEL_TYPES,
      ),
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Check-in Date
     * ========================================================
     */

    checkInDate: {
      type: Date,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Check-out Date
     * ========================================================
     */

    checkOutDate: {
      type: Date,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Accommodation Days
     * ========================================================
     *
     * Stored explicitly so that the booking retains the
     * exact number of paid accommodation days.
     *
     * Examples:
     *
     * 29 Sep → 30 Sep = 1 day
     * 29 Sep → 1 Oct  = 2 days
     */

    accommodationDays: {
      type: Number,
      required: true,
      min: 1,
    },

    /**
     * ========================================================
     * Amount
     * ========================================================
     *
     * Calculated by backend:
     *
     * accommodationDays × ₹100
     */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * ========================================================
     * Currency
     * ========================================================
     */

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
      required: true,
    },

    /**
     * ========================================================
     * Payment Status
     * ========================================================
     */

    paymentStatus: {
      type: String,
      enum: Object.values(
        ACCOMMODATION_PAYMENT_STATUS,
      ),
      default:
        ACCOMMODATION_PAYMENT_STATUS.PENDING,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Booking Status
     * ========================================================
     */

    bookingStatus: {
      type: String,
      enum: Object.values(
        ACCOMMODATION_BOOKING_STATUS,
      ),
      default:
        ACCOMMODATION_BOOKING_STATUS.PENDING,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Payment Reference
     * ========================================================
     */

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    /**
     * ========================================================
     * Confirmation
     * ========================================================
     */

    confirmationCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * Cancellation
     * ========================================================
     *
     * Accommodation cancellation is separate from
     * ticket cancellation.
     */

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    /**
     * ========================================================
     * Rejection Reason
     * ========================================================
     */

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * ========================================================
     * Refund
     * ========================================================
     */

    refundId: {
      type: String,
      default: "",
      trim: true,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * Remarks
     * ========================================================
     */

    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);

/**
 * ============================================================
 * Virtual ID
 * ============================================================
 */

accommodationSchema.virtual(
  "id",
).get(function () {
  return this._id.toHexString();
});

/**
 * ============================================================
 * Business Validation
 * ============================================================
 */

accommodationSchema.pre(
  "validate",
  function () {
    /**
     * --------------------------------------------------------
     * Check-out must be after check-in.
     * --------------------------------------------------------
     */

    if (
      this.checkInDate &&
      this.checkOutDate &&
      this.checkOutDate <=
        this.checkInDate
    ) {
      throw new Error(
        "Check-out date must be after check-in date.",
      );
    }

    /**
     * --------------------------------------------------------
     * Accommodation days must be valid.
     * --------------------------------------------------------
     */

    if (
      !Number.isInteger(
        this.accommodationDays,
      ) ||
      this.accommodationDays < 1
    ) {
      throw new Error(
        "Accommodation days must be at least 1.",
      );
    }

    /**
     * --------------------------------------------------------
     * Amount must match the official pricing.
     * --------------------------------------------------------
     *
     * ₹100 × accommodation days.
     */

    const expectedAmount =
      this.accommodationDays *
      ACCOMMODATION_PRICE_PER_DAY;

    if (
      this.amount !==
      expectedAmount
    ) {
      throw new Error(
        `Invalid accommodation amount. Expected ₹${expectedAmount}.`,
      );
    }

    /**
     * --------------------------------------------------------
     * Currency must be INR.
     * --------------------------------------------------------
     */

    if (
      this.currency !== "INR"
    ) {
      throw new Error(
        "Accommodation currency must be INR.",
      );
    }

    /**
     * --------------------------------------------------------
     * Confirmed accommodation must be paid.
     * --------------------------------------------------------
     */

    if (
      this.bookingStatus ===
        ACCOMMODATION_BOOKING_STATUS.CONFIRMED &&
      this.paymentStatus !==
        ACCOMMODATION_PAYMENT_STATUS.PAID
    ) {
      throw new Error(
        "Confirmed accommodation must have completed payment.",
      );
    }

    /**
     * --------------------------------------------------------
     * Automatically set confirmation date.
     * --------------------------------------------------------
     */

    if (
      this.bookingStatus ===
        ACCOMMODATION_BOOKING_STATUS.CONFIRMED &&
      !this.confirmedAt
    ) {
      this.confirmedAt =
        new Date();
    }

    /**
     * --------------------------------------------------------
     * Automatically set cancellation date.
     * --------------------------------------------------------
     */

    if (
      this.bookingStatus ===
        ACCOMMODATION_BOOKING_STATUS.CANCELLED &&
      !this.cancelledAt
    ) {
      this.cancelledAt =
        new Date();
    }

    /**
     * --------------------------------------------------------
     * Clear cancellation and rejection information when active.
     * --------------------------------------------------------
     */

    if (
      this.bookingStatus !==
        ACCOMMODATION_BOOKING_STATUS.CANCELLED &&
      this.bookingStatus !==
        ACCOMMODATION_BOOKING_STATUS.REJECTED
    ) {
      this.cancelledAt = null;
      this.cancellationReason = "";
      this.rejectionReason = "";
    }

    /**
     * --------------------------------------------------------
     * Refunded accommodation cannot remain confirmed.
     * --------------------------------------------------------
     */

    if (
      this.paymentStatus ===
        ACCOMMODATION_PAYMENT_STATUS.REFUNDED &&
      this.bookingStatus ===
        ACCOMMODATION_BOOKING_STATUS.CONFIRMED
    ) {
      throw new Error(
        "Refunded accommodation cannot remain confirmed.",
      );
    }
  },
);

/**
 * ============================================================
 * Indexes
 * ============================================================
 */

/**
 * User accommodation lookup
 */

accommodationSchema.index({
  user: 1,
  createdAt: -1,
});

/**
 * Event accommodation lookup
 */

accommodationSchema.index({
  event: 1,
  bookingStatus: 1,
});

/**
 * Hostel reporting
 */

accommodationSchema.index({
  event: 1,
  hostelType: 1,
  bookingStatus: 1,
});

/**
 * Date lookup
 */

accommodationSchema.index({
  event: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

/**
 * Payment status lookup
 */

accommodationSchema.index({
  paymentStatus: 1,
  bookingStatus: 1,
});

/**
 * Payment reference lookup
 */

accommodationSchema.index({
  payment: 1,
});

/**
 * Confirmation code lookup
 */

accommodationSchema.index({
  confirmationCode: 1,
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Accommodation = model(
  "Accommodation",
  accommodationSchema,
);

export default Accommodation;