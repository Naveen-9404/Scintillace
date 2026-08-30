import { Router } from "express";

import accommodationController from "../controllers/accommodation.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validate from "../middlewares/validate.js";

import ROLES from "../constants/roles.js";

import {
  createAccommodationValidator,
  accommodationIdValidator,
  accommodationQueryValidator,
  accommodationEventIdValidator,
  confirmAccommodationValidator,
  paymentAccommodationValidator,
  cancelAccommodationValidator,
  refundAccommodationValidator,
  rejectAccommodationValidator,
} from "../validators/accommodation.validator.js";

const router = Router();

/**
 * ============================================================
 * Student Routes
 * ============================================================
 */

/**
 * Create Accommodation Booking
 *
 * POST /api/v1/accommodation
 *
 * STUDENT:
 *   → Can create their own accommodation booking.
 *
 * SUPER_ADMIN:
 *   → Can create accommodation on behalf of a participant
 *      when required by administrative workflows.
 */

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  createAccommodationValidator,
  validate,
  accommodationController.createAccommodation,
);

/**
 * Get My Accommodation
 *
 * GET /api/v1/accommodation/my
 *
 * STUDENT:
 *   → Own bookings only.
 *
 * SUPER_ADMIN:
 *   → Allowed for administrative account testing.
 */

router.get(
  "/my",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  accommodationQueryValidator,
  validate,
  accommodationController.getMyAccommodation,
);

/**
 * ============================================================
 * Accommodation Summary
 * ============================================================
 *
 * GET /api/v1/accommodation/availability/:eventId
 *
 * Returns confirmed booking counts.
 *
 * IMPORTANT:
 * This does NOT represent physical room/bed availability.
 * Actual hostel allotment is handled offline.
 */

router.get(
  "/availability/:eventId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  accommodationEventIdValidator,
  validate,
  accommodationController.getAccommodationAvailability,
);

/**
 * ============================================================
 * Admin / Faculty Routes
 * ============================================================
 */

/**
 * Get All Accommodation Bookings
 *
 * GET /api/v1/accommodation
 */

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  accommodationQueryValidator,
  validate,
  accommodationController.getAllAccommodation,
);

/**
 * Accommodation Statistics
 *
 * GET /api/v1/accommodation/stats
 */

router.get(
  "/stats",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  accommodationController.getAccommodationStats,
);

/**
 * Confirm Accommodation
 *
 * PATCH /api/v1/accommodation/:id/confirm
 *
 * Only paid accommodation can be confirmed.
 */

router.patch(
  "/:id/confirm",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  confirmAccommodationValidator,
  validate,
  accommodationController.confirmAccommodation,
);

/**
 * Mark Accommodation Payment Paid
 *
 * PATCH /api/v1/accommodation/:id/payment/paid
 *
 * Administrative reconciliation endpoint.
 *
 * Actual participant payments should ultimately flow
 * through the centralized payment system.
 */

router.patch(
  "/:id/payment/paid",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  paymentAccommodationValidator,
  validate,
  accommodationController.markPaymentPaid,
);

/**
 * Mark Accommodation Payment Failed
 *
 * PATCH /api/v1/accommodation/:id/payment/failed
 */

router.patch(
  "/:id/payment/failed",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  accommodationIdValidator,
  validate,
  accommodationController.markPaymentFailed,
);

/**
 * Process Accommodation Refund
 *
 * PATCH /api/v1/accommodation/:id/refund
 */

router.patch(
  "/:id/refund",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  refundAccommodationValidator,
  validate,
  accommodationController.refundAccommodation,
);

/**
 * Reject Accommodation Booking
 *
 * PATCH /api/v1/accommodation/:id/reject
 */

router.patch(
  "/:id/reject",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  rejectAccommodationValidator,
  validate,
  accommodationController.rejectAccommodation,
);

/**
 * Delete Accommodation Booking
 *
 * DELETE /api/v1/accommodation/:id/delete
 *
 * Permanent deletion is SUPER_ADMIN only.
 */

router.delete(
  "/:id/delete",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
  ),
  accommodationIdValidator,
  validate,
  accommodationController.deleteAccommodation,
);

/**
 * ============================================================
 * Participant Cancellation
 * ============================================================
 *
 * DELETE /api/v1/accommodation/:id
 *
 * A participant can cancel their own booking.
 *
 * SUPER_ADMIN is also allowed for administrative intervention.
 */

router.delete(
  "/:id",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  cancelAccommodationValidator,
  validate,
  accommodationController.cancelAccommodation,
);

/**
 * ============================================================
 * Get Accommodation By ID
 * ============================================================
 *
 * GET /api/v1/accommodation/:id
 *
 * Authorization must be enforced inside the service:
 *
 * STUDENT:
 *   → Own booking only.
 *
 * SUPER_ADMIN / FACULTY:
 *   → Any booking.
 */

router.get(
  "/:id",
  authenticate,
  accommodationIdValidator,
  validate,
  accommodationController.getAccommodationById,
);

export default router;