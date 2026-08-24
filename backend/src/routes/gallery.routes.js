import express from "express";

import galleryController from "../controllers/gallery.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  createGalleryValidator,
  updateGalleryValidator,
  galleryIdValidator,
  festivalGalleryValidator,
  eventGalleryValidator,
  galleryQueryValidator,
  galleryPublicIdValidator,
} from "../validators/gallery.validator.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * PUBLIC GALLERY ROUTES
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Published Gallery
 * ------------------------------------------------------------
 *
 * GET /api/v1/gallery/published
 */

router.get(
  "/published",
  galleryQueryValidator,
  validateRequest,
  galleryController.getPublishedGallery,
);

/**
 * ------------------------------------------------------------
 * Featured Gallery
 * ------------------------------------------------------------
 *
 * GET /api/v1/gallery/featured
 */

router.get(
  "/featured",
  galleryQueryValidator,
  validateRequest,
  galleryController.getFeaturedGallery,
);

/**
 * ------------------------------------------------------------
 * Gallery By Festival
 * ------------------------------------------------------------
 *
 * GET /api/v1/gallery/festival/:festivalId
 *
 * Public requests return published items only.
 */

router.get(
  "/festival/:festivalId",
  festivalGalleryValidator,
  validateRequest,
  galleryController.getGalleryByFestival,
);

/**
 * ------------------------------------------------------------
 * Gallery By Event
 * ------------------------------------------------------------
 *
 * GET /api/v1/gallery/event/:eventId
 *
 * Public requests return published items only.
 */

router.get(
  "/event/:eventId",
  eventGalleryValidator,
  validateRequest,
  galleryController.getGalleryByEvent,
);

/**
 * ============================================================
 * ADMIN / FACULTY GALLERY ROUTES
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Get All Gallery Items
 * ------------------------------------------------------------
 *
 * GET /api/v1/gallery
 *
 * Includes drafts and archived items.
 */

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  galleryQueryValidator,
  validateRequest,
  galleryController.getAllGalleryItems,
);

/**
 * ------------------------------------------------------------
 * Find Gallery Item By Cloudinary Public ID
 * ------------------------------------------------------------
 *
 * GET /api/v1/gallery/cloudinary/:publicId
 *
 * Administrative/media-management operation.
 *
 * IMPORTANT:
 * This route MUST appear before /:id.
 */

router.get(
  "/cloudinary/:publicId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  galleryPublicIdValidator,
  validateRequest,
  galleryController.getGalleryItemByPublicId,
);

/**
 * ------------------------------------------------------------
 * Get Gallery Item By ID
 * ------------------------------------------------------------
 *
 * GET /api/v1/gallery/:id
 */

router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  galleryIdValidator,
  validateRequest,
  galleryController.getGalleryItemById,
);

/**
 * ------------------------------------------------------------
 * Create Gallery Item
 * ------------------------------------------------------------
 *
 * POST /api/v1/gallery
 */

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  createGalleryValidator,
  validateRequest,
  galleryController.createGalleryItem,
);

/**
 * ------------------------------------------------------------
 * Update Gallery Item
 * ------------------------------------------------------------
 *
 * PUT /api/v1/gallery/:id
 */

router.put(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  updateGalleryValidator,
  validateRequest,
  galleryController.updateGalleryItem,
);

/**
 * ------------------------------------------------------------
 * Delete Gallery Item
 * ------------------------------------------------------------
 *
 * DELETE /api/v1/gallery/:id
 *
 * Restricted to Super Admin.
 */

router.delete(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
  ),
  galleryIdValidator,
  validateRequest,
  galleryController.deleteGalleryItem,
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default router;