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
 * Payment API
 * ============================================================
 */

export default Object.freeze({
  getMyPayments,
  getPayment,
  downloadReceipt,
});