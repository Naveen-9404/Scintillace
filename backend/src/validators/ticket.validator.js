import {
  body,
  param,
  query,
} from "express-validator";

/**
 * ============================================================
 * Ticket Query Validator
 * ============================================================
 */

const ticketQueryValidator = [
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
 * Create Ticket Validator
 * ============================================================
 */

const createTicketValidator = [
  body("registration")
    .notEmpty()
    .withMessage(
      "Registration ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Registration ID.",
    ),

  body("user")
    .notEmpty()
    .withMessage(
      "User ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid User ID.",
    ),

  body("event")
    .notEmpty()
    .withMessage(
      "Event ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
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

  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage(
      "Expiration date must be a valid ISO 8601 date.",
    ),
];

/**
 * ============================================================
 * Ticket ID Validator
 * ============================================================
 */

const ticketIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Ticket ID.",
    ),
];

/**
 * ============================================================
 * Ticket Number Validator
 * ============================================================
 */

const ticketNumberValidator = [
  param("ticketNumber")
    .trim()
    .notEmpty()
    .withMessage(
      "Ticket number is required.",
    )
    .isLength({
      max: 100,
    })
    .withMessage(
      "Invalid ticket number.",
    ),
];

/**
 * ============================================================
 * QR Token Validator
 * ============================================================
 *
 * Legacy / direct QR token validation.
 *
 * Kept here for compatibility with any existing code that
 * may still use a QR token route.
 */

const qrTokenValidator = [
  param("qrToken")
    .trim()
    .notEmpty()
    .withMessage(
      "QR token is required.",
    )
    .isLength({
      min: 32,
      max: 128,
    })
    .withMessage(
      "Invalid QR token.",
    ),
];

/**
 * ============================================================
 * QR Payload Validator
 * ============================================================
 *
 * Used by:
 *
 * POST /api/v1/tickets/verify
 *
 * Expected body:
 *
 * {
 *   qrPayload: "..."
 * }
 *
 * The actual QR structure and cryptographic token
 * verification are handled by qr.service.js.
 *
 * This validator only verifies that the payload exists
 * and is a valid non-empty string.
 */

const qrPayloadValidator = [
  body("qrPayload")
    .exists()
    .withMessage(
      "QR payload is required.",
    )
    .bail()
    .isString()
    .withMessage(
      "QR payload must be a string.",
    )
    .trim()
    .notEmpty()
    .withMessage(
      "QR payload cannot be empty.",
    )
    .isLength({
      max: 5000,
    })
    .withMessage(
      "QR payload is too long.",
    ),
];

/**
 * ============================================================
 * Event Ticket Validator
 * ============================================================
 */

const eventTicketValidator = [
  param("eventId")
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  ...ticketQueryValidator,
];

/**
 * ============================================================
 * Festival Ticket Validator
 * ============================================================
 */

const festivalTicketValidator = [
  param("festivalId")
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  ...ticketQueryValidator,
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  ticketQueryValidator,

  createTicketValidator,

  ticketIdValidator,
  ticketNumberValidator,
  qrTokenValidator,
  qrPayloadValidator,

  eventTicketValidator,
  festivalTicketValidator,
};