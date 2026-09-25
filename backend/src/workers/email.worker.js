import logger from "../config/logger.js";
import emailJobRepository from "../repositories/emailJob.repository.js";
import emailUtil from "../utils/email.js";
import receiptUtil from "../utils/receipt.js";
import paymentRepository from "../repositories/payment.repository.js";
import eventRepository from "../repositories/event.repository.js";
import mongoose from "mongoose";

/**
 * ============================================================
 * Email Worker
 * ============================================================
 *
 * Lightweight MongoDB-backed background worker that polls the
 * EmailJob collection and processes confirmation emails.
 */

let workerInterval = null;
let isProcessing = false;

const processNextJob = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    // 1. Release any stale locks (e.g. from previous crashed processes)
    // 5 minutes threshold
    await emailJobRepository.releaseStaleProcessingJobs(5 * 60 * 1000);

    // 2. Atomically claim one job
    const job = await emailJobRepository.claimJobAtomically();
    if (!job) {
      isProcessing = false;
      return; // Queue is empty
    }

    logger.info(`Email Worker: Processing job ${job._id} (attempt ${job.attempts}/${job.maxAttempts})`);

    // 3. Gather required data
    const registration = job.registration;
    const ticket = job.ticket;

    if (!registration || !ticket) {
      throw new Error("Job is missing registration or ticket reference.");
    }

    const event = await eventRepository.findByIdRaw(registration.event || ticket.event);
    
    let payment = await paymentRepository.findPendingByRegistration(registration._id);
    if (!payment) {
      payment = await paymentRepository.findByRegistration(registration._id);
    }
    if (!payment) {
      // Create a mock offline payment object if literally none exists
      // though typically they will have a PAID payment by this point.
      payment = {
        amount: event?.registrationFee || 0,
        currency: event?.currency || "INR",
        paymentId: "OFFLINE / MANUAL",
        orderId: "OFFLINE / MANUAL",
        paidAt: new Date(),
      };
    }

    const fullRegistration = await mongoose.model("Registration")
      .findById(registration._id)
      .populate("team")
      .lean();

    // 4. Generate PDF
    const pdfBuffer = await receiptUtil.generateRegistrationPDF({
      payment,
      registration: fullRegistration,
      ticket,
    });

    // 5. Send Email
    const emailResult = await emailUtil.sendRegistrationConfirmation({
      to: job.recipientEmail,
      participantName: job.recipientName,
      eventName: event?.title || "Event",
      ticketNumber: ticket.ticketNumber,
      registrationId: registration._id || registration,
      pdfBuffer,
    });

    // 6. Mark Sent
    await emailJobRepository.markSent(job._id, emailResult?.messageId);
    logger.info(`Email Worker: Job ${job._id} SENT successfully.`);

  } catch (error) {
    logger.error(`Email Worker: Job processing failed: ${error.message}`);
    
    // We don't have the job object in scope if claimJobAtomically failed, 
    // so we must safely handle marking failed only if we actually claimed a job.
    // Wait, let's catch around the job processing specifically.
  } finally {
    isProcessing = false;
  }
};

/**
 * Enhanced loop with inner try-catch to properly update the job on failure.
 */
const processNextJobSafe = async () => {
  if (isProcessing) return;
  isProcessing = true;

  let job = null;

  try {
    await emailJobRepository.releaseStaleProcessingJobs(5 * 60 * 1000);
    job = await emailJobRepository.claimJobAtomically();
  } catch (error) {
    logger.error(`Email Worker: Database error during claim: ${error.message}`);
    isProcessing = false;
    return;
  }

  if (!job) {
    isProcessing = false;
    return;
  }

  try {
    logger.info(`Email Worker: Processing job ${job._id} (attempt ${job.attempts}/${job.maxAttempts})`);

    const registration = job.registration;
    const ticket = job.ticket;

    if (!registration || !ticket) {
      throw new Error("Job is missing registration or ticket reference.");
    }

    const event = await eventRepository.findByIdRaw(registration.event || ticket.event);
    
    let payment = await paymentRepository.findPendingByRegistration(registration._id);
    if (!payment) {
      payment = await paymentRepository.findByRegistration(registration._id);
    }
    if (!payment) {
      payment = {
        amount: event?.registrationFee || 0,
        currency: event?.currency || "INR",
        paymentId: "OFFLINE / MANUAL",
        orderId: "OFFLINE / MANUAL",
        paidAt: new Date(),
      };
    }

    const fullRegistration = await mongoose.model("Registration")
      .findById(registration._id)
      .populate("team")
      .lean();

    const pdfBuffer = await receiptUtil.generateRegistrationPDF({
      payment,
      registration: fullRegistration,
      ticket,
    });

    const emailResult = await emailUtil.sendRegistrationConfirmation({
      to: job.recipientEmail,
      participantName: job.recipientName,
      eventName: event?.title || "Event",
      ticketNumber: ticket.ticketNumber,
      registrationId: registration._id || registration,
      pdfBuffer,
    });

    await emailJobRepository.markSent(job._id, emailResult?.messageId);
    logger.info(`Email Worker: Job ${job._id} SENT successfully.`);

  } catch (error) {
    logger.error(`Email Worker: Job ${job._id} processing failed: ${error.message}`);
    try {
      await emailJobRepository.markFailed(job._id, error.message);
    } catch (dbError) {
      logger.error(`Email Worker: Failed to mark job ${job._id} as failed: ${dbError.message}`);
    }
  } finally {
    isProcessing = false;
  }
};

const start = (pollingIntervalMs = 10000) => {
  if (workerInterval) return;
  logger.info(`Email Worker started with polling interval ${pollingIntervalMs}ms`);
  workerInterval = setInterval(processNextJobSafe, pollingIntervalMs);
  
  // Call it immediately once
  processNextJobSafe();
};

const stop = () => {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    logger.info("Email Worker stopped.");
  }
};

const emailWorker = Object.freeze({
  start,
  stop,
});

export default emailWorker;
