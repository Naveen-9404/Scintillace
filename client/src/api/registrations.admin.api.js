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

export const approveRegistration = async (id, { manualVerification = false, adminNote = "" } = {}) => {
  const response = await apiClient.post(`/registrations/${id}/approve`, {
    manualVerification,
    adminNote
  });
  return response.data.data.registration;
};

export const rejectRegistration = async (id, rejectionReason, adminNote = "") => {
  const response = await apiClient.post(`/registrations/${id}/reject`, {
    rejectionReason,
    adminNote
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

export const downloadTicketPdf = async (id, teamMemberId = null) => {
  const url = teamMemberId
    ? `/registrations/${id}/ticket-pdf?teamMemberId=${teamMemberId}`
    : `/registrations/${id}/ticket-pdf`;

  const response = await apiClient.get(url, {
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'];
  let filename = 'Ticket.pdf';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const downloadTeamTicketsZip = async (id) => {
  const response = await apiClient.get(`/registrations/${id}/team-tickets-zip`, {
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'];
  let filename = 'Tickets.zip';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
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
    downloadTicketPdf,
    downloadTeamTicketsZip,
  });

export default registrationsAdminApi;
