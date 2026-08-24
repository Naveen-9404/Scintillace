import express from "express";

import volunteerController from "../controllers/volunteer.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  createVolunteerValidator,
  updateVolunteerValidator,
  volunteerIdValidator,
  volunteerFestivalValidator,
  volunteerEventValidator,
  volunteerQueryValidator,
  activeVolunteerQueryValidator,
  volunteerStatusValidator,
} from "../validators/volunteer.validator.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * VOLUNTEER SELF-SERVICE ROUTES
 * ============================================================
 */

/**
 * GET /api/v1/volunteers/me
 *
 * Volunteer can view their own assignments.
 */

router.get(
  "/me",
  authenticate,
  authorize(
    ROLES.VOLUNTEER,
  ),
  volunteerController.getMyVolunteerAssignments,
);

/**
 * ============================================================
 * ADMIN / FACULTY READ ROUTES
 * ============================================================
 */

/**
 * GET /api/v1/volunteers
 *
 * Get all volunteer assignments.
 */

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerQueryValidator,
  validateRequest,
  volunteerController.getAllVolunteers,
);

/**
 * GET /api/v1/volunteers/active
 *
 * Get active volunteers.
 *
 * Optional:
 *
 * ?festivalId=<id>
 * ?eventId=<id>
 * ?page=1
 * ?limit=10
 */

router.get(
  "/active",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  activeVolunteerQueryValidator,
  validateRequest,
  volunteerController.getActiveVolunteers,
);

/**
 * GET /api/v1/volunteers/status/:status
 *
 * Get volunteers by status.
 */

router.get(
  "/status/:status",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerStatusValidator,
  validateRequest,
  volunteerController.getVolunteersByStatus,
);

/**
 * GET /api/v1/volunteers/festival/:festivalId
 *
 * Get volunteers assigned to a festival.
 */

router.get(
  "/festival/:festivalId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerFestivalValidator,
  validateRequest,
  volunteerController.getVolunteersByFestival,
);

/**
 * GET /api/v1/volunteers/event/:eventId
 *
 * Get volunteers assigned to an event.
 */

router.get(
  "/event/:eventId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerEventValidator,
  validateRequest,
  volunteerController.getVolunteersByEvent,
);

/**
 * GET /api/v1/volunteers/:id
 *
 * Get a specific volunteer assignment.
 *
 * IMPORTANT:
 * This route stays after all named routes.
 */

router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.getVolunteerById,
);

/**
 * ============================================================
 * VOLUNTEER CREATION / MANAGEMENT
 * ============================================================
 */

/**
 * POST /api/v1/volunteers
 *
 * Create a volunteer assignment.
 */

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  createVolunteerValidator,
  validateRequest,
  volunteerController.createVolunteer,
);

/**
 * PUT /api/v1/volunteers/:id
 *
 * Update volunteer assignment details.
 *
 * Status changes are handled only through workflow routes.
 */

router.put(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  updateVolunteerValidator,
  validateRequest,
  volunteerController.updateVolunteer,
);

/**
 * DELETE /api/v1/volunteers/:id
 *
 * Restricted to Super Admin.
 */

router.delete(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.deleteVolunteer,
);

/**
 * ============================================================
 * VOLUNTEER WORKFLOW
 * ============================================================
 */

/**
 * PATCH /api/v1/volunteers/:id/approve
 */

router.patch(
  "/:id/approve",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.approveVolunteer,
);

/**
 * PATCH /api/v1/volunteers/:id/reject
 */

router.patch(
  "/:id/reject",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.rejectVolunteer,
);

/**
 * PATCH /api/v1/volunteers/:id/activate
 */

router.patch(
  "/:id/activate",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.activateVolunteer,
);

/**
 * PATCH /api/v1/volunteers/:id/cancel
 */

router.patch(
  "/:id/cancel",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.cancelVolunteer,
);

/**
 * PATCH /api/v1/volunteers/:id/check-in
 *
 * Admin/faculty can check volunteers in.
 * Volunteers may also check themselves in.
 *
 * The service layer should verify ownership where required.
 */

router.patch(
  "/:id/check-in",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
    ROLES.VOLUNTEER,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.checkInVolunteer,
);

/**
 * PATCH /api/v1/volunteers/:id/check-out
 *
 * Admin/faculty can check volunteers out.
 * Volunteers may also check themselves out.
 *
 * The service layer should verify ownership where required.
 */

router.patch(
  "/:id/check-out",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
    ROLES.VOLUNTEER,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.checkOutVolunteer,
);

/**
 * PATCH /api/v1/volunteers/:id/complete
 */

router.patch(
  "/:id/complete",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  volunteerIdValidator,
  validateRequest,
  volunteerController.completeVolunteer,
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default router;