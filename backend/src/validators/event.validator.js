import {
  body,
  param,
  query,
} from "express-validator";

import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_STATUS,
  EVENT_REGISTRATION_MODES,
} from "../constants/event.constants.js";

/**
 * ============================================================
 * Shared Values
 * ============================================================
 */

const eventCategories = Object.values(
  EVENT_CATEGORIES,
);

const eventTypes = Object.values(
  EVENT_TYPES,
);

const eventStatuses = Object.values(
  EVENT_STATUS,
);

const registrationModes =
  Object.values(
    EVENT_REGISTRATION_MODES,
  );

/**
 * ============================================================
 * Pagination / Query Validator
 * ============================================================
 */

const eventQueryValidator = [
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
 * Event ID Validator
 * ============================================================
 */

const eventIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),
];

/**
 * ============================================================
 * Festival ID Validator
 * ============================================================
 */

const festivalIdValidator = [
  param("festivalId")
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),
];

/**
 * ============================================================
 * Category Validator
 * ============================================================
 */

const categoryValidator = [
  param("category")
    .trim()
    .toUpperCase()
    .isIn(eventCategories)
    .withMessage(
      "Invalid event category.",
    ),

  ...eventQueryValidator,
];

/**
 * ============================================================
 * Type Validator
 * ============================================================
 */

const eventTypeValidator = [
  param("type")
    .trim()
    .toUpperCase()
    .isIn(eventTypes)
    .withMessage(
      "Invalid event type.",
    ),

  ...eventQueryValidator,
];

/**
 * ============================================================
 * Create Event Validator
 * ============================================================
 */

const createEventValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(
      "Event title is required.",
    )
    .isLength({
      max: 200,
    })
    .withMessage(
      "Event title cannot exceed 200 characters.",
    ),

  body("description")
    .trim()
    .notEmpty()
    .withMessage(
      "Event description is required.",
    )
    .isLength({
      max: 5000,
    })
    .withMessage(
      "Event description cannot exceed 5000 characters.",
    ),

  body("festival")
    .notEmpty()
    .withMessage(
      "Festival ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  body("category")
    .trim()
    .toUpperCase()
    .isIn(eventCategories)
    .withMessage(
      "Invalid event category.",
    ),

  body("type")
    .trim()
    .toUpperCase()
    .isIn(eventTypes)
    .withMessage(
      "Invalid event type.",
    ),

  body("registrationMode")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(registrationModes)
    .withMessage(
      "Invalid registration mode.",
    ),

  body("registrationRequired")
    .optional()
    .isBoolean()
    .withMessage(
      "Registration required must be a boolean.",
    )
    .toBoolean(),

  body("maxParticipants")
    .optional({
      nullable: true,
    })
    .isInt({
      min: 1,
    })
    .withMessage(
      "Maximum participants must be a positive integer.",
    ),

  body("teamSize")
    .optional({
      nullable: true,
    })
    .isInt({
      min: 1,
    })
    .withMessage(
      "Team size must be a positive integer.",
    ),

  body("isPaid")
    .optional()
    .isBoolean()
    .withMessage(
      "isPaid must be a boolean.",
    )
    .toBoolean(),

  body("registrationFee")
    .optional()
    .isFloat({
      min: 0,
    })
    .withMessage(
      "Registration fee must be zero or greater.",
    ),

  body("currency")
    .optional()
    .trim()
    .toUpperCase()
    .isLength({
      max: 10,
    })
    .withMessage(
      "Currency cannot exceed 10 characters.",
    ),

  body("startDateTime")
    .optional({
      nullable: true,
    })
    .isISO8601()
    .withMessage(
      "Start date/time must be a valid ISO 8601 date.",
    ),

  body("endDateTime")
    .optional({
      nullable: true,
    })
    .isISO8601()
    .withMessage(
      "End date/time must be a valid ISO 8601 date.",
    ),

  body("registrationDeadline")
    .optional({
      nullable: true,
    })
    .isISO8601()
    .withMessage(
      "Registration deadline must be a valid ISO 8601 date.",
    ),

  body("venue")
    .optional()
    .trim()
    .isLength({
      max: 300,
    })
    .withMessage(
      "Venue cannot exceed 300 characters.",
    ),

  body("prizePool")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Prize information cannot exceed 500 characters.",
    ),

  body("poster")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Poster URL cannot exceed 1000 characters.",
    ),

  body("banner")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Banner URL cannot exceed 1000 characters.",
    ),

  body("gallery")
    .optional()
    .isArray()
    .withMessage(
      "Gallery must be an array.",
    ),

  body("gallery.*")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Gallery image URL cannot exceed 1000 characters.",
    ),

  body("eligibility")
    .optional()
    .trim()
    .isLength({
      max: 2000,
    })
    .withMessage(
      "Eligibility cannot exceed 2000 characters.",
    ),

  body("highlights")
    .optional()
    .isArray()
    .withMessage(
      "Highlights must be an array.",
    ),

  body("highlights.*")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Each highlight cannot exceed 500 characters.",
    ),

  body("requirements")
    .optional()
    .isArray()
    .withMessage(
      "Requirements must be an array.",
    ),

  body("requirements.*")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Each requirement cannot exceed 500 characters.",
    ),

  body("rules")
    .optional()
    .isArray()
    .withMessage(
      "Rules must be an array.",
    ),

  body("rules.*")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Each rule cannot exceed 1000 characters.",
    ),

  body("speaker")
    .optional()
    .isObject()
    .withMessage(
      "Speaker must be an object.",
    ),

  body("speaker.name")
    .optional()
    .trim()
    .isLength({
      max: 150,
    })
    .withMessage(
      "Speaker name cannot exceed 150 characters.",
    ),

  body("speaker.designation")
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      "Speaker designation cannot exceed 200 characters.",
    ),

  body("speaker.organization")
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      "Speaker organization cannot exceed 200 characters.",
    ),

  body("coordinators")
    .optional()
    .isArray()
    .withMessage(
      "Coordinators must be an array.",
    ),

  body("coordinators.*.user")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid coordinator user ID.",
    ),

  body("coordinators.*.role")
    .optional()
    .trim()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Coordinator role cannot exceed 100 characters.",
    ),

  body("status")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(eventStatuses)
    .withMessage(
      "Invalid event status.",
    ),

  body("registrationOpen")
    .optional()
    .isBoolean()
    .withMessage(
      "Registration open must be a boolean.",
    )
    .toBoolean(),
];

