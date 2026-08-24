import { body, param, query } from "express-validator";

/**
 * ============================================================
 * Gallery Constants
 * ============================================================
 */

const GALLERY_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

/**
 * ============================================================
 * Common Pagination / Query Validators
 * ============================================================
 */

const galleryQueryValidator = [
  query("page")
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      "Page must be a positive integer.",
    ),

  query("limit")
    .optional()
    .isInt({
      min: 1,
      max: 100,
    })
    .withMessage(
      "Limit must be between 1 and 100.",
    ),

  query("includeDrafts")
    .optional()
    .isBoolean()
    .withMessage(
      "includeDrafts must be true or false.",
    ),
];

/**
 * ============================================================
 * Create Gallery Item Validator
 * ============================================================
 */

const createGalleryValidator = [
  body("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage(
      "Gallery title is required.",
    )
    .isLength({
      min: 3,
      max: 200,
    })
    .withMessage(
      "Gallery title must be between 3 and 200 characters.",
    ),

  body("description")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Gallery description cannot exceed 1000 characters.",
    ),

  body("imageUrl")
    .trim()
    .notEmpty()
    .withMessage(
      "Image URL is required.",
    )
    .isURL()
    .withMessage(
      "Image URL must be a valid URL.",
    ),

  body("thumbnailUrl")
    .optional({
      values: "falsy",
    })
    .trim()
    .isURL()
    .withMessage(
      "Thumbnail URL must be a valid URL.",
    ),

  body("publicId")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Cloudinary public ID cannot exceed 500 characters.",
    ),

  body("festival")
    .optional({
      values: "falsy",
    })
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  body("event")
    .optional({
      values: "falsy",
    })
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  body("status")
    .optional()
    .isIn(GALLERY_STATUSES)
    .withMessage(
      "Invalid gallery status.",
    ),

  body("displayOrder")
    .optional()
    .isInt({
      min: 0,
    })
    .withMessage(
      "Display order must be a non-negative integer.",
    ),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage(
      "Featured must be true or false.",
    ),
];

/**
 * ============================================================
 * Update Gallery Item Validator
 * ============================================================
 */

const updateGalleryValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Gallery ID.",
    ),

  body("title")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage(
      "Gallery title cannot be empty.",
    )
    .isLength({
      min: 3,
      max: 200,
    })
    .withMessage(
      "Gallery title must be between 3 and 200 characters.",
    ),

  body("description")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Gallery description cannot exceed 1000 characters.",
    ),

  body("imageUrl")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Image URL cannot be empty.",
    )
    .isURL()
    .withMessage(
      "Image URL must be a valid URL.",
    ),

  body("thumbnailUrl")
    .optional({
      values: "falsy",
    })
    .trim()
    .isURL()
    .withMessage(
      "Thumbnail URL must be a valid URL.",
    ),

  body("publicId")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Cloudinary public ID cannot exceed 500 characters.",
    ),

  body("festival")
    .optional({
      values: "falsy",
    })
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  body("event")
    .optional({
      values: "falsy",
    })
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  body("status")
    .optional()
    .isIn(GALLERY_STATUSES)
    .withMessage(
      "Invalid gallery status.",
    ),

  body("displayOrder")
    .optional()
    .isInt({
      min: 0,
    })
    .withMessage(
      "Display order must be a non-negative integer.",
    ),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage(
      "Featured must be true or false.",
    ),
];

/**
 * ============================================================
 * Gallery ID Validator
 * ============================================================
 */

const galleryIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Gallery ID.",
    ),
];

/**
 * ============================================================
 * Festival Gallery Validator
 * ============================================================
 */

const festivalGalleryValidator = [
  param("festivalId")
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  ...galleryQueryValidator,
];

/**
 * ============================================================
 * Event Gallery Validator
 * ============================================================
 */

const eventGalleryValidator = [
  param("eventId")
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  ...galleryQueryValidator,
];

/**
 * ============================================================
 * Cloudinary Public ID Validator
 * ============================================================
 */

const galleryPublicIdValidator = [
  param("publicId")
    .trim()
    .notEmpty()
    .withMessage(
      "Cloudinary public ID is required.",
    )
    .isLength({
      max: 500,
    })
    .withMessage(
      "Cloudinary public ID cannot exceed 500 characters.",
    ),
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  GALLERY_STATUSES,

  galleryQueryValidator,

  createGalleryValidator,
  updateGalleryValidator,

  galleryIdValidator,

  festivalGalleryValidator,
  eventGalleryValidator,

  galleryPublicIdValidator,
};