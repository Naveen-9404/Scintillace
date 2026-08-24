import mongoose from "mongoose";

const {
  Schema,
  model,
} = mongoose;

/**
 * ============================================================
 * Gallery Schema
 * ============================================================
 *
 * Stores images/media associated with a Scintillace festival
 * or event.
 *
 * A gallery item may belong to:
 *
 * - A festival
 * - An event
 * - Both
 *
 * At least one of festival/event should be associated with
 * every gallery item.
 * ============================================================
 */

const gallerySchema = new Schema(
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

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    /**
     * --------------------------------------------------------
     * Media
     * --------------------------------------------------------
     */

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },

    publicId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    /**
     * --------------------------------------------------------
     * Associations
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
     * Display / Publication
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

    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
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

gallerySchema.virtual("id").get(
  function () {
    return this._id.toHexString();
  },
);

/**
 * ============================================================
 * Business Validation
 * ============================================================
 */

gallerySchema.pre(
  "validate",
  function () {
    /**
     * Every gallery item must belong to either
     * a festival or an event.
     */

    if (
      !this.festival &&
      !this.event
    ) {
      this.invalidate(
        "festival",
        "Gallery item must be associated with a festival or event.",
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
 * Festival gallery ordered for display.
 */

gallerySchema.index({
  festival: 1,
  status: 1,
  displayOrder: 1,
});

/**
 * Event gallery ordered for display.
 */

gallerySchema.index({
  event: 1,
  status: 1,
  displayOrder: 1,
});

/**
 * Featured published gallery items.
 */

gallerySchema.index({
  featured: 1,
  status: 1,
  createdAt: -1,
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Gallery = model(
  "Gallery",
  gallerySchema,
);

export default Gallery;