/**
 * ============================================================
 * Update Event Validator
 * ============================================================
 */

const updateEventValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Event title cannot be empty.",
    )
    .isLength({
      max: 200,
    })
    .withMessage(
      "Event title cannot exceed 200 characters.",
    ),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Event description cannot be empty.",
    )
    .isLength({
      max: 5000,
    })
    .withMessage(
      "Event description cannot exceed 5000 characters.",
    ),

  body("festival")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  body("category")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(eventCategories)
    .withMessage(
      "Invalid event category.",
    ),

  body("type")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(eventTypes)
    .withMessage(
      "Invalid event type.",
    ),

  body("registrationMode")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(registrationModes)
    .withMessage(
      "Invalid registration mode.",
    ),

  body("registrationRequired")
    .optional()
    .isBoolean()
    .withMessage(
      "Registration required must be a boolean.",
    )
    .toBoolean(),

  body("maxParticipants")
    .optional({
      nullable: true,
    })
    .isInt({
      min: 1,
    })
    .withMessage(
      "Maximum participants must be a positive integer.",
    ),

  body("teamSize")
    .optional({
      nullable: true,
    })
    .isInt({
      min: 1,
    })
    .withMessage(
      "Team size must be a positive integer.",
    ),

  body("isPaid")
    .optional()
    .isBoolean()
    .withMessage(
      "isPaid must be a boolean.",
    )
    .toBoolean(),

  body("registrationFee")
    .optional()
    .isFloat({
      min: 0,
    })
    .withMessage(
      "Registration fee must be zero or greater.",
    ),

  body("currency")
    .optional()
    .trim()
    .toUpperCase()
    .isLength({
      max: 10,
    })
    .withMessage(
      "Currency cannot exceed 10 characters.",
    ),

  body("startDateTime")
    .optional({
      nullable: true,
    })
    .isISO8601()
    .withMessage(
      "Start date/time must be a valid ISO 8601 date.",
    ),

  body("endDateTime")
    .optional({
      nullable: true,
    })
    .isISO8601()
    .withMessage(
      "End date/time must be a valid ISO 8601 date.",
    ),

  body("registrationDeadline")
    .optional({
      nullable: true,
    })
    .isISO8601()
    .withMessage(
      "Registration deadline must be a valid ISO 8601 date.",
    ),

  body("venue")
    .optional()
    .trim()
    .isLength({
      max: 300,
    })
    .withMessage(
      "Venue cannot exceed 300 characters.",
    ),

  body("prizePool")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Prize information cannot exceed 500 characters.",
    ),

  body("poster")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Poster URL cannot exceed 1000 characters.",
    ),

  body("banner")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Banner URL cannot exceed 1000 characters.",
    ),

  body("gallery")
    .optional()
    .isArray()
    .withMessage(
      "Gallery must be an array.",
    ),

  body("gallery.*")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Gallery image URL cannot exceed 1000 characters.",
    ),

  body("eligibility")
    .optional()
    .trim()
    .isLength({
      max: 2000,
    })
    .withMessage(
      "Eligibility cannot exceed 2000 characters.",
    ),

  body("highlights")
    .optional()
    .isArray()
    .withMessage(
      "Highlights must be an array.",
    ),

  body("requirements")
    .optional()
    .isArray()
    .withMessage(
      "Requirements must be an array.",
    ),

  body("rules")
    .optional()
    .isArray()
    .withMessage(
      "Rules must be an array.",
    ),

  body("speaker")
    .optional()
    .isObject()
    .withMessage(
      "Speaker must be an object.",
    ),

  body("speaker.name")
    .optional()
    .trim()
    .isLength({
      max: 150,
    })
    .withMessage(
      "Speaker name cannot exceed 150 characters.",
    ),

  body("speaker.designation")
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      "Speaker designation cannot exceed 200 characters.",
    ),

  body("speaker.organization")
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      "Speaker organization cannot exceed 200 characters.",
    ),

  body("coordinators")
    .optional()
    .isArray()
    .withMessage(
      "Coordinators must be an array.",
    ),

  body("coordinators.*.user")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid coordinator user ID.",
    ),

  body("coordinators.*.role")
    .optional()
    .trim()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Coordinator role cannot exceed 100 characters.",
    ),

  body("status")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(eventStatuses)
    .withMessage(
      "Invalid event status.",
    ),

  body("registrationOpen")
    .optional()
    .isBoolean()
    .withMessage(
      "Registration open must be a boolean.",
    )
    .toBoolean(),
];

/**
 * ============================================================
 * Search Event Validator
 * ============================================================
 */

const searchEventValidator = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage(
      "Search query is required.",
    )
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Search query must contain between 2 and 100 characters.",
    ),

  ...eventQueryValidator,
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  eventQueryValidator,

  eventIdValidator,
  festivalIdValidator,

  categoryValidator,
  eventTypeValidator,

  createEventValidator,
  updateEventValidator,

  searchEventValidator,
};