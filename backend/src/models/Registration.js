import mongoose from "mongoose";

import {
  PAYMENT_STATUS,
  REGISTRATION_STATUS,
} from "../constants/registration.constants.js";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Registration Schema
 * ============================================================
 *
 * Individual Event:
 *
 * user  -> participant
 * team  -> null
 *
 * Team Event:
 *
 * user  -> team leader
 * team  -> registered team
 *
 * Therefore, one Registration represents one participation
 * in one Event.
 */

const registrationSchema = new Schema(
  {
    /**
     * ========================================================
     * Registered User
     * ========================================================
     *
     * For individual events:
     *   The participant.
     *
     * For team events:
     *   The team leader.
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Participant Name Snapshot
     * ========================================================
     *
     * Stores the participant's name at the time of
     * registration.
     *
     * This value is used by the certificate module.
     *
     * It is intentionally independent of User.fullName so
     * future profile-name changes do not alter historical
     * registration/certificate information.
     *
     * Required is intentionally false for backward compatibility
     * with registrations created before this field existed.
     *
     * New registrations created by registration.service.js
     * always populate this field.
     */

    participantName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
      default: "",
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
     * Team
     * ========================================================
     *
     * NULL for individual events.
     *
     * Required logically for team events.
     *
     * Cross-model validation is handled by
     * registration.service.js.
     */

    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
      index: true,
    },

    /**
     * ========================================================
     * Registration Status
     * ========================================================
     */

    status: {
      type: String,
      enum: Object.values(
        REGISTRATION_STATUS,
      ),
      default:
        REGISTRATION_STATUS.PENDING,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Payment Status
     * ========================================================
     */

    paymentStatus: {
      type: String,
      enum: Object.values(
        PAYMENT_STATUS,
      ),
      default:
        PAYMENT_STATUS.NOT_REQUIRED,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Check-In
     * ========================================================
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

    /**
     * ========================================================
     * Registration Date
     * ========================================================
     */

    registrationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /**
     * ========================================================
     * Cancellation
     * ========================================================
     */

    cancellationDate: {
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

registrationSchema
  .virtual("id")
  .get(function () {
    return this._id.toHexString();
  });

/**
 * ============================================================
 * Business Validations
 * ============================================================
 *
 * These validations handle fields that can be validated
 * without querying another collection.
 *
 * Cross-model rules such as:
 *
 * - team required for TEAM event
 * - team must belong to event
 * - user must belong to team
 *
 * are intentionally handled in registration.service.js.
 *
 * IMPORTANT:
 * This middleware uses Mongoose 9-compatible syntax.
 * Do NOT use next() here.
 * ============================================================
 */

registrationSchema.pre(
  "validate",
  function () {
    /**
     * --------------------------------------------------------
     * Check-in timestamp
     * --------------------------------------------------------
     */

    if (
      this.checkedIn &&
      !this.checkedInAt
    ) {
      this.checkedInAt =
        new Date();
    }

    if (
      !this.checkedIn &&
      this.checkedInAt
    ) {
      this.checkedInAt = null;
    }

    /**
     * --------------------------------------------------------
     * Cancellation timestamp
     * --------------------------------------------------------
     */

    if (
      this.status ===
        REGISTRATION_STATUS.CANCELLED &&
      !this.cancellationDate
    ) {
      this.cancellationDate =
        new Date();
    }

    if (
      this.status !==
        REGISTRATION_STATUS.CANCELLED &&
      this.cancellationDate
    ) {
      this.cancellationDate = null;
    }
  },
);

/**
 * ============================================================
 * Duplicate Registration Protection
 * ============================================================
 *
 * Individual registration:
 *
 *   user + event
 *
 * Team registration:
 *
 *   leader(user) + event
 *
 * This prevents the same user from creating multiple
 * registrations for the same event.
 */

registrationSchema.index(
  {
    user: 1,
    event: 1,
  },
  {
    unique: true,
  },
);

/**
 * ============================================================
 * Team Registration Lookup
 * ============================================================
 */

registrationSchema.index({
  team: 1,
  event: 1,
});

/**
 * ============================================================
 * Event + Registration Status
 * ============================================================
 */

registrationSchema.index({
  event: 1,
  status: 1,
});

/**
 * ============================================================
 * Festival + Registration Status
 * ============================================================
 */

registrationSchema.index({
  festival: 1,
  status: 1,
});

/**
 * ============================================================
 * Event + Payment Status
 * ============================================================
 */

registrationSchema.index({
  event: 1,
  paymentStatus: 1,
});

/**
 * ============================================================
 * Check-In + Event
 * ============================================================
 */

registrationSchema.index({
  checkedIn: 1,
  event: 1,
});

/**
 * ============================================================
 * User + Status
 * ============================================================
 */

registrationSchema.index({
  user: 1,
  status: 1,
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Registration = model(
  "Registration",
  registrationSchema,
);

export default Registration;