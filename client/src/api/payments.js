import { apiClient } from "./axios";

/**
 * ============================================================
 * Create Event Payment Order
 * ============================================================
 *
 * POST /api/v1/payments/event/create-order
 */

export const createEventPaymentOrder =
  async (registrationId) => {
    if (!registrationId) {
      throw new Error(
        "Registration ID is required.",
      );
    }

    const { data } =
      await apiClient.post(
        "/v1/payments/event/create-order",
        {
          registrationId,
        },
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Create Accommodation Payment Order
 * ============================================================
 *
 * POST /api/v1/payments/accommodation/create-order
 *
 * Creates the Razorpay order for an existing
 * accommodation booking.
 */

export const createAccommodationPaymentOrder =
  async (accommodationId) => {
    if (!accommodationId) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.post(
        "/v1/payments/accommodation/create-order",
        {
          accommodationId,
        },
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Verify Payment
 * ============================================================
 *
 * POST /api/v1/payments/verify
 *
 * Used for both event and accommodation payments.
 */

export const verifyPayment =
  async (payload) => {
    if (
      !payload ||
      typeof payload !== "object"
    ) {
      throw new Error(
        "Payment verification data is required.",
      );
    }

    const { data } =
      await apiClient.post(
        "/v1/payments/verify",
        payload,
      );

    return data?.data || null;
  };

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
  createEventPaymentOrder,
  createAccommodationPaymentOrder,
  verifyPayment,
  getMyPayments,
  getPayment,
  downloadReceipt,
});