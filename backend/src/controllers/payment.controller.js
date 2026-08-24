import paymentService from "../services/payment.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Create Event Payment Order
 * POST /api/v1/payments/event/create-order
 * ============================================================
 */

const createEventOrder = asyncHandler(
  async (req, res) => {
    const result =
      await paymentService.createEventPayment({
        userId: req.user.id,
        registrationId:
          req.body.registrationId,
      });

    return ApiResponse.success(
      res,
      result,
      "Event payment order created successfully.",
    );
  },
);

/**
 * ============================================================
 * Create Accommodation Payment Order
 * POST /api/v1/payments/accommodation/create-order
 * ============================================================
 */

const createAccommodationOrder =
  asyncHandler(
    async (req, res) => {
      const result =
        await paymentService.createAccommodationPayment({
          userId: req.user.id,
          accommodationId:
            req.body.accommodationId,
        });

      return ApiResponse.success(
        res,
        result,
        "Accommodation payment order created successfully.",
      );
    },
  );

/**
 * ============================================================
 * Verify Razorpay Payment
 * POST /api/v1/payments/verify
 * ============================================================
 */

const verifyPayment = asyncHandler(
  async (req, res) => {
    const result =
      await paymentService.verifyPayment({
        userId: req.user.id,

        razorpay_order_id:
          req.body.razorpay_order_id,

        razorpay_payment_id:
          req.body.razorpay_payment_id,

        razorpay_signature:
          req.body.razorpay_signature,
      });

    return ApiResponse.success(
      res,
      result,
      "Payment verified successfully.",
    );
  },
);

/**
 * ============================================================
 * Get Payment By ID
 * GET /api/v1/payments/:paymentId
 * ============================================================
 */

const getPaymentById = asyncHandler(
  async (req, res) => {
    const payment =
      await paymentService.getPaymentById({
        paymentId:
          req.params.paymentId,

        userId: req.user.id,
      });

    return ApiResponse.success(
      res,
      payment,
      "Payment fetched successfully.",
    );
  },
);

/**
 * ============================================================
 * Download Payment Receipt
 * GET /api/v1/payments/:id/receipt
 * ============================================================
 */

const downloadPaymentReceipt = asyncHandler(
  async (req, res) => {
    const receipt =
      await paymentService.getPaymentReceipt({
        paymentId:
          req.params.paymentId,
        userId: req.user.id,
        userRole: req.user.role,
      });

    const safeReceiptReference =
      String(receipt.receiptNumber)
        .replace(/[^A-Za-z0-9_-]/g, "_");

    return res
      .status(HTTP_STATUS.OK)
      .set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="scintillace-receipt-${safeReceiptReference}.pdf"`,
      })
      .send(receipt.pdf);
  },
);

/**
 * ============================================================
 * Get Logged-in User Payments
 * GET /api/v1/payments/my-payments
 * ============================================================
 */

const getMyPayments = asyncHandler(
  async (req, res) => {
    const payments =
      await paymentService.getMyPayments({
        userId: req.user.id,

        page:
          Number(req.query.page) || 1,

        limit:
          Number(req.query.limit) || 10,
      });

    return ApiResponse.success(
      res,
      payments,
      "Payments fetched successfully.",
    );
  },
);

/**
 * ============================================================
 * Get All Payments
 * GET /api/v1/payments
 * ============================================================
 */

const getAllPayments = asyncHandler(
  async (req, res) => {
    const payments =
      await paymentService.getAllPayments({
        page:
          Number(req.query.page) || 1,

        limit:
          Number(req.query.limit) || 10,
      });

    return ApiResponse.success(
      res,
      payments,
      "Payments fetched successfully.",
    );
  },
);

/**
 * ============================================================
 * Refund Payment
 * POST /api/v1/payments/:paymentId/refund
 * ============================================================
 */

const refundPayment = asyncHandler(
  async (req, res) => {
    const result =
      await paymentService.refundPayment({
        paymentId:
          req.params.paymentId,

        amount:
          req.body.amount ?? null,

        notes:
          req.body.notes || {},
      });

    return ApiResponse.success(
      res,
      result,
      "Payment refunded successfully.",
    );
  },
);

/**
 * ============================================================
 * Mark Payment Failed
 * POST /api/v1/payments/:orderId/failed
 * ============================================================
 */

const markPaymentFailed =
  asyncHandler(
    async (req, res) => {
      const result =
        await paymentService.markPaymentFailed({
          orderId:
            req.params.orderId,

          reason:
            req.body.reason ||
            "Payment failed.",
        });

      return ApiResponse.success(
        res,
        result,
        "Payment marked as failed.",
      );
    },
  );

/**
 * ============================================================
 * Razorpay Webhook
 * POST /api/v1/payments/webhook
 * ============================================================
 *
 * IMPORTANT:
 *
 * This endpoint does NOT use authentication.
 *
 * Razorpay sends the request directly.
 *
 * app.js preserves the original request body
 * as req.rawBody.
 * ============================================================
 */

const handleWebhook =
  asyncHandler(
    async (req, res) => {
      const signature =
        req.headers[
          "x-razorpay-signature"
        ];

      const rawBody =
        req.rawBody;

      const payload =
        req.body;

      const result =
        await paymentService.handleWebhook({
          rawBody,
          signature,
          payload,
        });

      return ApiResponse.success(
        res,
        result,
        "Webhook processed successfully.",
      );
    },
  );

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const paymentController =
  Object.freeze({
    createEventOrder,
    createAccommodationOrder,
    verifyPayment,

    getPaymentById,
    downloadPaymentReceipt,
    getMyPayments,
    getAllPayments,

    refundPayment,
    markPaymentFailed,

    handleWebhook,
  });

export default paymentController;
