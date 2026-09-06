import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Ticket Schema
 * ============================================================
 *
 * Represents the admission ticket generated for a successful
 * event registration.
 *
 * A ticket belongs to:
 *
 * - One registration
 * - One user
 * - One event
 * - One festival
 *
 * The QR code contains the ticket verification token.
 * ============================================================
 */

const ticketSchema = new Schema(
  {
    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Team Member
     * --------------------------------------------------------
     *
     * Points to the specific member inside Team.members if this
     * is a team ticket. Null for individual tickets.
     */

    teamMemberId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Participant
     * --------------------------------------------------------
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Event
     * --------------------------------------------------------
     */

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Festival
     * --------------------------------------------------------
     */

    festival: {
      type: Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Ticket Number
     * --------------------------------------------------------
     */

    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * QR Verification Token
     * --------------------------------------------------------
     *
     * This token is unique to the ticket.
     *
     * Do not store sensitive user information inside the QR
     * payload itself.
     */

    qrToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      select: false,
    },

    qrCodeUrl: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * --------------------------------------------------------
     * Ticket Status
     * --------------------------------------------------------
     */

    status: {
      type: String,
      enum: ["ACTIVE", "USED", "EXPIRED"],
      default: "ACTIVE",
      required: true,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Check-in Information
     * --------------------------------------------------------
     */

    checkedIn: {
      type: Boolean,
      default: false,
      index: true,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },

    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /**
     * --------------------------------------------------------
     * Ticket Generation
     * --------------------------------------------------------
     */

    generatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /**
     * --------------------------------------------------------
     * Expiration
     * --------------------------------------------------------
     */

    expiresAt: {
      type: Date,
      default: null,
      index: true,
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

ticketSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

/**
 * ============================================================
 * Business Validation
 * ============================================================
 */

ticketSchema.pre("validate", function () {
  /**
   * USED tickets must have check-in information.
   */

  if (this.status === "USED" && !this.checkedIn) {
    this.checkedIn = true;
  }

  if (this.checkedIn && !this.checkedInAt) {
    this.checkedInAt = new Date();
  }

  /**
   * Expired tickets should not remain active.
   */

  if (
    this.expiresAt &&
    this.expiresAt <= new Date() &&
    this.status === "ACTIVE"
  ) {
    this.status = "EXPIRED";
  }
});

/**
 * ============================================================
 * Indexes
 * ============================================================
 */

ticketSchema.index({
  registration: 1,
  teamMemberId: 1,
}, { unique: true });

ticketSchema.index({
  event: 1,
  status: 1,
});

ticketSchema.index({
  festival: 1,
  status: 1,
});

ticketSchema.index({
  event: 1,
  checkedIn: 1,
});

ticketSchema.index({
  user: 1,
  status: 1,
});

ticketSchema.index({
  generatedAt: -1,
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Ticket = model("Ticket", ticketSchema);

export default Ticket;

