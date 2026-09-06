import { body, param, query } from "express-validator";

/**
 * ============================================================
 * Certificate Constants
 * ============================================================
 */

const CERTIFICATE_TYPES = [
  "PARTICIPATION",
  "WINNER",
  "RUNNER_UP",
  "VOLUNTEER",
  "ORGANIZER",
];

const CERTIFICATE_STATUSES = [
  "GENERATED",
  "ISSUED",
  "REVOKED",
];

/**
 * ============================================================
 * Pagination Validator
 * ============================================================
 */

const certificateQueryValidator = [
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
 * Create Certificate Validator
 * ============================================================
 */

const createCertificateValidator = [
  body("user")
    .notEmpty()
    .withMessage(
      "User ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid User ID.",
    ),

  body("registration")
    .notEmpty()
    .withMessage(
      "Registration ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Registration ID.",
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

  body("certificateType")
    .optional()
    .isIn(CERTIFICATE_TYPES)
    .withMessage(
      "Invalid certificate type.",
    ),

  body("position")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Position cannot exceed 100 characters.",
    ),

  body("issuedAt")
    .optional()
    .isISO8601()
    .withMessage(
      "Issued date must be a valid ISO 8601 date.",
    ),
];

/**
 * ============================================================
 * Certificate ID Validator
 * ============================================================
 */

const certificateIdValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Certificate ID.",
    ),
];

const downloadCertificateValidator = [
  param("certificateId")
    .isMongoId()
    .withMessage(
      "Invalid Certificate ID.",
    ),
];

/**
 * ============================================================
 * Certificate Number Validator
 * ============================================================
 */

const certificateNumberValidator = [
  param("certificateNumber")
    .trim()
    .notEmpty()
    .withMessage(
      "Certificate number is required.",
    )
    .isLength({
      max: 100,
    })
    .withMessage(
      "Invalid certificate number.",
    ),
];

/**
 * ============================================================
 * Verification Code Validator
 * ============================================================
 */

const verificationCodeValidator = [
  param("verificationCode")
    .trim()
    .notEmpty()
    .withMessage(
      "Verification code is required.",
    )
    .isLength({
      min: 10,
      max: 100,
    })
    .withMessage(
      "Invalid verification code.",
    ),
];

/**
 * ============================================================
 * Event Certificate Validator
 * ============================================================
 */

const eventCertificateValidator = [
  param("eventId")
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  ...certificateQueryValidator,
];

/**
 * ============================================================
 * Festival Certificate Validator
 * ============================================================
 */

const festivalCertificateValidator = [
  param("festivalId")
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),

  ...certificateQueryValidator,
];

/**
 * ============================================================
 * Revoke Certificate Validator
 * ============================================================
 */

const revokeCertificateValidator = [
  param("id")
    .isMongoId()
    .withMessage(
      "Invalid Certificate ID.",
    ),

  body("reason")
    .optional()
    .trim()
    .escape()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Revocation reason cannot exceed 500 characters.",
    ),
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  CERTIFICATE_TYPES,
  CERTIFICATE_STATUSES,

  certificateQueryValidator,

  createCertificateValidator,

  certificateIdValidator,
  downloadCertificateValidator,
  certificateNumberValidator,
  verificationCodeValidator,

  eventCertificateValidator,
  festivalCertificateValidator,

  revokeCertificateValidator,
};