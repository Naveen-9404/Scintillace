import express from "express";
import rateLimit from "express-rate-limit";

import registrationController from "../controllers/registration.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";
import verifyGuestToken from "../middlewares/verifyGuestToken.js";

import {
  createRegistrationValidator,
  publicRegistrationValidator,
  registrationIdValidator,
  eventIdValidator,
  festivalIdValidator,
  teamIdValidator,
  updateRegistrationStatusValidator,
  updatePaymentStatusValidator,
  registrationQueryValidator,
  rejectRegistrationValidator,
} from "../validators/registration.validator.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * Student Routes
 * ============================================================
 */

/**
 * Register for an Event
 *
 * POST /api/v1/registrations
 *
 * Individual event:
 *
 * {
 *   "event": "EVENT_ID"
 * }
 *
 * Team event:
 *
 * {
 *   "event": "EVENT_ID",
 *   "teamId": "TEAM_ID"
 * }
 */
router.post(
  "/",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  ...createRegistrationValidator,
  validateRequest,
  registrationController.createRegistration,
);

/**
 * ============================================================
 * Public Routes
 * ============================================================
 */

const publicRegistrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registrations from this IP, please try again after 15 minutes.",
  },
  skip: () => process.env.NODE_ENV === "test"
});

/**
 * Public Register for an Event
 *
 * POST /api/v1/registrations/public
 */
router.post(
  "/public",
  publicRegistrationLimiter,
  ...publicRegistrationValidator,
  validateRequest,
  registrationController.createPublicRegistration,
);

const publicStatusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many status checks from this IP, please try again later.",
  },
  skip: () => process.env.NODE_ENV === "test"
});

/**
 * Get Public Registration Status
 *
 * GET /api/v1/registrations/public/:id/status
 */
router.get(
  "/public/:id/status",
  publicStatusLimiter,
  verifyGuestToken,
  registrationController.getPublicRegistrationStatus,
);

/**
 * ============================================================
 * My Registrations
 * ============================================================
 */

/**
 * Get Logged-in User Registrations
 *
 * GET /api/v1/registrations/my
 */
router.get(
  "/my",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  ...registrationQueryValidator,
  validateRequest,
  registrationController.getMyRegistrations,
);

/**
 * ============================================================
 * Common Registration Queries
 * ============================================================
 */

/**
 * Get Registration By ID
 *
 * GET /api/v1/registrations/:id
 *
 * Must appear after all specific /:id/... routes.
 */
router.get(
  "/:id",
  authenticate,
  ...registrationIdValidator,
  validateRequest,
  registrationController.getRegistrationById,
);

/**
 * ============================================================
 * Cancel Registration
 * ============================================================
 *
 * POST /api/v1/registrations/:id/cancel
 *
 * Logical cancellation.
 *
 * The registration remains in the database for audit purposes.
 */
router.post(
  "/:id/cancel",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  ...registrationIdValidator,
  validateRequest,
  registrationController.cancelRegistration,
);

/**
 * ============================================================
 * Admin / Faculty Routes
 * ============================================================
 */

/**
 * Get All Registrations
 *
 * GET /api/v1/registrations
 */
router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...registrationQueryValidator,
  validateRequest,
  registrationController.getAllRegistrations,
);

/**
 * Get Registrations By Event
 *
 * GET /api/v1/registrations/event/:eventId
 */
router.get(
  "/event/:eventId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...eventIdValidator,
  ...registrationQueryValidator,
  validateRequest,
  registrationController.getRegistrationsByEvent,
);

/**
 * Get Registrations By Festival
 *
 * GET /api/v1/registrations/festival/:festivalId
 */
router.get(
  "/festival/:festivalId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...festivalIdValidator,
  ...registrationQueryValidator,
  validateRequest,
  registrationController.getRegistrationsByFestival,
);

/**
 * Get Registrations By Team
 *
 * GET /api/v1/registrations/team/:teamId
 */
router.get(
  "/team/:teamId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...teamIdValidator,
  ...registrationQueryValidator,
  validateRequest,
  registrationController.getRegistrationsByTeam,
);

/**
 * ============================================================
 * Registration Status
 * ============================================================
 */

/**
 * Update Registration Status
 *
 * PATCH /api/v1/registrations/:id/status
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...registrationIdValidator,
  ...updateRegistrationStatusValidator,
  validateRequest,
  registrationController.updateRegistrationStatus,
);

/**
 * ============================================================
 * Payment Status
 * ============================================================
 *
 * This endpoint is primarily for the payment module.
 *
 * In the final production setup, Admin verification
 * should be the source that changes payment status rather than
 * allowing arbitrary client-side updates.
 */

/**
 * PATCH /api/v1/registrations/:id/payment-status
 */

/**
 * ============================================================
 * Ticket Recovery
 * ============================================================
 */

/**
 * POST /api/v1/registrations/:id/retry-tickets
 * 
 * Safely retry ticket and email generation for a registration
 * that is already in PAID status but failed to generate tickets.
 */
router.post(
  "/:id/retry-tickets",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...registrationIdValidator,
  validateRequest,
  registrationController.retryTicketGeneration,
);
router.patch(
  "/:id/payment-status",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...registrationIdValidator,
  ...updatePaymentStatusValidator,
  validateRequest,
  registrationController.updatePaymentStatus,
);

/**
 * ============================================================
 * Admin Payment Verification Flow
 * ============================================================
 */

/**
 * Get Payment By Registration
 *
 * GET /api/v1/registrations/:id/payment
 */
router.get(
  "/:id/payment",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...registrationIdValidator,
  validateRequest,
  registrationController.getPaymentByRegistration,
);

/**
 * Approve Registration
 *
 * POST /api/v1/registrations/:id/approve
 */
router.post(
  "/:id/approve",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...registrationIdValidator,
  validateRequest,
  registrationController.approveRegistration,
);

/**
 * Reject Registration
 *
 * POST /api/v1/registrations/:id/reject
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...registrationIdValidator,
  ...rejectRegistrationValidator,
  validateRequest,
  registrationController.rejectRegistration,
);

/**
 * ============================================================
 * Check-In
 * ============================================================
 */

/**
 * PATCH /api/v1/registrations/:id/check-in
 */
router.patch(
  "/:id/check-in",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
    ROLES.VOLUNTEER,
  ),
  ...registrationIdValidator,
  validateRequest,
  registrationController.checkInRegistration,
);

/**
 * ============================================================
 * Permanent Delete
 * ============================================================
 *
 * DELETE /api/v1/registrations/:id/permanent
 *
 * Administrative cleanup only.
 */
router.delete(
  "/:id/permanent",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
  ),
  ...registrationIdValidator,
  validateRequest,
  registrationController.deleteRegistration,
);

export default router;