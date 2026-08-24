import express from "express";

import eventController from "../controllers/event.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  createEventValidator,
  updateEventValidator,
  eventIdValidator,
  festivalIdValidator,
  categoryValidator,
  eventQueryValidator,
  searchEventValidator,
} from "../validators/event.validator.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * PUBLIC EVENT ROUTES
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Published Events
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/published
 */

router.get(
  "/published",
  eventQueryValidator,
  validateRequest,
  eventController.getPublishedEvents,
);

/**
 * ------------------------------------------------------------
 * Events With Registration Open
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/open-registration
 */

router.get(
  "/open-registration",
  eventQueryValidator,
  validateRequest,
  eventController.getOpenRegistrationEvents,
);

/**
 * ------------------------------------------------------------
 * Upcoming Events
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/upcoming
 */

router.get(
  "/upcoming",
  eventQueryValidator,
  validateRequest,
  eventController.getUpcomingEvents,
);

/**
 * ------------------------------------------------------------
 * Search Events
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/search?q=workshop
 */

router.get(
  "/search",
  searchEventValidator,
  validateRequest,
  eventController.searchEvents,
);

/**
 * ------------------------------------------------------------
 * Events By Festival
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/festival/:festivalId
 */

router.get(
  "/festival/:festivalId",
  festivalIdValidator,
  eventQueryValidator,
  validateRequest,
  eventController.getEventsByFestival,
);

/**
 * ------------------------------------------------------------
 * Events By Category
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/category/:category
 */

router.get(
  "/category/:category",
  categoryValidator,
  validateRequest,
  eventController.getEventsByCategory,
);

/**
 * ------------------------------------------------------------
 * Event Availability
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/:id/availability
 *
 * IMPORTANT:
 * This must remain before /:id.
 */

router.get(
  "/:id/availability",
  eventIdValidator,
  validateRequest,
  eventController.getEventAvailability,
);

/**
 * ------------------------------------------------------------
 * Event By ID
 * ------------------------------------------------------------
 *
 * GET /api/v1/events/:id
 */

router.get(
  "/:id",
  eventIdValidator,
  validateRequest,
  eventController.getEventById,
);

/**
 * ============================================================
 * ADMIN / FACULTY EVENT ROUTES
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Get All Events
 * ------------------------------------------------------------
 *
 * GET /api/v1/events
 */

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  eventQueryValidator,
  validateRequest,
  eventController.getAllEvents,
);

/**
 * ------------------------------------------------------------
 * Create Event
 * ------------------------------------------------------------
 *
 * POST /api/v1/events
 */

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  createEventValidator,
  validateRequest,
  eventController.createEvent,
);

/**
 * ------------------------------------------------------------
 * Update Event
 * ------------------------------------------------------------
 *
 * PUT /api/v1/events/:id
 */

router.put(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  eventIdValidator,
  updateEventValidator,
  validateRequest,
  eventController.updateEvent,
);

/**
 * ------------------------------------------------------------
 * Delete Event
 * ------------------------------------------------------------
 *
 * DELETE /api/v1/events/:id
 */

router.delete(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  eventIdValidator,
  validateRequest,
  eventController.deleteEvent,
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default router;