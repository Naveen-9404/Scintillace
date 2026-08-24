import mongoose from "mongoose";

import paymentRepository from "../repositories/payment.repository.js";
import registrationRepository from "../repositories/registration.repository.js";
import accommodationRepository from "../repositories/accommodation.repository.js";
import eventRepository from "../repositories/event.repository.js";
import ticketRepository from "../repositories/ticket.repository.js";

import ticketService from "./ticket.service.js";

import razorpayUtil from "../utils/razorpay.util.js";
import receiptUtil from "../utils/receipt.js";
import emailUtil from "../utils/email.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import ROLES from "../constants/roles.js";

import {
  PAYMENT_STATUS,
  PAYMENT_FOR,
} from "../constants/payment.constants.js";

import {
  REGISTRATION_STATUS,
  PAYMENT_STATUS as REGISTRATION_PAYMENT_STATUS,
} from "../constants/registration.constants.js";

import {
  ACCOMMODATION_BOOKING_STATUS,
  ACCOMMODATION_PAYMENT_STATUS,
} from "../constants/accommodation.constants.js";

import logger from "../utils/logger.js";

/**
 * ============================================================
 * Transaction Helpers
 * ============================================================
 */

const startTransaction = async () => {
  const session = await mongoose.startSession();

  session.startTransaction();

  return session;
};

const commitTransaction = async (
  session,
) => {
  await session.commitTransaction();
};

const rollbackTransaction = async (
  session,
) => {
  if (session?.inTransaction()) {
    await session.abortTransaction();
  }
};

const endTransaction = async (
  session,
) => {
  await session.endSession();
};

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
 * Currency Normalizer
 * ============================================================
 */

const normalizeCurrency = (
  currency,
) => {
  return (
    currency || "INR"
  )
    .toString()
    .trim()
    .toUpperCase();
};

/**
 * ============================================================
 * Verify Payment Amount / Currency
 * ============================================================
 */

