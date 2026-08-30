import {
  body,
  param,
  query,
} from "express-validator";

import {
  REGISTRATION_STATUS,
  PAYMENT_STATUS,
} from "../constants/registration.constants.js";

/**
 * ============================================================
 * Create Registration Validator
 * ============================================================
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

export const createRegistrationValidator = [
  body("event")
    .notEmpty()
    .withMessage(
      "Event ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  body("teamId")
    .optional({
      nullable: true,
    })
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),

  body("screenshotUrl")
    .optional({
      nullable: true,
      values: "falsy",
    })
    .trim()
    .isURL()
    .withMessage(
      "Screenshot URL must be a valid URL.",
    ),

  body("screenshotPublicId")
    .optional({
      nullable: true,
      values: "falsy",
    })
    .trim()
    .isString()
    .withMessage(
      "Screenshot Public ID must be a string.",
    ),
];

/**
 * ============================================================
 * Registration ID Validator
 * ============================================================
 */

export const registrationIdValidator = [
  param("id")
    .notEmpty()
    .withMessage(
      "Registration ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Registration ID.",
    ),
];

/**
 * ============================================================
 * Event ID Validator
 * ============================================================
 */

export const eventIdValidator = [
  param("eventId")
    .notEmpty()
    .withMessage(
      "Event ID is required.",
    )
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

export const festivalIdValidator = [
  param("festivalId")
    .notEmpty()
    .withMessage(
      "Festival ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),
];

/**
 * ============================================================
 * Team ID Validator
 * ============================================================
 */

export const teamIdValidator = [
  param("teamId")
    .notEmpty()
    .withMessage(
      "Team ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),
];

/**
 * ============================================================
 * Update Registration Status Validator
 * ============================================================
 */

export const updateRegistrationStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage(
      "Registration status is required.",
    )
    .isIn(
      Object.values(
        REGISTRATION_STATUS,
      ),
    )
    .withMessage(
      "Invalid registration status.",
    ),
];

/**
 * ============================================================
 * Update Payment Status Validator
 * ============================================================
 */

export const updatePaymentStatusValidator = [
  body("paymentStatus")
    .notEmpty()
    .withMessage(
      "Payment status is required.",
    )
    .isIn(
      Object.values(
        PAYMENT_STATUS,
      ),
    )
    .withMessage(
      "Invalid payment status.",
    ),
];

/**
 * ============================================================
 * Reject Registration Validator
 * ============================================================
 */

export const rejectRegistrationValidator = [
  body("rejectionReason")
    .optional()
    .isString()
    .withMessage("Rejection reason must be a string.")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Rejection reason cannot exceed 255 characters."),
];

/**
 * ============================================================
 * Registration Query Validator
 * ============================================================
 */

export const registrationQueryValidator = [
  query("page")
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      "Page must be at least 1.",
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

  query("status")
    .optional()
    .isIn(
      Object.values(
        REGISTRATION_STATUS,
      ),
    )
    .withMessage(
      "Invalid registration status.",
    ),

  query("paymentStatus")
    .optional()
    .isIn(
      Object.values(
        PAYMENT_STATUS,
      ),
    )
    .withMessage(
      "Invalid payment status.",
    ),

  query("event")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  query("festival")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  query("team")
    .optional()
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),
];

/**
 * ============================================================
 * Export Object
 * ============================================================
 */

const registrationValidator =
  Object.freeze({
    createRegistrationValidator,
    registrationIdValidator,
    eventIdValidator,
    festivalIdValidator,
    teamIdValidator,
    updateRegistrationStatusValidator,
    updatePaymentStatusValidator,
    registrationQueryValidator,
  });

export default registrationValidator;