import mongoose from "mongoose";

import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_STATUS,
  EVENT_REGISTRATION_MODES,
  EVENT_REGISTRATION_METHODS,
} from "../constants/event.constants.js";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Event Schema
 * ============================================================
 *
 * Represents an individual Scintillace/FestSphere event.
 *
 * Registration modes:
 *
 * PAID
 *   Registration is required and payment is required.
 *
 * FREE
 *   Registration is required but no payment is required.
 *
 * NONE
 *   No online registration is required.
 * ============================================================
 */

const eventSchema = new Schema(
  {
    /**
     * ========================================================
     * Basic Information
     * ========================================================
     */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
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
     * Event Classification
     * ========================================================
     */

    category: {
      type: String,
      enum: Object.values(EVENT_CATEGORIES),
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(EVENT_TYPES),
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Registration Configuration
     * ========================================================
     */

    registrationMethod: {
      type: String,
      enum: Object.values(
        EVENT_REGISTRATION_METHODS,
      ),
      default:
        EVENT_REGISTRATION_METHODS.SYSTEM,
      required: true,
      index: true,
    },

    googleFormUrl: {
      type: String,
      trim: true,
      default: "",
    },

    registrationMode: {
      type: String,
      enum: Object.values(
        EVENT_REGISTRATION_MODES,
      ),
      default:
        EVENT_REGISTRATION_MODES.PAID,
      required: true,
      index: true,
    },

    registrationRequired: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Event Capacity
     * ========================================================
     *
     * null means unlimited / not applicable.
     */

    maxParticipants: {
      type: Number,
      default: null,
      min: 1,
    },

    /**
     * ========================================================
     * Team Configuration
     * ========================================================
     *
     * Required only when type === TEAM.
     */

    teamSize: {
      type: Number,
      default: null,
      min: 1,
    },

    /**
     * ========================================================
     * Payment
     * ========================================================
     */

    isPaid: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },

    registrationFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
      maxlength: 10,
    },

    /**
     * ========================================================
     * Event Schedule
     * ========================================================
     *
     * Dates/times are optional.
     *
     * Exact timings are handled by the
     * Timeline/Schedule module when finalized.
     */

    startDateTime: {
      type: Date,
      default: null,
      index: true,
    },

    endDateTime: {
      type: Date,
      default: null,
    },

    registrationDeadline: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * Venue
     * ========================================================
     */

    venue: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    /**
     * ========================================================
     * Prize Information
     * ========================================================
     */

    prizePool: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    /**
     * ========================================================
     * Event Content
     * ========================================================
     */

    poster: {
      type: String,
      trim: true,
      default: "",
    },

    banner: {
      type: String,
      trim: true,
      default: "",
    },

    gallery: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    eligibility: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    highlights: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    requirements: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    rules: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    /**
     * ========================================================
     * Speaker
     * ========================================================
     */

    speaker: {
      name: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },

      designation: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      organization: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },
    },

    /**
     * ========================================================
     * Coordinators
     * ========================================================
     */

    coordinators: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        role: {
          type: String,
          trim: true,
          maxlength: 100,
          default: "COORDINATOR",
        },
      },
    ],

    /**
     * ========================================================
     * Event Status
     * ========================================================
     */

    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.DRAFT,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Registration Availability
     * ========================================================
     */

    registrationOpen: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Created By
     * ========================================================
     */

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

eventSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

/**
 * ============================================================
 * Business Validation
 * ============================================================
 */

