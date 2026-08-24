import { Router } from "express";

import paymentController from "../controllers/payment.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import paymentValidator from "../validators/payment.validator.js";

import ROLES from "../constants/roles.js";

const router = Router();

/**
 * ============================================================
 * PAYMENT CREATION ROUTES
 * ============================================================
 */

/**
 * Create Event Payment Order
 *
 * POST /api/v1/payments/event/create-order
 */
router.post(
  "/event/create-order",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  ...paymentValidator.createEventOrder,
  validateRequest,
  paymentController.createEventOrder,
);

/**
 * Create Accommodation Payment Order
 *
 * POST /api/v1/payments/accommodation/create-order
 */
router.post(
  "/accommodation/create-order",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  ...paymentValidator.createAccommodationOrder,
  validateRequest,
  paymentController.createAccommodationOrder,
);

/**
 * ============================================================
 * PAYMENT VERIFICATION
 * ============================================================
 */

/**
 * Verify Razorpay Payment
 *
 * POST /api/v1/payments/verify
 */
router.post(
  "/verify",
  authenticate,
  ...paymentValidator.verifyPayment,
  validateRequest,
  paymentController.verifyPayment,
);

/**
 * ============================================================
 * RAZORPAY WEBHOOK
 * ============================================================
 *
 * POST /api/v1/payments/webhook
 *
 * IMPORTANT:
 * No authentication.
 *
 * Razorpay calls this endpoint directly.
 */
router.post(
  "/webhook",
  paymentController.handleWebhook,
);

/**
 * ============================================================
 * USER PAYMENT ROUTES
 * ============================================================
 */

/**
 * Get Logged-in User Payments
 *
 * GET /api/v1/payments/my-payments
 */
router.get(
  "/my-payments",
  authenticate,
  ...paymentValidator.paymentQuery,
  validateRequest,
  paymentController.getMyPayments,
);

/**
 * ============================================================
 * ADMIN / FACULTY LIST ROUTE
 * ============================================================
 */

/**
 * Get All Payments
 *
 * GET /api/v1/payments
 */
router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...paymentValidator.paymentQuery,
  validateRequest,
  paymentController.getAllPayments,
);

/**
 * ============================================================
 * ADMIN PAYMENT ACTIONS
 * ============================================================
 */

/**
 * Refund Payment
 *
 * POST /api/v1/payments/:paymentId/refund
 */
router.post(
  "/:paymentId/refund",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...paymentValidator.refundPayment,
  validateRequest,
  paymentController.refundPayment,
);

/**
 * Mark Payment Failed
 *
 * POST /api/v1/payments/:orderId/failed
 */
router.post(
  "/:orderId/failed",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  ...paymentValidator.markPaymentFailed,
  validateRequest,
  paymentController.markPaymentFailed,
);

/**
 * Download Payment Receipt
 *
 * GET /api/v1/payments/:paymentId/receipt
 *
 * This route must be declared before /:paymentId.
 */
router.get(
  "/:paymentId/receipt",
  authenticate,
  ...paymentValidator.paymentId,
  validateRequest,
  paymentController.downloadPaymentReceipt,
);

/**
 * ============================================================
 * DYNAMIC PAYMENT ID ROUTE
 * ============================================================
 *
 * This should be near the bottom because :paymentId
 * can match many different path segments.
 */

/**
 * Get Payment By ID
 *
 * GET /api/v1/payments/:paymentId
 */
router.get(
  "/:paymentId",
  authenticate,
  ...paymentValidator.paymentId,
  validateRequest,
  paymentController.getPaymentById,
);

export default router;
