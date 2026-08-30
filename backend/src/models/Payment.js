import mongoose from "mongoose";

import {
  PAYMENT_GATEWAY,
  PAYMENT_FOR,
  PAYMENT_STATUS,
} from "../constants/payment.constants.js";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Payment Schema
 * ============================================================
 */

const paymentSchema = new Schema(
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
     * Event Registration
     * ========================================================
     */

    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      default: null,
    },

    /**
     * ========================================================
     * Accommodation
     * ========================================================
     */

    accommodation: {
      type: Schema.Types.ObjectId,
      ref: "Accommodation",
      default: null,
    },

    /**
     * ========================================================
     * Payment Purpose
     * ========================================================
     */

    paymentFor: {
      type: String,
      enum: Object.values(PAYMENT_FOR),
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Amount
     * ========================================================
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
      minlength: 3,
      maxlength: 3,
    },

    /**
     * ========================================================
     * Payment Gateway
     * ========================================================
     */

    gateway: {
      type: String,
      enum: Object.values(PAYMENT_GATEWAY),
      default: PAYMENT_GATEWAY.UPI,
      required: true,
    },

    /**
     * ========================================================
     * Payment Screenshot (UPI)
     * ========================================================
     */

    screenshotUrl: {
      type: String,
      default: null,
      trim: true,
    },

    screenshotPublicId: {
      type: String,
      default: null,
      trim: true,
    },

    /**
     * ========================================================
     * Payment Status
     * ========================================================
     */

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Successful Payment
     * ========================================================
     */

    paidAt: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * Failure Information
     * ========================================================
     */

    failureReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    /**
     * ========================================================
     * Refund Information
     * ========================================================
     */

    refundId: {
      type: String,
      default: null,
      trim: true,
    },

    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * Registration Confirmation Email
     * ========================================================
     *
     * Used for EVENT payments.
     *
     * The email contains:
     *
     * - Registration confirmation
     * - Participant details
     * - Event details
     * - Ticket number
     * - QR code
     * - PDF attachment
     *
     * The status prevents duplicate emails when both:
     *
     * - frontend payment verification
     * - background retry job
     *
     * attempt to process the same payment.
     */

    confirmationEmailStatus: {
      type: String,
      enum: [
        "NOT_SENT",
        "SENDING",
        "SENT",
        "FAILED",
      ],
      default: "NOT_SENT",
    },

    confirmationEmailSentAt: {
      type: Date,
      default: null,
    },

    confirmationEmailMessageId: {
      type: String,
      default: null,
      trim: true,
    },

    confirmationEmailError: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /**
     * Number of attempts made to send the confirmation email.
     */

    confirmationEmailAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Last time an email sending attempt was made.
     */

    confirmationEmailLastAttemptAt: {
      type: Date,
      default: null,
    },

    /**
     * Last time an email sending attempt failed.
     */

    confirmationEmailLastFailedAt: {
      type: Date,
      default: null,
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

paymentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

/**
 * ============================================================
 * Indexes
 * ============================================================
 */

paymentSchema.index({
  user: 1,
  status: 1,
});

paymentSchema.index({
  registration: 1,
});

paymentSchema.index({
  accommodation: 1,
});

paymentSchema.index({
  paymentFor: 1,
  status: 1,
});

paymentSchema.index({
  user: 1,
  paymentFor: 1,
  status: 1,
});

paymentSchema.index({
  confirmationEmailStatus: 1,
});

/**
 * Useful when finding paid registrations whose
 * confirmation email still needs to be delivered.
 */

paymentSchema.index({
  paymentFor: 1,
  status: 1,
  confirmationEmailStatus: 1,
});

/**
 * ============================================================
 * Business Validation
 * ============================================================
 *
 * Synchronous validation middleware.
 *
 * No `next()` callback is used here.
 * Mongoose continues automatically when
 * this function completes successfully.
 */

paymentSchema.pre(
  "validate",
  function () {
    /**
     * ========================================================
     * Event Payment
     * ========================================================
     */

    if (
      this.paymentFor ===
      PAYMENT_FOR.EVENT
    ) {
      if (!this.registration) {
        throw new Error(
          "Registration is required for an event payment.",
        );
      }

      this.accommodation = null;
    }

    /**
     * ========================================================
     * Accommodation Payment
     * ========================================================
     */

    if (
      this.paymentFor ===
      PAYMENT_FOR.ACCOMMODATION
    ) {
      if (!this.accommodation) {
        throw new Error(
          "Accommodation is required for an accommodation payment.",
        );
      }

      this.registration = null;
    }

    /**
     * ========================================================
     * Refund Validation
     * ========================================================
     */

    if (
      this.refundedAmount >
      this.amount
    ) {
      throw new Error(
        "Refunded amount cannot exceed the payment amount.",
      );
    }
  },
);

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Payment = model(
  "Payment",
  paymentSchema,
);

export default Payment;