eventSchema.pre(
  "validate",
  function () {
    /**
     * --------------------------------------------------------
     * Normalize category
     * --------------------------------------------------------
     */

    if (this.category) {
      this.category =
        this.category.toUpperCase();
    }

    /**
     * --------------------------------------------------------
     * Normalize type
     * --------------------------------------------------------
     */

    if (this.type) {
      this.type =
        this.type.toUpperCase();
    }

    /**
     * --------------------------------------------------------
     * NONE registration
     * --------------------------------------------------------
     *
     * Used by:
     * - Technical Quiz
     * - Spot Events
     */

    if (
      this.registrationMode ===
      EVENT_REGISTRATION_MODES.NONE
    ) {
      this.registrationRequired = false;
      this.registrationOpen = false;
      this.isPaid = false;
      this.registrationFee = 0;
    }

    /**
     * --------------------------------------------------------
     * FREE registration
     * --------------------------------------------------------
     */

    if (
      this.registrationMode ===
      EVENT_REGISTRATION_MODES.FREE
    ) {
      this.registrationRequired = true;
      this.isPaid = false;
      this.registrationFee = 0;
    }

    /**
     * --------------------------------------------------------
     * Google Form validation
     * --------------------------------------------------------
     */

    if (
      this.registrationMethod ===
      EVENT_REGISTRATION_METHODS.GOOGLE_FORM
    ) {
      if (!this.googleFormUrl) {
        throw new Error(
          "A Google Form URL is required when registration method is GOOGLE_FORM.",
        );
      }
    } else {
      this.googleFormUrl = "";
    }

    /**
     * --------------------------------------------------------
     * PAID registration
     * --------------------------------------------------------
     *
     * Used by:
     * - Workshop
     * - Paper Presentation
     * - Poster Presentation
     * - Hardware Expo
     */

    if (
      this.registrationMode ===
      EVENT_REGISTRATION_MODES.PAID
    ) {
      this.registrationRequired = true;
      this.isPaid = true;

      if (
        typeof this.registrationFee !==
          "number" ||
        this.registrationFee <= 0
      ) {
        throw new Error(
          "Paid events must have a registration fee greater than zero.",
        );
      }
    }

    /**
     * --------------------------------------------------------
     * Team validation
     * --------------------------------------------------------
     */

    if (
  this.type === EVENT_TYPES.TEAM &&
  this.teamSize !== null &&
  this.teamSize !== undefined &&
  this.teamSize < 1
) {
  throw new Error(
    "Team size must be at least 1 when specified.",
  );
}

    /**
     * --------------------------------------------------------
     * Individual events
     * --------------------------------------------------------
     */

    if (
      this.type ===
      EVENT_TYPES.INDIVIDUAL
    ) {
      this.teamSize = null;
    }

    /**
     * --------------------------------------------------------
     * Date validation
     * --------------------------------------------------------
     */

    if (
      this.startDateTime &&
      this.endDateTime &&
      this.endDateTime <=
        this.startDateTime
    ) {
      throw new Error(
        "Event end time must be after the start time.",
      );
    }

    /**
     * --------------------------------------------------------
     * Registration deadline validation
     * --------------------------------------------------------
     */

    if (
      this.registrationDeadline &&
      this.startDateTime &&
      this.registrationDeadline >
        this.startDateTime
    ) {
      throw new Error(
        "Registration deadline cannot be after the event start time.",
      );
    }

    /**
     * --------------------------------------------------------
     * Capacity validation
     * --------------------------------------------------------
     *
     * null means unlimited / not applicable.
     */

    if (
      this.maxParticipants !== null &&
      this.maxParticipants !==
        undefined &&
      this.maxParticipants < 1
    ) {
      throw new Error(
        "Maximum participants must be at least 1.",
      );
    }
  },
);

/**
 * ============================================================
 * Indexes
 * ============================================================
 */

eventSchema.index({
  festival: 1,
  status: 1,
});

eventSchema.index({
  category: 1,
  status: 1,
});

eventSchema.index({
  type: 1,
  status: 1,
});

eventSchema.index({
  registrationMode: 1,
  registrationOpen: 1,
});

/*
 * startDateTime already has `index: true`
 * in the schema field definition.
 *
 * Therefore, do NOT define another:
 *
 * eventSchema.index({
 *   startDateTime: 1,
 * });
 */

eventSchema.index({
  registrationDeadline: 1,
});

/**
 * ============================================================
 * Text Search
 * ============================================================
 */

eventSchema.index({
  title: "text",
  description: "text",
  eligibility: "text",
  venue: "text",
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Event = model(
  "Event",
  eventSchema,
);

export default Event;