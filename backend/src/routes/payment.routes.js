import { Router } from "express";

import paymentController from "../controllers/payment.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import paymentValidator from "../validators/payment.validator.js";

import ROLES from "../constants/roles.js";

import { paymentOrderLimiter, paymentVerifyLimiter } from "../middlewares/rateLimiters.js";

const router = Router();


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
