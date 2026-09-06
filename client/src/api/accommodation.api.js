import { apiClient } from "./axios";

/**
 * ============================================================
 * Create Accommodation Booking
 * ============================================================
 *
 * POST /api/v1/accommodation
 *
 * Request body:
 *
 * {
 *   registrationId,
 *   hostelType,
 *   checkInDate,
 *   checkOutDate,
 *   remarks
 * }
 *
 * The backend calculates:
 *
 * accommodationDays
 * amount
 *
 * at ₹100 per accommodation day.
 */

export const createAccommodation = async (
  payload,
) => {
  const { data } =
    await apiClient.post(
      "/accommodation",
      payload,
    );

  return data?.data || null;
};

/**
 * ============================================================
 * Create Guest Accommodation Booking
 * ============================================================
 *
 * POST /api/v1/accommodation/public/book
 */

export const createGuestAccommodation = async (
  payload
) => {
  const { data } = await apiClient.post(
    "/accommodation/public/book",
    payload
  );

  return data?.data || null;
};

/**
 * ============================================================
 * Get Guest Accommodation Bookings
 * ============================================================
 *
 * GET /api/v1/accommodation/public/book/:registrationId
 */

export const getGuestAccommodation = async (
  id,
  accommodationToken
) => {
  const { data } = await apiClient.get(
    `/accommodation/public/${id}`,
    {
      headers: {
        "X-Accommodation-Token": accommodationToken
      }
    }
  );

  return data?.data || null;
};

/**
 * ============================================================
 * Upload Guest Accommodation Payment Screenshot
 * ============================================================
 *
 * POST /api/v1/accommodation/public/:id/screenshot
 */

export const uploadGuestAccommodationPaymentScreenshot = async (
  id,
  payload,
  accommodationToken
) => {
  const { data } = await apiClient.post(
    `/accommodation/public/${id}/screenshot`,
    payload,
    {
      headers: {
        "X-Accommodation-Token": accommodationToken
      }
    }
  );

  return data?.data || null;
};

/**
 * ============================================================
 * Get My Accommodation Bookings
 * ============================================================
 *
 * GET /api/v1/accommodation/my
 */

export const getMyAccommodationBookings =
  async () => {
    const { data } =
      await apiClient.get(
        "/accommodation/my",
      );

    /**
     * Current backend response:
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    /**
     * Backward compatibility if the backend
     * later wraps the array inside bookings.
     */

    return data?.data?.bookings || [];
  };

/**
 * ============================================================
 * Get Accommodation Booking By ID
 * ============================================================
 *
 * GET /api/v1/accommodation/:id
 */

export const getAccommodationBooking =
  async (id) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.get(
        `/accommodation/${id}`,
      );

    /**
     * Current backend response:
     *
     * {
     *   success: true,
     *   data: { ...accommodation }
     * }
     */

    return data?.data || null;
  };

/**
 * ============================================================
 * Get Accommodation Availability
 * ============================================================
 *
 * GET /api/v1/accommodation/availability/:eventId
 */

export const getAccommodationAvailability =
  async (
    eventId,
    params = {},
  ) => {
    if (!eventId) {
      throw new Error(
        "Event ID is required.",
      );
    }

    const { data } =
      await apiClient.get(
        `/accommodation/availability/${eventId}`,
        {
          params,
        },
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Cancel Accommodation Booking
 * ============================================================
 *
 * IMPORTANT:
 *
 * The finalized backend exposes cancellation as:
 *
 * PATCH /api/v1/accommodation/:id/cancel
 *
 * If your backend route is different, we will align it
 * after checking the accommodation routes.
 */

export const cancelAccommodationBooking =
  async (
    id,
    payload = {},
  ) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.patch(
        `/accommodation/${id}/cancel`,
        payload,
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Cancel Guest Accommodation Booking
 * ============================================================
 *
 * DELETE /api/v1/accommodation/public/:id
 */

export const cancelGuestAccommodationBooking =
  async (
    id,
    accommodationToken,
    payload = {},
  ) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.delete(
        `/accommodation/public/${id}`,
        {
          headers: {
            "X-Accommodation-Token": accommodationToken
          },
          data: payload
        }
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Get Accommodation Statistics
 * ============================================================
 *
 * GET /api/v1/accommodation/stats
 *
 * Admin / Faculty use.
 */

export const getAccommodationStats =
  async () => {
    const { data } =
      await apiClient.get(
        "/accommodation/stats",
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Confirm Accommodation
 * ============================================================
 *
 * PATCH /api/v1/accommodation/:id/confirm
 *
 * Admin / Faculty use.
 */

export const confirmAccommodation =
  async (id) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.patch(
        `/accommodation/${id}/confirm`,
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Mark Accommodation Payment Paid
 * ============================================================
 *
 * PATCH /api/v1/accommodation/:id/payment/paid
 *
 * Admin / Faculty route.
 */

export const markAccommodationPaymentPaid =
  async (
    id,
    payload = {},
  ) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.patch(
        `/accommodation/${id}/payment/paid`,
        payload,
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Mark Accommodation Payment Failed
 * ============================================================
 *
 * PATCH /api/v1/accommodation/:id/payment/failed
 *
 * Admin / Faculty route.
 */

export const markAccommodationPaymentFailed =
  async (id) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.patch(
        `/accommodation/${id}/payment/failed`,
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Reject Accommodation Booking
 * ============================================================
 *
 * PATCH /api/v1/accommodation/:id/reject
 *
 * Admin / Faculty route.
 */

export const rejectAccommodation =
  async (
    id,
    payload = {},
  ) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.patch(
        `/accommodation/${id}/reject`,
        payload,
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Refund Accommodation Payment
 * ============================================================
 *
 * PATCH /api/v1/accommodation/:id/refund
 *
 * Admin / Faculty route.
 */

export const refundAccommodation =
  async (
    id,
    payload = {},
  ) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.patch(
        `/accommodation/${id}/refund`,
        payload,
      );

    return data?.data || null;
  };

/**
 * ============================================================
 * Delete Accommodation
 * ============================================================
 *
 * DELETE /api/v1/accommodation/:id/delete
 *
 * Super Admin only.
 */

export const deleteAccommodation =
  async (id) => {
    if (!id) {
      throw new Error(
        "Accommodation ID is required.",
      );
    }

    const { data } =
      await apiClient.delete(
        `/accommodation/${id}/delete`,
      );

    return data?.data || null;
  };
