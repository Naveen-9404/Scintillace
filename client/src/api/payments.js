import { apiClient } from "./axios";

/**
 * ============================================================
 * Get My Payments
 * ============================================================
 *
 * GET /api/v1/payments/my-payments
 */

export const getMyPayments =
  async (params = {}) => {
    const { data } =
      await apiClient.get(
        "/v1/payments/my-payments",
        {
          params,
        },
      );

    return (
      data?.data?.payments ||
      []
    );
  };

/**
 * ============================================================
 * Get Payment By ID
 * ============================================================
 *
 * GET /api/v1/payments/:paymentId
 */

export const getPayment =
  async (paymentId) => {
    if (!paymentId) {
      throw new Error(
        "Payment ID is required.",
      );
    }

    const { data } =
      await apiClient.get(
        `/v1/payments/${paymentId}`,
      );

    return (
      data?.data?.payment ||
      data?.data ||
      null
    );
  };

/**
 * ============================================================
 * Download Payment Receipt
 * ============================================================
 *
 * GET /api/v1/payments/:paymentId/receipt
 *
 * Returns the receipt PDF as a Blob.
 */

export const downloadReceipt =
  async (paymentId) => {
    if (!paymentId) {
      throw new Error(
        "Payment ID is required.",
      );
    }

    return apiClient.get(
      `/v1/payments/${paymentId}/receipt`,
      {
        responseType: "blob",
      },
    );
  };

/**
 * ============================================================
 * Submit Payment Screenshot (Guest)
 * ============================================================
 *
 * POST /api/v1/payments/public/:id/screenshot
 */

export const submitGuestPaymentScreenshot =
  async (registrationId, payload, guestToken) => {
    if (!registrationId || !guestToken) {
      throw new Error("Registration ID and Guest Token are required.");
    }

    const { data } = await apiClient.post(
      `/v1/payments/public/${registrationId}/screenshot`,
      payload,
      {
        headers: {
          "X-Guest-Token": guestToken,
        },
      }
    );

    return data.data;
  };

/**
 * ============================================================
 * Payment API
 * ============================================================
 */

export default Object.freeze({
  getMyPayments,
  getPayment,
  downloadReceipt,
  submitGuestPaymentScreenshot,
});