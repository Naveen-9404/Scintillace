import paymentService from "../services/payment.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

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
 * Submit Payment Screenshot (Guest)
 * POST /api/v1/payments/public/:id/screenshot
 * ============================================================
 */

const submitPaymentScreenshot = asyncHandler(async (req, res) => {
  const { screenshotUrl, screenshotPublicId, paymentFor, accommodationId } = req.body;
  const { registration } = req; // From verifyGuestToken middleware

  if (!screenshotUrl || !screenshotPublicId) {
    throw new ApiError("Screenshot URL and Public ID are required.", HTTP_STATUS.BAD_REQUEST);
  }

  const payment = await paymentService.submitPaymentScreenshot({
    registration,
    screenshotUrl,
    screenshotPublicId,
    paymentFor,
    accommodationId,
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Payment screenshot submitted successfully.",
    data: payment,
  });
});

const paymentController =
  Object.freeze({
    getPaymentById,
    downloadPaymentReceipt,
    getMyPayments,
    getAllPayments,
    submitPaymentScreenshot,
  });

export default paymentController;
