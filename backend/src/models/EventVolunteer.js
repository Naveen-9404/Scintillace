import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Event Volunteer Schema
 * ============================================================
 *
 * Represents the assignment of a volunteer to an event.
 *
 * One volunteer can be assigned to multiple events.
 * One event can have multiple volunteers.
 *
 * This model is intentionally separate from User and Event
 * so that assignments can be created, removed, audited, and
 * queried independently.
 */

const eventVolunteerSchema = new Schema(
  {
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
     * Volunteer
     * ========================================================
     *
     * Must reference a User whose role is VOLUNTEER.
     *
     * Role validation itself is performed in the service layer
     * because the referenced User document is not embedded.
     */

    volunteer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Assignment Status
     * ========================================================
     *
     * ACTIVE:
     * Volunteer is currently assigned to the event.
     *
     * REMOVED:
     * Assignment was revoked but the record is retained for
     * audit/history purposes.
     */

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "REMOVED",
      ],
      default: "ACTIVE",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Assigned By
     * ========================================================
     *
     * User who created the assignment.
     *
     * Normally:
     * - SUPER_ADMIN
     * - FACULTY
     */

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * Assignment Timestamp
     * ========================================================
     */

    assignedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    /**
     * ========================================================
     * Removal Information
     * ========================================================
     */

    removedAt: {
      type: Date,
      default: null,
    },

    removedBy: {
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

eventVolunteerSchema.virtual("id").get(
  function () {
    return this._id.toHexString();
  },
);

/**
 * ============================================================
 * Compound Indexes
 * ============================================================
 */

/**
 * Prevent duplicate active assignments for the same
 * volunteer and event.
 *
 * A partial unique index is used so that a removed historical
 * assignment does not prevent a future reassignment.
 */

eventVolunteerSchema.index(
  {
    event: 1,
    volunteer: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "ACTIVE",
    },
  },
);

/**
 * Event volunteer lookup.
 */

eventVolunteerSchema.index({
  event: 1,
  status: 1,
});

/**
 * Volunteer event lookup.
 */

eventVolunteerSchema.index({
  volunteer: 1,
  status: 1,
});

/**
 * Assignment audit lookup.
 */

eventVolunteerSchema.index({
  assignedBy: 1,
  assignedAt: -1,
});

/**
 * ============================================================
 * Business Validation
 * ============================================================
 *
 * These validations protect the assignment document itself.
 * Verification that the referenced User is actually a
 * VOLUNTEER is handled by the service layer.
 */

eventVolunteerSchema.pre(
  "validate",
  function (next) {
    /**
     * Removed assignments must contain removal information.
     */

    if (
      this.status === "REMOVED"
    ) {
      if (!this.removedAt) {
        this.removedAt = new Date();
      }

      if (!this.removedBy) {
        return next(
          new Error(
            "Removed assignments must specify who removed the volunteer.",
          ),
        );
      }
    }

    /**
     * Active assignments should not contain removal
     * information.
     */

    if (
      this.status === "ACTIVE"
    ) {
      this.removedAt = null;
      this.removedBy = null;
    }

    return next();
  },
);

/**
 * ============================================================
 * Model
 * ============================================================
 */

const EventVolunteer = model(
  "EventVolunteer",
  eventVolunteerSchema,
);

export default EventVolunteer;