import mongoose from "mongoose";

const {
  Schema,
  model,
} = mongoose;

/**
 * ============================================================
 * Announcement Schema
 * ============================================================
 *
 * Announcements are used to publish important information
 * related to a festival, event, or the overall Scintillace
 * platform.
 *
 * An announcement may be:
 *
 * - Global
 * - Festival-specific
 * - Event-specific
 *
 * Only the creator and administrative users should manage
 * announcements through the service/controller layer.
 * ============================================================
 */

const announcementSchema =
  new Schema(
    {
      /**
       * --------------------------------------------------------
       * Basic Information
       * --------------------------------------------------------
       */

      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200,
        index: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 5000,
      },

      /**
       * --------------------------------------------------------
       * Announcement Type
       * --------------------------------------------------------
       *
       * GLOBAL
       *   → visible across the platform/festival website
       *
       * FESTIVAL
       *   → associated with a particular festival
       *
       * EVENT
       *   → associated with a particular event
       */

      scope: {
        type: String,
        enum: [
          "GLOBAL",
          "FESTIVAL",
          "EVENT",
        ],
        default: "GLOBAL",
        required: true,
        index: true,
      },

      /**
       * --------------------------------------------------------
       * References
       * --------------------------------------------------------
       *
       * These remain optional because GLOBAL announcements do
       * not require a festival or event reference.
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
       * Priority
       * --------------------------------------------------------
       */

      priority: {
        type: String,
        enum: [
          "LOW",
          "NORMAL",
          "HIGH",
          "URGENT",
        ],
        default: "NORMAL",
        index: true,
      },

      /**
       * --------------------------------------------------------
       * Publication
       * --------------------------------------------------------
       */

      status: {
        type: String,
        enum: [
          "DRAFT",
          "PUBLISHED",
          "ARCHIVED",
        ],
        default: "DRAFT",
        required: true,
        index: true,
      },

      publishedAt: {
        type: Date,
        default: null,
        index: true,
      },

      /**
       * --------------------------------------------------------
       * Visibility
       * --------------------------------------------------------
       *
       * Allows an announcement to be published for a specific
       * period instead of remaining visible indefinitely.
       */

      visibleFrom: {
        type: Date,
        default: null,
        index: true,
      },

      visibleUntil: {
        type: Date,
        default: null,
        index: true,
      },

      /**
       * --------------------------------------------------------
       * Audit
       * --------------------------------------------------------
       */

      createdBy: {
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

announcementSchema.virtual(
  "id",
).get(function () {
  return this._id.toHexString();
});

/**
 * ============================================================
 * Business Validation
 * ============================================================
 *
 * Keep these invariants at model level so they also apply to
 * internal scripts/services and not only HTTP validators.
 * ============================================================
 */

announcementSchema.pre(
  "validate",
  function () {
    /**
     * Festival-scoped announcements must have a festival.
     */

    if (
      this.scope === "FESTIVAL" &&
      !this.festival
    ) {
      this.invalidate(
        "festival",
        "Festival is required for a festival announcement.",
      );
    }

    /**
     * Event-scoped announcements must have an event.
     */

    if (
      this.scope === "EVENT" &&
      !this.event
    ) {
      this.invalidate(
        "event",
        "Event is required for an event announcement.",
      );
    }

    /**
     * Global announcements should not point to a
     * specific festival or event.
     */

    if (
      this.scope === "GLOBAL"
    ) {
      this.festival = null;
      this.event = null;
    }

    /**
     * Published announcements should have a publication date.
     */

    if (
      this.status === "PUBLISHED" &&
      !this.publishedAt
    ) {
      this.publishedAt = new Date();
    }

    /**
     * Archived announcements should not remain
     * scheduled for future publication.
     */

    if (
      this.status === "ARCHIVED"
    ) {
      this.visibleFrom = null;
      this.visibleUntil = null;
    }

    /**
     * visibleUntil must be after visibleFrom.
     */

    if (
      this.visibleFrom &&
      this.visibleUntil &&
      this.visibleUntil <=
        this.visibleFrom
    ) {
      this.invalidate(
        "visibleUntil",
        "Announcement visibility end must be after the visibility start.",
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
 * Published announcements ordered by publication date.
 */

announcementSchema.index({
  status: 1,
  publishedAt: -1,
});

/**
 * Festival announcements.
 */

announcementSchema.index({
  festival: 1,
  status: 1,
  publishedAt: -1,
});

/**
 * Event announcements.
 */

announcementSchema.index({
  event: 1,
  status: 1,
  publishedAt: -1,
});

/**
 * Priority-based administrative queries.
 */

announcementSchema.index({
  priority: 1,
  status: 1,
});

/**
 * Visibility-window queries.
 */

announcementSchema.index({
  status: 1,
  visibleFrom: 1,
  visibleUntil: 1,
});

/**
 * Text search.
 */

announcementSchema.index({
  title: "text",
  message: "text",
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Announcement = model(
  "Announcement",
  announcementSchema,
);

export default Announcement;
