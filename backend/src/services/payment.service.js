

import paymentRepository from "../repositories/payment.repository.js";
import registrationRepository from "../repositories/registration.repository.js";
import ticketRepository from "../repositories/ticket.repository.js";




import receiptUtil from "../utils/receipt.js";
import emailUtil from "../utils/email.js";
import cloudinaryUtil from "../utils/cloudinary.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";


import {
  PAYMENT_STATUS,
  PAYMENT_FOR,
} from "../constants/payment.constants.js";



import logger from "../utils/logger.js";

/**

 * ============================================================
 * Payment Lookup
 * ============================================================
 */

const getPaymentByIdOrThrow =
  async (
    paymentId,
  ) => {
    const payment =
      await paymentRepository.findById(
        paymentId,
      );

    if (!payment) {
      throw new ApiError(
        "Payment not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return payment;
  };

/**
 * ============================================================
 * Payment Ownership
 * ============================================================
 */

const ensurePaymentOwnership = (
  payment,
  userId,
) => {
  const paymentUserId =
    payment.user?._id ||
    payment.user;

  if (
    !paymentUserId ||
    paymentUserId.toString() !==
      userId.toString()
  ) {
    throw new ApiError(
      "You are not authorized to access this payment.",
      HTTP_STATUS.FORBIDDEN,
    );
  }
};

/**
 * ============================================================

/**
 * ============================================================
 * Send Event Registration Confirmation
 * ============================================================
 *
 * IMPORTANT:
 *
 * This runs AFTER the payment transaction has committed.
 *
 * Therefore:
 *
 * Payment success
 *     ↓
 * Registration updated
 *     ↓
 * Ticket created
 *     ↓
 * Transaction committed
 *     ↓
 * PDF generated
 *     ↓
 * Email sent
 *
 * Email failure never rolls back the successful payment.
 *
 * The repository claim method prevents duplicate emails when
 * multiple concurrent requests attempt to finalize the
 * same payment.
 */

const sendEventRegistrationConfirmation =
  async ({
    paymentId,
  }) => {
    if (!paymentId) {
      return;
    }

    /**
     * ----------------------------------------------------------
     * Atomically claim email sending
     * ----------------------------------------------------------
     */

    const payment =
      await paymentRepository.claimConfirmationEmail(
        paymentId,
      );

    /**
     * Another request has already claimed or completed
     * the email.
     */

    if (!payment) {
      return;
    }

    try {
      /**
       * --------------------------------------------------------
       * Registration
       * --------------------------------------------------------
       */

      if (!payment.registration) {
        throw new Error(
          "Registration reference is missing.",
        );
      }

      const registration =
        await registrationRepository.findById(
          payment.registration._id ||
            payment.registration,
        );

      if (!registration) {
        throw new Error(
          "Registration could not be found.",
        );
      }

      /**
       * --------------------------------------------------------
       * Ticket with QR token
       * --------------------------------------------------------
       */

      const ticket =
        await ticketRepository.findByRegistrationWithQrToken(
          registration._id,
        );

      if (!ticket) {
        throw new Error(
          "Ticket could not be found for the registration.",
        );
      }

      if (!ticket.qrToken) {
        throw new Error(
          "Ticket QR token could not be found.",
        );
      }

      /**
       * --------------------------------------------------------
       * Participant
       * --------------------------------------------------------
       */

      const user =
        registration.user ||
        ticket.user;

      if (!user?.email) {
        throw new Error(
          "Registered user's email address could not be found.",
        );
      }

      /**
       * --------------------------------------------------------
       * Event
       * --------------------------------------------------------
       */

      const event =
        registration.event ||
        ticket.event;

      /**
       * --------------------------------------------------------
       * Generate PDF
       * --------------------------------------------------------
       */

      const pdf =
        await receiptUtil.generateRegistrationPDF(
          {
            payment,
            registration,
            ticket,
          },
        );

      /**
       * --------------------------------------------------------
       * Send Email
       * --------------------------------------------------------
       */

      const emailResult =
        await emailUtil.sendRegistrationConfirmation(
          {
            to:
              user.email,

            participantName:
              user.fullName,

            eventName:
              event?.title,

            ticketNumber:
              ticket.ticketNumber,

            pdfBuffer:
              pdf,
          },
        );

      /**
       * --------------------------------------------------------
       * Mark email as successfully sent
       * --------------------------------------------------------
       */

      await paymentRepository.markConfirmationEmailSent(
        paymentId,
        {
          messageId:
            emailResult?.messageId ||
            null,
        },
      );

      logger.info(
        `Registration confirmation email sent successfully for payment ${payment.orderId}.`,
      );
    } catch (error) {
      /**
       * IMPORTANT:
       *
       * The payment is already successful and the transaction
       * has already committed.
       *
       * Therefore email failure must not affect the payment.
       */

      try {
        await paymentRepository.markConfirmationEmailFailed(
          paymentId,
          error.message,
        );
      } catch (
        emailStatusError
      ) {
        logger.error(
          `Unable to update confirmation email status for payment ${paymentId}: ${emailStatusError.message}`,
        );
      }

      logger.error(
        `Registration confirmation email failed for payment ${payment.orderId}: ${error.message}`,
      );
    }
  };

/**
 * ============================================================
 * Send Accommodation Payment Confirmation
 * ============================================================
 *
 * This runs only AFTER the payment transaction commits.
 * Email failure never rolls back a successful payment.
 */

const sendAccommodationPaymentConfirmation =
  async ({
    paymentId,
  }) => {
    if (!paymentId) {
      return;
    }

    const payment =
      await paymentRepository.claimConfirmationEmail(
        paymentId,
      );

    if (!payment) {
      return;
    }

    try {
      if (
        payment.paymentFor !==
        PAYMENT_FOR.ACCOMMODATION
      ) {
        throw new Error(
          "Payment is not an accommodation payment.",
        );
      }

      if (!payment.accommodation) {
        throw new Error(
          "Accommodation reference is missing.",
        );
      }

      const user =
        payment.user || {};

      const accommodation =
        payment.accommodation;

      const toEmail = user.email || accommodation?.participantEmail;
      const toName = user.fullName || accommodation?.participantName;

      if (!toEmail) {
        throw new Error(
          "Participant's email address could not be found.",
        );
      }

      const event =
        accommodation.event ||
        accommodation.registration?.event ||
        {};

      const calculateDays = (
        checkIn,
        checkOut,
      ) => {
        if (!checkIn || !checkOut) {
          return null;
        }

        const start =
          new Date(checkIn);

        const end =
          new Date(checkOut);

        if (
          Number.isNaN(start.getTime()) ||
          Number.isNaN(end.getTime()) ||
          end <= start
        ) {
          return null;
        }

        return Math.ceil(
          (end.getTime() -
            start.getTime()) /
            (1000 * 60 * 60 * 24),
        );
      };

      const accommodationDays =
        calculateDays(
          accommodation.checkInDate,
          accommodation.checkOutDate,
        );

      const pdf =
        await receiptUtil.generateAccommodationReceiptPDF({
          accommodation,
        });

      const emailResult =
        await emailUtil.sendAccommodationConfirmation({
          to:
            toEmail,

          participantName:
            toName,

          eventName:
            event?.title,

          hostelType:
            accommodation.hostelType,

          checkInDate:
            accommodation.checkInDate,

          checkOutDate:
            accommodation.checkOutDate,

          accommodationDays,

          amount:
            payment.amount,

          currency:
            payment.currency,

          paymentId:
            payment.paymentId,

          orderId:
            payment.orderId,

          bookingId:
            accommodation._id,

          confirmationCode:
            accommodation.confirmationCode ||
            "",

          pdfBuffer:
            pdf,
        });

      await paymentRepository.markConfirmationEmailSent(
        paymentId,
        {
          messageId:
            emailResult?.messageId ||
            null,
        },
      );

      logger.info(
        `Accommodation payment confirmation email sent successfully for payment ${payment.orderId}.`,
      );
    } catch (error) {
      try {
        await paymentRepository.markConfirmationEmailFailed(
          paymentId,
          error.message,
        );
      } catch (
        emailStatusError
      ) {
        logger.error(
          `Unable to update accommodation confirmation email status for payment ${paymentId}: ${emailStatusError.message}`,
        );
      }

      logger.error(
        `Accommodation payment confirmation email failed for payment ${payment.orderId}: ${error.message}`,
      );
    }
  };
  /**


/**
 * ============================================================
 * Get Payment By ID
 * ============================================================
 */

const getPaymentById =
  async ({
    paymentId,
    userId,
  }) => {
    if (!paymentId) {
      throw new ApiError(
        "Payment ID is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const payment =
      await getPaymentByIdOrThrow(
        paymentId,
      );

    ensurePaymentOwnership(
      payment,
      userId,
    );

    return payment;
  };

/**
 * ============================================================
 * Get Payment Receipt
 * ============================================================
 */

const getPaymentReceipt =
  async ({
    paymentId,
    userId,
  }) => {
    const payment =
      await getPaymentByIdOrThrow(
        paymentId,
      );

    ensurePaymentOwnership(
      payment,
      userId,
    );

    if (
      payment.status !==
      PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "Receipt is available only for successful payments.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      payment.paymentFor ===
      PAYMENT_FOR.EVENT
    ) {
      const registration =
        await registrationRepository.findById(
          payment.registration?._id ||
            payment.registration,
        );

      if (!registration) {
        throw new ApiError(
          "Registration could not be found.",
          HTTP_STATUS.NOT_FOUND,
        );
      }

      const ticket =
        await ticketRepository.findByRegistrationWithQrToken(
          registration._id,
        );

      if (!ticket) {
        throw new ApiError(
          "Ticket could not be found.",
          HTTP_STATUS.NOT_FOUND,
        );
      }

      return receiptUtil.generateRegistrationPDF({
        payment,
        registration,
        ticket,
      });
    }

    if (
      payment.paymentFor ===
      PAYMENT_FOR.ACCOMMODATION
    ) {
      if (!payment.accommodation) {
        throw new ApiError(
          "Accommodation reference is missing.",
          HTTP_STATUS.NOT_FOUND,
        );
      }

      return receiptUtil.generateAccommodationReceiptPDF({
        accommodation:
          payment.accommodation,
      });
    }

    throw new ApiError(
      "Unsupported payment type.",
      HTTP_STATUS.BAD_REQUEST,
    );
  };

/**
 * ============================================================
 * Get My Payments
 * ============================================================
 */

const getMyPayments =
  async ({
    userId,
    page = 1,
    limit = 20,
    paymentFor,
    status,
  }) => {
    const normalizedPage =
      Math.max(
        Number(page) || 1,
        1,
      );

    const normalizedLimit =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1,
        ),
        100,
      );

    const payments =
      await paymentRepository.findByUser(
        userId,
        {
          page:
            normalizedPage,

          limit:
            normalizedLimit,

          paymentFor,

          status,
        },
      );

    return payments || [];
  };

/**
 * ============================================================
 * Submit Payment Screenshot (Guest Flow)
 * ============================================================
 */
const submitPaymentScreenshot = async ({
  registration,
  screenshotUrl,
  screenshotPublicId,
  paymentFor = PAYMENT_FOR.EVENT,
  accommodationId = null,
}) => {
  if (paymentFor === PAYMENT_FOR.EVENT && registration.paymentStatus !== PAYMENT_STATUS.PENDING) {
    throw new ApiError("Event registration payment is not pending.", HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const parsedUrl = new URL(screenshotUrl);
    if (parsedUrl.hostname !== "res.cloudinary.com") {
      throw new ApiError("Screenshot URL must be a valid Cloudinary URL.", HTTP_STATUS.BAD_REQUEST);
    }
  } catch (err) {
    throw new ApiError("Invalid screenshot URL format.", HTTP_STATUS.BAD_REQUEST);
  }

  let payment;

  if (paymentFor === PAYMENT_FOR.ACCOMMODATION) {
    if (!accommodationId) {
      throw new ApiError("Accommodation ID is required for accommodation payments.", HTTP_STATUS.BAD_REQUEST);
    }
    
    // Look up existing pending payment for this accommodation
    payment = await paymentRepository.findPendingByAccommodation(accommodationId);

    if (payment) {
      if (payment.screenshotPublicId) {
        cloudinaryUtil.deleteAsset(payment.screenshotPublicId).catch((err) => {
          logger.error(`Failed to delete old screenshot from Cloudinary: ${err.message}`);
        });
      }
      payment = await paymentRepository.updateById(payment._id, {
        screenshotUrl,
        screenshotPublicId,
        status: PAYMENT_STATUS.PENDING
      });
    } else {
      throw new ApiError("No pending payment found for this accommodation.", HTTP_STATUS.NOT_FOUND);
    }
  } else {
    // Find if a payment document already exists for this registration (Event)
    payment = await paymentRepository.findByRegistration(registration._id);

    if (payment) {
      if (payment.status !== PAYMENT_STATUS.PENDING && payment.status !== PAYMENT_STATUS.FAILED) {
        throw new ApiError("Cannot update screenshot for this payment status.", HTTP_STATUS.BAD_REQUEST);
      }
      // Delete old screenshot if it exists
      if (payment.screenshotPublicId) {
        cloudinaryUtil.deleteAsset(payment.screenshotPublicId).catch((err) => {
          logger.error(`Failed to delete old screenshot from Cloudinary: ${err.message}`);
        });
      }
      payment = await paymentRepository.updateById(payment._id, {
        screenshotUrl,
        screenshotPublicId,
        status: PAYMENT_STATUS.PENDING
      });
    } else {
      // Create new payment document
      const paymentData = {
        user: null,
        registration: registration._id,
        paymentFor: PAYMENT_FOR.EVENT,
        amount: registration.event.registrationFee,
        currency: registration.event.currency || "INR",
        screenshotUrl,
        screenshotPublicId,
        status: PAYMENT_STATUS.PENDING
      };
      payment = await paymentRepository.create(paymentData);
    }
  }

  return payment;
};

/**
 * ============================================================
 * Get All Payments
 * ============================================================
 */

const getAllPayments =
  async ({
    page = 1,
    limit = 50,
    paymentFor,
    status,
    search,
  } = {}) => {
    const normalizedPage =
      Math.max(
        Number(page) || 1,
        1,
      );

    const normalizedLimit =
      Math.min(
        Math.max(
          Number(limit) || 50,
          1,
        ),
        100,
      );

    const payments =
      await paymentRepository.findAll({
        page:
          normalizedPage,

        limit:
          normalizedLimit,

        paymentFor,

        status,

        search,
      });

    return payments || [];
  };


/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const paymentService = Object.freeze({
  getPaymentById,
  getPaymentReceipt,
  getMyPayments,
  getAllPayments,
  sendEventRegistrationConfirmation,
  sendAccommodationPaymentConfirmation,
  submitPaymentScreenshot,
});

export default paymentService;
