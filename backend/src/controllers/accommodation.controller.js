import accommodationService from "../services/accommodation.service.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * ============================================================
 * Create Accommodation Booking
 * POST /api/v1/accommodation
 * ============================================================
 *
 * Participant selects:
 *
 * - Registration
 * - Hostel type
 * - Check-in date
 * - Check-out date
 *
 * Accommodation amount is calculated by the service.
 */

const createAccommodation = asyncHandler(
  async (req, res) => {
    const booking =
      await accommodationService.createAccommodation(
        req.user.id,
        req.body.registrationId,
        req.body,
      );

    res.status(
      HTTP_STATUS.CREATED,
    ).json({
      success: true,
      message:
        "Accommodation booked successfully.",
      data: booking,
    });
  },
);

/**
 * ============================================================
 * Get All Accommodation Bookings
 * GET /api/v1/accommodation
 * ============================================================
 */

const getAllAccommodation =
  asyncHandler(async (req, res) => {
    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const result =
      await accommodationService.getAllAccommodation({
        page,
        limit,
      });

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      data: result.bookings,
      pagination:
        result.pagination,
    });
  });

/**
 * ============================================================
 * Get Accommodation By ID
 * GET /api/v1/accommodation/:id
 * ============================================================
 */

const getAccommodationById =
  asyncHandler(async (req, res) => {
    const booking =
      await accommodationService.getAccommodationById(
        req.params.id,
        req.user.id,
        req.user.role,
      );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: booking,
    });
  });

/**
 * ============================================================
 * Get Logged-in User Accommodation
 * GET /api/v1/accommodation/my
 * ============================================================
 */

const getMyAccommodation =
  asyncHandler(async (req, res) => {
    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const bookings =
      await accommodationService.getMyAccommodation(
        req.user.id,
        {
          page,
          limit,
        },
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      data: bookings,
    });
  });

/**
 * ============================================================
 * Confirm Accommodation
 * PATCH /api/v1/accommodation/:id/confirm
 * ============================================================
 */

const confirmAccommodation =
  asyncHandler(async (req, res) => {
    const booking =
      await accommodationService.confirmAccommodation(
        req.params.id,
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      message:
        "Accommodation confirmed successfully.",
      data: booking,
    });
  });

/**
 * ============================================================
 * Mark Payment As Paid
 * PATCH /api/v1/accommodation/:id/payment/paid
 * ============================================================
 */

const markPaymentPaid =
  asyncHandler(async (req, res) => {
    const booking =
      await accommodationService.markPaymentPaid(
        req.params.id,
        req.body.paymentId || null,
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      message:
        "Accommodation payment marked as paid.",
      data: booking,
    });
  });

/**
 * ============================================================
 * Mark Payment As Failed
 * PATCH /api/v1/accommodation/:id/payment/failed
 * ============================================================
 */

const markPaymentFailed =
  asyncHandler(async (req, res) => {
    const booking =
      await accommodationService.markPaymentFailed(
        req.params.id,
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      message:
        "Accommodation payment marked as failed.",
      data: booking,
    });
  });

/**
 * ============================================================
 * Reject Accommodation Booking
 * PATCH /api/v1/accommodation/:id/reject
 * ============================================================
 */

const rejectAccommodation =
  asyncHandler(async (req, res) => {
    const booking =
      await accommodationService.rejectAccommodation(
        req.params.id,
        req.body.reason || "",
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      message:
        "Accommodation rejected successfully.",
      data: booking,
    });
  });

/**
 * ============================================================
 * Cancel Accommodation
 * DELETE /api/v1/accommodation/:id
 * ============================================================
 */

const cancelAccommodation =
  asyncHandler(async (req, res) => {
    const booking =
      await accommodationService.cancelAccommodation(
        req.params.id,
        req.user.id,
        req.body.reason || "",
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      message:
        "Accommodation booking cancelled successfully.",
      data: booking,
    });
  });

/**
 * ============================================================
 * Process Refund
 * PATCH /api/v1/accommodation/:id/refund
 * ============================================================
 */

const refundAccommodation =
  asyncHandler(async (req, res) => {
    const booking =
      await accommodationService.refundAccommodation(
        req.params.id,
        req.body.refundId || "",
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      message:
        "Accommodation refund processed successfully.",
      data: booking,
    });
  });

/**
 * ============================================================
 * Delete Accommodation
 * DELETE /api/v1/accommodation/:id/delete
 * ============================================================
 */

const deleteAccommodation =
  asyncHandler(async (req, res) => {
    const result =
      await accommodationService.deleteAccommodation(
        req.params.id,
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      message:
        result.message,
    });
  });

/**
 * ============================================================
 * Accommodation Dashboard Statistics
 * GET /api/v1/accommodation/stats
 * ============================================================
 */

const getAccommodationStats =
  asyncHandler(async (req, res) => {
    const stats =
      await accommodationService.getAccommodationStats();

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      data: stats,
    });
  });

/**
 * ============================================================
 * Accommodation Availability
 * GET /api/v1/accommodation/availability/:eventId
 * ============================================================
 *
 * Hostel type is optional.
 *
 * Examples:
 *
 * /availability/:eventId
 *
 * /availability/:eventId?hostelType=BOYS
 *
 * /availability/:eventId?hostelType=GIRLS
 *
 * Physical room allocation is handled offline.
 */

const getAccommodationAvailability =
  asyncHandler(async (req, res) => {
    const availability =
      await accommodationService.getAccommodationAvailability(
        {
          eventId:
            req.params.eventId,

          hostelType:
            req.query.hostelType ||
            null,
        },
      );

    res.status(
      HTTP_STATUS.OK,
    ).json({
      success: true,
      data: availability,
    });
  });

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const accommodationController =
  Object.freeze({
    createAccommodation,

    getAllAccommodation,

    getAccommodationById,

    getMyAccommodation,

    confirmAccommodation,

    markPaymentPaid,

    markPaymentFailed,

    rejectAccommodation,

    cancelAccommodation,

    refundAccommodation,

    deleteAccommodation,

    getAccommodationStats,

    getAccommodationAvailability,
  });

export default accommodationController;