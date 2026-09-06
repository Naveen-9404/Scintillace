import { apiClient } from "./axios";

/**
 * ============================================================
 * Get All Registrations
 * ============================================================
 *
 * GET /api/v1/registrations
 *
 * SUPER_ADMIN / FACULTY
 */
export const getAllRegistrations =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/registrations",
        {
          params,
        },
      );

    return response.data.data;
  };

/**
 * ============================================================
 * Get Registration By ID
 * ============================================================
 */

export const getRegistrationById =
  async (id) => {
    const response =
      await apiClient.get(
        `/registrations/${id}`,
      );

    return response.data.data
      .registration;
  };

/**
 * ============================================================
 * Get Registrations By Event
 * ============================================================
 */

export const getRegistrationsByEvent =
  async (
    eventId,
    params = {},
  ) => {
    const response =
      await apiClient.get(
        `/registrations/event/${eventId}`,
        {
          params,
        },
      );

    return response.data.data;
  };

/**
 * ============================================================
 * Get Registrations By Festival
 * ============================================================
 */

export const getRegistrationsByFestival =
  async (
    festivalId,
    params = {},
  ) => {
    const response =
      await apiClient.get(
        `/registrations/festival/${festivalId}`,
        {
          params,
        },
      );

    return response.data.data;
  };

/**
 * ============================================================
 * Get Registrations By Team
 * ============================================================
 */

export const getRegistrationsByTeam =
  async (
    teamId,
    params = {},
  ) => {
    const response =
      await apiClient.get(
        `/registrations/team/${teamId}`,
        {
          params,
        },
      );

    return response.data.data;
  };

/**
 * ============================================================
 * Update Registration Status
 * ============================================================
 */

export const updateRegistrationStatus =
  async (
    id,
    status,
  ) => {
    const response =
      await apiClient.patch(
        `/registrations/${id}/status`,
        {
          status,
        },
      );

    return response.data.data
      .registration;
  };

/**
 * ============================================================
 * Update Payment Status
 * ============================================================
 */

export const updatePaymentStatus =
  async (
    id,
    paymentStatus,
  ) => {
    const response =
      await apiClient.patch(
        `/registrations/${id}/payment-status`,
        {
          paymentStatus,
        },
      );

    return response.data.data
      .registration;
  };

/**
 * ============================================================
 * Check In Registration
 * ============================================================
 */

export const checkInRegistration =
  async (id) => {
    const response =
      await apiClient.patch(
        `/registrations/${id}/check-in`,
      );

    return response.data.data
      .registration;
  };

/**
 * ============================================================
 * Admin Payment Verification Flow
 * ============================================================
 */

export const getPaymentByRegistration = async (id) => {
  const response = await apiClient.get(`/registrations/${id}/payment`);
  return response.data.data.payment;
};

export const approveRegistration = async (id) => {
  const response = await apiClient.post(`/registrations/${id}/approve`);
  return response.data.data.registration;
};

export const rejectRegistration = async (id, rejectionReason) => {
  const response = await apiClient.post(`/registrations/${id}/reject`, {
    rejectionReason,
  });
  return response.data.data.registration;
};

/**
 * ============================================================
 * Permanently Delete Registration
 * ============================================================
 *
 * SUPER_ADMIN only.
 */
export const deleteRegistration =
  async (id) => {
    const response =
      await apiClient.delete(
        `/registrations/${id}/permanent`,
      );

    return response.data;
  };

const registrationsAdminApi =
  Object.freeze({
    getAllRegistrations,
    getRegistrationById,
    getRegistrationsByEvent,
    getRegistrationsByFestival,
    getRegistrationsByTeam,
    updateRegistrationStatus,
    updatePaymentStatus,
    checkInRegistration,
    deleteRegistration,
    getPaymentByRegistration,
    approveRegistration,
    rejectRegistration,
  });

export default registrationsAdminApi;
