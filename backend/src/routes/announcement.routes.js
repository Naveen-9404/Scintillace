import express from "express";

import announcementController from "../controllers/announcement.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  createAnnouncementValidator,
  updateAnnouncementValidator,
  announcementIdValidator,
  festivalAnnouncementValidator,
  eventAnnouncementValidator,
  announcementQueryValidator,
  searchAnnouncementValidator,
} from "../validators/announcement.validator.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * PUBLIC ANNOUNCEMENT ROUTES
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Published Announcements
 * ------------------------------------------------------------
 *
 * GET /api/v1/announcements/published
 */

router.get(
  "/published",
  announcementQueryValidator,
  validateRequest,
  announcementController.getPublishedAnnouncements,
);

/**
 * ------------------------------------------------------------
 * Search Published Announcements
 * ------------------------------------------------------------
 *
 * GET /api/v1/announcements/search?q=registration
 */

router.get(
  "/search",
  searchAnnouncementValidator,
  validateRequest,
  announcementController.searchAnnouncements,
);

/**
 * ------------------------------------------------------------
 * Announcements By Festival
 * ------------------------------------------------------------
 *
 * GET /api/v1/announcements/festival/:festivalId
 *
 * Public requests return published announcements only.
 *
 * Drafts can only be requested through authenticated
 * administrative access.
 */

router.get(
  "/festival/:festivalId",
  festivalAnnouncementValidator,
  validateRequest,
  announcementController.getAnnouncementsByFestival,
);

/**
 * ------------------------------------------------------------
 * Announcements By Event
 * ------------------------------------------------------------
 *
 * GET /api/v1/announcements/event/:eventId
 */

router.get(
  "/event/:eventId",
  eventAnnouncementValidator,
  validateRequest,
  announcementController.getAnnouncementsByEvent,
);

/**
 * ============================================================
 * ADMIN / FACULTY ANNOUNCEMENT ROUTES
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Get All Announcements
 * ------------------------------------------------------------
 *
 * GET /api/v1/announcements
 *
 * Includes drafts and archived announcements.
 */

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  announcementQueryValidator,
  validateRequest,
  announcementController.getAllAnnouncements,
);

/**
 * ------------------------------------------------------------
 * Get Announcement By ID
 * ------------------------------------------------------------
 *
 * GET /api/v1/announcements/:id
 *
 * Administrative access is required because this endpoint
 * may expose drafts or archived announcements.
 */

router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  announcementIdValidator,
  validateRequest,
  announcementController.getAnnouncementById,
);

/**
 * ------------------------------------------------------------
 * Create Announcement
 * ------------------------------------------------------------
 *
 * POST /api/v1/announcements
 */

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  createAnnouncementValidator,
  validateRequest,
  announcementController.createAnnouncement,
);

/**
 * ------------------------------------------------------------
 * Update Announcement
 * ------------------------------------------------------------
 *
 * PUT /api/v1/announcements/:id
 */

router.put(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  updateAnnouncementValidator,
  validateRequest,
  announcementController.updateAnnouncement,
);

/**
 * ------------------------------------------------------------
 * Publish Announcement
 * ------------------------------------------------------------
 *
 * PATCH /api/v1/announcements/:id/publish
 */

router.patch(
  "/:id/publish",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  announcementIdValidator,
  validateRequest,
  announcementController.publishAnnouncement,
);

/**
 * ------------------------------------------------------------
 * Archive Announcement
 * ------------------------------------------------------------
 *
 * PATCH /api/v1/announcements/:id/archive
 */

router.patch(
  "/:id/archive",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  announcementIdValidator,
  validateRequest,
  announcementController.archiveAnnouncement,
);

/**
 * ------------------------------------------------------------
 * Delete Announcement
 * ------------------------------------------------------------
 *
 * DELETE /api/v1/announcements/:id
 *
 * Deletion is restricted to Super Admin.
 *
 * Archiving should normally be preferred for published
 * announcements so the administrative history is retained.
 */

router.delete(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
  ),
  announcementIdValidator,
  validateRequest,
  announcementController.deleteAnnouncement,
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default router;