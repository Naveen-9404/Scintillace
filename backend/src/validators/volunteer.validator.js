import { body, param, query } from "express-validator";

/**
 * ============================================================
 * Volunteer Constants
 * ============================================================
 */

const VOLUNTEER_AVAILABILITY = [
  "FULL_TIME",
  "PART_TIME",
  "EVENT_ONLY",
];

const VOLUNTEER_STATUS = [
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

/**
 * ============================================================
 * Common Pagination Validator
 * ============================================================
 */

const volunteerQueryValidator = [
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
 * Active Volunteer Query Validator
 * ============================================================
 *
 * Supports optional filtering by:
 *
 * ?festivalId=<MongoId>
 * ?eventId=<MongoId>
 * ?page=1
 * ?limit=10
 */

const activeVolunteerQueryValidator = [
  query("festivalId")
    .optional({
      values: "falsy",
    })
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  query("eventId")
    .optional({
      values: "falsy",
    })
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  ...volunteerQueryValidator,
];

/**
 * ============================================================
 * Volunteer Status Param Validator
 * ============================================================
 */

const volunteerStatusValidator = [
  param("status")
    .trim()
    .notEmpty()
    .withMessage(
      "Volunteer status is required.",
    )
    .isIn(VOLUNTEER_STATUS)
    .withMessage(
      "Invalid volunteer status.",
    ),

  ...volunteerQueryValidator,
];

/**
 * ============================================================
 * Create Volunteer Validator
 * ============================================================
 */

const createVolunteerValidator = [
  body("user")
    .notEmpty()
    .withMessage(
      "User ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid User ID.",
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

  body("assignmentRole")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Assignment role cannot exceed 100 characters.",
    ),

  body("department")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Department cannot exceed 100 characters.",
    ),

  body("responsibilities")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 2000,
    })
    .withMessage(
      "Responsibilities cannot exceed 2000 characters.",
    ),

  body("availability")
    .optional()
    .isIn(VOLUNTEER_AVAILABILITY)
    .withMessage(
      "Invalid volunteer availability.",
    ),

  body("notes")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 2000,
    })
    .withMessage(
      "Notes cannot exceed 2000 characters.",
    ),
];

/**
 * ============================================================
 * Update Volunteer Validator
 * ============================================================
 *
 * Status is intentionally NOT accepted here.
 *
 * Status changes must happen through dedicated endpoints:
 *
 * approve
 * reject
 * activate
 * cancel
 * complete
 *
 * This keeps the volunteer lifecycle controlled.
 */

const updateVolunteerValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Volunteer ID.",
    ),

  body("user")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid User ID.",
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

  body("assignmentRole")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Assignment role cannot exceed 100 characters.",
    ),

  body("department")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Department cannot exceed 100 characters.",
    ),

  body("responsibilities")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 2000,
    })
    .withMessage(
      "Responsibilities cannot exceed 2000 characters.",
    ),

  body("availability")
    .optional()
    .isIn(VOLUNTEER_AVAILABILITY)
    .withMessage(
      "Invalid volunteer availability.",
    ),

  body("notes")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 2000,
    })
    .withMessage(
      "Notes cannot exceed 2000 characters.",
    ),
];

/**
 * ============================================================
 * Volunteer ID Validator
 * ============================================================
 */

const volunteerIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Volunteer ID.",
    ),
];

/**
 * ============================================================
 * Festival Volunteer Validator
 * ============================================================
 */

const volunteerFestivalValidator = [
  param("festivalId")
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  ...volunteerQueryValidator,
];

/**
 * ============================================================
 * Event Volunteer Validator
 * ============================================================
 */

const volunteerEventValidator = [
  param("eventId")
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  ...volunteerQueryValidator,
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  VOLUNTEER_AVAILABILITY,
  VOLUNTEER_STATUS,

  volunteerQueryValidator,
  activeVolunteerQueryValidator,
  volunteerStatusValidator,

  createVolunteerValidator,
  updateVolunteerValidator,

  volunteerIdValidator,

  volunteerFestivalValidator,
  volunteerEventValidator,
};