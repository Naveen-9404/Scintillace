import mongoose from "mongoose";

import FESTIVAL_STATUS from "../constants/festivalStatus.js";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Festival Schema
 * ============================================================
 */

const festivalSchema = new Schema(
  {
    /**
     * ========================================================
     * Title
     * ========================================================
     */

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
      index: true,
    },

    /**
     * ========================================================
     * Description
     * ========================================================
     */

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },

    /**
     * ========================================================
     * Theme
     * ========================================================
     */

    theme: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    /**
     * ========================================================
     * Start Date
     * ========================================================
     */

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    /**
     * ========================================================
     * End Date
     * ========================================================
     */

    endDate: {
      type: Date,
      required: true,
      index: true,

      validate: {
        validator(value) {
          /**
           * --------------------------------------------------
           * Document Validation
           * --------------------------------------------------
           *
           * Used during Festival.create() and save().
           */

          if (
            this instanceof
            mongoose.Document
          ) {
            return (
              value >= this.startDate
            );
          }

          /**
           * --------------------------------------------------
           * Query Validation
           * --------------------------------------------------
           *
           * Used by findByIdAndUpdate()
           * with runValidators: true.
           */

          if (
            this instanceof
            mongoose.Query
          ) {
            const startDate =
              this.get("startDate");

            /**
             * If startDate is not being updated,
             * repository-level validation already
             * checks the existing startDate.
             *
             * Therefore, allow Mongoose to continue.
             */

            if (
              startDate === undefined
            ) {
              return true;
            }

            return (
              value >=
              new Date(startDate)
            );
          }

          return true;
        },

        message:
          "End date must be greater than or equal to the start date.",
      },
    },

    /**
     * ========================================================
     * Venue
     * ========================================================
     */

    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    /**
     * ========================================================
     * Banner URL
     * ========================================================
     */

    bannerUrl: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * ========================================================
     * Status
     * ========================================================
     */

    status: {
      type: String,
      enum: Object.values(
        FESTIVAL_STATUS,
      ),
      default: FESTIVAL_STATUS.DRAFT,
      index: true,
    },

    /**
     * ========================================================
     * Registration Open
     * ========================================================
     */

    registrationOpen: {
      type: Boolean,
      default: false,
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

festivalSchema.virtual("id").get(
  function () {
    return this._id.toHexString();
  },
);

/**
 * ============================================================
 * Compound Indexes
 * ============================================================
 */

festivalSchema.index({
  status: 1,
  startDate: 1,
});

festivalSchema.index({
  createdBy: 1,
  status: 1,
});

/**
 * ============================================================
 * Model
 * ============================================================
 */

const Festival = model(
  "Festival",
  festivalSchema,
);

export default Festival;