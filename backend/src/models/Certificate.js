import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Certificate Schema
 * ============================================================
 *
 * One Certificate belongs to exactly one Registration.
 *
 * Certificate workflow:
 *
 *   Registration
 *        ↓
 *   Participant checked in
 *        ↓
 *   Admin/FACULTY disburses certificates
 *        ↓
 *   Certificate generated
 *        ↓
 *   Certificate issued
 *        ↓
 *   PDF generated
 *        ↓
 *   Email sent
 *
 * A certificate must never be created for an unchecked-in
 * participant.
 * ============================================================
 */

const certificateSchema = new Schema(
  {
    /**
     * ========================================================
     * Participant
     * ========================================================
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    /**
     * ========================================================
     * Team Member
     * ========================================================
     *
     * Points to the specific member inside Team.members if this
     * is a team certificate. Null for individual certificates.
     */

    teamMemberId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
      index: true,
    },

    /**
     * ========================================================
     * Participant Name Snapshot
     * ========================================================
     *
     * This is the exact name that should appear on the
     * certificate.
     *
     * The value is copied from Registration.participantName.
     *
     * This prevents later User profile changes from affecting
     * an already-issued certificate.
     */

    participantName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    /**
     * ========================================================
     * Registration
     * ========================================================
     *
     * Exactly one certificate can exist for one registration.
     */

    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true,
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
     * Festival
     * ========================================================
     */

    festival: {
      type: Schema.Types.ObjectId,
      ref: "Festival",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Certificate Information
     * ========================================================
     */

    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    certificateType: {
      type: String,
      enum: [
        "PARTICIPATION",
        "WINNER",
        "RUNNER_UP",
        "VOLUNTEER",
        "ORGANIZER",
      ],
      default: "PARTICIPATION",
      required: true,
      index: true,
    },

    position: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    /**
     * ========================================================
     * Verification
     * ========================================================
     */

    verificationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      select: false,
      index: true,
    },

    verificationUrl: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * ========================================================
     * Certificate PDF
     * ========================================================
     */

    pdfUrl: {
      type: String,
      trim: true,
      default: "",
    },

    pdfPublicId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    /**
     * ========================================================
     * Email Delivery
     * ========================================================
     */

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },

    emailSent: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailSentAt: {
      type: Date,
      default: null,
    },

    emailError: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    /**
     * ========================================================
     * Issue Information
     * ========================================================
     */

    issuedAt: {
      type: Date,
      default: null,
      index: true,
    },

    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /**
     * ========================================================
     * Status
     * ========================================================
     */

    status: {
      type: String,
      enum: [
        "GENERATED",
        "ISSUED",
        "REVOKED",
      ],
      default: "GENERATED",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Revocation
     * ========================================================
     */

    revokedAt: {
      type: Date,
      default: null,
    },

    revokedReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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

certificateSchema
  .virtual("id")
  .get(function () {
    return this._id.toHexString();
  });

/**
 * ============================================================
 * Business Validation
 * ============================================================
 */

certificateSchema.pre(
  "validate",
  function () {
    /**
     * Issued state.
     */

    if (
      this.status === "ISSUED" &&
      !this.issuedAt
    ) {
      this.issuedAt =
        new Date();
    }

    /**
     * Revoked state.
     */

    if (
      this.status === "REVOKED" &&
      !this.revokedAt
    ) {
      this.revokedAt =
        new Date();
    }

    /**
     * Non-revoked state.
     */

    if (
      this.status !== "REVOKED"
    ) {
      this.revokedAt = null;
      this.revokedReason = "";
    }

    /**
     * Email state.
     */

    if (
      this.emailSent &&
      !this.emailSentAt
    ) {
      this.emailSentAt =
        new Date();
    }

    if (
      !this.emailSent
    ) {
      this.emailSentAt = null;
    }
  },
);

/**
 * ============================================================
 * Indexes
 * ============================================================
 */

certificateSchema.index({
  user: 1,
  event: 1,
});

certificateSchema.index({
  festival: 1,
  event: 1,
});

certificateSchema.index(
  {
    registration: 1,
    teamMemberId: 1,
  },
  { unique: true }
);

certificateSchema.index({
  status: 1,
  issuedAt: -1,
});

certificateSchema.index({
  event: 1,
  certificateType: 1,
});

certificateSchema.index({
  emailSent: 1,
  status: 1,
});

certificateSchema.index({
  festival: 1,
  status: 1,
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Certificate = model(
  "Certificate",
  certificateSchema,
);

export default Certificate;