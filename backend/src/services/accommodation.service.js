import accommodationRepository from "../repositories/accommodation.repository.js";
import registrationRepository from "../repositories/registration.repository.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

import {
  ACCOMMODATION_HOSTEL_TYPES,
  ACCOMMODATION_BOOKING_STATUS,
  ACCOMMODATION_PAYMENT_STATUS,
  ACCOMMODATION_PRICE_PER_DAY,
} from "../constants/accommodation.constants.js";

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
   * Normalize both dates to midnight so that
   * timezone/time components cannot produce
   * an incorrect accommodation-day count.
   */

  start.setHours(
    0,
    0,
    0,
    0,
  );

  end.setHours(
    0,
    0,
    0,
    0,
  );

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  const difference =
    end.getTime() -
    start.getTime();

  return difference /
    millisecondsPerDay;
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
 * ₹100 × number of accommodation days
 *
 * The amount supplied by the frontend is NEVER trusted.
 */

const createAccommodation = async (
  userId,
  registrationId,
  bookingData,
) => {
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
    registration.status !== "REGISTERED"
  ) {
    throw new ApiError(
      "Accommodation can only be booked for an active registration.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * ----------------------------------------------------------
   * 5. Prevent duplicate booking
   * ----------------------------------------------------------
   */

  const existingBooking =
    await accommodationRepository.findByRegistration(
      registrationId,
    );

  if (existingBooking) {
    throw new ApiError(
      "Accommodation already booked for this registration.",
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * ----------------------------------------------------------
   * 6. Extract request data
   * ----------------------------------------------------------
   */

  const {
    hostelType,
    checkInDate,
    checkOutDate,
    currency = "INR",
    remarks = "",
  } = bookingData;

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
   * ₹100 per participant per accommodation day.
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

  const accommodation =
    await accommodationRepository.create({
      user: userId,

      registration:
        registration._id,

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
   * 13. Return booking
   * ----------------------------------------------------------
   */

  return accommodation;
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

    return accommodationRepository.updateById(
      bookingId,
      {
        bookingStatus:
          ACCOMMODATION_BOOKING_STATUS.CONFIRMED,

        confirmationCode,

        confirmedAt:
          new Date(),
      },
    );
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

    return accommodationRepository.updateById(
      bookingId,
      {
        paymentStatus:
          ACCOMMODATION_PAYMENT_STATUS.PAID,

        payment:
          paymentId ||
          booking.payment,
      },
    );
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

    return accommodationRepository.updateById(
      bookingId,
      {
        paymentStatus:
          ACCOMMODATION_PAYMENT_STATUS.FAILED,
      },
    );
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

    if (
      booking.bookingStatus ===
      ACCOMMODATION_BOOKING_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Accommodation booking is already cancelled.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return accommodationRepository.updateById(
      bookingId,
      {
        bookingStatus:
          ACCOMMODATION_BOOKING_STATUS.CANCELLED,

        cancelledAt:
          new Date(),

        cancellationReason:
          typeof reason === "string"
            ? reason.trim()
            : "",
      },
    );
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

    return accommodationRepository.updateById(
      bookingId,
      {
        paymentStatus:
          ACCOMMODATION_PAYMENT_STATUS.REFUNDED,

        refundId:
          typeof refundId === "string"
            ? refundId.trim()
            : "",

        refundedAt:
          new Date(),
      },
    );
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

    getAllAccommodation,

    getAccommodationById,

    getMyAccommodation,

    confirmAccommodation,

    markPaymentPaid,

    markPaymentFailed,

    cancelAccommodation,

    refundAccommodation,

    deleteAccommodation,

    getAccommodationStats,

    getAccommodationAvailability,
  });

export default accommodationService;