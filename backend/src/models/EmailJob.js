import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * ============================================================
 * Email Job Schema
 * ============================================================
 *
 * A robust, persistent queue for asynchronous email dispatch.
 * Prevents emails from being lost during server restarts,
 * timeouts, or process boundary issues.
 * ============================================================
 */

const emailJobSchema = new Schema(
  {
    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true,
    },

    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: false,
    },

    type: {
      type: String,
      required: true,
      enum: ["REGISTRATION_CONFIRMATION"],
    },

    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["PENDING", "PROCESSING", "SENT", "FAILED"],
      default: "PENDING",
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    nextAttemptAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lockedAt: {
      type: Date,
      default: null,
    },

    lastError: {
      type: String,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * ============================================================
 * Indexes
 * ============================================================
 */

// Core indexing for the background worker to atomically claim the next available job
emailJobSchema.index({ status: 1, nextAttemptAt: 1 });

// Index for reclaiming stale processing jobs
emailJobSchema.index({ status: 1, lockedAt: 1 });

// Unique partial index to natively deduplicate jobs.
// A given ticket can only have one job of a specific type.
emailJobSchema.index(
  { type: 1, ticket: 1 },
  { unique: true, partialFilterExpression: { ticket: { $exists: true, $type: "objectId" } } }
);

/**
 * ============================================================
 * Model
 * ============================================================
 */

const EmailJob = model("EmailJob", emailJobSchema);

export default EmailJob;
