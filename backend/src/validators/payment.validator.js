import {
  body,
  param,
  query,
} from "express-validator";

/**
 * ============================================================
 * Create Event Payment Order
 * ============================================================
 */

const createEventOrder = [
  body("registrationId")
    .trim()
    .notEmpty()
    .withMessage(
      "Registration ID is required.",
    )
    .bail()
    .isMongoId()
    .withMessage(
      "Invalid Registration ID.",
    ),
];

/**
 * ============================================================
 * Create Accommodation Payment Order
 * ============================================================
 */

const createAccommodationOrder = [
  body("accommodationId")
    .trim()
    .notEmpty()
    .withMessage(
      "Accommodation ID is required.",
    )
    .bail()
    .isMongoId()
    .withMessage(
      "Invalid Accommodation ID.",
    ),
];

/**
 * ============================================================
 * Verify Razorpay Payment
 * ============================================================
 */

const verifyPayment = [
  body("razorpay_order_id")
    .trim()
    .notEmpty()
    .withMessage(
      "Razorpay Order ID is required.",
    )
    .bail()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Invalid Razorpay Order ID.",
    ),

  body("razorpay_payment_id")
    .trim()
    .notEmpty()
    .withMessage(
      "Razorpay Payment ID is required.",
    )
    .bail()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Invalid Razorpay Payment ID.",
    ),

  body("razorpay_signature")
    .trim()
    .notEmpty()
    .withMessage(
      "Razorpay Signature is required.",
    )
    .bail()
    .isLength({
      max: 256,
    })
    .withMessage(
      "Invalid Razorpay Signature.",
    ),
];

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
 * Order ID Validation
 * ============================================================
 */

const orderId = [
  param("orderId")
    .trim()
    .notEmpty()
    .withMessage(
      "Order ID is required.",
    )
    .bail()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Invalid Razorpay Order ID.",
    ),
];

/**
 * ============================================================
 * Refund Payment Validation
 * ============================================================
 */

const refundPayment = [
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

  body("amount")
    .optional({
      nullable: true,
    })
    .isFloat({
      min: 0.01,
    })
    .withMessage(
      "Refund amount must be greater than 0.",
    ),

  body("notes")
    .optional()
    .isObject()
    .withMessage(
      "Refund notes must be an object.",
    ),
];

/**
 * ============================================================
 * Mark Payment Failed Validation
 * ============================================================
 */

const markPaymentFailed = [
  param("orderId")
    .trim()
    .notEmpty()
    .withMessage(
      "Order ID is required.",
    )
    .bail()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Invalid Razorpay Order ID.",
    ),

  body("reason")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Failure reason cannot exceed 500 characters.",
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
    createEventOrder,
    createAccommodationOrder,
    verifyPayment,

    paymentId,
    orderId,

    refundPayment,
    markPaymentFailed,

    paymentQuery,
  });

export default paymentValidator;