const ensurePaymentAmountMatches =
  ({
    payment,
    razorpayPayment,
  }) => {
    const expectedAmountPaise =
      Math.round(
        Number(payment.amount) *
          100,
      );

    const actualAmountPaise =
      Number(
        razorpayPayment.amount,
      );

    if (
      expectedAmountPaise !==
      actualAmountPaise
    ) {
      throw new ApiError(
        "Payment amount does not match the expected amount.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const expectedCurrency =
      normalizeCurrency(
        payment.currency,
      );

    const actualCurrency =
      normalizeCurrency(
        razorpayPayment.currency,
      );

    if (
      expectedCurrency !==
      actualCurrency
    ) {
      throw new ApiError(
        "Payment currency does not match the expected currency.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  };

/**
 * ============================================================
 * Create Event Payment
 * ============================================================
 */

const createEventPayment =
  async ({
    userId,
    registrationId,
  }) => {
    if (!registrationId) {
      throw new ApiError(
        "Registration ID is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const registrationUserId =
      registration.user?._id ||
      registration.user;

    if (
      !registrationUserId ||
      registrationUserId.toString() !==
        userId.toString()
    ) {
      throw new ApiError(
        "You are not authorized to create payment for this registration.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (
      registration.status !==
      REGISTRATION_STATUS.PENDING
    ) {
      throw new ApiError(
        "This registration is not awaiting payment.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registration.paymentStatus !==
      REGISTRATION_PAYMENT_STATUS.PENDING
    ) {
      throw new ApiError(
        "This registration does not require payment.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Reuse existing pending order
     * ----------------------------------------------------------
     */

    const existingPayment =
      await paymentRepository.findPendingByRegistration(
        registrationId,
      );

    if (existingPayment) {
      return {
        payment:
          existingPayment,

        orderId:
          existingPayment.orderId,

        amount:
          existingPayment.amount,

        currency:
          existingPayment.currency,

        keyId:
          process.env.RAZORPAY_KEY_ID,
      };
    }

    const eventId =
      registration.event?._id ||
      registration.event;

    const event =
      await eventRepository.findByIdRaw(
        eventId,
      );

    if (!event) {
      throw new ApiError(
        "Event not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (!event.isPaid) {
      throw new ApiError(
        "This event does not require payment.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      !event.registrationFee ||
      event.registrationFee <= 0
    ) {
      throw new ApiError(
        "Invalid event registration fee.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const currency =
      normalizeCurrency(
        event.currency,
      );

    const receipt =
      `event_${registrationId}_${Date.now()}`;

    const razorpayOrder =
      await razorpayUtil.createOrder({
        amount:
          event.registrationFee,

        currency,

        receipt,

        notes: {
          paymentFor:
            PAYMENT_FOR.EVENT,

          registrationId:
            registrationId.toString(),

          userId:
            userId.toString(),

          eventId:
            event._id.toString(),
        },
      });

    const payment =
      await paymentRepository.create({
        user: userId,

        registration:
          registrationId,

        accommodation: null,

        paymentFor:
          PAYMENT_FOR.EVENT,

        amount:
          event.registrationFee,

        currency,

        orderId:
          razorpayOrder.id,

        status:
          PAYMENT_STATUS.PENDING,
      });

    return {
      payment,

      orderId:
        razorpayOrder.id,

      amount:
        event.registrationFee,

      currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,
    };
  };

/**
 * ============================================================
 * Create Accommodation Payment
 * ============================================================
 */

/**
 * ============================================================
 * Create Accommodation Payment
 * ============================================================
 *
 * Creates a Razorpay order for an accommodation booking.
 *
 * An existing local PENDING payment is only reused when its
 * corresponding Razorpay order is still in "created" state.
 *
 * This prevents stale local payment records from causing the
 * frontend to reopen an already-paid Razorpay order.
 */

const createAccommodationPayment =
  async ({
    userId,
    accommodationId,
  }) => {
    if (!accommodationId) {
      throw new ApiError(
        "Accommodation ID is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Find accommodation
     * ----------------------------------------------------------
     */

    const accommodation =
      await accommodationRepository.findById(
        accommodationId,
      );

    if (!accommodation) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    /**
     * ----------------------------------------------------------
     * Verify ownership
     * ----------------------------------------------------------
     */

    const accommodationUserId =
      accommodation.user?._id ||
      accommodation.user;

    if (
      !accommodationUserId ||
      accommodationUserId.toString() !==
        userId.toString()
    ) {
      throw new ApiError(
        "You are not authorized to create payment for this accommodation booking.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    /**
     * ----------------------------------------------------------
     * Booking must still be pending
     * ----------------------------------------------------------
     */

    if (
      accommodation.bookingStatus !==
      ACCOMMODATION_BOOKING_STATUS.PENDING
    ) {
      throw new ApiError(
        "This accommodation booking is not awaiting payment.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Already paid
     * ----------------------------------------------------------
     */

    if (
      accommodation.paymentStatus ===
      ACCOMMODATION_PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "This accommodation booking has already been paid.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      accommodation.paymentStatus !==
      ACCOMMODATION_PAYMENT_STATUS.PENDING
    ) {
      throw new ApiError(
        "This accommodation booking does not require payment.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Validate amount
     * ----------------------------------------------------------
     */

    const amount =
      Number(
        accommodation.amount,
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new ApiError(
        "Invalid accommodation amount.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const currency =
      normalizeCurrency(
        accommodation.currency ||
          "INR",
      );

    /**
     * ----------------------------------------------------------
     * Find an existing local pending payment
     * ----------------------------------------------------------
     */

    const existingPayment =
      await paymentRepository.findPendingByAccommodation(
        accommodationId,
      );

    /**
     * ----------------------------------------------------------
     * Check whether the existing Razorpay order is reusable
     * ----------------------------------------------------------
     */

    if (
      existingPayment?.orderId
    ) {
      try {
        const razorpayOrder =
          await razorpayUtil.fetchOrder(
            existingPayment.orderId,
          );

        /**
         * --------------------------------------------------------
         * Existing order is already paid
         * --------------------------------------------------------
         *
         * This means MongoDB and Razorpay are out of sync.
         *
         * We must NOT return this order to the frontend because
         * Razorpay Checkout cannot open an already-paid order.
         *
         * The normal verification/webhook flow should reconcile
         * the payment. We therefore reject the attempt instead of
         * charging the user again.
         */

        if (
          razorpayOrder?.status ===
          "paid"
        ) {
          throw new ApiError(
            "This accommodation payment has already been completed. Please refresh your accommodation details.",
            HTTP_STATUS.CONFLICT,
          );
        }

        /**
         * --------------------------------------------------------
         * Existing order is still usable
         * --------------------------------------------------------
         */

        if (
          razorpayOrder?.status ===
          "created"
        ) {
          return {
            payment:
              existingPayment,

            orderId:
              existingPayment.orderId,

            amount:
              existingPayment.amount,

            currency:
              existingPayment.currency,

            keyId:
              process.env.RAZORPAY_KEY_ID,
          };
        }

        /**
         * --------------------------------------------------------
         * Existing order is no longer usable
         * --------------------------------------------------------
         *
         * Continue below and create a fresh Razorpay order.
         */
      } catch (
        existingOrderError
      ) {
        /**
         * ApiError with CONFLICT means Razorpay explicitly told
         * us that the order is already paid.
         *
         * Do not swallow that error.
         */

        if (
          existingOrderError?.statusCode ===
          HTTP_STATUS.CONFLICT
        ) {
          throw existingOrderError;
        }

        /**
         * For an unavailable/invalid/expired old order, continue
         * and create a fresh Razorpay order.
         */

        logger.warn(
          `Existing Razorpay order ${existingPayment.orderId} could not be reused for accommodation ${accommodationId}: ${existingOrderError.message}`,
        );
      }
    }

    /**
     * ----------------------------------------------------------
     * Create a fresh Razorpay order
     * ----------------------------------------------------------
     */

    const receipt =
      `accommodation_${accommodationId}_${Date.now()}`;

    const razorpayOrder =
      await razorpayUtil.createOrder({
        amount,

        currency,

        receipt,

        notes: {
          paymentFor:
            PAYMENT_FOR.ACCOMMODATION,

          accommodationId:
            accommodationId.toString(),

          userId:
            userId.toString(),
        },
      });

    /**
     * ----------------------------------------------------------
     * Replace stale local PENDING payment
     * ----------------------------------------------------------
     *
     * We reuse the existing Payment document rather than
     * creating multiple PENDING payment records for the same
     * accommodation.
     */

    if (existingPayment) {
      const updatedPayment =
        await paymentRepository.updateById(
          existingPayment._id,
          {
            $set: {
              amount,

              currency,

              orderId:
                razorpayOrder.id,

              paymentId:
                null,

              status:
                PAYMENT_STATUS.PENDING,

              paidAt:
                null,

              failureReason:
                "",

              confirmationEmailStatus:
                "NOT_SENT",

              confirmationEmailSentAt:
                null,

              confirmationEmailMessageId:
                null,

              confirmationEmailError:
                "",

              confirmationEmailAttempts:
                0,

              confirmationEmailLastAttemptAt:
                null,

              confirmationEmailLastFailedAt:
                null,
            },
          },
        );

      return {
        payment:
          updatedPayment,

        orderId:
          razorpayOrder.id,

        amount,

        currency,

        keyId:
          process.env.RAZORPAY_KEY_ID,
      };
    }

    /**
     * ----------------------------------------------------------
     * Create new local payment
     * ----------------------------------------------------------
     */

    const payment =
      await paymentRepository.create({
        user:
          userId,

        registration:
          null,

        accommodation:
          accommodationId,

        paymentFor:
          PAYMENT_FOR.ACCOMMODATION,

        amount,

        currency,

        orderId:
          razorpayOrder.id,

        status:
          PAYMENT_STATUS.PENDING,
      });

    return {
      payment,

      orderId:
        razorpayOrder.id,

      amount,

      currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,
    };
  };
/**
 * ============================================================
 * Apply Successful Event Payment
 * ============================================================
 */

const applySuccessfulEventPayment =
  async ({
    payment,
    session,
  }) => {
    if (!payment.registration) {
      throw new ApiError(
        "Registration reference is missing.",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const registrationId =
      payment.registration._id ||
      payment.registration;

    const registration =
      await registrationRepository.updateById(
        registrationId,
        {
          status:
            REGISTRATION_STATUS.REGISTERED,

          paymentStatus:
            REGISTRATION_PAYMENT_STATUS.PAID,
        },
        session,
      );

    if (!registration) {
      throw new ApiError(
        "Unable to update registration after payment.",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return registration;
  };

/**
 * ============================================================
 * Create Ticket For Successful Event Payment
 * ============================================================
 */

const createTicketForRegistration =
  async ({
    registration,
    session,
  }) => {
    const existingTicket =
      await ticketRepository.findByRegistration(
        registration._id,
      );

    if (existingTicket) {
      return existingTicket;
    }

    const getReferenceId = (
      reference,
    ) =>
      reference?._id ||
      reference;

    return ticketService.createTicket(
      {
        registration:
          registration._id,

        user:
          getReferenceId(
            registration.user,
          ),

        event:
          getReferenceId(
            registration.event,
          ),

        festival:
          getReferenceId(
            registration.festival,
          ),
      },
      null,
      session,
    );
  };

/**
 * ============================================================
 * Apply Successful Accommodation Payment
 * ============================================================
 */

const applySuccessfulAccommodationPayment =
  async ({
    payment,
    session,
  }) => {
    if (!payment.accommodation) {
      throw new ApiError(
        "Accommodation reference is missing.",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const accommodationId =
      payment.accommodation._id ||
      payment.accommodation;

    const accommodation =
      await accommodationRepository.updateById(
        accommodationId,
        {
          paymentStatus:
            ACCOMMODATION_PAYMENT_STATUS.PAID,
        },
        session,
      );

    if (!accommodation) {
      throw new ApiError(
        "Unable to update accommodation payment status.",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return accommodation;
  };

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
 * both frontend verification and Razorpay webhook processing
 * happen for the same payment.
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

      if (!user.email) {
        throw new Error(
          "Registered user's email address could not be found.",
        );
      }

      const accommodation =
        payment.accommodation;

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
            user.email,

          participantName:
            user.fullName,

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
 * ============================================================
 * Verify Payment
 * ============================================================
 */

const verifyPayment =
  async ({
    userId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      throw new ApiError(
        "Razorpay payment verification details are required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Verify Razorpay Signature
     * ----------------------------------------------------------
     */

    const isSignatureValid =
      razorpayUtil.verifySignature({
        orderId:
          razorpay_order_id,

        paymentId:
          razorpay_payment_id,

        signature:
          razorpay_signature,
      });

    if (!isSignatureValid) {
      throw new ApiError(
        "Invalid payment signature.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Find Payment
     * ----------------------------------------------------------
     */

    const payment =
      await paymentRepository.findByOrderId(
        razorpay_order_id,
      );

    if (!payment) {
      throw new ApiError(
        "Payment order not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    ensurePaymentOwnership(
      payment,
      userId,
    );

    /**
     * ----------------------------------------------------------
     * Already Processed Payment
     * ----------------------------------------------------------
     *
     * The payment itself is already successful.
     *
     * We still attempt the confirmation email because the
     * previous email attempt may have failed.
     * ----------------------------------------------------------
     */

    if (
      payment.status ===
      PAYMENT_STATUS.PAID
    ) {
      if (
        payment.paymentFor ===
        PAYMENT_FOR.EVENT
      ) {
        await sendEventRegistrationConfirmation({
          paymentId:
            payment._id,
        });
      }

      if (
        payment.paymentFor ===
        PAYMENT_FOR.ACCOMMODATION
      ) {
        await sendAccommodationPaymentConfirmation({
          paymentId:
            payment._id,
        });
      }

      return {
        payment,

        alreadyProcessed:
          true,
      };
    }

    /**
     * ----------------------------------------------------------
     * Refunded Payment
     * ----------------------------------------------------------
     */

    if (
      payment.status ===
      PAYMENT_STATUS.REFUNDED
    ) {
      throw new ApiError(
        "This payment has already been refunded.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Fetch Payment From Razorpay
     * ----------------------------------------------------------
     */

    const razorpayPayment =
      await razorpayUtil.fetchPayment(
        razorpay_payment_id,
      );

    if (
      !razorpayPayment?.id
    ) {
      throw new ApiError(
        "Unable to retrieve Razorpay payment.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Verify Amount / Currency
     * ----------------------------------------------------------
     */

    ensurePaymentAmountMatches({
      payment,
      razorpayPayment,
    });

    if (
      normalizeCurrency(
        razorpayPayment.currency,
      ) !==
      normalizeCurrency(
        payment.currency,
      )
    ) {
      throw new ApiError(
        "Payment currency does not match the expected currency.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Verify Captured Status
     * ----------------------------------------------------------
     */

    if (
      razorpayPayment.status !==
      "captured"
    ) {
      throw new ApiError(
        "Razorpay payment has not been captured.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Transaction
     * ----------------------------------------------------------
     */

    const session =
      await startTransaction();

    let updatedPayment =
      null;

    let registration =
      null;

    let accommodation =
      null;

    try {
      /**
       * --------------------------------------------------------
       * Mark Payment As PAID
       * --------------------------------------------------------
       */

      updatedPayment =
        await paymentRepository.updateByOrderId(
          razorpay_order_id,

          {
            paymentId:
              razorpay_payment_id,

            signature:
              razorpay_signature,

            status:
              PAYMENT_STATUS.PAID,

            paidAt:
              new Date(),
          },

          session,
        );

      if (!updatedPayment) {
        throw new ApiError(
          "Unable to update payment status.",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      /**
       * --------------------------------------------------------
       * EVENT PAYMENT
       * --------------------------------------------------------
       */

      if (
        payment.paymentFor ===
        PAYMENT_FOR.EVENT
      ) {
        registration =
          await applySuccessfulEventPayment({
            payment,
            session,
          });

        await createTicketForRegistration({
          registration,
          session,
        });
      }

      /**
       * --------------------------------------------------------
       * ACCOMMODATION PAYMENT
       * --------------------------------------------------------
       */

      else if (
        payment.paymentFor ===
        PAYMENT_FOR.ACCOMMODATION
      ) {
        accommodation =
          await applySuccessfulAccommodationPayment({
            payment,
            session,
          });
      }

      /**
       * --------------------------------------------------------
       * Unsupported Payment
       * --------------------------------------------------------
       */

      else {
        throw new ApiError(
          "Unsupported payment type.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      /**
       * --------------------------------------------------------
       * Commit
       * --------------------------------------------------------
       */

      await commitTransaction(
        session,
      );
    } catch (error) {
      await rollbackTransaction(
        session,
      );

      logger.error(
        `Payment verification failed for order ${razorpay_order_id}: ${error.message}`,
      );

      throw error;
    } finally {
      await endTransaction(
        session,
      );
    }

    /**
     * ----------------------------------------------------------
     * IMPORTANT
     * ----------------------------------------------------------
     *
     * Email is intentionally sent only after the transaction
     * has committed.
     *
     * A confirmation-email failure therefore cannot roll back
     * a successful payment.
     * ----------------------------------------------------------
     */

    if (
      payment.paymentFor ===
      PAYMENT_FOR.EVENT
    ) {
      await sendEventRegistrationConfirmation({
        paymentId:
          payment._id,
      });
    }

    if (
      payment.paymentFor ===
      PAYMENT_FOR.ACCOMMODATION
    ) {
      await sendAccommodationPaymentConfirmation({
        paymentId:
          payment._id,
      });
    }

    return {
      payment:
        updatedPayment,

      ...(registration && {
        registration,
      }),

      ...(accommodation && {
        accommodation,
      }),

      alreadyProcessed:
        false,
    };
  };

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
 * Mark Payment Failed
 * ============================================================
 */

const markPaymentFailed =
  async ({
    orderId,
    reason,
  }) => {
    if (!orderId) {
      throw new ApiError(
        "Payment order ID is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const payment =
      await paymentRepository.findByOrderId(
        orderId,
      );

    if (!payment) {
      throw new ApiError(
        "Payment order not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      payment.status ===
      PAYMENT_STATUS.PAID
    ) {
      return payment;
    }

    if (
      payment.status ===
      PAYMENT_STATUS.REFUNDED
    ) {
      return payment;
    }

    return paymentRepository.updateByOrderId(
      orderId,
      {
        status:
          PAYMENT_STATUS.FAILED,

        failureReason:
          reason ||
          "Payment failed.",
      },
    );
  };

/**
 * ============================================================
 * Refund Payment
 * ============================================================
 */

const refundPayment =
  async ({
    paymentId,
    userId,
    amount,
    reason,
  }) => {
    const payment =
      await getPaymentByIdOrThrow(
        paymentId,
      );

    /**
     * ----------------------------------------------------------
     * Ownership
     * ----------------------------------------------------------
     */

    if (userId) {
      ensurePaymentOwnership(
        payment,
        userId,
      );
    }

    /**
     * ----------------------------------------------------------
     * Refund Eligibility
     * ----------------------------------------------------------
     */

    if (
      payment.status !==
      PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "Only successful payments can be refunded.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      payment.refundId
    ) {
      throw new ApiError(
        "This payment has already been refunded.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Determine Refund Amount
     * ----------------------------------------------------------
     */

    const refundAmount =
      amount == null
        ? Number(payment.amount)
        : Number(amount);

    if (
      !Number.isFinite(
        refundAmount,
      ) ||
      refundAmount <= 0
    ) {
      throw new ApiError(
        "Invalid refund amount.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      refundAmount >
      Number(payment.amount)
    ) {
      throw new ApiError(
        "Refund amount cannot exceed the payment amount.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Razorpay Refund
     * ----------------------------------------------------------
     */

    const razorpayRefund =
      await razorpayUtil.createRefund({
        paymentId:
          payment.paymentId,

        amount:
          refundAmount,

        notes: {
          reason:
            reason ||
            "Payment refund",
        },
      });

    if (
      !razorpayRefund?.id
    ) {
      throw new ApiError(
        "Razorpay refund could not be created.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ----------------------------------------------------------
     * Update Local Payment
     * ----------------------------------------------------------
     *
     * The webhook remains the final source of truth for the
     * completed refund state.
     * ----------------------------------------------------------
     */

    return paymentRepository.updateById(
      payment._id,
      {
        refundId:
          razorpayRefund.id,

        refundedAmount:
          refundAmount,

        refundStatus:
          razorpayRefund.status ||
          "created",
      },
    );
  };

/**
 * ============================================================
 * Finalize Refund
 * ============================================================
 */

const finalizeRefund =
  async ({
    payment,
    refundId,
    refundAmount,
    refundedAt,
  }) => {
    if (!payment) {
      throw new ApiError(
        "Payment is required to finalize refund.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const update = {
      status:
        PAYMENT_STATUS.REFUNDED,

      refundId,

      refundedAmount:
        refundAmount,

      refundedAt:
        refundedAt ||
        new Date(),
    };

    const updatedPayment =
      await paymentRepository.updateById(
        payment._id,
        update,
      );

    if (!updatedPayment) {
      throw new ApiError(
        "Unable to finalize payment refund.",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    /**
     * ----------------------------------------------------------
     * Update Related Accommodation
     * ----------------------------------------------------------
     */

    if (
      payment.paymentFor ===
      PAYMENT_FOR.ACCOMMODATION
    ) {
      if (
        payment.accommodation
      ) {
        await accommodationRepository.updateById(
          payment.accommodation._id ||
            payment.accommodation,
          {
            paymentStatus:
              ACCOMMODATION_PAYMENT_STATUS.REFUNDED,

            bookingStatus:
              ACCOMMODATION_BOOKING_STATUS.CANCELLED,

            refundId,

            refundedAt:
              refundedAt ||
              new Date(),
          },
        );
      }
    }

    /**
     * ----------------------------------------------------------
     * Update Related Registration
     * ----------------------------------------------------------
     */

    if (
      payment.paymentFor ===
      PAYMENT_FOR.EVENT
    ) {
      if (
        payment.registration
      ) {
        await registrationRepository.updateById(
          payment.registration._id ||
            payment.registration,
          {
            paymentStatus:
              REGISTRATION_PAYMENT_STATUS.REFUNDED,

            status:
              REGISTRATION_STATUS.CANCELLED,

            cancellationDate:
              refundedAt ||
              new Date(),
          },
        );
      }
    }

    return updatedPayment;
  };

/**
 * ============================================================
 * Razorpay Webhook
 * ============================================================
 */

const handleWebhook =
  async ({
    eventName,
    payload,
  }) => {
    switch (eventName) {
      /**
       * ======================================================
       * Payment Captured
       * ======================================================
       */

      case "payment.captured": {
        const razorpayPayment =
          payload?.payload?.payment
            ?.entity;

        if (
          !razorpayPayment?.id ||
          !razorpayPayment?.order_id
        ) {
          logger.warn(
            "Invalid payment.captured webhook payload.",
          );

          break;
        }

        const payment =
          await paymentRepository.findByOrderId(
            razorpayPayment.order_id,
          );

        if (!payment) {
          logger.warn(
            `Payment not found for order ${razorpayPayment.order_id}`,
          );

          break;
        }

        /**
         * ------------------------------------------------------
         * Already Paid
         * ------------------------------------------------------
         *
         * Retry the confirmation email if necessary.
         * ------------------------------------------------------
         */

        if (
          payment.status ===
          PAYMENT_STATUS.PAID
        ) {
          if (
            payment.paymentFor ===
            PAYMENT_FOR.EVENT
          ) {
            await sendEventRegistrationConfirmation({
              paymentId:
                payment._id,
            });
          }

          if (
            payment.paymentFor ===
            PAYMENT_FOR.ACCOMMODATION
          ) {
            await sendAccommodationPaymentConfirmation({
              paymentId:
                payment._id,
            });
          }

          break;
        }

        /**
         * ------------------------------------------------------
         * Already Refunded
         * ------------------------------------------------------
         */

        if (
          payment.status ===
          PAYMENT_STATUS.REFUNDED
        ) {
          break;
        }

        /**
         * ------------------------------------------------------
         * Validate Amount
         * ------------------------------------------------------
         */

        ensurePaymentAmountMatches({
          payment,
          razorpayPayment,
        });

        /**
         * ------------------------------------------------------
         * Validate Currency
         * ------------------------------------------------------
         */

        if (
          normalizeCurrency(
            razorpayPayment.currency,
          ) !==
          normalizeCurrency(
            payment.currency,
          )
        ) {
          throw new ApiError(
            "Payment currency does not match the expected currency.",
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        /**
         * ------------------------------------------------------
         * Validate Capture
         * ------------------------------------------------------
         */

        if (
          razorpayPayment.status !==
          "captured"
        ) {
          logger.warn(
            `Payment ${razorpayPayment.id} is not captured.`,
          );

          break;
        }

        const session =
          await startTransaction();

        try {
          const updatedPayment =
            await paymentRepository.updateByOrderId(
              razorpayPayment.order_id,
              {
                paymentId:
                  razorpayPayment.id,

                status:
                  PAYMENT_STATUS.PAID,

                paidAt:
                  new Date(),
              },
              session,
            );

          if (!updatedPayment) {
            throw new ApiError(
              "Unable to update captured payment.",
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
            );
          }

          if (
            payment.paymentFor ===
            PAYMENT_FOR.EVENT
          ) {
            const registration =
              await applySuccessfulEventPayment({
                payment,
                session,
              });

            await createTicketForRegistration({
              registration,
              session,
            });
          } else if (
            payment.paymentFor ===
            PAYMENT_FOR.ACCOMMODATION
          ) {
            await applySuccessfulAccommodationPayment({
              payment,
              session,
            });
          } else {
            throw new ApiError(
              "Unsupported payment type.",
              HTTP_STATUS.BAD_REQUEST,
            );
          }

          await commitTransaction(
            session,
          );
        } catch (error) {
          await rollbackTransaction(
            session,
          );

          logger.error(
            `Payment capture processing failed for order ${razorpayPayment.order_id}: ${error.message}`,
          );

          throw error;
        } finally {
          await endTransaction(
            session,
          );
        }

        /**
         * ------------------------------------------------------
         * Email only after transaction commit
         * ------------------------------------------------------
         */

        if (
          payment.paymentFor ===
          PAYMENT_FOR.EVENT
        ) {
          await sendEventRegistrationConfirmation({
            paymentId:
              payment._id,
          });
        }

        if (
          payment.paymentFor ===
          PAYMENT_FOR.ACCOMMODATION
        ) {
          await sendAccommodationPaymentConfirmation({
            paymentId:
              payment._id,
          });
        }

        break;
      }

      /**
       * ======================================================
       * Payment Failed
       * ======================================================
       */

      case "payment.failed": {
        const razorpayPayment =
          payload?.payload?.payment
            ?.entity;

        if (
          !razorpayPayment?.order_id
        ) {
          logger.warn(
            "Invalid payment.failed webhook payload.",
          );

          break;
        }

        const reason =
          razorpayPayment.error_description ||
          razorpayPayment.error_reason ||
          "Payment failed.";

        await markPaymentFailed({
          orderId:
            razorpayPayment.order_id,

          reason,
        });

        break;
      }

      /**
       * ======================================================
       * Refund Processed
       * ======================================================
       */

      case "refund.processed": {
        const refund =
          payload?.payload?.refund
            ?.entity;

        if (
          !refund?.payment_id ||
          !refund?.id
        ) {
          logger.warn(
            "Invalid refund.processed webhook payload.",
          );

          break;
        }

        const payment =
          await paymentRepository.findByPaymentId(
            refund.payment_id,
          );

        if (!payment) {
          logger.warn(
            `Payment not found for Razorpay payment ${refund.payment_id}`,
          );

          break;
        }

        /**
         * ------------------------------------------------------
         * Idempotency
         * ------------------------------------------------------
         */

        if (
          payment.refundId ===
          refund.id
        ) {
          break;
        }

        const refundAmount =
          Number(
            refund.amount || 0,
          ) / 100;

        if (
          refundAmount <= 0
        ) {
          logger.warn(
            `Invalid refund amount for refund ${refund.id}`,
          );

          break;
        }

        await finalizeRefund({
          payment,

          refundId:
            refund.id,

          refundAmount,

          refundedAt:
            refund.created_at
              ? new Date(
                  refund.created_at *
                    1000,
                )
              : new Date(),
        });

        break;
      }

      /**
       * ======================================================
       * Other Razorpay Events
       * ======================================================
       */

      default: {
        logger.info(
          `Unhandled Razorpay webhook event: ${eventName}`,
        );

        break;
      }
    }

    return {
      received: true,

      event:
        eventName,
    };
  };

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const paymentService =
  Object.freeze({
    createEventPayment,

    createAccommodationPayment,

    verifyPayment,

    getPaymentById,

    getPaymentReceipt,

    getMyPayments,

    getAllPayments,

    refundPayment,

    markPaymentFailed,

    handleWebhook,

    sendEventRegistrationConfirmation,

    sendAccommodationPaymentConfirmation,
  });

export default paymentService;