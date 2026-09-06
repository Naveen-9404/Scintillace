import accommodationRepository from "../repositories/accommodation.repository.js";
import registrationRepository from "../repositories/registration.repository.js";
import paymentRepository from "../repositories/payment.repository.js";

import User from "../models/User.js";

import receiptUtil from "../utils/receipt.js";
import emailUtil from "../utils/email.js";
import logger from "../utils/logger.js";
import cloudinaryUtil from "../utils/cloudinary.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

import {
  ACCOMMODATION_HOSTEL_TYPES,
  ACCOMMODATION_BOOKING_STATUS,
  ACCOMMODATION_PAYMENT_STATUS,
  ACCOMMODATION_PRICE_PER_DAY,
} from "../constants/accommodation.constants.js";

import {
  PAYMENT_FOR,
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
} from "../constants/payment.constants.js";

/**
 * ============================================================
 * Accommodation Date Helpers
 * ============================================================
 */

/**
 * Calculate the number of accommodation days.
 *
 * Examples:
 *
 * 29 Sep -> 30 Sep = 1 day
 * 29 Sep -> 1 Oct  = 2 days
 */
const calculateAccommodationDays = (
  startDate,
  endDate,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  /**
   * Use UTC to normalize dates to absolute calendar days,
   * completely avoiding timezone and DST anomalies.
   */
  const utcStart = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const utcEnd = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  const difference = utcEnd - utcStart;

  return Math.round(difference / millisecondsPerDay);
};

/**
 * ============================================================
 * Create Accommodation Booking
 * ============================================================
 *
 * Participant selects:
 *
 * - Registration
 * - Boys Hostel / Girls Hostel
 * - Check-in date
 * - Check-out date
 *
 * Actual room / bed allocation is handled offline.
 *
 * Pricing:
 *
 * ₹200 × number of accommodation days
 *
 * The amount supplied by the frontend is NEVER trusted.
 */

const bookingLocks = new Set();

