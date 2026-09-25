import EmailJob from "../models/EmailJob.js";

/**
 * ============================================================
 * Create Confirmation Jobs
 * ============================================================
 *
 * Safely inserts multiple email jobs.
 * We use unordered insertMany to intentionally ignore duplicate
 * key errors (error code 11000). This naturally deduplicates
 * jobs if multiple concurrent requests (e.g., admin double-clicks)
 * attempt to create jobs for the same ticket.
 */
const createConfirmationJobs = async (jobsData) => {
  if (!jobsData || jobsData.length === 0) return [];

  try {
    const result = await EmailJob.insertMany(jobsData, { ordered: false });
    return result;
  } catch (error) {
    // If it's a BulkWriteError (code 11000), some documents were duplicates.
    // We only care about ensuring that jobs *exist*, so we can ignore it.
    if (error.name === "BulkWriteError" && error.code === 11000) {
      return error.insertedDocs || [];
    }
    // If it's a real database error, throw it so the caller knows the queue failed.
    throw error;
  }
};

/**
 * ============================================================
 * Claim Job Atomically
 * ============================================================
 *
 * Atomically finds a PENDING job (or a retryable FAILED job)
 * whose nextAttemptAt is in the past, marks it PROCESSING,
 * and locks it.
 */
const claimJobAtomically = async () => {
  return EmailJob.findOneAndUpdate(
    {
      status: "PENDING",
      nextAttemptAt: { $lte: new Date() },
    },
    {
      $set: {
        status: "PROCESSING",
        lockedAt: new Date(),
      },
      $inc: { attempts: 1 },
    },
    {
      new: true,
      sort: { nextAttemptAt: 1 },
    }
  )
    .populate("registration")
    .populate({
      path: "ticket",
      select: "+qrToken"
    })
    .exec();
};

/**
 * ============================================================
 * Mark Job Sent
 * ============================================================
 */
const markSent = async (jobId) => {
  return EmailJob.findByIdAndUpdate(
    jobId,
    {
      $set: {
        status: "SENT",
        sentAt: new Date(),
        lockedAt: null,
        lastError: null,
      },
    },
    { new: true }
  ).exec();
};

/**
 * ============================================================
 * Mark Job Failed / Handle Backoff
 * ============================================================
 *
 * Checks if the job has exceeded max attempts.
 * If yes, sets it to FAILED.
 * If no, applies exponential backoff and returns to PENDING.
 */
const markFailed = async (jobId, errorMessage) => {
  const job = await EmailJob.findById(jobId).lean();
  if (!job) return null;

  const isFinalFailure = job.attempts >= job.maxAttempts;
  const status = isFinalFailure ? "FAILED" : "PENDING";
  
  // Exponential backoff: 1m, 2m, 5m, 10m, 30m, etc.
  // Formula: current time + (attempts^2) * 60 seconds (roughly)
  // Let's use predefined reasonable values to avoid huge numbers.
  const backoffMinutes = [1, 2, 5, 10, 30];
  const backoffIndex = Math.min(job.attempts - 1, backoffMinutes.length - 1);
  const backoffMs = backoffMinutes[Math.max(0, backoffIndex)] * 60 * 1000;
  
  const nextAttemptAt = isFinalFailure ? job.nextAttemptAt : new Date(Date.now() + backoffMs);

  return EmailJob.findByIdAndUpdate(
    jobId,
    {
      $set: {
        status,
        lastError: String(errorMessage || "").slice(0, 1000),
        nextAttemptAt,
        lockedAt: null,
      },
    },
    { new: true }
  ).exec();
};

/**
 * ============================================================
 * Release Stale Processing Jobs
 * ============================================================
 *
 * If a process died while a job was PROCESSING, its lockedAt
 * will become stale. This transitions them back to PENDING.
 */
const releaseStaleProcessingJobs = async (thresholdMs = 5 * 60 * 1000) => {
  const staleDate = new Date(Date.now() - thresholdMs);
  
  return EmailJob.updateMany(
    {
      status: "PROCESSING",
      lockedAt: { $lt: staleDate },
    },
    {
      $set: {
        status: "PENDING",
        lockedAt: null,
      },
    }
  ).exec();
};

const emailJobRepository = Object.freeze({
  createConfirmationJobs,
  claimJobAtomically,
  markSent,
  markFailed,
  releaseStaleProcessingJobs,
});

export default emailJobRepository;
