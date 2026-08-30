import {
  body,
  param,
  query,
} from "express-validator";



/**
 * ============================================================
 * Payment ID Validation
 * ============================================================
 */

const paymentId = [
  param("paymentId")
    .trim()
    .notEmpty()
    .withMessage(
      "Payment ID is required.",
    )
    .bail()
    .isMongoId()
    .withMessage(
      "Invalid Payment ID.",
    ),
];



/**
 * ============================================================
 * Pagination Validation
 * ============================================================
 */

const paymentQuery = [
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
    )
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

const paymentValidator =
  Object.freeze({
    paymentId,

    paymentQuery,
  });

export default paymentValidator;