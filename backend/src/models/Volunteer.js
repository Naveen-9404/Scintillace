import mongoose from "mongoose";

const {
  Schema,
  model,
} = mongoose;

/**
 * ============================================================
 * Volunteer Schema
 * ============================================================
 *
 * Stores volunteer assignments.
 *
 * A user may have multiple volunteer assignments across
 * different festivals/events.
 *
 * Every assignment must belong to at least:
 *
 * - A festival
 * - An event
 * - Or both
 * ============================================================
 */

const volunteerSchema = new Schema(
  {
    /**
     * --------------------------------------------------------
     * User Reference
     * --------------------------------------------------------
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Assignment
     * --------------------------------------------------------
     */

    festival: {
      type: Schema.Types.ObjectId,
      ref: "Festival",
      default: null,
      index: true,
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      default: null,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Volunteer Role
     * --------------------------------------------------------
     *
     * Operational role of the volunteer.
     *
     * This is different from the User account role.
     * --------------------------------------------------------
     */

    assignmentRole: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "GENERAL",
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Department / Area
     * --------------------------------------------------------
     */

    department: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Responsibilities
     * --------------------------------------------------------
     */

    responsibilities: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    /**
     * --------------------------------------------------------
     * Availability
     * --------------------------------------------------------
     */

    availability: {
      type: String,
      enum: [
        "FULL_TIME",
        "PART_TIME",
        "EVENT_ONLY",
      ],
      default: "EVENT_ONLY",
      required: true,
    },

    /**
     * --------------------------------------------------------
     * Volunteer Status
     * --------------------------------------------------------
     */

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "ACTIVE",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "PENDING",
      required: true,
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Check-in / Check-out
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

    checkedOut: {
      type: Boolean,
      default: false,
    },

    checkedOutAt: {
      type: Date,
      default: null,
    },

    /**
     * --------------------------------------------------------
     * Notes
     * --------------------------------------------------------
     */

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    /**
     * --------------------------------------------------------
     * Audit
     * --------------------------------------------------------
     */

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

volunteerSchema.virtual("id").get(
  function () {
    return this._id.toHexString();
  },
);

/**
 * ============================================================
 * Business Validation
 * ============================================================
 */

volunteerSchema.pre(
  "validate",
  function () {
    /**
     * Every assignment must belong to a festival
     * or an event.
     */

    if (
      !this.festival &&
      !this.event
    ) {
      this.invalidate(
        "festival",
        "Volunteer assignment must be associated with a festival or event.",
      );
    }

    /**
     * A completed assignment must be checked out.
     */

    if (
      this.status === "COMPLETED" &&
      !this.checkedOut
    ) {
      this.invalidate(
        "checkedOut",
        "A completed volunteer assignment must be checked out.",
      );
    }

    /**
     * Check-in timestamp.
     */

    if (
      this.checkedIn &&
      !this.checkedInAt
    ) {
      this.checkedInAt = new Date();
    }

    /**
     * Check-out requires check-in.
     */

    if (
      this.checkedOut &&
      !this.checkedIn
    ) {
      this.invalidate(
        "checkedOut",
        "A volunteer must be checked in before being checked out.",
      );
    }

    /**
     * Check-out timestamp.
     */

    if (
      this.checkedOut &&
      !this.checkedOutAt
    ) {
      this.checkedOutAt = new Date();
    }
  },
);

/**
 * ============================================================
 * Indexes
 * ============================================================
 */

/**
 * Prevent duplicate volunteer assignment for the same
 * user + festival + event combination.
 *
 * Because every assignment must contain either festival
 * or event, this also prevents duplicate event-only and
 * festival-only assignments.
 */

volunteerSchema.index(
  {
    user: 1,
    festival: 1,
    event: 1,
  },
  {
    unique: true,
  },
);

/**
 * Festival volunteer lookup.
 */

volunteerSchema.index({
  festival: 1,
  status: 1,
});

/**
 * Event volunteer lookup.
 */

volunteerSchema.index({
  event: 1,
  status: 1,
});

/**
 * Department-based management.
 */

volunteerSchema.index({
  festival: 1,
  department: 1,
});

/**
 * Assignment-role based management.
 */

volunteerSchema.index({
  festival: 1,
  assignmentRole: 1,
});

/**
 * Active volunteer lookup.
 */

volunteerSchema.index({
  status: 1,
  checkedIn: 1,
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Volunteer = model(
  "Volunteer",
  volunteerSchema,
);

export default Volunteer;