const createAccommodation = async (
  userId,
  registrationId,
  bookingData,
  options = { isGuest: false },
) => {
  const lockKey = `${registrationId}-${bookingData.teamMemberId || 'null'}`;
  if (bookingLocks.has(lockKey)) {
    throw new ApiError(
      "Accommodation already booked for this registration.",
      HTTP_STATUS.CONFLICT,
    );
  }
  bookingLocks.add(lockKey);

  try {
  /**
   * ----------------------------------------------------------
   * 1. Find registration
   * ----------------------------------------------------------
   */

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

  /**
   * ----------------------------------------------------------
   * 2. Verify registration ownership
   * ----------------------------------------------------------
   */

  if (!options.isGuest) {
    const registrationUserId =
      registration.user?._id ||
      registration.user;

    if (
      !registrationUserId ||
      registrationUserId.toString() !==
        userId.toString()
    ) {
      throw new ApiError(
        "You are not authorized to book accommodation for this registration.",
        HTTP_STATUS.FORBIDDEN,
      );
    }
  }

  /**
   * ----------------------------------------------------------
   * 3. Registration must belong to an event
   * ----------------------------------------------------------
   */

  if (!registration.event) {
    throw new ApiError(
      "Registration is not associated with an event.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Registration must be valid
   * ----------------------------------------------------------
   *
   * Accommodation should only be available to a
   * successfully registered participant.
   */

  if (
    registration.status &&
    registration.status !== "REGISTERED" &&
    registration.status !== "PENDING"
  ) {
    throw new ApiError(
      "Accommodation can only be booked for an active registration.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  let {
    hostelType,
    checkInDate,
    checkOutDate,
    currency = "INR",
    remarks = "",
    screenshotUrl = null,
    screenshotPublicId = null,
    teamMemberId = null,
  } = bookingData;

  /**
   * ----------------------------------------------------------
   * 4b. Enforce Team Member Identity
   * ----------------------------------------------------------
   */
  if (registration.team) {
    if (!teamMemberId) {
      throw new ApiError(
        "teamMemberId is required for team accommodation.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const isMemberValid = registration.team.members?.some(
      (member) => member._id.toString() === teamMemberId.toString()
    );
    if (!isMemberValid) {
      throw new ApiError(
        "Invalid teamMemberId. The member does not belong to this team.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  } else {
    // Individual registration MUST have null teamMemberId
    teamMemberId = null;
  }

  /**
   * ----------------------------------------------------------
   * 5. Prevent duplicate booking
   * ----------------------------------------------------------
   */

  const existingBooking =
    await accommodationRepository.findByRegistrationAndTeamMember(
      registrationId,
      teamMemberId,
    );

  if (existingBooking) {
    throw new ApiError(
      "Accommodation already booked for this registration.",
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * ----------------------------------------------------------
   * 7. Validate hostel type
   * ----------------------------------------------------------
   */

  if (
    !Object.values(
      ACCOMMODATION_HOSTEL_TYPES,
    ).includes(hostelType)
  ) {
    throw new ApiError(
      "Invalid accommodation hostel type. Select either Boys Hostel or Girls Hostel.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * ----------------------------------------------------------
   * 8. Validate dates
   * ----------------------------------------------------------
   */

  const startDate =
    new Date(checkInDate);

  const endDate =
    new Date(checkOutDate);

  if (
    Number.isNaN(
      startDate.getTime(),
    ) ||
    Number.isNaN(
      endDate.getTime(),
    )
  ) {
    throw new ApiError(
      "Invalid check-in or check-out date.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (endDate <= startDate) {
    throw new ApiError(
      "Check-out date must be after check-in date.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * ----------------------------------------------------------
   * 9. Calculate accommodation days
   * ----------------------------------------------------------
   */

  const accommodationDays =
    calculateAccommodationDays(
      startDate,
      endDate,
    );

  if (
    !Number.isInteger(
      accommodationDays,
    ) ||
    accommodationDays < 1
  ) {
    throw new ApiError(
      "Accommodation must be booked for at least one day.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * ----------------------------------------------------------
   * 10. Calculate amount
   * ----------------------------------------------------------
   *
   * ₹200 per participant per accommodation day.
   *
   * Amount is calculated entirely by the backend.
   */

  const amount =
    accommodationDays *
    ACCOMMODATION_PRICE_PER_DAY;

  /**
   * ----------------------------------------------------------
   * 11. Normalize currency
   * ----------------------------------------------------------
   */

  const normalizedCurrency =
    currency
      .toString()
      .trim()
      .toUpperCase();

  if (
    normalizedCurrency !== "INR"
  ) {
    throw new ApiError(
      "Accommodation payments are currently supported only in INR.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * ----------------------------------------------------------
   * 12. Create pending booking
   * ----------------------------------------------------------
   */

  // Removed duplicate try block
    const accommodation = await accommodationRepository.create({
      user: userId || null,

      participantName: registration.participantName,
      participantEmail: registration.participantEmail,
      participantPhone: registration.participantPhone,
      collegeId: registration.collegeId,
      department: registration.department,
      yearOfStudy: registration.yearOfStudy,

      registration:
        registration._id,

      teamMemberId,

      event:
        registration.event?._id ||
        registration.event,

      hostelType,

      checkInDate:
        startDate,

      checkOutDate:
        endDate,

      /**
       * IMPORTANT:
       * This was missing previously and caused:
       *
       * "Accommodation days must be at least 1."
       */

      accommodationDays,

      amount,

      currency:
        normalizedCurrency,

      paymentStatus:
        ACCOMMODATION_PAYMENT_STATUS.PENDING,

      bookingStatus:
        ACCOMMODATION_BOOKING_STATUS.PENDING,

      remarks:
        typeof remarks === "string"
          ? remarks.trim()
          : "",
    });

    /**
     * ----------------------------------------------------------
     * 13. Create payment record
     * ----------------------------------------------------------
     */

    const paymentData = {
      user: userId || null,
      accommodation: accommodation._id,
      paymentFor: PAYMENT_FOR.ACCOMMODATION,
      amount,
      currency: normalizedCurrency,
      gateway: PAYMENT_GATEWAY.UPI,
      screenshotUrl,
      screenshotPublicId,
      status: PAYMENT_STATUS.PENDING,
    };

    await paymentRepository.create(paymentData);

    return accommodation;
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.registration) {
      throw new ApiError(
        'Accommodation already booked for this registration.',
        HTTP_STATUS.CONFLICT
      );
    }
    throw error;
  } finally {
    const lockKey = `${registrationId}-${bookingData.teamMemberId || 'null'}`;
    bookingLocks.delete(lockKey);
  }
};

/**
 * ============================================================
 * Get All Accommodation Bookings
 * ============================================================
 */

const getAllAccommodation = async ({
  page = 1,
  limit = 10,
  filter = {},
} = {}) => {
  const [
    bookings,
    total,
  ] = await Promise.all([
    accommodationRepository.findAll({
      filter,
      page,
      limit,
    }),

    accommodationRepository.count(
      filter,
    ),
  ]);

  return {
    bookings,

    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(
          total / limit,
        ),
    },
  };
};

/**
 * ============================================================
 * Get Accommodation By ID
 * ============================================================
 *
 * STUDENT:
 *   → Own booking only.
 *
 * FACULTY / SUPER_ADMIN:
 *   → Any booking.
 */

const getAccommodationById =
  async (
    bookingId,
    userId,
    userRole,
  ) => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    /**
     * --------------------------------------------------------
     * Administrative access
     * --------------------------------------------------------
     */

    const isAdmin =
      userRole === "SUPER_ADMIN" ||
      userRole === "FACULTY";

    if (isAdmin) {
      return booking;
    }

    /**
     * --------------------------------------------------------
     * Student ownership check
     * --------------------------------------------------------
     */

    const bookingUserId =
      booking.user?._id ||
      booking.user;

    if (
      !bookingUserId ||
      bookingUserId.toString() !==
        userId.toString()
    ) {
      throw new ApiError(
        "You are not authorized to view this accommodation booking.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    return booking;
  };

/**
 * ============================================================
 * Get Logged-in User Accommodation
 * ============================================================
 */

const getMyAccommodation =
  async (
    userId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    return accommodationRepository.findByUser(
      userId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Create Guest Accommodation (Standalone)
 * ============================================================
 */

const createGuestAccommodation = async (bookingData) => {
  let {
    participantName,
    participantEmail,
    participantPhone,
    collegeId,
    department,
    yearOfStudy,
    hostelType,
    checkInDate,
    checkOutDate,
    currency = "INR",
    remarks = "",
    guestTokenHash,
  } = bookingData;

  if (
    !Object.values(ACCOMMODATION_HOSTEL_TYPES).includes(hostelType)
  ) {
    throw new ApiError(
      "Invalid accommodation hostel type. Select either Boys Hostel or Girls Hostel.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const startDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new ApiError("Invalid check-in or check-out date.", HTTP_STATUS.BAD_REQUEST);
  }

  if (endDate <= startDate) {
    throw new ApiError("Check-out date must be after check-in date.", HTTP_STATUS.BAD_REQUEST);
  }

  const accommodationDays = calculateAccommodationDays(startDate, endDate);

  if (!Number.isInteger(accommodationDays) || accommodationDays < 1) {
    throw new ApiError("Accommodation must be booked for at least one day.", HTTP_STATUS.BAD_REQUEST);
  }

  const amount = accommodationDays * ACCOMMODATION_PRICE_PER_DAY;

  const normalizedCurrency = currency.toString().trim().toUpperCase();

  if (normalizedCurrency !== "INR") {
    throw new ApiError("Accommodation payments are currently supported only in INR.", HTTP_STATUS.BAD_REQUEST);
  }

  const accommodation = await accommodationRepository.create({
    participantName: participantName || "",
    participantEmail: participantEmail || "",
    participantPhone: participantPhone || "",
    collegeId: collegeId || "",
    department: department || "",
    yearOfStudy: yearOfStudy || "",
    hostelType,
    checkInDate: startDate,
    checkOutDate: endDate,
    accommodationDays,
    amount,
    currency: normalizedCurrency,
    paymentStatus: ACCOMMODATION_PAYMENT_STATUS.PENDING,
    bookingStatus: ACCOMMODATION_BOOKING_STATUS.PENDING,
    guestTokenHash,
    remarks: typeof remarks === "string" ? remarks.trim() : "",
  });

  return accommodation;
};

/**
 * ============================================================
 * Upload Guest Payment Screenshot
 * ============================================================
 */

const uploadGuestPaymentScreenshot = async (bookingId, screenshotUrl, screenshotPublicId) => {
  const accommodation = await accommodationRepository.findById(bookingId);

  if (!accommodation) {
    throw new ApiError("Accommodation booking not found.", HTTP_STATUS.NOT_FOUND);
  }

  if (accommodation.paymentStatus !== ACCOMMODATION_PAYMENT_STATUS.PENDING) {
    throw new ApiError("Payment screenshot can only be uploaded for pending payments.", HTTP_STATUS.BAD_REQUEST);
  }

  if (!screenshotUrl) {
    throw new ApiError("Screenshot URL is required.", HTTP_STATUS.BAD_REQUEST);
  }

  // Create or Update Payment document
  let payment;
  if (accommodation.payment) {
    payment = await paymentRepository.findById(accommodation.payment);
    if (payment) {
      payment.screenshotUrl = screenshotUrl;
      payment.screenshotPublicId = screenshotPublicId;
      await payment.save();
    }
  }

  if (!payment) {
    payment = await paymentRepository.create({
      user: accommodation.user || null,
      accommodation: accommodation._id,
      paymentFor: PAYMENT_FOR.ACCOMMODATION,
      amount: accommodation.amount,
      currency: accommodation.currency,
      gateway: PAYMENT_GATEWAY.UPI,
      screenshotUrl,
      screenshotPublicId,
      status: PAYMENT_STATUS.PENDING,
    });
    
    accommodation.payment = payment._id;
    await accommodation.save();
  }

  return accommodation;
};

/**
 * ============================================================
 * Confirm Accommodation Booking
 * ============================================================
 *
 * Confirmation requires successful payment.
 *
 * Actual hostel / room allocation remains offline.
 */

const confirmAccommodation =
  async (bookingId) => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      booking.bookingStatus ===
      ACCOMMODATION_BOOKING_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Cancelled accommodation cannot be confirmed.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      booking.paymentStatus !==
      ACCOMMODATION_PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "Accommodation payment must be completed before confirmation.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      booking.bookingStatus ===
      ACCOMMODATION_BOOKING_STATUS.CONFIRMED
    ) {
      throw new ApiError(
        "Accommodation is already confirmed.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * Generate confirmation code.
     */

    const confirmationCode =
      `CEL-${Date.now()
        .toString(36)
        .toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

    const updatedBooking = await accommodationRepository.updateWithCondition(
      {
        _id: bookingId,
        bookingStatus: { $ne: ACCOMMODATION_BOOKING_STATUS.CONFIRMED },
      },
      {
        bookingStatus: ACCOMMODATION_BOOKING_STATUS.CONFIRMED,
        confirmationCode,
        confirmedAt: new Date(),
      }
    );

    if (!updatedBooking) {
      throw new ApiError(
        'Accommodation is already confirmed or was modified concurrently.',
        HTTP_STATUS.CONFLICT
      );
    }
    return updatedBooking;
  };

/**
 * ============================================================
 * Mark Accommodation Payment As Paid
 * ============================================================
 */

const markPaymentPaid =
  async (
    bookingId,
    paymentId = null,
  ) => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      booking.bookingStatus ===
      ACCOMMODATION_BOOKING_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Cancelled accommodation cannot be paid.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      booking.paymentStatus ===
      ACCOMMODATION_PAYMENT_STATUS.PAID
    ) {
      return booking;
    }

    const updatedBooking = await accommodationRepository.updateWithCondition(
      {
        _id: bookingId,
        paymentStatus: { $ne: ACCOMMODATION_PAYMENT_STATUS.PAID },
      },
      {
        paymentStatus: ACCOMMODATION_PAYMENT_STATUS.PAID,
        payment: paymentId || booking.payment,
      }
    );

    if (!updatedBooking) {
      throw new ApiError(
        'Accommodation payment is already paid or was modified concurrently.',
        HTTP_STATUS.CONFLICT
      );
    }

    try {
      const getReferenceId = (ref) => ref?._id || ref;
      const user = await User.findById(getReferenceId(updatedBooking.user)).lean();
      
      let payment = await paymentRepository.findPendingByAccommodation(updatedBooking._id);
      
      if (payment) {
        await paymentRepository.updateById(payment._id, {
          status: PAYMENT_STATUS.PAID,
          paidAt: new Date(),
        });
      } else {
        payment = {
          amount: updatedBooking.amount,
          currency: updatedBooking.currency || "INR",
          paymentId: "OFFLINE / MANUAL",
          orderId: "OFFLINE / MANUAL",
        };
      }

      if (user && user.email) {
        const accommodationDays = calculateAccommodationDays(
          updatedBooking.checkInDate,
          updatedBooking.checkOutDate
        );

        const pdf = await receiptUtil.generateAccommodationReceiptPDF({
          accommodation: updatedBooking,
        });

        await emailUtil.sendAccommodationConfirmation({
          to: user.email,
          participantName: user.fullName,
          eventName: updatedBooking.event?.title || "Scintillace Accommodation",
          hostelType: updatedBooking.hostelType,
          checkInDate: updatedBooking.checkInDate,
          checkOutDate: updatedBooking.checkOutDate,
          accommodationDays,
          amount: payment.amount,
          currency: payment.currency,
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          bookingId: updatedBooking._id,
          confirmationCode: updatedBooking.confirmationCode || "PENDING",
          pdfBuffer: pdf,
        });

        logger.info(`Manual accommodation payment confirmation email sent successfully for booking ${updatedBooking._id}.`);
      }
    } catch (error) {
      logger.error(`Manual accommodation payment confirmation email failed for booking ${updatedBooking._id}: ${error.message}`);
    }

    return updatedBooking;
  };

/**
 * ============================================================
 * Reject Accommodation Booking (Admin)
 * ============================================================
 */

const rejectAccommodation =
  async (bookingId, reason = "") => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      booking.bookingStatus !==
      ACCOMMODATION_BOOKING_STATUS.PENDING
    ) {
      throw new ApiError(
        "Only PENDING accommodations can be rejected.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const payment = await paymentRepository.findPendingByAccommodation(bookingId);
    
    if (!payment) {
      throw new ApiError(
        "Payment record not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new ApiError(
        "Payment is not in PENDING status.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const updatedPayment = await paymentRepository.updateById(payment._id, {
      status: PAYMENT_STATUS.FAILED,
      screenshotUrl: null,
      screenshotPublicId: null
    });

    if (!updatedPayment) {
      throw new ApiError(
        "Failed to reject payment. It may have already been processed.",
        HTTP_STATUS.CONFLICT,
      );
    }

    const updatedBooking = await accommodationRepository.updateWithCondition(
      {
        _id: bookingId,
        bookingStatus: { $ne: ACCOMMODATION_BOOKING_STATUS.REJECTED },
      },
      {
        bookingStatus: ACCOMMODATION_BOOKING_STATUS.REJECTED,
        paymentStatus: ACCOMMODATION_PAYMENT_STATUS.FAILED,
        rejectionReason: reason || "",
      }
    );

    if (!updatedBooking) {
      throw new ApiError(
        "Accommodation is already rejected or was modified concurrently.",
        HTTP_STATUS.CONFLICT
      );
    }

    // Clean up the screenshot asset asynchronously
    if (payment.screenshotPublicId) {
      cloudinaryUtil.deleteAsset(payment.screenshotPublicId).catch((err) => {
        logger.error(`Non-blocking error during Cloudinary deletion for accommodation rejection: ${err.message}`);
      });
    }

    return updatedBooking;
  };

/**
 * ============================================================
 * Mark Accommodation Payment As Failed
 * ============================================================
 */

const markPaymentFailed =
  async (bookingId) => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      booking.paymentStatus ===
      ACCOMMODATION_PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "A paid accommodation booking cannot be marked as failed.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const updatedBooking = await accommodationRepository.updateWithCondition(
      {
        _id: bookingId,
        paymentStatus: { $ne: ACCOMMODATION_PAYMENT_STATUS.FAILED },
      },
      {
        paymentStatus: ACCOMMODATION_PAYMENT_STATUS.FAILED,
      }
    );

    if (!updatedBooking) {
      throw new ApiError(
        'Accommodation payment is already failed or was modified concurrently.',
        HTTP_STATUS.CONFLICT
      );
    }
    return updatedBooking;
  };

/**
 * ============================================================
 * Cancel Accommodation Booking
 * ============================================================
 *
 * Accommodation cancellation remains supported.
 *
 * Ticket cancellation and accommodation cancellation
 * are separate business rules.
 */

const cancelAccommodation =
  async (
    bookingId,
    userId,
    reason = "",
    options = { isGuest: false },
  ) => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (!options.isGuest) {
      const bookingUserId =
        booking.user?._id ||
        booking.user;

      if (
        !bookingUserId ||
        bookingUserId.toString() !==
          userId.toString()
      ) {
        throw new ApiError(
          "You are not authorized to cancel this booking.",
          HTTP_STATUS.FORBIDDEN,
        );
      }
    }

    if (
      booking.bookingStatus ===
      ACCOMMODATION_BOOKING_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Accommodation booking is already cancelled.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const updatedBooking = await accommodationRepository.updateWithCondition(
      {
        _id: bookingId,
        bookingStatus: { $ne: ACCOMMODATION_BOOKING_STATUS.CANCELLED },
      },
      {
        bookingStatus: ACCOMMODATION_BOOKING_STATUS.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: typeof reason === 'string' ? reason.trim() : '',
      }
    );

    if (!updatedBooking) {
      throw new ApiError(
        'Accommodation is already cancelled or was modified concurrently.',
        HTTP_STATUS.CONFLICT
      );
    }
    return updatedBooking;
  };

/**
 * ============================================================
 * Process Accommodation Refund
 * ============================================================
 */

const refundAccommodation =
  async (
    bookingId,
    refundId = "",
  ) => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      booking.bookingStatus !==
      ACCOMMODATION_BOOKING_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Only cancelled accommodation bookings can be refunded.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      booking.paymentStatus !==
      ACCOMMODATION_PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "Only paid accommodation bookings can be refunded.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      booking.paymentStatus ===
      ACCOMMODATION_PAYMENT_STATUS.REFUNDED
    ) {
      throw new ApiError(
        "Accommodation booking is already refunded.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const updatedBooking = await accommodationRepository.updateWithCondition(
      {
        _id: bookingId,
        paymentStatus: { $ne: ACCOMMODATION_PAYMENT_STATUS.REFUNDED },
      },
      {
        paymentStatus: ACCOMMODATION_PAYMENT_STATUS.REFUNDED,
        refundId: typeof refundId === 'string' ? refundId.trim() : '',
        refundedAt: new Date(),
      }
    );

    if (!updatedBooking) {
      throw new ApiError(
        'Accommodation is already refunded or was modified concurrently.',
        HTTP_STATUS.CONFLICT
      );
    }
    return updatedBooking;
  };

/**
 * ============================================================
 * Delete Accommodation Booking
 * ============================================================
 */

const deleteAccommodation =
  async (bookingId) => {
    const booking =
      await accommodationRepository.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        "Accommodation booking not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    /**
     * Only cancelled bookings can be permanently deleted.
     */

    if (
      booking.bookingStatus !==
      ACCOMMODATION_BOOKING_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Only cancelled accommodation bookings can be permanently deleted.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await accommodationRepository.deleteById(
      bookingId,
    );

    return {
      success: true,
      message:
        "Accommodation booking deleted successfully.",
    };
  };

/**
 * ============================================================
 * Accommodation Dashboard Statistics
 * ============================================================
 */

const getAccommodationStats =
  async () => {
    const [
      total,
      pending,
      confirmed,
      cancelled,
      paid,
      refunded,
    ] = await Promise.all([
      accommodationRepository.count(),

      accommodationRepository.count({
        bookingStatus:
          ACCOMMODATION_BOOKING_STATUS.PENDING,
      }),

      accommodationRepository.count({
        bookingStatus:
          ACCOMMODATION_BOOKING_STATUS.CONFIRMED,
      }),

      accommodationRepository.count({
        bookingStatus:
          ACCOMMODATION_BOOKING_STATUS.CANCELLED,
      }),

      accommodationRepository.count({
        paymentStatus:
          ACCOMMODATION_PAYMENT_STATUS.PAID,
      }),

      accommodationRepository.count({
        paymentStatus:
          ACCOMMODATION_PAYMENT_STATUS.REFUNDED,
      }),
    ]);

    return {
      total,
      pending,
      confirmed,
      cancelled,
      paid,
      refunded,
    };
  };

/**
 * ============================================================
 * Accommodation Booking Summary
 * ============================================================
 *
 * Since physical hostel / room allocation is handled offline,
 * this endpoint does NOT attempt to calculate room capacity.
 *
 * It only returns the number of confirmed accommodation
 * bookings for the selected event and optional hostel type.
 */

const getAccommodationAvailability =
  async ({
    eventId,
    hostelType = null,
  }) => {
    const filter = {
      event: eventId,

      bookingStatus:
        ACCOMMODATION_BOOKING_STATUS.CONFIRMED,
    };

    if (hostelType) {
      if (
        !Object.values(
          ACCOMMODATION_HOSTEL_TYPES,
        ).includes(hostelType)
      ) {
        throw new ApiError(
          "Invalid accommodation hostel type.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      filter.hostelType =
        hostelType;
    }

    const confirmedBookings =
      await accommodationRepository.count(
        filter,
      );

    return {
      eventId,

      hostelType,

      confirmedBookings,
    };
  };

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const accommodationService =
  Object.freeze({
    createAccommodation,
    createGuestAccommodation,
    uploadGuestPaymentScreenshot,

    getAllAccommodation,

    getAccommodationById,

    getMyAccommodation,

    confirmAccommodation,

    markPaymentPaid,

    rejectAccommodation,

    cancelAccommodation,

    refundAccommodation,

    deleteAccommodation,

    getAccommodationStats,

    getAccommodationAvailability,
  });

export default accommodationService;