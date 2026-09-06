import { Router } from "express";

import paymentController from "../controllers/payment.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import paymentValidator from "../validators/payment.validator.js";

import ROLES from "../constants/roles.js";

import { paymentOrderLimiter, paymentVerifyLimiter } from "../middlewares/rateLimiters.js";
import verifyGuestToken from "../middlewares/verifyGuestToken.js";
import rateLimit from "express-rate-limit";

const router = Router();


/**
 * ============================================================
 * PUBLIC / GUEST PAYMENT ROUTES
 * ============================================================
 */

const publicPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment screenshot uploads, please try again later.",
  },
  skip: () => process.env.NODE_ENV === "test"
});

/**
 * Submit Payment Screenshot
 *
 * POST /api/v1/payments/public/:id/screenshot
 */
router.post(
  "/public/:id/screenshot",
  publicPaymentLimiter,
  verifyGuestToken,
  paymentController.submitPaymentScreenshot,
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
