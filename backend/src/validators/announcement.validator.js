import {
  body,
  param,
  query,
} from "express-validator";

/**
 * ============================================================
 * Announcement Constants
 * ============================================================
 */

const ANNOUNCEMENT_SCOPES = [
  "GLOBAL",
  "FESTIVAL",
  "EVENT",
];

const ANNOUNCEMENT_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

const ANNOUNCEMENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

/**
 * ============================================================
 * Common Pagination / Query Validators
 * ============================================================
 */

const announcementQueryValidator = [
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

  /**
   * ----------------------------------------------------------
   * Status
   * ----------------------------------------------------------
   */

  query("status")
    .optional()
    .isIn(
      ANNOUNCEMENT_STATUSES,
    )
    .withMessage(
      "Invalid announcement status.",
    ),

  /**
   * ----------------------------------------------------------
   * Scope
   * ----------------------------------------------------------
   */

  query("scope")
    .optional()
    .isIn(
      ANNOUNCEMENT_SCOPES,
    )
    .withMessage(
      "Invalid announcement scope.",
    ),

  /**
   * ----------------------------------------------------------
   * Priority
   * ----------------------------------------------------------
   */

  query("priority")
    .optional()
    .isIn(
      ANNOUNCEMENT_PRIORITIES,
    )
    .withMessage(
      "Invalid announcement priority.",
    ),
];

/**
 * ============================================================
 * Create Announcement Validator
 * ============================================================
 */

const createAnnouncementValidator = [
  body("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage(
      "Announcement title is required.",
    )
    .isLength({
      min: 3,
      max: 200,
    })
    .withMessage(
      "Announcement title must be between 3 and 200 characters.",
    ),

  body("message")
    .trim()
    .escape()
    .notEmpty()
    .withMessage(
      "Announcement message is required.",
    )
    .isLength({
      min: 5,
      max: 5000,
    })
    .withMessage(
      "Announcement message must be between 5 and 5000 characters.",
    ),

  body("scope")
    .optional()
    .isIn(
      ANNOUNCEMENT_SCOPES,
    )
    .withMessage(
      "Invalid announcement scope.",
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

  body("priority")
    .optional()
    .isIn(
      ANNOUNCEMENT_PRIORITIES,
    )
    .withMessage(
      "Invalid announcement priority.",
    ),

  body("status")
    .optional()
    .isIn(
      ANNOUNCEMENT_STATUSES,
    )
    .withMessage(
      "Invalid announcement status.",
    ),

  body("publishedAt")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid publication date.",
    ),

  body("visibleFrom")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid visibility start date.",
    ),

  body("visibleUntil")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid visibility end date.",
    ),
];

/**
 * ============================================================
 * Update Announcement Validator
 * ============================================================
 */

const updateAnnouncementValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Announcement ID.",
    ),

  body("title")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage(
      "Announcement title cannot be empty.",
    )
    .isLength({
      min: 3,
      max: 200,
    })
    .withMessage(
      "Announcement title must be between 3 and 200 characters.",
    ),

  body("message")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage(
      "Announcement message cannot be empty.",
    )
    .isLength({
      min: 5,
      max: 5000,
    })
    .withMessage(
      "Announcement message must be between 5 and 5000 characters.",
    ),

  body("scope")
    .optional()
    .isIn(
      ANNOUNCEMENT_SCOPES,
    )
    .withMessage(
      "Invalid announcement scope.",
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

  body("priority")
    .optional()
    .isIn(
      ANNOUNCEMENT_PRIORITIES,
    )
    .withMessage(
      "Invalid announcement priority.",
    ),

  body("status")
    .optional()
    .isIn(
      ANNOUNCEMENT_STATUSES,
    )
    .withMessage(
      "Invalid announcement status.",
    ),

  body("publishedAt")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid publication date.",
    ),

  body("visibleFrom")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid visibility start date.",
    ),

  body("visibleUntil")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid visibility end date.",
    ),
];

/**
 * ============================================================
 * Announcement ID Validator
 * ============================================================
 */

const announcementIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Announcement ID.",
    ),
];

/**
 * ============================================================
 * Festival ID Validator
 * ============================================================
 */

const festivalAnnouncementValidator = [
  param("festivalId")
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  ...announcementQueryValidator,
];

/**
 * ============================================================
 * Event ID Validator
 * ============================================================
 */

const eventAnnouncementValidator = [
  param("eventId")
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  ...announcementQueryValidator,
];

/**
 * ============================================================
 * Search Validator
 * ============================================================
 */

const searchAnnouncementValidator = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage(
      "Search term is required.",
    )
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Search term must be between 2 and 100 characters.",
    ),

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
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  ANNOUNCEMENT_SCOPES,
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_STATUSES,

  announcementQueryValidator,

  createAnnouncementValidator,
  updateAnnouncementValidator,

  announcementIdValidator,

  festivalAnnouncementValidator,
  eventAnnouncementValidator,

  searchAnnouncementValidator,
};